import type { Payload } from "payload";
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
		await payload.create({
			collection: "categories",
			data: {
				name,
			},
		});
	}

	console.log("✅ Seed des catégories.");
}
