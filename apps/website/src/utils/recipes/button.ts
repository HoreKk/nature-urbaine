import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
	base: {
		borderRadius: 'full',
		fontWeight: '500',
	},
	variants: {
		variant: {
			solid: {
				bg: 'secondary.solid',
				color: 'secondary.contrast',
				_hover: { bg: 'secondary.emphasized' },
			},
			outline: {
				bg: 'bg',
				borderColor: 'border',
				color: 'fg',
				_hover: { bg: 'bg.subtle' },
			},
			ghost: {
				color: 'fg.muted',
				_hover: { bg: 'bg.muted', color: 'fg' },
			},
		},
	},
});
