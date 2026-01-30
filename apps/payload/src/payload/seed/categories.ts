import type { Payload } from "payload";
import { readExcelSheet } from "~/utils/tools";

type ExcelCategory = {
	CATEGORIES: string;
};

export default async function seedCategories(payload: Payload) {
	const data = readExcelSheet(
		"./src/payload/seed/historic-data.xlsx",
		"CATEGORIES REPORTAGES",
	) as ExcelCategory[];

	for (const item of data) {
		const name = item.CATEGORIES.trim();
		await payload.create({
			collection: "categories",
			data: {
				name,
			},
		});
	}
}
