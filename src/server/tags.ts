import { type PostgresAdapter, sql } from '@payloadcms/db-postgres';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { PaginatedDocs } from 'payload';
import z from 'zod';
import type {
	Picture,
	Report,
	Tag,
	TagCategory,
} from '@/payload/payload-types';
import { baseProcedure } from './db';
import { withMediaUrls } from './media-urls';
import {
	foldTagTaxonomyStats,
	type PictureTags,
	type TagTaxonomyStats,
	type TaxonomyTag,
} from './tag-taxonomy-stats';

export type { TagNodeStats, TagTaxonomyStats } from './tag-taxonomy-stats';

export type PictureWithReport = Omit<Picture, 'report' | 'relatedTags'> & {
	report: Report;
	relatedTags: Tag[];
};

export const getTagById = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.validator(z.number())
	.handler(async ({ data: id, context }) => {
		const tag = await context.db.findByID({
			collection: 'tags',
			id,
			depth: 1,
		});

		if (!tag) throw notFound();

		return tag as Tag;
	});

export type TagCategoryWithCount = TagCategory & { rootTagCount: number };

/** The root count lets Chakra's TreeView treat categories as lazy-loadable branches (see ADR-0002). */
export const getTagCategoriesWithRootCount = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }) => {
		const [categoriesResult, rootTagsResult] = await Promise.all([
			context.db.find({
				collection: 'tag-categories',
				limit: 200,
				depth: 0,
				sort: 'name',
			}),
			context.db.find({
				collection: 'tags',
				limit: 5000,
				depth: 0,
				pagination: false,
				where: { parentId: { exists: false } },
			}),
		]);

		const countsByCategory = new Map<number, number>();
		for (const tag of rootTagsResult.docs as Tag[]) {
			const categoryRef = tag.tagCategory;
			const categoryId =
				typeof categoryRef === 'number' ? categoryRef : categoryRef?.id;
			if (categoryId == null) continue;
			countsByCategory.set(
				categoryId,
				(countsByCategory.get(categoryId) ?? 0) + 1,
			);
		}

		return (categoriesResult.docs as TagCategory[]).map((c) => ({
			...c,
			rootTagCount: countsByCategory.get(c.id) ?? 0,
		})) satisfies TagCategoryWithCount[];
	});

/** Raw SQL: hydrating ~19k pictures through Payload took ~630 ms of the old ~800 ms (see ADR-0002). */
export const getTagTaxonomyStats = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }): Promise<TagTaxonomyStats> => {
		// Payload types `db` as the generic adapter; config.ts uses postgresAdapter.
		const { drizzle } = context.db.db as unknown as PostgresAdapter;
		const [tags, pictures] = await Promise.all([
			drizzle.execute<TaxonomyTag>(sql`
				select id, parent_id_id as "parentId", tag_category_id as "categoryId"
				from tags
			`),
			drizzle.execute<PictureTags>(sql`
				select array_agg(tags_id) as "tagIds"
				from pictures_rels
				where path = 'relatedTags' and tags_id is not null
				group by parent_id
			`),
		]);
		return foldTagTaxonomyStats(tags.rows, pictures.rows);
	});

export const getChildTags = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.validator(
		z.object({
			parentId: z.number().nullable(),
			tagCategoryId: z.number().nullable(),
		}),
	)
	.handler(async ({ data, context }) => {
		let where: Parameters<typeof context.db.find>[0]['where'];
		if (data.parentId !== null) {
			where = { parentId: { equals: data.parentId } };
		} else if (data.tagCategoryId !== null) {
			where = {
				tagCategory: { equals: data.tagCategoryId },
				parentId: { exists: false },
			};
		}

		const result = await context.db.find({
			collection: 'tags',
			limit: 200,
			depth: 0,
			sort: 'name',
			where,
			joins: { relatedChildTags: { count: true } },
		});
		return result.docs as Array<
			Tag & { relatedChildTags?: { totalDocs?: number } }
		>;
	});

/** Move to a closure table once p95 > 200ms or descendants > 500 (see ADR-0002). */
export const getPicturesByTagRecursive = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.validator(
		z.object({
			tagId: z.number(),
			page: z.number().min(1),
			pageSize: z.number().min(1).max(100),
		}),
	)
	.handler(async ({ data, context }) => {
		const start = Date.now();

		const descendants = new Set<number>([data.tagId]);
		let frontier: number[] = [data.tagId];
		let depth = 0;
		// Depth cap guards against `parentId` cycles; the cahier targets ~2000 tags
		// in 3 strata, so 10000 per level is never reached.
		while (frontier.length > 0 && depth < 10) {
			const children = await context.db.find({
				collection: 'tags',
				limit: 10000,
				depth: 0,
				pagination: false,
				where: { parentId: { in: frontier } },
			});
			const nextFrontier: number[] = [];
			for (const child of children.docs as Tag[]) {
				if (!descendants.has(child.id)) {
					descendants.add(child.id);
					nextFrontier.push(child.id);
				}
			}
			frontier = nextFrontier;
			depth += 1;
		}

		const ids = [...descendants];
		// The `PictureWithReport` cast trusts `depth: 1` to hydrate `report` and
		// `relatedTags` as objects; the lightbox breaks visibly otherwise.
		const result = await context.db.find({
			collection: 'pictures',
			limit: data.pageSize,
			page: data.page,
			depth: 1,
			sort: '-createdAt',
			where: { relatedTags: { in: ids } },
		});

		if (process.env.NODE_ENV !== 'production') {
			const elapsed = Date.now() - start;
			console.log(
				`[getPicturesByTagRecursive] tagId=${data.tagId} descendants=${ids.length} elapsed=${elapsed}ms`,
			);
		}

		return withMediaUrls({
			...result,
			docs: result.docs as PictureWithReport[],
		} satisfies PaginatedDocs<PictureWithReport>);
	});
