import {
	convertHTMLToLexical,
	editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import type { Payload } from "payload";
import payloadConfig from "../default-config";
import { interviewSeedKey } from "../utils/seed-key";
import { upsertBySeedKey } from "../utils/seed-upsert";
import { cleanString, readExcelSheet } from "../utils/tools";

type ExcelInterview = {
	"Ville // Département": string;
	"NOM DU PROJET": string;
	"Maîtrise d'ouvrage": string;
	"Maîtrise d’œuvre": string;
	"Date de réalisation": number | string;
	Coût: string;
	Superficie: string;
	Résumé: string;
	"Date de l'interview": number | string;
	"A la rencontre de": string;
	"Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?": string;
	"Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ? ": string;
	"Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?": string;
};

export default async function seedInterviews(payload: Payload) {
	const data = readExcelSheet(
		"./src/seed/historic-data.xlsx",
		"interviews",
	) as ExcelInterview[];

	const editorConfig = await editorConfigFactory.default({
		config: await payloadConfig,
	});

	for (const interview of data) {
		const projectName = cleanString(interview["NOM DU PROJET"]);

		const [interviewee, ...interviewRole] = interview["A la rencontre de"]
			.split(",")
			.map((part) => cleanString(part));
		const [city, department] = interview["Ville // Département"]
			.split("//")
			.map((part) => cleanString(part));

		const realisedAt = parseExcelDate(interview["Date de réalisation"]);
		const publishedAt = parseExcelDate(interview["Date de l'interview"]);

		await upsertBySeedKey(payload, {
			collection: "interviews",
			seedKey: interviewSeedKey({
				projectName,
				interviewee: interviewee || "",
			}),
			draft: false,
			data: {
				name: projectName,
				interviewee: interviewee || "",
				intervieweeRole: interviewRole.join(", "),
				city: city || "",
				department: department || "",
				projectOwner: cleanString(interview["Maîtrise d'ouvrage"]),
				projectManagement: cleanString(interview["Maîtrise d’œuvre"]),
				summary: cleanString(interview.Résumé),
				area: cleanString(interview.Superficie),
				publishedAt: publishedAt ?? new Date().toISOString(),
				realisedAt: realisedAt ?? new Date().toISOString(),
				projectDetails: {
					objectives: convertHTMLToLexical({
						editorConfig,
						html: interview[
							"Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?"
						].trim(),
						JSDOM,
					}),
					impacts: convertHTMLToLexical({
						editorConfig,
						html: interview[
							"Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ? "
						].trim(),
						JSDOM,
					}),
					challenges: convertHTMLToLexical({
						editorConfig,
						html: interview[
							"Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?"
						].trim(),
						JSDOM,
					}),
				},
			},
		});
	}

	console.log("✅ Seed des interviews.");
}

function parseExcelDate(value: number | string | undefined | null) {
	if (value === undefined || value === null || value === "") return undefined;

	if (typeof value === "number" && Number.isFinite(value)) {
		const str = value.toString();
		if (str.length === 8) {
			const iso = `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
			const parsed = new Date(iso);
			if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
		}
		const excelEpoch = new Date(Date.UTC(1899, 11, 30));
		const ms = value * 24 * 60 * 60 * 1000;
		const fromSerial = new Date(excelEpoch.getTime() + ms);
		if (!Number.isNaN(fromSerial.getTime())) return fromSerial.toISOString();
	}

	const parsed = new Date(value.toString().trim());
	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
