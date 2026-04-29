import { defineTextStyles } from '@chakra-ui/react';

export const textStyles = defineTextStyles({
	kicker: {
		value: {
			fontFamily: 'mono',
			fontSize: '11px',
			textTransform: 'uppercase',
			letterSpacing: '0.08em',
			color: 'fg.subtle',
		},
	},
	display: {
		value: {
			fontFamily: 'heading',
			fontSize: { base: '48px', md: '76px' },
			fontWeight: '350',
			lineHeight: '0.95',
			letterSpacing: '-0.025em',
			color: 'fg',
		},
	},
	'heading.lg': {
		value: {
			fontFamily: 'heading',
			fontSize: { base: '32px', md: '44px' },
			fontWeight: '400',
			lineHeight: '1',
			letterSpacing: '-0.02em',
			color: 'fg',
		},
	},
	'heading.md': {
		value: {
			fontFamily: 'heading',
			fontSize: '26px',
			fontWeight: '400',
			lineHeight: '1.1',
			letterSpacing: '-0.01em',
			color: 'fg',
		},
	},
	wordmark: {
		value: {
			fontFamily: 'heading',
			fontSize: '20px',
			fontWeight: '500',
			lineHeight: '1',
			letterSpacing: '-0.02em',
			color: 'fg',
		},
	},
	lead: {
		value: {
			fontFamily: 'body',
			fontSize: { base: 'md', md: 'lg' },
			lineHeight: '1.5',
			color: 'fg.muted',
		},
	},
	emphasis: {
		value: {
			fontStyle: 'italic',
			color: 'primary.fg',
		},
	},
	'label.section': {
		value: {
			fontFamily: 'mono',
			fontSize: '11px',
			textTransform: 'uppercase',
			letterSpacing: '0.08em',
			color: 'fg.subtle',
		},
	},
});
