import { Section, Text } from "react-email";
import { MainEmailLayout } from "../../layouts/MainEmailLayout";

export type ContactEmailInput = {
	firstName: string;
	lastName: string;
	email: string;
	sector: string;
	message: string;
	submittedAtParis: string;
	source: string;
};

const SECTOR_LABELS: Record<string, string> = {
	paysagiste: "Paysagiste",
	MOA: "Maîtrise d'ouvrage (MOA)",
	MOE: "Maîtrise d'œuvre (MOE)",
	urbaniste: "Urbaniste",
	autre: "Autre",
};

function getSectorLabel(value: string): string {
	return SECTOR_LABELS[value] ?? value;
}

function MessageWithBreaks({ value }: { value: string }) {
	const lines = value.split("\n");

	return (
		<>
			{lines.map((line, index) => (
				<span key={`${line}-${index}`}>
					{line}
					{index < lines.length - 1 ? <br /> : null}
				</span>
			))}
		</>
	);
}

export function ContactNotificationEmail(props: ContactEmailInput) {
	return (
		<MainEmailLayout
			title="Nouveau message de contact"
			preheader={`Nouveau message de ${props.firstName} ${props.lastName} (${getSectorLabel(props.sector)}).`}
		>
			<Section style={styles.block}>
				<Text style={styles.label}>Prénom</Text>
				<Text style={styles.value}>{props.firstName}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Nom</Text>
				<Text style={styles.value}>{props.lastName}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Email</Text>
				<Text style={styles.value}>{props.email}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Secteur d'activité</Text>
				<Text style={styles.value}>{getSectorLabel(props.sector)}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Message</Text>
				<Text style={styles.value}>
					<MessageWithBreaks value={props.message} />
				</Text>
			</Section>
			<Section style={styles.metaBlock}>
				<Text style={styles.metaLabel}>Métadonnées</Text>
				<Text style={styles.metaValue}>
					Envoyé le: {props.submittedAtParis}
				</Text>
				<Text style={styles.metaValue}>Source: {props.source}</Text>
			</Section>
		</MainEmailLayout>
	);
}

const styles = {
	block: {
		marginBottom: "16px",
	},
	label: {
		color: "#6f665b",
		fontFamily: "JetBrains Mono, monospace",
		fontSize: "11px",
		letterSpacing: "0.08em",
		margin: "0 0 4px",
		textTransform: "uppercase" as const,
	},
	value: {
		color: "#1b1d1a",
		fontSize: "14px",
		lineHeight: "1.65",
		margin: 0,
	},
	metaBlock: {
		backgroundColor: "#f3eee7",
		border: "1px solid #ddd3c7",
		borderRadius: "6px",
		marginTop: "24px",
		padding: "12px",
	},
	metaLabel: {
		color: "#6f665b",
		fontFamily: "JetBrains Mono, monospace",
		fontSize: "11px",
		letterSpacing: "0.08em",
		margin: "0 0 6px",
		textTransform: "uppercase" as const,
	},
	metaValue: {
		color: "#3a3d37",
		fontSize: "12px",
		lineHeight: "1.6",
		margin: 0,
	},
};
