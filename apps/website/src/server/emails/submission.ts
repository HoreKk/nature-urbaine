import { renderSubmissionEmail } from '@nature-urbaine/emails';
import { getParisTimestamp, sendTemplatedEmail } from './send-email';

interface SubmissionEmailData {
	name: string;
	description: string;
	category: string;
	deliveryYear: number;
	address: string;
	contributorEmail: string;
}

export async function sendSubmissionEmail(
	data: SubmissionEmailData,
): Promise<void> {
	const rendered = await renderSubmissionEmail({
		name: data.name,
		description: data.description,
		category: data.category,
		deliveryYear: data.deliveryYear,
		address: data.address,
		contributorEmail: data.contributorEmail,
		submittedAtParis: getParisTimestamp(new Date()),
		source: '/contribuer',
	});

	await sendTemplatedEmail(rendered, data.contributorEmail);
}
