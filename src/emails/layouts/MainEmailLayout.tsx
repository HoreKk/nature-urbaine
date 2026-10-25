import type { ReactNode } from 'react';
import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from 'react-email';
import { colors, fonts, labelText } from '../theme';

type MainEmailLayoutProps = {
	preheader: string;
	title: string;
	footer?: string;
	children: ReactNode;
};

export function MainEmailLayout({
	preheader,
	title,
	footer = 'Ce message provient d’un formulaire du site Nature Urbaine.',
	children,
}: MainEmailLayoutProps) {
	return (
		<Html lang="fr">
			<Head />
			<Preview>{preheader}</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Section style={styles.header}>
						<Text style={styles.kicker}>Nature Urbaine</Text>
						<Heading as="h1" style={styles.title}>
							{title}
						</Heading>
					</Section>
					<Section style={styles.content}>{children}</Section>
					<Hr style={styles.separator} />
					<Section style={styles.footer}>
						<Text style={styles.footerText}>{footer}</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const styles = {
	body: {
		backgroundColor: colors.sand,
		fontFamily: fonts.sans,
		margin: 0,
		padding: '24px 12px',
	},
	container: {
		backgroundColor: colors.paper,
		border: `1px solid ${colors.line}`,
		borderRadius: '8px',
		margin: '0 auto',
		maxWidth: '620px',
		padding: '24px',
	},
	header: {
		marginBottom: '16px',
	},
	kicker: {
		...labelText,
		margin: '0 0 8px',
	},
	title: {
		color: colors.ink,
		fontFamily: fonts.serif,
		fontSize: '30px',
		fontWeight: 500,
		lineHeight: '1.2',
		margin: 0,
	},
	content: {
		margin: 0,
	},
	separator: {
		borderColor: colors.line,
		margin: '24px 0 16px',
	},
	footer: {
		marginTop: 0,
	},
	footerText: {
		color: colors.muted,
		fontSize: '12px',
		lineHeight: '1.6',
		margin: 0,
	},
};
