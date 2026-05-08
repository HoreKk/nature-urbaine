import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Payload } from "payload";
import { cleanString, readExcelSheet } from "../utils/tools";

type ExcelReport = {
	PAYS: string;
	PROJET: string;
	VILLE: string;
	"CODE POSTAL": string;
	DPT: number | string;
	DEPARTEMENT: string;
	REGION: string;
	Adresse: string;
	CATEGORIE: string;
	"Description projet ": string;
	"DATE PHOTO": number;
	"STRATE DE LA VILLE": string;
	"NB habitant.e.s": string;
	"AUTEUR.E": string;
	"code WORD PRESS": number | string;
	MOA: string;
	MOE: string;
	"ANNE LIVRAISON": number | string;
	COUT: string;
	SUPERFICIE: string;
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
		"../../../../apps/cms-payload/public/hero-section.jpg",
	);

	const defaultMedia = await payload.create({
		collection: "media",
		data: { alt: "Default Thumbnail" },
		filePath: localFilePath,
	});

	const sortedData = [...data].toSorted((a, b) => {
		const aFrench = isFrench(a.PAYS) ? 0 : 1;
		const bFrench = isFrench(b.PAYS) ? 0 : 1;
		return aFrench - bFrench;
	});

	for (const report of sortedData) {
		const country = formatCountry(report.PAYS);
		const city = cleanString(report.VILLE);
		const projectName = cleanString(report.PROJET);
		const name = isFrench(report.PAYS)
			? `${city}, ${projectName}`
			: `${country}, ${city}, ${projectName}`;

		const reportCategory = categories.docs.find((cat) =>
			cat.name.includes(cleanString(report.CATEGORIE)),
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

		const reportData = {
			name,
			projectName,
			description:
				report["Description projet "] || "Aucune description disponible.",
			locationDetails: {
				country,
				city,
				postalCode: formatPostalCode(report["CODE POSTAL"]),
				address: cleanString(report.Adresse),
				departmentCode: formatDepartmentCode(report.DPT),
				department: cleanString(report.DEPARTEMENT),
				region: cleanString(report.REGION),
				cityStratum: report["STRATE DE LA VILLE"] || "",
				nbPopulations: parseOptionalNumber(report["NB habitant.e.s"]),
			},
			category: reportCategory.id,
			date: formattedDate,
			thumbnail: defaultMedia.id,
			projectDetails: {
				photoAuthor: cleanString(report["AUTEUR.E"]),
				wordpressPostId: parseOptionalNumber(report["code WORD PRESS"]),
				projectOwner: cleanString(report.MOA),
				projectManagement: cleanString(report.MOE),
				deliveryYear: parseOptionalNumber(report["ANNE LIVRAISON"]),
				projectCost: cleanString(report.COUT),
				projectArea: cleanString(report.SUPERFICIE),
			},
		};

		const existingReport = await payload.find({
			collection: "reports",
			limit: 1,
			where: {
				and: [
					{
						name: {
							equals: name,
						},
					},
					{
						date: {
							equals: formattedDate,
						},
					},
				],
			},
		});

		if (existingReport.docs[0]) {
			await payload.update({
				collection: "reports",
				id: existingReport.docs[0].id,
				draft: false,
				data: reportData,
			});
			continue;
		}

		await payload.create({
			collection: "reports",
			draft: false,
			data: reportData,
		});
	}

	console.log("✅ Seed des reportages.");
}

function parseOptionalNumber(value: number | string | undefined | null) {
	if (value === undefined || value === null || value === "") return undefined;

	if (typeof value === "number")
		return Number.isFinite(value) ? value : undefined;

	const normalized = value.toString().replace(/\s/g, "").replace(",", ".");
	const parsed = Number.parseFloat(normalized);

	return Number.isFinite(parsed) ? parsed : undefined;
}

function formatCountry(value: string | undefined) {
	const country = cleanString(value?.replace(/^_+/, ""));
	if (!country) return "";

	return country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
}

function isFrench(value: string | undefined) {
	const country = formatCountry(value);
	return !country || country === "France";
}

function formatPostalCode(value: string | undefined) {
	if (!value) return "";

	const digits = value.toString().trim();

	return /^\d+$/.test(digits) ? digits.padStart(5, "0") : digits;
}

function formatDepartmentCode(value: number | string | undefined) {
	if (value === undefined || value === null || value === "") return "";
	if (typeof value === "number") return value.toString().padStart(2, "0");

	const trimmed = value.toString().trim();

	if (/^\d+$/.test(trimmed)) {
		return trimmed.length >= 3 ? trimmed : trimmed.padStart(2, "0");
	}

	return trimmed;
}
