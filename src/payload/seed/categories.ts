import type { Payload } from 'payload';
import { createOnce, categoryKey } from '../utils/seed-once';
import { cleanString, readExcelSheet } from '../utils/tools';

type ExcelCategory = {
	CATEGORIES: string;
};

export default async function seedCategories(payload: Payload) {
	const data = readExcelSheet(
		'./src/payload/seed/historic-data.xlsx',
		'CATEGORIES REPORTAGES',
	) as ExcelCategory[];

	for (const item of data) {
		const name = cleanString(item.CATEGORIES);
		if (!name) continue;

		await createOnce(payload, {
			collection: 'categories',
			key: categoryKey(name),
			data: { name },
		});
	}

	console.log('✅ Seed des catégories.');
}
