import { chakra } from '@chakra-ui/react';
import type { HTMLChakraProps } from '@chakra-ui/react';

export interface ProseProps extends HTMLChakraProps<'article'> {}

export const Prose = chakra('article', {
	base: {
		color: 'fg',
		lineHeight: 'tall',
		maxW: '65ch',

		'& p': {
			mt: '4',
			_first: { mt: '0' },
		},

		'& h1, & h2, & h3, & h4, & h5, & h6': {
			fontWeight: 'bold',
			lineHeight: 'tight',
			letterSpacing: 'tight',
		},
		'& h1': { fontSize: '4xl', mt: '8', mb: '3' },
		'& h2': { fontSize: '2xl', mt: '8', mb: '3' },
		'& h3': { fontSize: 'xl', mt: '6', mb: '2' },
		'& h4': { fontSize: 'lg', mt: '5', mb: '2' },
		'& h5, & h6': { fontSize: 'md', mt: '4', mb: '2' },

		'& ul': {
			listStyleType: 'disc',
			paddingInlineStart: '6',
			mt: '4',
		},
		'& ol': {
			listStyleType: 'decimal',
			paddingInlineStart: '6',
			mt: '4',
		},
		'& li': {
			mt: '2',
			_marker: { color: 'fg.muted' },
		},

		'& strong': { fontWeight: 'semibold' },
		'& em': { fontStyle: 'italic' },
		'& u': { textDecoration: 'underline' },
		'& s': { textDecoration: 'line-through' },

		'& blockquote': {
			borderStartWidth: '3px',
			borderStartColor: 'primary.emphasized',
			paddingStart: '4',
			paddingBlock: '1',
			my: '6',
			fontStyle: 'italic',
			color: 'fg.muted',
		},

		'& code:not(pre code)': {
			bg: 'bg.muted',
			px: '1',
			py: '0.5',
			borderRadius: 'sm',
			fontSize: '0.875em',
			fontFamily: 'mono',
		},
		'& pre': {
			bg: 'bg.muted',
			p: '4',
			borderRadius: 'md',
			overflowX: 'auto',
			my: '4',
			'& code': { fontFamily: 'mono', fontSize: '0.875em' },
		},

		'& a': {
			color: 'primary.fg',
			textDecoration: 'underline',
			_hover: { color: 'primary.solid' },
		},

		'& hr': {
			borderColor: 'border.emphasized',
			my: '8',
		},

		'& img': {
			borderRadius: 'md',
			maxW: 'full',
		},

		'& table': {
			width: 'full',
			borderCollapse: 'collapse',
			mt: '4',
		},
		'& th': {
			fontWeight: 'semibold',
			bg: 'bg.muted',
			p: '2',
			borderWidth: '1px',
			borderColor: 'border',
			textAlign: 'left',
		},
		'& td': {
			p: '2',
			borderWidth: '1px',
			borderColor: 'border',
		},
	},
});
