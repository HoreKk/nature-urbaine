import { Field } from '../../components/Field';
import { Metadata } from '../../components/Metadata';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';

export type ContactEmailInput = {
	firstName: string;
	lastName: string;
	email: string;
	sector: string;
	message: string;
	submittedAtParis: string;
	source: string;
};

export function ContactNotificationEmail(props: ContactEmailInput) {
	return (
		<MainEmailLayout
			title="Nouveau message de contact"
			preheader={`Nouveau message de ${props.firstName} ${props.lastName} (${props.sector}).`}
		>
			<Field label="Prénom" value={props.firstName} />
			<Field label="Nom" value={props.lastName} />
			<Field label="Email" value={props.email} />
			<Field label="Secteur d'activité" value={props.sector} />
			<Field label="Message" value={props.message} />
			<Metadata
				entries={{ 'Envoyé le': props.submittedAtParis, Source: props.source }}
			/>
		</MainEmailLayout>
	);
}
