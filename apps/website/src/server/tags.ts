import type {
	PaginatedDocs,
	Picture,
	Report,
	Tag,
	TagCategory,
} from '@nature-urbaine/database';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { baseProcedure } from './db';

export type PictureWithReport = Omit<Picture, 'report' | 'relatedTags'> & {
	report: Report;
	relatedTags: Tag[];
};

export const getTagById = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(z.number())
	.handler(async ({ data: id, context }) => {
		const tag = await context.db.findByID({
			collection: 'tags',
			id,
			depth: 1,
		});

		if (!tag) throw notFound();

		return tag as Tag;
	});

export const getRootTagCategories = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }) => {
		const result = await context.db.find({
			collection: 'tag-categories',
			limit: 100,
			depth: 0,
			sort: 'name',
		});
		return result.docs as TagCategory[];
	});

export type TagCategoryWithCount = TagCategory & { rootTagCount: number };

/**
 * Returns each TagCategory annotated with the count of its root-level tags
 * (tags with no `parentId`). Used by the `/tags` TreeView to render
 * top-level branches with a known `childrenCount` so Chakra treats them as
 * lazy-loadable branches (see ADR-0002).
 */
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

export const getChildTags = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(
		z.object({
			parentId: z.number().nullable(),
			tagCategoryId: z.number().nullable(),
		}),
	)
	.handler(async ({ data, context }) => {
		// Root-level tags inside a TagCategory: no parent set, but matching tagCategory.
		// Nested children: parentId === <tag id>.
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

/**
 * Recursive descendant picture search.
 *
 * BFS walk: start with [tagId], fetch direct children via parentId, collect ids,
 * repeat until no more children. Then query pictures whose `relatedTags` overlap
 * with [tagId, ...descendants].
 *
 * See ADR-0002 for trade-off and migration triggers (closure table) when:
 *   - p95 latency > 200ms, or
 *   - descendant set size > 500.
 */
export const getPicturesByTagRecursive = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(
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
		while (frontier.length > 0 && depth < 10) {
			const children = await context.db.find({
				collection: 'tags',
				limit: 1000,
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
		const result = await context.db.find({
			collection: 'pictures',
			limit: data.pageSize,
			page: data.page,
			depth: 1,
			sort: '-createdAt',
			where: { relatedTags: { in: ids } },
		});

		const elapsed = Date.now() - start;
		console.log(
			`[getPicturesByTagRecursive] tagId=${data.tagId} descendants=${ids.length} elapsed=${elapsed}ms`,
		);

		return {
			...result,
			docs: result.docs as PictureWithReport[],
		} satisfies PaginatedDocs<PictureWithReport>;
	});
