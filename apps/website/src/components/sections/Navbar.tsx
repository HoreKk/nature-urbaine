import { Link as ChakraLink, Container, Flex, Heading } from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { ColorModeButton } from '../ui/color-mode';

const navbarLinks: { label: string; to: LinkProps['to'] }[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Reportages', to: '/reports' },
	{ label: 'Interviews', to: '/interviews' },
	{ label: 'Contact', to: '/contact' },
];

const Navbar = () => {
	return (
		<Container as="nav" maxW="container.xl" py={6}>
			<Flex gap={4} align="center">
				<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
					<Link to="/">
						<Heading as="h1" fontWeight="extrabold">
							Nature Urbaine
						</Heading>
					</Link>
				</ChakraLink>
				<Flex gap={6} ml="auto">
					{navbarLinks.map(({ label, to }) => (
						<Link key={`${to}-${label}`} to={to}>
							{({ isActive }) => (
								<ChakraLink
									outline="none"
									_hover={{ textDecor: 'none' }}
									fontWeight={isActive ? 'bold' : 'medium'}
									asChild
								>
									<span>{label}</span>
								</ChakraLink>
							)}
						</Link>
					))}
				</Flex>
				<ColorModeButton />
			</Flex>
		</Container>
	);
};

export default Navbar;
