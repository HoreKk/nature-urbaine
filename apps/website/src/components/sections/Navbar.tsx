import { Box, Link as ChakraLink, Container, Flex } from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { ColorModeButton } from '../ui/color-mode';
import Logo from '../ui/Logo';

const navbarLinks: { label: string; to: LinkProps['to'] }[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Reportages', to: '/reports' },
	{ label: 'Interviews', to: '/interviews' },
	{ label: 'Contact', to: '/contact' },
];

const Navbar = () => {
	return (
		<Container
			as="nav"
			maxW="container.xl"
			py={6}
			borderBottom="1px solid"
			borderColor="border.muted"
		>
			<Flex gap={4} align="center">
				<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
					<Link to="/">
						<Logo size="md" />
					</Link>
				</ChakraLink>
				<Flex gap={6} ml="auto" align="center">
					{navbarLinks.map(({ label, to }) => (
						<Link key={`${to}-${label}`} to={to}>
							{({ isActive }) => (
								<Flex direction="column" align="center" gap={1}>
									<ChakraLink
										outline="none"
										_hover={{ textDecor: 'none' }}
										fontWeight={isActive ? 'bold' : 'medium'}
										pt={1}
										asChild
									>
										<span>{label}</span>
									</ChakraLink>
									<Box
										w="95%"
										h="2px"
										borderRadius="full"
										bgColor={isActive ? 'primary.solid' : 'transparent'}
									/>
								</Flex>
							)}
						</Link>
					))}
					<ColorModeButton />
				</Flex>
			</Flex>
		</Container>
	);
};

export default Navbar;
