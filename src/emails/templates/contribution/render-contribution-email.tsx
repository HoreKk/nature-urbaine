import { type RenderedEmail, renderEmail } from '../../render-email';
import {
	ContributionNotificationEmail,
	type ContributionNotificationEmailInput,
} from './ContributionNotificationEmail';
import {
	ContributionPublishedEmail,
	type ContributionPublishedEmailInput,
} from './ContributionPublishedEmail';
import {
	ContributionRejectedEmail,
	type ContributionRejectedEmailInput,
} from './ContributionRejectedEmail';

export function getContributionSubject({
	title,
	category,
}: Pick<ContributionNotificationEmailInput, 'title' | 'category'>): string {
	return `[Contribution] ${title} - ${category}`;
}

export function renderContributionNotificationEmail(
	input: ContributionNotificationEmailInput,
): Promise<RenderedEmail> {
	return renderEmail(
		<ContributionNotificationEmail {...input} />,
		getContributionSubject(input),
	);
}

export function renderContributionRejectedEmail(
	input: ContributionRejectedEmailInput,
): Promise<RenderedEmail> {
	return renderEmail(
		<ContributionRejectedEmail {...input} />,
		`Votre contribution « ${input.title} » à Nature Urbaine`,
	);
}

export function renderContributionPublishedEmail(
	input: ContributionPublishedEmailInput,
): Promise<RenderedEmail> {
	return renderEmail(
		<ContributionPublishedEmail {...input} />,
		'Vos photos sont en ligne sur Nature Urbaine',
	);
}
