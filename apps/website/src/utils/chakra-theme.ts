import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
	theme: {
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
					50: { value: '#EFF4EC' },
					100: { value: '#E9F1E5' },
					200: { value: '#C9DCBF' },
					300: { value: '#A6C597' },
					400: { value: '#83AE71' },
					500: { value: '#6B9759' },
					600: { value: '#4F7B43' },
					700: { value: '#3D6034' },
					800: { value: '#2C4226' },
					900: { value: '#1B2818' },
					950: { value: '#0E1A0C' },
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
		},
	},
});

const system = createSystem(defaultConfig, config);

export default system;
