import { Box, Flex, Text } from '@chakra-ui/react';

const Wordmark = () => (
	<Flex align="center" gap={2}>
		<Box w="11px" h="11px" borderRadius="full" bgColor="primary.solid" />
		<Text textStyle="wordmark">Nature Urbaine</Text>
	</Flex>
);

export default Wordmark;
