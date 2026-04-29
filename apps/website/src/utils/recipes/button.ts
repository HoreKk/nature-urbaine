import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
	variants: {
		variant: {
			outline: {
				bg: 'bg',
				_hover: { bg: 'bg.subtle' },
			},
		},
	},
});
