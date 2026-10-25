import type { Payload } from 'payload';
import { cleanString, readExcelSheet } from './excel';
import { createOnce, categoryKey } from './seed-once';

const CATEGORY_COLORS: Record<string, string> = {
	'AGRICULTURE URBAINE': '#7FA878',
	BERGES: '#3C9FA8',
	'ESPACES PUBLICS': '#D58B7D',
	'ENTREPRISE INDUSTRIE': '#66727A',
	'EQUIPEMENT PUBLIC': '#D6B45C',
	'GRAND PAYSAGE': '#9AA66A',
	'JARDIN DE MÉMOIRE': '#9A82A8',
	LOGEMENTS: '#C3A071',
	'PARCS ET JARDINS': '#4F8A68',
	'PAYSAGES HISTORIQUES': '#B87562',
	'RENOUVELLEMENT URBAIN': '#895879',
	VOIRIE: '#6689A5',
};

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
			// No `color` for an unknown name: the field's default applies.
			data: { name, color: CATEGORY_COLORS[name] },
		});
	}

	console.log('✅ Seed des catégories.');
}
