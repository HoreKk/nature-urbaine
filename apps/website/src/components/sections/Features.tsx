import { Box, Container, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { LuArrowRight } from 'react-icons/lu';

type Feature = {
	num: string;
	kicker: string;
	title: string;
	desc: string;
	to: LinkProps['to'];
	disabled?: boolean;
};

const features: Feature[] = [
	{
		num: '01',
		kicker: 'Découvrir',
		title: 'Reportages photos',
		desc: 'Des centaines de reportages photographiques classés par lieux, catégories, maîtrises d’œuvres, maîtrises d’ouvrages, saisons…',
		to: '/reports',
	},
	{
		num: '02',
		kicker: 'Visualiser',
		title: 'La carte interactive',
		desc: 'Localisez tous les projets sur une carte satellite, par catégorie.',
		to: '/carte',
		disabled: true,
	},
	{
		num: '03',
		kicker: 'Lire',
		title: 'Interviews',
		desc: 'À la rencontre des maîtres d’œuvre et maîtres d’ouvrage qui façonnent la ville, le territoire.',
		to: '/interviews',
	},
	{
		num: '04',
		kicker: 'Filtrer',
		title: 'Recherche par mot clé',
		desc: 'Retrouvez facilement des images de référence grâce à un système de tags associés à chaque image.',
		to: '/tags',
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
		disabled: true,
	},
];

const Features = () => {
	const total = features.length.toString().padStart(2, '0');

	return (
		<Box as="section" py={{ base: 16, md: 20 }}>
			<Container maxW="container.xl" mb={10}>
				<Stack gap={2}>
					<Text textStyle="kicker">Fonctionnalités</Text>
					<Heading as="h2" textStyle="heading.lg">
						À explorer sur{' '}
						<Text as="em" textStyle="emphasis">
							Nature Urbaine
						</Text>
					</Heading>
				</Stack>
			</Container>
			<Container maxW="container.xl">
				<Flex
					gap={5}
					overflowX="auto"
					pt={2}
					pb={4}
					scrollbarWidth="none"
					css={{ '&::-webkit-scrollbar': { display: 'none' } }}
				>
					{features.map((f) => {
						const card = (
							<Box
								as="article"
								bgColor={f.disabled ? 'bg.muted' : 'bg'}
								border="1px solid"
								borderColor="border.muted"
								borderRadius="sm"
								p={6}
								aspectRatio="1 / 1"
								display="flex"
								flexDir="column"
								opacity={f.disabled ? 0.7 : 1}
								cursor={f.disabled ? 'not-allowed' : 'pointer'}
								transition="all 0.2s ease"
								_hover={
									f.disabled
										? undefined
										: { borderColor: 'fg', transform: 'translateY(-2px)' }
								}
							>
								<Flex justify="space-between" align="baseline">
									<Text
										textStyle="kicker"
										textTransform="none"
										letterSpacing="normal"
									>
										{f.num} / {total}
									</Text>
									<Box
										w="10px"
										h="10px"
										borderRadius="full"
										bgColor={f.disabled ? 'border' : 'primary.solid'}
									/>
								</Flex>

								<Text
									textStyle="kicker"
									color={f.disabled ? 'fg.subtle' : 'primary.fg'}
									mt={8}
								>
									{f.kicker}
								</Text>
								<Heading
									as="h3"
									textStyle="heading.md"
									color={f.disabled ? 'fg.muted' : 'fg'}
									mt={1}
								>
									{f.title}
								</Heading>
								<Text
									fontSize="13px"
									lineHeight={1.45}
									color={f.disabled ? 'fg.muted' : 'fg.subtle'}
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
									color={f.disabled ? 'fg.subtle' : 'fg'}
								>
									{f.disabled ? (
										'Bientôt disponible'
									) : (
										<>
											Y aller <LuArrowRight size={12} />
										</>
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
								{f.disabled ? card : <Link to={f.to}>{card}</Link>}
							</Box>
						);
					})}
				</Flex>
			</Container>
		</Box>
	);
};

export default Features;
