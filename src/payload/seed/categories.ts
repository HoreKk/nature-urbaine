import type { Payload } from 'payload';
import { createOnce } from '../utils/seed-create';
import { categorySeedKey } from '../utils/seed-key';
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
			key: categorySeedKey(name),
			data: { name },
		});
	}

	console.log('✅ Seed des catégories.');
}
