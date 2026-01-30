import type { Payload } from "payload";
import { readExcelSheet } from "~/utils/tools";

type ExcelTags = {
	category: string;
	parent: string;
	tag: string;
};

export default async function seedTags(payload: Payload) {
	const data = readExcelSheet(
		"./src/payload/seed/historic-data.xlsx",
		"CATEGORIES REPORTAGES",
		["category", "parent", "tag"],
	) as ExcelTags[];

	const tagsStructure = data.reduce(
		(acc, item) => {
			let category = acc.find((c) => c.name === item.category);
			if (!category) {
				category = { name: item.category, tags: [] };
				acc.push(category);
			}

			let tag = category.tags.find((t) => t.name === item.parent);
			if (!tag) {
				tag = { name: item.parent, children: [] };
				category.tags.push(tag);
			}

			tag.children.push({ name: item.tag });
			return acc;
		},
		[] as Array<{
			name: string;
			tags: Array<{ name: string; children: Array<{ name: string }> }>;
		}>,
	);
}
