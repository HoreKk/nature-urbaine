import {
	AbsoluteCenter,
	Box,
	Button,
	Link as ChakraLink,
	Container,
	Flex,
	HStack,
} from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { LuSearch } from 'react-icons/lu';
import Wordmark from '@/components/standard/Wordmark';

const navbarLinks: { label: string; to: LinkProps['to'] }[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'À la une', to: '/interviews' },
	{ label: 'Reportages', to: '/reports' },
	{ label: 'Carte', to: '/carte' },
	{ label: 'Contribuer', to: '/contribuer' },
	{ label: 'Contact', to: '/contact' },
];

const Navbar = () => {
	return (
		<Box as="nav" borderBottom="1px solid" borderColor="border.muted">
			<Container maxW="container.xl" py="20px" position="relative">
				<Flex align="center" justify="space-between" gap={6}>
					<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
						<Link to="/">
							<Wordmark />
						</Link>
					</ChakraLink>

					<AbsoluteCenter axis="horizontal">
						<HStack gap="22px" fontSize="13px">
							{navbarLinks.map(({ label, to }) => (
								<Link key={`${to}-${label}`} to={to}>
									{({ isActive }) => (
										<ChakraLink
											asChild
											outline="none"
											color={isActive ? 'fg' : 'fg.muted'}
											fontWeight={isActive ? 500 : 400}
											letterSpacing="-0.005em"
											textDecoration={isActive ? 'underline' : 'none'}
											textUnderlineOffset="5px"
											_hover={{ textDecoration: 'underline' }}
										>
											<span>{label}</span>
										</ChakraLink>
									)}
								</Link>
							))}
						</HStack>
					</AbsoluteCenter>

					<HStack gap={3}>
						<Button
							variant="outline"
							size="sm"
							borderRadius="full"
							borderColor="border"
							color="fg.muted"
							fontWeight={500}
							px="14px"
						>
							<LuSearch /> Rechercher
						</Button>
						<Button
							size="sm"
							borderRadius="full"
							bgColor="secondary.solid"
							color="secondary.contrast"
							fontWeight={500}
							px="16px"
							_hover={{ bgColor: 'secondary.emphasized' }}
						>
							Contribuer
						</Button>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
};

export default Navbar;
