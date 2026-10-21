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

export type TaxonomyTag = {
	id: number;
	parentId: number | null;
	categoryId: number | null;
};

export type PictureTags = {
	tagIds: number[];
};

export function foldTagTaxonomyStats(
	tags: TaxonomyTag[],
	pictures: PictureTags[],
): TagTaxonomyStats {
	const childrenByParent = new Map<number, number[]>();
	const parentOf = new Map<number, number | null>();
	const categoryOf = new Map<number, number>();
	for (const tag of tags) {
		parentOf.set(tag.id, tag.parentId);
		if (tag.categoryId !== null) categoryOf.set(tag.id, tag.categoryId);
		if (tag.parentId !== null) {
			const siblings = childrenByParent.get(tag.parentId) ?? [];
			siblings.push(tag.id);
			childrenByParent.set(tag.parentId, siblings);
		}
	}

	// The visiting set guards against cycles in malformed `parentId` chains.
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

	const ancestorChains = new Map<number, number[]>();
	const ancestorsOf = (id: number): number[] => {
		const cached = ancestorChains.get(id);
		if (cached) return cached;
		const chain: number[] = [];
		const seen = new Set<number>();
		let current: number | null = id;
		while (current !== null && !seen.has(current)) {
			seen.add(current);
			chain.push(current);
			current = parentOf.get(current) ?? null;
		}
		ancestorChains.set(id, chain);
		return chain;
	};

	// A picture counts once per ancestor however many of its tags fall under
	// it, like the recursive find on the tag detail page. The last picture index
	// seen per node dedupes without a Set per picture. Arrays indexed by serial
	// id beat Maps here: this loop runs ~200k times at prod size.
	const tagPictureCount: number[] = [];
	const categoryPictureCount: number[] = [];
	const lastTagPicture: number[] = [];
	const lastCategoryPicture: number[] = [];
	for (let pictureIndex = 0; pictureIndex < pictures.length; pictureIndex++) {
		for (const tagId of pictures[pictureIndex]!.tagIds) {
			for (const ancestor of ancestorsOf(tagId)) {
				if (lastTagPicture[ancestor] === pictureIndex) continue;
				lastTagPicture[ancestor] = pictureIndex;
				tagPictureCount[ancestor] = (tagPictureCount[ancestor] ?? 0) + 1;
			}
			const category = categoryOf.get(tagId);
			if (category === undefined) continue;
			if (lastCategoryPicture[category] === pictureIndex) continue;
			lastCategoryPicture[category] = pictureIndex;
			categoryPictureCount[category] =
				(categoryPictureCount[category] ?? 0) + 1;
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
			pictureCount: tagPictureCount[tag.id] ?? 0,
			descendantCount: descendantCount.get(tag.id) ?? 0,
		};
	}
	const categoryStats: Record<number, TagNodeStats> = {};
	for (const [category, count] of categoryDescendantCount) {
		categoryStats[category] = {
			pictureCount: categoryPictureCount[category] ?? 0,
			descendantCount: count,
		};
	}

	return { categories: categoryStats, tags: tagStats };
}
