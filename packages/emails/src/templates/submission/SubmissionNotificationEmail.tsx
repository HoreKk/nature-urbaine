import { Section, Text } from "react-email";
import { MainEmailLayout } from "../../layouts/MainEmailLayout";

export type SubmissionEmailInput = {
	name: string;
	description: string;
	category: string;
	deliveryYear: number;
	address: string;
	contributorEmail: string;
	submittedAtParis: string;
	source: string;
};

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

export function SubmissionNotificationEmail(props: SubmissionEmailInput) {
	return (
		<MainEmailLayout
			title="Nouvelle contribution"
			preheader={`Nouvelle contribution de ${props.contributorEmail} pour ${props.category}.`}
		>
			<Section style={styles.block}>
				<Text style={styles.label}>Titre du projet</Text>
				<Text style={styles.value}>{props.name}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Description</Text>
				<Text style={styles.value}>
					<MessageWithBreaks value={props.description} />
				</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Categorie</Text>
				<Text style={styles.value}>{props.category}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Annee de livraison</Text>
				<Text style={styles.value}>{props.deliveryYear}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Adresse</Text>
				<Text style={styles.value}>{props.address}</Text>
			</Section>
			<Section style={styles.block}>
				<Text style={styles.label}>Email contributeur</Text>
				<Text style={styles.value}>{props.contributorEmail}</Text>
			</Section>
			<Section style={styles.metaBlock}>
				<Text style={styles.metaLabel}>Metadonnees</Text>
				<Text style={styles.metaValue}>
					Envoye le: {props.submittedAtParis}
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
