import { SubmissionNotificationEmail } from "../templates/submission/SubmissionNotificationEmail";

export default function SubmissionNotificationPreview() {
	return (
		<SubmissionNotificationEmail
			name="Reamenagement de la place Jourdan"
			description={
				"Transformation des sols et plantation de strates basses.\nValidation en concertation locale."
			}
			category="Espaces publics"
			deliveryYear={2024}
			address="12 rue de la Paix, Paris"
			contributorEmail="contributeur@example.com"
			submittedAtParis="03/05/2026 14:20"
			source="/contribuer"
		/>
	);
}
