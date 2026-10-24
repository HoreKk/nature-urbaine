import { render, toPlainText } from 'react-email';
import {
	ContactNotificationEmail,
	type ContactEmailInput,
} from './ContactNotificationEmail';

type RenderedContactEmail = {
	subject: string;
	html: string;
	text: string;
};

export function getContactSubject({
	firstName,
	lastName,
	sector,
}: Pick<ContactEmailInput, 'firstName' | 'lastName' | 'sector'>): string {
	return `[Contact] ${firstName} ${lastName} — ${sector}`;
}

export async function renderContactEmail(
	input: ContactEmailInput,
): Promise<RenderedContactEmail> {
	const email = <ContactNotificationEmail {...input} />;
	const html = await render(email);
	const text = toPlainText(html);

	return {
		subject: getContactSubject(input),
		html,
		text,
	};
}
