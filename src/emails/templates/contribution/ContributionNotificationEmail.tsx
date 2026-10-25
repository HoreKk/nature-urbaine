import { Link, Section } from 'react-email';
import { Field } from '../../components/Field';
import { Metadata } from '../../components/Metadata';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';
import { bodyText } from '../../theme';

export type ContributionNotificationEmailInput = {
	title: string;
	category: string;
	description?: string;
	projectOwner?: string;
	projectManagement?: string;
	deliveryYear?: number;
	projectCost?: string;
	projectArea?: string;
	address?: string;
	authorName: string;
	authorEmail: string;
	pictureCount: number;
	adminUrl: string;
	submittedAtParis: string;
	source: string;
};

export function ContributionNotificationEmail(
	props: ContributionNotificationEmailInput,
) {
	return (
		<MainEmailLayout
			title="Nouvelle contribution"
			preheader={`${props.authorName} propose ${props.pictureCount} photo(s) pour ${props.category}.`}
		>
			<Field label="Titre du projet" value={props.title} />
			<Field label="Catégorie" value={props.category} />
			<Field label="Description" value={props.description} />
			<Field label="Maître d’ouvrage" value={props.projectOwner} />
			<Field label="Maître d’œuvre" value={props.projectManagement} />
			<Field label="Année de livraison" value={props.deliveryYear} />
			<Field label="Coût" value={props.projectCost} />
			<Field label="Superficie" value={props.projectArea} />
			<Field label="Adresse" value={props.address} />
			<Field
				label="Auteur des photographies"
				value={`${props.authorName} <${props.authorEmail}>`}
			/>
			<Field label="Photos" value={props.pictureCount} />
			<Section style={styles.block}>
				<Link href={props.adminUrl} style={styles.link}>
					Ouvrir la contribution dans l’administration
				</Link>
			</Section>
			<Metadata
				entries={{ 'Envoyée le': props.submittedAtParis, Source: props.source }}
			/>
		</MainEmailLayout>
	);
}

const styles = {
	block: {
		marginBottom: '16px',
	},
	link: {
		color: bodyText.color,
		fontSize: bodyText.fontSize,
		textDecoration: 'underline',
	},
};
