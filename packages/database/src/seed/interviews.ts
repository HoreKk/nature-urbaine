import {
	convertHTMLToLexical,
	editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import type { Payload } from "payload";
import payloadConfig from "../config";
import { readExcelSheet } from "../utils/tools";

type ExcelInterview = {
	"Ville // Département": string;
	"NOM DU PROJET": string;
	"Maîtrise d'ouvrage": string;
	"Maîtrise d’œuvre": string;
	"Date de réalisation": number;
	Coût: string;
	Superficie: string;
	Résumé: string;
	"Date de l'interview": number;
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

	for (const interview of data) {
		const [interviewee, ...interviewRole] = interview["A la rencontre de"]
			.split(",")
			.map((part) => part.trim());
		const [city, department] = interview["Ville // Département"]
			.split("//")
			.map((part) => part.trim());

		const test = await editorConfigFactory.default({
			config: await payloadConfig, // Your Payload Config
		});

		await payload.create({
			collection: "interviews",
			draft: false,
			data: {
				name: `${interview["NOM DU PROJET"].trim()}`,
				interviewee: interviewee || "",
				intervieweeRole: interviewRole.join(", "),
				city: city || "",
				department: department || "",
				projectOwner: interview["Maîtrise d'ouvrage"].trim(),
				projectManagement: interview["Maîtrise d’œuvre"].trim(),
				summary: interview.Résumé.trim(),
				area: interview.Superficie.trim(),
				publishedAt: new Date().toLocaleDateString("fr-FR"),
				realisedAt: new Date().toLocaleDateString("fr-FR"),
				projectDetails: {
					objectives: convertHTMLToLexical({
						editorConfig: test,
						html: interview[
							"Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?"
						].trim(),
						JSDOM,
					}),
					impacts: convertHTMLToLexical({
						editorConfig: test,
						html: interview[
							"Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ? "
						].trim(),
						JSDOM,
					}),
					challenges: convertHTMLToLexical({
						editorConfig: test,
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
