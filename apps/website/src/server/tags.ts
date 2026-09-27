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
import { withMediaUrls } from './media-urls';

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

export type TagNodeStats = {
	/** Distinct pictures reachable through this node and all its descendants. */
	pictureCount: number;
	/** Total number of descendant tags below this node (whole subtree). */
	descendantCount: number;
};

export type TagTaxonomyStats = {
	categories: Record<number, TagNodeStats>;
	tags: Record<number, TagNodeStats>;
};

const relationId = (
	ref: number | { id: number } | null | undefined,
): number | null => (typeof ref === 'number' ? ref : (ref?.id ?? null));

/**
 * Aggregated counts used to annotate every node of the `/tags` TreeView with
 * the number of pictures reachable through it (recursive, matching
 * `getPicturesByTagRecursive` semantics) and the number of descendant tags
 * under it.
 *
 * Computed from two bulk reads (all tags + all picture→tag links) folded in
 * memory, rather than one query per visible node, to avoid N+1 round-trips on
 * every branch expansion. The same ADR-0002 migration triggers as
 * `getPicturesByTagRecursive` apply once the catalog outgrows in-memory walks.
 */
export const getTagTaxonomyStats = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }): Promise<TagTaxonomyStats> => {
		const [tagsResult, picturesResult] = await Promise.all([
			context.db.find({
				collection: 'tags',
				limit: 10000,
				depth: 0,
				pagination: false,
				select: { parentId: true, tagCategory: true },
			}),
			context.db.find({
				collection: 'pictures',
				limit: 100000,
				depth: 0,
				pagination: false,
				select: { relatedTags: true },
			}),
		]);

		const tags = tagsResult.docs as Array<
			Pick<Tag, 'id' | 'parentId' | 'tagCategory'>
		>;

		const childrenByParent = new Map<number, number[]>();
		const parentOf = new Map<number, number | null>();
		const categoryOf = new Map<number, number>();
		for (const tag of tags) {
			const parent = relationId(tag.parentId);
			const category = relationId(tag.tagCategory);
			parentOf.set(tag.id, parent);
			if (category !== null) categoryOf.set(tag.id, category);
			if (parent !== null) {
				const siblings = childrenByParent.get(parent) ?? [];
				siblings.push(tag.id);
				childrenByParent.set(parent, siblings);
			}
		}

		// Descendant counts via memoized DFS; the visiting set guards against
		// cycles in malformed `parentId` chains (the same risk the BFS in
		// getPicturesByTagRecursive caps with its depth limit).
		const descendantCount = new Map<number, number>();
		const countDescendants = (id: number, visiting: Set<number>): number => {
			const cached = descendantCount.get(id);
			if (cached !== undefined) return cached;
			if (visiting.has(id)) return 0;
			visiting.add(id);
			let total = 0;
			for (const child of childrenByParent.get(id) ?? []) {
				total += 1 + countDescendants(child, visiting);
			}
			visiting.delete(id);
			descendantCount.set(id, total);
			return total;
		};
		for (const tag of tags) countDescendants(tag.id, new Set());

		const ancestorsOf = (id: number): number[] => {
			const chain: number[] = [];
			const seen = new Set<number>();
			let current: number | null = id;
			while (current !== null && !seen.has(current)) {
				seen.add(current);
				chain.push(current);
				current = parentOf.get(current) ?? null;
			}
			return chain;
		};

		// Distinct picture counts, bubbled to every ancestor tag and owning
		// category. Each picture is counted once per ancestor whose subtree holds
		// one of its tags — matching the recursive find on the detail page, where
		// a picture appears at most once regardless of how many of its tags match.
		const tagPictureCount = new Map<number, number>();
		const categoryPictureCount = new Map<number, number>();
		for (const picture of picturesResult.docs as Array<{
			relatedTags?: Array<number | Tag> | null;
		}>) {
			const reachedTags = new Set<number>();
			const reachedCategories = new Set<number>();
			for (const ref of picture.relatedTags ?? []) {
				const tagId = relationId(ref);
				if (tagId === null) continue;
				for (const ancestor of ancestorsOf(tagId)) reachedTags.add(ancestor);
				const category = categoryOf.get(tagId);
				if (category !== undefined) reachedCategories.add(category);
			}
			for (const id of reachedTags) {
				tagPictureCount.set(id, (tagPictureCount.get(id) ?? 0) + 1);
			}
			for (const id of reachedCategories) {
				categoryPictureCount.set(id, (categoryPictureCount.get(id) ?? 0) + 1);
			}
		}

		const categoryDescendantCount = new Map<number, number>();
		for (const category of categoryOf.values()) {
			categoryDescendantCount.set(
				category,
				(categoryDescendantCount.get(category) ?? 0) + 1,
			);
		}

		const tagStats: Record<number, TagNodeStats> = {};
		for (const tag of tags) {
			tagStats[tag.id] = {
				pictureCount: tagPictureCount.get(tag.id) ?? 0,
				descendantCount: descendantCount.get(tag.id) ?? 0,
			};
		}
		const categoryStats: Record<number, TagNodeStats> = {};
		for (const [category, count] of categoryDescendantCount) {
			categoryStats[category] = {
				pictureCount: categoryPictureCount.get(category) ?? 0,
				descendantCount: count,
			};
		}

		return { categories: categoryStats, tags: tagStats };
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
		// Hard depth cap protects against cycles in `parentId` chains. The 10000
		// limit per level is generous: the cahier targets ~2000 tags total across
		// 3 strata, so any single level realistically holds dozens-to-hundreds.
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
		// `depth: 1` hydrates `report` and `relatedTags` as objects (Payload's
		// behaviour). The `as PictureWithReport[]` cast trusts that — if Payload
		// ever stops doing this on depth:1, the lightbox will break visibly (city,
		// date, tag chips). Worth a runtime guard if we ever see flakiness here.
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
