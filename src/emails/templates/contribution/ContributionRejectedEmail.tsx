import { Section, Text } from 'react-email';
import { MessageWithBreaks } from '../../components/MessageWithBreaks';
import { Paragraph } from '../../components/Paragraph';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';
import { labelText, panel } from '../../theme';

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
			<Paragraph>Bonjour {props.authorName},</Paragraph>
			<Paragraph>
				Merci d’avoir proposé vos photographies de « {props.title} » à Nature
				Urbaine. Après examen, nous ne les publierons pas.
			</Paragraph>
			<Section style={styles.note}>
				<Text style={styles.label}>Motif</Text>
				<Paragraph>
					<MessageWithBreaks value={props.rejectionNote} />
				</Paragraph>
			</Section>
			<Paragraph>
				Les photos que vous nous avez envoyées ont été supprimées.
			</Paragraph>
		</MainEmailLayout>
	);
}

const styles = {
	note: {
		...panel,
		marginBottom: '16px',
		padding: '12px 12px 0',
	},
	label: {
		...labelText,
		margin: '0 0 4px',
	},
};
