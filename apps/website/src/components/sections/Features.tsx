import { Box, Container, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { LuArrowRight } from 'react-icons/lu';

type Feature = {
	num: string;
	kicker: string;
	title: string;
	desc: string;
	to: LinkProps['to'];
	available?: boolean;
};

const features: Feature[] = [
	{
		num: '01',
		kicker: 'Découvrir',
		title: 'Reportages photos',
		desc: 'Plus de 480 reportages classés par catégorie, lieu, saison.',
		to: '/reports',
		available: true,
	},
	{
		num: '02',
		kicker: 'Visualiser',
		title: 'La carte interactive',
		desc: 'Localisez tous les projets sur une carte satellite, par catégorie.',
		to: '/carte',
	},
	{
		num: '03',
		kicker: 'Lire',
		title: 'Interviews',
		desc: "À la rencontre des paysagistes, urbanistes, maîtres d'œuvre.",
		to: '/interviews',
		available: true,
	},
	{
		num: '04',
		kicker: 'Filtrer',
		title: 'Recherche par mot-clé',
		desc: '« candélabre », « banc bois »… toutes les photos taguées.',
		to: '/reports',
		available: true,
	},
	{
		num: '05',
		kicker: 'Partager',
		title: 'Contribuer',
		desc: 'Proposez vos projets, vos images, vos détails uniques.',
		to: '/contribuer',
	},
	{
		num: '06',
		kicker: 'Trouver',
		title: 'Fournisseurs partenaires',
		desc: 'Mobilier, éclairage, végétaux — fiches détaillées.',
		to: '/',
	},
];

const Features = () => {
	const total = features.length.toString().padStart(2, '0');

	return (
		<Box as="section" py={{ base: 16, md: 20 }}>
			<Container maxW="container.xl" mb={10}>
				<Stack gap={2}>
					<Text
						fontFamily="mono"
						fontSize="11px"
						textTransform="uppercase"
						letterSpacing="0.08em"
						color="fg.subtle"
					>
						Fonctionnalités
					</Text>
					<Heading
						as="h2"
						fontFamily="heading"
						fontSize={{ base: '32px', md: '44px' }}
						fontWeight={400}
						lineHeight={1}
						letterSpacing="-0.02em"
						color="fg"
					>
						Que faire sur{' '}
						<Text as="em" fontStyle="italic" color="primary.fg">
							Nature Urbaine
						</Text>{' '}
						?
					</Heading>
				</Stack>
			</Container>
			<Container maxW="container.xl">
				<Flex gap={5} overflowX="auto" pt={2} pb={4}>
					{features.map((f) => {
						const card = (
							<Box
								as="article"
								bgColor={f.available ? 'bg' : 'bg.muted'}
								border="1px solid"
								borderColor="border.muted"
								borderRadius="sm"
								p={6}
								aspectRatio="1 / 1"
								display="flex"
								flexDir="column"
								opacity={f.available ? 1 : 0.7}
								cursor={f.available ? 'pointer' : 'not-allowed'}
								transition="all 0.2s ease"
								_hover={
									f.available
										? { borderColor: 'fg', transform: 'translateY(-2px)' }
										: undefined
								}
							>
								<Flex justify="space-between" align="baseline">
									<Text fontFamily="mono" fontSize="11px" color="fg.subtle">
										{f.num} / {total}
									</Text>
									<Box
										w="10px"
										h="10px"
										borderRadius="full"
										bgColor={f.available ? 'primary.solid' : 'border'}
									/>
								</Flex>

								<Text
									mt={8}
									fontSize="11px"
									textTransform="uppercase"
									letterSpacing="0.08em"
									color={f.available ? 'primary.fg' : 'fg.subtle'}
								>
									{f.kicker}
								</Text>
								<Heading
									as="h3"
									fontFamily="heading"
									fontSize="26px"
									fontWeight={400}
									lineHeight={1.1}
									letterSpacing="-0.01em"
									color={f.available ? 'fg' : 'fg.muted'}
									mt={1}
								>
									{f.title}
								</Heading>
								<Text
									fontSize="13px"
									lineHeight={1.45}
									color={f.available ? 'fg.muted' : 'fg.subtle'}
									mt={3}
									flex={1}
								>
									{f.desc}
								</Text>
								<Flex
									align="center"
									gap={1.5}
									mt={4}
									fontSize="12px"
									fontWeight={500}
									color={f.available ? 'fg' : 'fg.subtle'}
								>
									{f.available ? (
										<>
											Y aller <LuArrowRight size={12} />
										</>
									) : (
										'Bientôt disponible'
									)}
								</Flex>
							</Box>
						);

						return (
							<Box
								key={f.num}
								flex="0 0 auto"
								w={{ base: '260px', md: '280px' }}
								scrollSnapAlign="start"
							>
								{f.available ? <Link to={f.to}>{card}</Link> : card}
							</Box>
						);
					})}
				</Flex>
			</Container>
		</Box>
	);
};

export default Features;
