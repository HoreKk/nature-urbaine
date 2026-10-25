import { Section, Text } from 'react-email';
import { bodyText, labelText } from '../theme';
import { MessageWithBreaks } from './MessageWithBreaks';

/** Renders nothing for a field the visitor left empty. */
export function Field({
	label,
	value,
}: {
	label: string;
	value?: string | number;
}) {
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

const styles = {
	block: {
		marginBottom: '16px',
	},
	label: {
		...labelText,
		margin: '0 0 4px',
	},
	value: {
		...bodyText,
		margin: 0,
	},
};
