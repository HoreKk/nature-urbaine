import { Box, Container, Flex, Heading, Icon, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { LuWorm } from "react-icons/lu";

type NavbarItemProps = {
	href: string;
	children: React.ReactNode;
};

const NavbarItem = ({ children, href }: NavbarItemProps) => {
	const pathanme = usePathname();
	return (
		<Link
			_focus={{ outline: "none" }}
			asChild
			color={pathanme === href ? "green" : "inherit"}
			px={2}
			py={1}
			rounded="md"
		>
			<NextLink href={href} passHref>
				{children}
			</NextLink>
		</Link>
	);
};

const Navbar = () => {
	const navItems = [
		{ href: "/", label: "Accueil" },
		{ href: "/reports", label: "Reportages" },
		{ href: "/interviews", label: "Interviews" },
		{ href: "/contact", label: "Contact" },
	];

	return (
		<Box bg="white">
			<Container
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				maxW="container.lg"
				py={6}
			>
				<Flex alignItems="center" asChild gap={2}>
					<NextLink href="/">
						<Icon as={LuWorm} boxSize={8} />
						<Heading
							as="h1"
							fontWeight="bold"
							size="md"
							textTransform="uppercase"
						>
							Nature Urbaine
						</Heading>
					</NextLink>
				</Flex>
				<Flex gap={4}>
					{navItems.map((item) => (
						<NavbarItem href={item.href} key={item.href}>
							{item.label}
						</NavbarItem>
					))}
				</Flex>
			</Container>
		</Box>
	);
};

export default Navbar;
