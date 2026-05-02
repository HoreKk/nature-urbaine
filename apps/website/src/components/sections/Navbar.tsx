import {
	AbsoluteCenter,
	Box,
	Button,
	CloseButton,
	Drawer,
	Flex,
	HStack,
	IconButton,
	Link as ChakraLink,
	Container,
	Stack,
	Portal,
} from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import Wordmark from '@/components/standard/Wordmark';

const navbarLinks: { label: string; to: LinkProps['to'] }[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Reportages', to: '/reports' },
	{ label: 'Interviews', to: '/interviews' },
	{ label: 'Carte', to: '/carte' },
	{ label: 'Contribuer', to: '/contribuer' },
	{ label: 'Contact', to: '/contact' },
];

const NavLink = ({
	label,
	to,
	onClick,
}: {
	label: string;
	to: LinkProps['to'];
	onClick?: () => void;
}) => (
	<Link key={`${to}-${label}`} to={to} onClick={onClick}>
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
);

const Navbar = () => {
	const [open, setOpen] = useState(false);

	return (
		<Box as="nav" borderBottom="1px solid" borderColor="border.muted">
			<Container maxW="container.xl" py="20px" position="relative">
				<Flex align="center" justify="space-between" gap={6}>
					<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
						<Link to="/">
							<Wordmark />
						</Link>
					</ChakraLink>

					<AbsoluteCenter
						axis="horizontal"
						display={{ base: 'none', md: 'block' }}
					>
						<HStack gap="22px" fontSize="13px">
							{navbarLinks.map(({ label, to }) => (
								<NavLink key={`${to}-${label}`} label={label} to={to} />
							))}
						</HStack>
					</AbsoluteCenter>

					<HStack gap={3} display={{ base: 'none', md: 'flex' }}>
						<Button variant="outline" size="sm" px="14px" color="fg.muted">
							<LuSearch /> Rechercher
						</Button>
						<ChakraLink asChild outline="none" _hover={{ textDecor: 'none' }}>
							<Link to="/contribuer">
								<Button size="sm" px="16px">
									Contribuer
								</Button>
							</Link>
						</ChakraLink>
					</HStack>

					<IconButton
						aria-label="Ouvrir le menu"
						variant="ghost"
						size="sm"
						display={{ base: 'flex', md: 'none' }}
						onClick={() => setOpen(true)}
					>
						<LuMenu />
					</IconButton>
				</Flex>
			</Container>

			<Drawer.Root
				open={open}
				onOpenChange={(e) => setOpen(e.open)}
				placement="end"
			>
				<Portal>
					<Drawer.Backdrop />
					<Drawer.Positioner>
						<Drawer.Content>
							<Drawer.Header
								borderBottom="1px solid"
								borderColor="border.muted"
							>
								<Drawer.Title>
									<ChakraLink
										asChild
										outline="none"
										_hover={{ textDecor: 'none' }}
									>
										<Link to="/" onClick={() => setOpen(false)}>
											<Wordmark />
										</Link>
									</ChakraLink>
								</Drawer.Title>
								<Drawer.CloseTrigger
									asChild
									position="absolute"
									top={3}
									right={3}
								>
									<CloseButton />
								</Drawer.CloseTrigger>
							</Drawer.Header>
							<Drawer.Body pt={6}>
								<Stack gap={1} fontSize="15px">
									{navbarLinks.map(({ label, to }) => (
										<NavLink
											key={`mobile-${to}-${label}`}
											label={label}
											to={to}
											onClick={() => setOpen(false)}
										/>
									))}
								</Stack>
							</Drawer.Body>
							<Drawer.Footer
								borderTop="1px solid"
								borderColor="border.muted"
								gap={3}
							>
								<Button variant="outline" size="sm" flex={1} color="fg.muted">
									<LuSearch /> Rechercher
								</Button>
								<ChakraLink
									asChild
									outline="none"
									_hover={{ textDecor: 'none' }}
									flex={1}
								>
									<Link to="/contribuer" onClick={() => setOpen(false)}>
										<Button size="sm" w="full">
											Contribuer
										</Button>
									</Link>
								</ChakraLink>
							</Drawer.Footer>
						</Drawer.Content>
					</Drawer.Positioner>
				</Portal>
			</Drawer.Root>
		</Box>
	);
};

export default Navbar;
