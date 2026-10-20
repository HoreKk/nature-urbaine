import { render, toPlainText } from "react-email";
import {
	SubmissionNotificationEmail,
	type SubmissionEmailInput,
} from "./SubmissionNotificationEmail";

type RenderedSubmissionEmail = {
	subject: string;
	html: string;
	text: string;
};

export function getSubmissionSubject({
	name,
	category,
}: Pick<SubmissionEmailInput, "name" | "category">): string {
	return `[Contribution] ${name} - ${category}`;
}

export async function renderSubmissionEmail(
	input: SubmissionEmailInput,
): Promise<RenderedSubmissionEmail> {
	const email = <SubmissionNotificationEmail {...input} />;
	const html = await render(email);
	const text = toPlainText(html);

	return {
		subject: getSubmissionSubject(input),
		html,
		text,
	};
}
