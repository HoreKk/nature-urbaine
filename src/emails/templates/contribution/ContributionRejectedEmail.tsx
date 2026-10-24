import { Section, Text } from 'react-email';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';
import { MessageWithBreaks } from './ContributionNotificationEmail';

export type ContributionRejectedEmailInput = {
	title: string;
	authorName: string;
	rejectionNote: string;
};

export function ContributionRejectedEmail(
	props: ContributionRejectedEmailInput,
) {
	return (
		<MainEmailLayout
			title="Votre contribution"
			preheader={`Nous ne publierons pas les photographies de « ${props.title} ».`}
			footer="Une question ? Répondez simplement à ce message."
		>
			<Text style={styles.paragraph}>Bonjour {props.authorName},</Text>
			<Text style={styles.paragraph}>
				Merci d’avoir proposé vos photographies de « {props.title} » à Nature
				Urbaine. Après examen, nous ne les publierons pas.
			</Text>
			<Section style={styles.note}>
				<Text style={styles.label}>Motif</Text>
				<Text style={styles.paragraph}>
					<MessageWithBreaks value={props.rejectionNote} />
				</Text>
			</Section>
			<Text style={styles.paragraph}>
				Les photos que vous nous avez envoyées ont été supprimées.
			</Text>
		</MainEmailLayout>
	);
}

const styles = {
	paragraph: {
		color: '#1b1d1a',
		fontSize: '14px',
		lineHeight: '1.65',
		margin: '0 0 16px',
	},
	note: {
		backgroundColor: '#f3eee7',
		border: '1px solid #ddd3c7',
		borderRadius: '6px',
		marginBottom: '16px',
		padding: '12px 12px 0',
	},
	label: {
		color: '#6f665b',
		fontFamily: 'JetBrains Mono, monospace',
		fontSize: '11px',
		letterSpacing: '0.08em',
		margin: '0 0 4px',
		textTransform: 'uppercase' as const,
	},
};
