import type { Payload } from "payload";
import type { Tag, TagCategory } from "~/payload-types";
import { readExcelSheet } from "~/utils/tools";

type ExcelTags = {
	category: string;
	parent: string;
	tag: string;
};

export default async function seedTags(payload: Payload) {
	const data = readExcelSheet("./src/seed/historic-data.xlsx", "mots_clefs", [
		"category",
		"parent",
		"tag",
	]) as ExcelTags[];

	const expandedData: ExcelTags[] = [];
	for (const item of data) {
		if (!item.tag || !item.parent) {
			console.warn(
				`Données incomplètes pour l'étiquette: catégorie='${item.category}', parent='${item.parent}', tag='${item.tag}'. Ignoré.`,
			);
			continue;
		}

		const parents = item.parent.split(",").map((p) => p.trim());
		const tags = item.tag.split(",").map((t) => t.trim());

		for (const parent of parents) {
			for (const tag of tags) {
				expandedData.push({
					category: item.category,
					parent,
					tag,
				});
			}
		}
	}

	for (const item of expandedData) {
		const tagCategoryName = item.category.trim();
		const tagName = item.tag.trim();
		const parentName = item.parent.trim();

		const tagCategories = await payload.find({
			collection: "tag-categories",
			where: { name: { equals: tagCategoryName } },
			limit: 1,
		});

		let tagCategory = null;

		if (tagCategories.totalDocs === 0) {
			tagCategory = await payload.create({
				collection: "tag-categories",
				data: { name: tagCategoryName },
			});
		} else {
			tagCategory = tagCategories.docs[0] as TagCategory;
		}

		const parentTag = await payload.find({
			collection: "tags",
			where: { name: { equals: parentName } },
			limit: 1,
		});

		let tagParent = null;

		if (parentTag.totalDocs === 0) {
			tagParent = await payload.create({
				collection: "tags",
				data: { name: parentName, tagCategory: tagCategory.id },
			});
		} else {
			tagParent = parentTag.docs[0] as Tag;
		}

		await payload.create({
			collection: "tags",
			data: {
				name: tagName,
				tagCategory: tagCategory.id,
				parentId: tagParent.id,
			},
		});
	}

	console.log("✅ Seed des étiquettes.");
}
