import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { buttonRecipe } from './recipes/button';
import { textStyles } from './recipes/textStyles';

const config = defineConfig({
	theme: {
		recipes: {
			button: buttonRecipe,
		},
		textStyles,
		tokens: {
			fonts: {
				body: {
					value: "'Instrument Sans', 'IBM Plex Sans', system-ui, sans-serif",
				},
				heading: {
					value: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
				},
				mono: {
					value:
						"'JetBrains Mono Variable', 'IBM Plex Mono', ui-monospace, monospace",
				},
			},
			colors: {
				paper: {
					DEFAULT: { value: '#FAF8F3' },
					50: { value: '#FAF8F3' },
					100: { value: '#F2EFE7' },
					200: { value: '#E8E4D8' },
					300: { value: '#D9D5C7' },
					400: { value: '#9A9D93' },
					500: { value: '#6B6E66' },
					600: { value: '#3A3D38' },
					700: { value: '#1B1D1A' },
					800: { value: '#141511' },
					900: { value: '#0B0C0A' },
					950: { value: '#050605' },
				},
				primary: {
					50: { value: '#FBF2EA' },
					100: { value: '#F5DEC9' },
					200: { value: '#E9B991' },
					300: { value: '#DA945E' },
					400: { value: '#C97639' },
					500: { value: '#B25D27' },
					600: { value: '#934A1F' },
					700: { value: '#6F3818' },
					800: { value: '#4F2811' },
					900: { value: '#2F180A' },
					950: { value: '#1A0D05' },
				},
				secondary: {
					50: { value: '#F4F4F2' },
					100: { value: '#E5E5E2' },
					200: { value: '#C8C9C3' },
					300: { value: '#9A9D93' },
					400: { value: '#6B6E66' },
					500: { value: '#3A3D38' },
					600: { value: '#262824' },
					700: { value: '#1B1D1A' },
					800: { value: '#141511' },
					900: { value: '#0B0C0A' },
					950: { value: '#050605' },
				},
			},
		},
		semanticTokens: {
			colors: {
				bg: {
					DEFAULT: { value: '{colors.paper.50}' },
					subtle: { value: '{colors.paper.100}' },
					muted: { value: '{colors.paper.200}' },
				},
				border: {
					DEFAULT: { value: '{colors.paper.300}' },
					muted: { value: '{colors.paper.200}' },
				},
				fg: {
					DEFAULT: { value: '{colors.secondary.700}' },
					muted: { value: '{colors.secondary.500}' },
					subtle: { value: '{colors.secondary.400}' },
				},
				paper: {
					solid: { value: '{colors.paper.700}' },
					contrast: { value: '{colors.paper.50}' },
					fg: { value: '{colors.paper.700}' },
					muted: { value: '{colors.paper.100}' },
					subtle: { value: '{colors.paper.50}' },
					emphasized: { value: '{colors.paper.300}' },
					focusRing: { value: '{colors.paper.500}' },
				},
				primary: {
					solid: { value: '{colors.primary.600}' },
					contrast: { value: '{colors.paper.50}' },
					fg: { value: '{colors.primary.800}' },
					muted: { value: '{colors.primary.100}' },
					subtle: { value: '{colors.primary.50}' },
					emphasized: { value: '{colors.primary.500}' },
					focusRing: { value: '{colors.primary.600}' },
				},
				secondary: {
					solid: { value: '{colors.secondary.700}' },
					contrast: { value: '{colors.paper.50}' },
					fg: { value: '{colors.secondary.700}' },
					muted: { value: '{colors.secondary.100}' },
					subtle: { value: '{colors.secondary.50}' },
					emphasized: { value: '{colors.secondary.500}' },
					focusRing: { value: '{colors.secondary.700}' },
				},
			},
		},
	},
	globalCss: {
		'html, body': {
			backgroundColor: 'bg',
			color: 'fg',
			scrollbarWidth: 'thin',
			scrollbarColor: 'gray transparent',
		},
	},
});

const system = createSystem(defaultConfig, config);

export default system;
