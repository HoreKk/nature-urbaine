import { ContributionNotificationEmail } from '../templates/contribution/ContributionNotificationEmail';

export default function ContributionNotificationPreview() {
	return (
		<ContributionNotificationEmail
			title="PARIS, RUE DE LA PAIX"
			category="Espaces publics"
			description={
				'Transformation des sols et plantation de strates basses.\nValidation en concertation locale.'
			}
			projectOwner="Ville de Paris"
			deliveryYear={2024}
			address="12 Rue de la Paix 75002 Paris"
			authorName="Camille Martin"
			authorEmail="camille@example.com"
			pictureCount={12}
			adminUrl="http://localhost:3000/admin/collections/contributions/1"
			submittedAtParis="03/05/2026 14:20"
			source="/contribuer"
		/>
	);
}
