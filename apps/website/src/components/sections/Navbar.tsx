import { Link as ChakraLink, Container, Flex, Heading } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { ColorModeButton } from '../ui/color-mode';

const Navbar = () => {
	return (
		<Container as="nav" maxW="container.xl" py={6}>
			<Flex gap={4} align="center">
				<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
					<Link to="/">
						<Heading as="h1">Nature Urbaine</Heading>
					</Link>
				</ChakraLink>
				<Flex gap={6} ml="auto">
					<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
						<Link to="/">Accueil</Link>
					</ChakraLink>
					<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
						<Link to="/reports">Reportages</Link>
					</ChakraLink>
					<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
						<Link to="/">Interviews</Link>
					</ChakraLink>
					<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
						<Link to="/">Contact</Link>
					</ChakraLink>
				</Flex>
				<ColorModeButton />
			</Flex>
		</Container>
	);
};

export default Navbar;
