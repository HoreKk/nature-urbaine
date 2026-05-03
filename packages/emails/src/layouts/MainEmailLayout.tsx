import type { ReactNode } from "react";
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
} from "react-email";

type MainEmailLayoutProps = {
	preheader: string;
	title: string;
	children: ReactNode;
};

export function MainEmailLayout({
	preheader,
	title,
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
						<Text style={styles.footerText}>
							Ce message provient du formulaire de contact Nature Urbaine.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const styles = {
	body: {
		backgroundColor: "#f3eee7",
		fontFamily: "Instrument Sans, Arial, sans-serif",
		margin: 0,
		padding: "24px 12px",
	},
	container: {
		backgroundColor: "#fdfaf4",
		border: "1px solid #ddd3c7",
		borderRadius: "8px",
		margin: "0 auto",
		maxWidth: "620px",
		padding: "24px",
	},
	header: {
		marginBottom: "16px",
	},
	kicker: {
		color: "#6f665b",
		fontFamily: "JetBrains Mono, monospace",
		fontSize: "11px",
		letterSpacing: "0.08em",
		margin: "0 0 8px",
		textTransform: "uppercase" as const,
	},
	title: {
		color: "#1b1d1a",
		fontFamily: "Newsreader, Georgia, serif",
		fontSize: "30px",
		fontWeight: 500,
		lineHeight: "1.2",
		margin: 0,
	},
	content: {
		margin: 0,
	},
	separator: {
		borderColor: "#ddd3c7",
		margin: "24px 0 16px",
	},
	footer: {
		marginTop: 0,
	},
	footerText: {
		color: "#6f665b",
		fontSize: "12px",
		lineHeight: "1.6",
		margin: 0,
	},
};
