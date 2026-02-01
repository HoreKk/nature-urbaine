import { Box, Container, Flex, Separator, Text } from '@chakra-ui/react';

const Footer = () => {
	return (
		<Box py={8} bgColor="bg.muted">
			<Container
				maxW="container.lg"
				display="flex"
				flexDir="column"
				alignItems="center"
				gap={6}
			>
				<Flex gap={4} flexWrap="wrap" justifyContent="center">
					TODO: Add footer links here
				</Flex>
				<Separator borderColor="border.emphasized" flex={1} w="full" />
				<Text fontSize="sm" color="fg.muted">
					&copy; {new Date().getFullYear()} Nature Urbaine. All rights reserved.
				</Text>
			</Container>
		</Box>
	);
};

export default Footer;
