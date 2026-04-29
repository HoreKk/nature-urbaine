import { Box, Flex, Text } from '@chakra-ui/react';

const Wordmark = () => (
	<Flex align="center" gap={2}>
		<Box w="11px" h="11px" borderRadius="full" bgColor="primary.solid" />
		<Text
			fontFamily="heading"
			fontSize="20px"
			fontWeight={500}
			letterSpacing="-0.02em"
			lineHeight={1}
			color="fg"
		>
			Nature Urbaine
		</Text>
	</Flex>
);

export default Wordmark;
