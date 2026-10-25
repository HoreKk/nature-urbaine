import type { ReactNode } from 'react';
import { Text } from 'react-email';
import { bodyText } from '../theme';

export function Paragraph({ children }: { children: ReactNode }) {
	return <Text style={style}>{children}</Text>;
}

const style = {
	...bodyText,
	margin: '0 0 16px',
};
