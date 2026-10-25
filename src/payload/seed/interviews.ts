import {
	convertHTMLToLexical,
	editorConfigFactory,
} from '@payloadcms/richtext-lexical';
import { JSDOM } from 'jsdom';
import type { Payload } from 'payload';
import payloadConfig from '../default-config';
import { DEFAULT_INTERVIEW_QUESTIONS } from '../fields/interview-questions';
import { cleanString, readExcelSheet } from './excel';
import { createOnce, interviewKey } from './seed-once';

type ExcelInterview = {
	'Ville // Département': string;
	'NOM DU PROJET': string;
	"Maîtrise d'ouvrage": string;
	'Maîtrise d’œuvre': string;
	'Date de réalisation': number | string;
	Coût: string;
	Superficie: string;
	Résumé: string;
	"Date de l'interview": number | string;
	'A la rencontre de': string;
} & Record<(typeof QUESTION_COLUMNS)[number], string>;

type SheetHeaders<Questions extends readonly string[]> = {
	readonly [I in keyof Questions]: Questions[I] | `${Questions[I]} `;
};

// Each header is its default question; the impacts one keeps a trailing space.
const QUESTION_COLUMNS = [
	'Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?',
	'Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ? ',
	'Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?',
] as const satisfies SheetHeaders<typeof DEFAULT_INTERVIEW_QUESTIONS>;

export default async function seedInterviews(payload: Payload) {
	const data = readExcelSheet(
		'./src/payload/seed/historic-data.xlsx',
		'interviews',
	) as ExcelInterview[];

	const editorConfig = await editorConfigFactory.default({
		config: await payloadConfig,
	});

	for (const interview of data) {
		const projectName = cleanString(interview['NOM DU PROJET']);

		const [interviewee, ...interviewRole] = interview['A la rencontre de']
			.split(',')
			.map((part) => cleanString(part));
		const [city, department] = interview['Ville // Département']
			.split('//')
			.map((part) => cleanString(part));

		const realisedAt = parseExcelDate(interview['Date de réalisation']);
		const publishedAt = parseExcelDate(interview["Date de l'interview"]);

		await createOnce(payload, {
			collection: 'interviews',
			key: interviewKey({
				projectName,
				interviewee: interviewee || '',
			}),
			draft: false,
			data: {
				name: projectName,
				interviewee: interviewee || '',
				intervieweeRole: interviewRole.join(', '),
				city: city || '',
				department: department || '',
				projectOwner: cleanString(interview["Maîtrise d'ouvrage"]),
				projectManagement: cleanString(interview['Maîtrise d’œuvre']),
				summary: cleanString(interview.Résumé),
				area: cleanString(interview.Superficie),
				projectCost: cleanString(interview.Coût) || undefined,
				publishedAt: publishedAt ?? new Date().toISOString(),
				realisedAt: realisedAt ?? new Date().toISOString(),
				questions: QUESTION_COLUMNS.map((column) => ({
					question: column.trim(),
					answer: convertHTMLToLexical({
						editorConfig,
						html: interview[column].trim(),
						JSDOM,
					}),
				})),
			},
		});
	}

	console.log('✅ Seed des interviews.');
}

function parseExcelDate(value: number | string | undefined | null) {
	if (value === undefined || value === null || value === '') return undefined;

	if (typeof value === 'number' && Number.isFinite(value)) {
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
