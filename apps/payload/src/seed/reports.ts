import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Payload } from "payload";
import { readExcelSheet } from "~/utils/tools";

type ExcelReport = {
	PROJET: string;
	VILLE: string;
	CATEGORIE: string;
	"Description projet ": string;
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
		"../../../public/hero-section.jpg",
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

		await payload.create({
			collection: "reports",
			draft: false,
			data: {
				name,
				description:
					report["Description projet "] || "Aucune description disponible.",
				category: reportCategory.id,
				date: new Date().toISOString().split("T")[0] || "",
				thumbnail: defaultMedia.id,
			},
		});
	}
}
