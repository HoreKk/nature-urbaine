/** From the cahier des charges. */
export const DEFAULT_INTERVIEW_QUESTIONS = [
	'Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?',
	'Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ?',
	'Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?',
] as const;

const ROW_LABEL_MAX_LENGTH = 60;

export function interviewQuestionRowLabel(
	question: string | null | undefined,
	rowIndex: number,
) {
	const text = question?.trim();
	if (!text) return `Question ${rowIndex + 1}`;
	if (text.length <= ROW_LABEL_MAX_LENGTH) return text;
	return `${text.slice(0, ROW_LABEL_MAX_LENGTH - 1).trimEnd()}…`;
}
