import { ContributionPublishedEmail } from '../templates/contribution/ContributionPublishedEmail';

export default function ContributionPublishedPreview() {
	return (
		<ContributionPublishedEmail
			title="PARIS, RUE DE LA PAIX"
			authorName="Camille Martin"
			reportUrl="http://localhost:3000/reports/1"
		/>
	);
}
