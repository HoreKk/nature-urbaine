import { createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				body: { value: 'Inter Variable' },
				heading: { value: 'Josefin Sans Variable' },
			},
		},
	},
});

export default system;
