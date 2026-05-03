import { ContactNotificationEmail } from "../templates/contact/ContactNotificationEmail";

export default function ContactNotificationPreview() {
	return (
		<ContactNotificationEmail
			firstName="Claire"
			lastName="Martin"
			email="claire.martin@example.com"
			sector="paysagiste"
			message={
				"Bonjour,\nJe souhaite echanger sur un reportage de reamenagement d'espace public.\nPouvez-vous me recontacter cette semaine ?"
			}
			submittedAtParis="03/05/2026 14:20"
			source="/contact"
		/>
	);
}
