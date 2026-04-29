import {
	Badge,
	Box,
	Link as ChakraLink,
	Container,
	Flex,
	Grid,
	GridItem,
	HStack,
	Separator,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import Wordmark from '@/components/standard/Wordmark';

type FooterLink = { label: string; to: LinkProps['to'] };
type FooterColumn = { title: string; links: FooterLink[] };

const footerColumns: FooterColumn[] = [
	{
		title: 'Découvrir',
		links: [
			{ label: 'À la une', to: '/interviews' },
			{ label: 'Reportages', to: '/reports' },
			{ label: 'Carte', to: '/carte' },
		],
	},
	{
		title: 'Participer',
		links: [
			{ label: 'Contribuer', to: '/contribuer' },
			{ label: 'Contact', to: '/contact' },
		],
	},
];

const Footer = () => {
	return (
		<Box as="footer" bgColor="bg.muted" py={10}>
			<Container maxW="container.xl">
				<Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={10}>
					<GridItem>
						<Wordmark />
						<Text fontSize="13px" color="fg.muted" mt={3} maxW="320px">
							La plateforme collaborative dédiée au paysage urbain.
						</Text>
						<Text
							fontSize="11px"
							color="fg.subtle"
							lineHeight={1.5}
							fontStyle="italic"
							mt={4}
							maxW="420px"
						>
							Les données présentées sont communiquées à titre indicatif,
							majoritairement issues de sources publiques ou de tiers. Si vous
							constatez une erreur, signalez-la via le formulaire de contact.
						</Text>
					</GridItem>
					{footerColumns.map((col) => (
						<GridItem key={col.title}>
							<Text
								fontSize="11px"
								textTransform="uppercase"
								letterSpacing="0.08em"
								color="fg.subtle"
								mb={3}
							>
								{col.title}
							</Text>
							<Stack gap={2}>
								{col.links.map(({ label, to }) => (
									<Link key={`${col.title}-${label}`} to={to}>
										<ChakraLink
											asChild
											fontSize="13px"
											color="fg"
											outline="none"
											_hover={{ textDecoration: 'underline' }}
										>
											<span>{label}</span>
										</ChakraLink>
									</Link>
								))}
							</Stack>
						</GridItem>
					))}
				</Grid>
				<Separator mt={6} mb={4} />
				<Flex
					justify="space-between"
					align="center"
					fontSize="11px"
					color="fg.subtle"
					flexWrap="wrap"
					gap={3}
				>
					<Text>&copy; {new Date().getFullYear()} Nature Urbaine</Text>
					<HStack gap={2}>
						<Text fontFamily="mono">v0.1</Text>
						<Badge
							size="xs"
							variant="outline"
							colorPalette="gray"
							borderRadius="sm"
							textTransform="uppercase"
							letterSpacing="0.08em"
						>
							MVP
						</Badge>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
};

export default Footer;
