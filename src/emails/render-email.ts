import type { ReactElement } from 'react';
import { render, toPlainText } from 'react-email';

export type RenderedEmail = {
	subject: string;
	html: string;
	text: string;
};

export async function renderEmail(
	email: ReactElement,
	subject: string,
): Promise<RenderedEmail> {
	const html = await render(email);
	return { subject, html, text: toPlainText(html) };
}
