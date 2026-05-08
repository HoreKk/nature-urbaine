import type { Payload } from "payload";
import { tagCategorySeedKey, tagSeedKey } from "../utils/seed-key";
import { upsertBySeedKey } from "../utils/seed-upsert";
import { cleanString, readExcelSheet } from "../utils/tools";

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

		const parents = item.parent.split(",").map((p) => cleanString(p));
		const tags = item.tag.split(",").map((t) => cleanString(t));

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
		const tagCategoryName = cleanString(item.category);
		const tagName = cleanString(item.tag);
		const parentName = cleanString(item.parent);

		const tagCategory = await upsertBySeedKey(payload, {
			collection: "tag-categories",
			seedKey: tagCategorySeedKey(tagCategoryName),
			data: { name: tagCategoryName },
		});

		const parentTag = await upsertBySeedKey(payload, {
			collection: "tags",
			seedKey: tagSeedKey(parentName),
			data: { name: parentName, tagCategory: tagCategory.id },
		});

		await upsertBySeedKey(payload, {
			collection: "tags",
			seedKey: tagSeedKey(tagName, parentName),
			data: {
				name: tagName,
				tagCategory: tagCategory.id,
				parentId: parentTag.id,
			},
		});
	}

	console.log("✅ Seed des étiquettes.");
}
