import { type RenderedEmail, renderEmail } from '../../render-email';
import {
	ContactNotificationEmail,
	type ContactEmailInput,
} from './ContactNotificationEmail';

export function getContactSubject({
	firstName,
	lastName,
	sector,
}: Pick<ContactEmailInput, 'firstName' | 'lastName' | 'sector'>): string {
	return `[Contact] ${firstName} ${lastName} — ${sector}`;
}

export function renderContactEmail(
	input: ContactEmailInput,
): Promise<RenderedEmail> {
	return renderEmail(
		<ContactNotificationEmail {...input} />,
		getContactSubject(input),
	);
}
