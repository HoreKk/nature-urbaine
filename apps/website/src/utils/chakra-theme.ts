import { createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				body: { value: 'Mulish Variable' },
				heading: { value: 'Mulish Variable' },
			},
			colors: {
				primary: {
					50: { value: '#edf7ed' },
					100: { value: '#c6e8c6' },
					200: { value: '#9dd59d' },
					300: { value: '#6ec06e' },
					400: { value: '#44ab44' },
					500: { value: '#2a8a2a' }, // primary
					600: { value: '#1f6b1f' }, // use this for text on light bg
					700: { value: '#164e16' },
					800: { value: '#0e330e' },
					900: { value: '#071807' },
				},
			},
		},
		semanticTokens: {
			colors: {
				primary: {
					solid: {
						value: {
							base: '{colors.primary.500}',
							_dark: '{colors.primary.300}',
						},
					},
					contrast: { 
						value: {
							base: '{colors.primary.100}',
							_dark: '{colors.primary.900}',
						},
					},
					fg: { 
						value: {
							base: '{colors.primary.700}',
							_dark: '{colors.primary.300}',
						},
					},
					muted: { 
						value: {
							base: '{colors.primary.100}',
							_dark: '{colors.primary.800}',
						},
					},
					subtle: { 
						value: {
							base: '{colors.primary.200}',
							_dark: '{colors.primary.700}',
						},
					},
					emphasized: { 
						value: {
							base: '{colors.primary.300}',
							_dark: '{colors.primary.600}',
						},
					},
					focusRing: { 
						value: {
							base: '{colors.primary.500}',
							_dark: '{colors.primary.400}',
						},
					},
					accent: { 
						value: {
							base: '{colors.primary.700}',
							_dark: '{colors.primary.300}',
						},
					},
				},
			},
		},
	},
});

export default system;
