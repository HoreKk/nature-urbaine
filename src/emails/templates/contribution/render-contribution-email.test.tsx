import { describe, expect, it } from 'vitest';
import {
	getContributionSubject,
	renderContributionEmail,
	renderContributionRejectedEmail,
} from './render-contribution-email';

const input = {
	title: 'PARIS, RUE DE LA PAIX',
	category: 'Espaces publics',
	description:
		'Transformation des sols et plantation de strates basses.\nValidation en concertation locale.',
	authorName: 'Camille Martin',
	authorEmail: 'camille@example.com',
	pictureCount: 12,
	adminUrl: 'https://example.com/admin/collections/contributions/4',
	submittedAtParis: '03/05/2026 14:20',
	source: '/contribuer',
};

describe('renderContributionEmail', () => {
	it('renders the contribution with a link to the admin', async () => {
		const rendered = await renderContributionEmail(input);

		expect(rendered.subject).toBe(getContributionSubject(input));
		expect(rendered.html).toContain('Nouvelle contribution');
		expect(rendered.html).toContain(input.adminUrl);
		expect(rendered.text).toContain('Transformation des sols');
		expect(rendered.text).toContain('Camille Martin <camille@example.com>');
	});

	it('leaves out the fields the author did not fill', async () => {
		const rendered = await renderContributionEmail(input);

		expect(rendered.text).not.toContain('Maître d’ouvrage');
		expect(rendered.text).not.toContain('Superficie');
	});
});

describe('renderContributionRejectedEmail', () => {
	it('gives the Contributeur the reason, line breaks kept', async () => {
		const rendered = await renderContributionRejectedEmail({
			title: 'PARIS, RUE DE LA PAIX',
			authorName: 'Camille Martin',
			rejectionNote: 'Photos trop sombres.\nProposez-en d’autres.',
		});

		expect(rendered.subject).toContain('PARIS, RUE DE LA PAIX');
		expect(rendered.text).toContain('Bonjour Camille Martin');
		expect(rendered.html).toContain('Photos trop sombres.<br/>');
		expect(rendered.text).toContain('Répondez simplement à ce message');
	});
});
