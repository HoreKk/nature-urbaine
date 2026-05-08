import type { Payload } from "payload";
import { categorySeedKey } from "../utils/seed-key";
import { upsertBySeedKey } from "../utils/seed-upsert";
import { cleanString, readExcelSheet } from "../utils/tools";

type ExcelCategory = {
	CATEGORIES: string;
};

export default async function seedCategories(payload: Payload) {
	const data = readExcelSheet(
		"./src/seed/historic-data.xlsx",
		"CATEGORIES REPORTAGES",
	) as ExcelCategory[];

	for (const item of data) {
		const name = cleanString(item.CATEGORIES);
		if (!name) continue;

		await upsertBySeedKey(payload, {
			collection: "categories",
			seedKey: categorySeedKey(name),
			data: { name },
		});
	}

	console.log("✅ Seed des catégories.");
}
