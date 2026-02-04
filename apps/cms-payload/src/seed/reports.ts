import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Payload } from "payload";
import { readExcelSheet } from "~/utils/tools";

type ExcelReport = {
	PROJET: string;
	VILLE: string;
	CATEGORIE: string;
	"Description projet ": string;
	"DATE PHOTO": number;
	"STRATE DE LA VILLE": string;
	"NB habitant.e.s": string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function seedReports(payload: Payload) {
	const data = readExcelSheet(
		"./src/seed/historic-data.xlsx",
		"reportages lieux",
	) as ExcelReport[];

	const categories = await payload.find({
		collection: "categories",
		limit: 0,
	});

	const localFilePath = path.resolve(
		__dirname,
		"../../../cms-payload/public/hero-section.jpg",
	);

	const defaultMedia = await payload.create({
		collection: "media",
		data: { alt: "Default Thumbnail" },
		filePath: localFilePath,
	});

	for (const report of data) {
		const name = `${report.PROJET.trim()}, ${report.VILLE.trim()}`;

		const reportCategory = categories.docs.find((cat) =>
			cat.name.includes(report.CATEGORIE.trim()),
		);

		if (!reportCategory)
			throw new Error(
				`Catégorie introuvable pour le rapport: ${report.CATEGORIE}`,
			);

		const dateStr = report["DATE PHOTO"].toString();

		if (dateStr.length !== 8) {
			console.warn(`Date invalide pour le rapport (pas 8 caractères): ${name}`);
			continue;
		}

		const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

		if (!formattedDate || Number.isNaN(new Date(formattedDate).getTime())) {
			console.warn(`Date invalide pour le rapport (date invalide): ${name}`);
			continue;
		}

		await payload.create({
			collection: "reports",
			draft: false,
			data: {
				name,
				description:
					report["Description projet "] || "Aucune description disponible.",
				category: reportCategory.id,
				date: formattedDate,
				thumbnail: defaultMedia.id,
				cityStratum: report["STRATE DE LA VILLE"] || "",
				nbPopulations: report["NB habitant.e.s"]
					? parseInt(report["NB habitant.e.s"], 10)
					: undefined,
			},
		});
	}

	console.log("✅ Seed des reportages.");
}
