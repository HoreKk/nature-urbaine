import { Button, Section, Text } from 'react-email';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';

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
			<Text style={styles.paragraph}>Bonjour {props.authorName},</Text>
			<Text style={styles.paragraph}>
				Merci pour votre contribution : le reportage « {props.title} » est
				publié sur Nature Urbaine, avec vos photographies créditées à votre nom.
			</Text>
			<Section style={styles.action}>
				<Button href={props.reportUrl} style={styles.button}>
					Voir le reportage
				</Button>
			</Section>
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
	action: {
		margin: '8px 0 0',
	},
	button: {
		backgroundColor: '#1b1d1a',
		borderRadius: '6px',
		color: '#fdfaf4',
		fontSize: '14px',
		padding: '10px 18px',
	},
};
