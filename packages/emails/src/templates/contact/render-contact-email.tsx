import { render, toPlainText } from "react-email";
import {
	ContactNotificationEmail,
	type ContactEmailInput,
} from "./ContactNotificationEmail";

type RenderedContactEmail = {
	subject: string;
	html: string;
	text: string;
};

const SECTOR_LABELS: Record<string, string> = {
	paysagiste: "Paysagiste",
	MOA: "Maîtrise d'ouvrage (MOA)",
	MOE: "Maîtrise d'œuvre (MOE)",
	urbaniste: "Urbaniste",
	autre: "Autre",
};

function getSectorLabel(value: string): string {
	return SECTOR_LABELS[value] ?? value;
}

export function getContactSubject({
	firstName,
	lastName,
	sector,
}: Pick<ContactEmailInput, "firstName" | "lastName" | "sector">): string {
	return `[Contact] ${firstName} ${lastName} — ${getSectorLabel(sector)}`;
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
