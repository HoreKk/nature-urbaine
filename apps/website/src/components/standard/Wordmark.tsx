import { Box, Flex, Text } from '@chakra-ui/react';

type WordmarkProps = {
	title?: string;
};

const Wordmark = ({ title = 'Nature Urbaine' }: WordmarkProps) => (
	<Flex align="center" gap={2}>
		<Box w="11px" h="11px" borderRadius="full" bgColor="primary.solid" />
		<Text textStyle="wordmark">{title}</Text>
	</Flex>
);

export default Wordmark;
