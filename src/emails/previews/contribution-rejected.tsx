import { ContributionRejectedEmail } from '../templates/contribution/ContributionRejectedEmail';

export default function ContributionRejectedPreview() {
	return (
		<ContributionRejectedEmail
			title="PARIS, RUE DE LA PAIX"
			authorName="Camille Martin"
			rejectionNote={
				'Les photos sont trop sombres pour être publiées.\nN’hésitez pas à nous en proposer d’autres.'
			}
		/>
	);
}
