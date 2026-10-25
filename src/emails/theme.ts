export const colors = {
	ink: '#1b1d1a',
	inkSoft: '#3a3d37',
	muted: '#6f665b',
	paper: '#fdfaf4',
	sand: '#f3eee7',
	line: '#ddd3c7',
};

export const fonts = {
	sans: 'Instrument Sans, Arial, sans-serif',
	serif: 'Newsreader, Georgia, serif',
	mono: 'JetBrains Mono, monospace',
};

export const labelText = {
	color: colors.muted,
	fontFamily: fonts.mono,
	fontSize: '11px',
	letterSpacing: '0.08em',
	textTransform: 'uppercase' as const,
};

export const bodyText = {
	color: colors.ink,
	fontSize: '14px',
	lineHeight: '1.65',
};

export const panel = {
	backgroundColor: colors.sand,
	border: `1px solid ${colors.line}`,
	borderRadius: '6px',
};
