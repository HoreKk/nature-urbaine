import { render, toPlainText } from 'react-email';
import {
	ContributionNotificationEmail,
	type ContributionEmailInput,
} from './ContributionNotificationEmail';
import {
	ContributionRejectedEmail,
	type ContributionRejectedEmailInput,
} from './ContributionRejectedEmail';

type RenderedContributionEmail = {
	subject: string;
	html: string;
	text: string;
};

export function getContributionSubject({
	title,
	category,
}: Pick<ContributionEmailInput, 'title' | 'category'>): string {
	return `[Contribution] ${title} - ${category}`;
}

export async function renderContributionEmail(
	input: ContributionEmailInput,
): Promise<RenderedContributionEmail> {
	const email = <ContributionNotificationEmail {...input} />;
	const html = await render(email);
	const text = toPlainText(html);

	return {
		subject: getContributionSubject(input),
		html,
		text,
	};
}

export async function renderContributionRejectedEmail(
	input: ContributionRejectedEmailInput,
): Promise<RenderedContributionEmail> {
	const html = await render(<ContributionRejectedEmail {...input} />);

	return {
		subject: `Votre contribution « ${input.title} » à Nature Urbaine`,
		html,
		text: toPlainText(html),
	};
}
