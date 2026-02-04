import { createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				body: { value: 'Mulish Variable' },
				heading: { value: 'Mulish Variable' },
			},
		},
	},
});

export default system;
