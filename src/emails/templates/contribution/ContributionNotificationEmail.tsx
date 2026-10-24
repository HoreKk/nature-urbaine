import { Link, Section, Text } from 'react-email';
import { MainEmailLayout } from '../../layouts/MainEmailLayout';

export type ContributionEmailInput = {
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

function MessageWithBreaks({ value }: { value: string }) {
	const lines = value.split('\n');

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

function Row({ label, value }: { label: string; value?: string | number }) {
	if (value === undefined || value === '') return null;

	return (
		<Section style={styles.block}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.value}>
				<MessageWithBreaks value={String(value)} />
			</Text>
		</Section>
	);
}

export function ContributionNotificationEmail(props: ContributionEmailInput) {
	return (
		<MainEmailLayout
			title="Nouvelle contribution"
			preheader={`${props.authorName} propose ${props.pictureCount} photo(s) pour ${props.category}.`}
		>
			<Row label="Titre du projet" value={props.title} />
			<Row label="Catégorie" value={props.category} />
			<Row label="Description" value={props.description} />
			<Row label="Maître d’ouvrage" value={props.projectOwner} />
			<Row label="Maître d’œuvre" value={props.projectManagement} />
			<Row label="Année de livraison" value={props.deliveryYear} />
			<Row label="Coût" value={props.projectCost} />
			<Row label="Superficie" value={props.projectArea} />
			<Row label="Adresse" value={props.address} />
			<Row
				label="Auteur des photographies"
				value={`${props.authorName} <${props.authorEmail}>`}
			/>
			<Row label="Photos" value={props.pictureCount} />
			<Section style={styles.block}>
				<Link href={props.adminUrl} style={styles.link}>
					Ouvrir la contribution dans l’administration
				</Link>
			</Section>
			<Section style={styles.metaBlock}>
				<Text style={styles.metaLabel}>Métadonnées</Text>
				<Text style={styles.metaValue}>
					Envoyée le : {props.submittedAtParis}
				</Text>
				<Text style={styles.metaValue}>Source : {props.source}</Text>
			</Section>
		</MainEmailLayout>
	);
}

const styles = {
	block: {
		marginBottom: '16px',
	},
	label: {
		color: '#6f665b',
		fontFamily: 'JetBrains Mono, monospace',
		fontSize: '11px',
		letterSpacing: '0.08em',
		margin: '0 0 4px',
		textTransform: 'uppercase' as const,
	},
	value: {
		color: '#1b1d1a',
		fontSize: '14px',
		lineHeight: '1.65',
		margin: 0,
	},
	link: {
		color: '#1b1d1a',
		fontSize: '14px',
		textDecoration: 'underline',
	},
	metaBlock: {
		backgroundColor: '#f3eee7',
		border: '1px solid #ddd3c7',
		borderRadius: '6px',
		marginTop: '24px',
		padding: '12px',
	},
	metaLabel: {
		color: '#6f665b',
		fontFamily: 'JetBrains Mono, monospace',
		fontSize: '11px',
		letterSpacing: '0.08em',
		margin: '0 0 6px',
		textTransform: 'uppercase' as const,
	},
	metaValue: {
		color: '#3a3d37',
		fontSize: '12px',
		lineHeight: '1.6',
		margin: 0,
	},
};
