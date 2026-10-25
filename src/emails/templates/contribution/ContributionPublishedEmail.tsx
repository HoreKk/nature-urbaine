import { Button, Section } from 'react-email';
import { Paragraph } from '../../components/Paragraph';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';
import { colors } from '../../theme';

export type ContributionPublishedEmailInput = {
	title: string;
	authorName: string;
	reportUrl: string;
};

export function ContributionPublishedEmail(
	props: ContributionPublishedEmailInput,
) {
	return (
		<MainEmailLayout
			title="Vos photos sont en ligne"
			preheader={`Le reportage « ${props.title} » est publié sur Nature Urbaine.`}
			footer="Une question ? Répondez simplement à ce message."
		>
			<Paragraph>Bonjour {props.authorName},</Paragraph>
			<Paragraph>
				Merci pour votre contribution : le reportage « {props.title} » est
				publié sur Nature Urbaine, avec vos photographies créditées à votre nom.
			</Paragraph>
			<Section style={styles.action}>
				<Button href={props.reportUrl} style={styles.button}>
					Voir le reportage
				</Button>
			</Section>
		</MainEmailLayout>
	);
}

const styles = {
	action: {
		margin: '8px 0 0',
	},
	button: {
		backgroundColor: colors.ink,
		borderRadius: '6px',
		color: colors.paper,
		fontSize: '14px',
		padding: '10px 18px',
	},
};
