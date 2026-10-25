import { Section, Text } from 'react-email';
import { colors, labelText, panel } from '../theme';

export function Metadata({ entries }: { entries: Record<string, string> }) {
	return (
		<Section style={styles.block}>
			<Text style={styles.label}>Métadonnées</Text>
			{Object.entries(entries).map(([label, value]) => (
				<Text key={label} style={styles.value}>
					{`${label} : ${value}`}
				</Text>
			))}
		</Section>
	);
}

const styles = {
	block: {
		...panel,
		marginTop: '24px',
		padding: '12px',
	},
	label: {
		...labelText,
		margin: '0 0 6px',
	},
	value: {
		color: colors.inkSoft,
		fontSize: '12px',
		lineHeight: '1.6',
		margin: 0,
	},
};
