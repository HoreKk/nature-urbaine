import {
	Box,
	Button,
	Container,
	Flex,
	Heading,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { LuArrowRight } from 'react-icons/lu';

const ContributeCta = () => {
	return (
		<Box as="section" bgColor="primary.muted" py={{ base: 16, md: 24 }}>
			<Container maxW="container.lg">
				<Flex
					direction={{ base: 'column', md: 'row' }}
					gap={{ base: 10, md: 16 }}
					align={{ base: 'flex-start', md: 'flex-end' }}
					justify="space-between"
				>
					<Stack gap={5} maxW="560px">
						<Text
							fontFamily="mono"
							fontSize="11px"
							textTransform="uppercase"
							letterSpacing="0.08em"
							color="fg.subtle"
						>
							Communauté · MVP
						</Text>
						<Heading
							as="h2"
							fontFamily="heading"
							fontSize={{ base: '40px', md: '56px' }}
							fontWeight={400}
							lineHeight={0.95}
							letterSpacing="-0.02em"
							color="fg"
						>
							Proposez votre{' '}
							<Text as="em" fontStyle="italic" color="primary.fg">
								projet
							</Text>
							.
						</Heading>
						<Text fontSize="md" lineHeight={1.5} color="fg.muted" maxW="520px">
							Renseignez le titre, une courte description et joignez vos
							photographies. Notre équipe se charge de la mise en forme, du
							tagage des images et de la publication.
						</Text>
					</Stack>
					<Stack gap={3} direction={{ base: 'column', sm: 'row' }}>
						<Link to="/contribuer">
							<Button
								size="lg"
								bgColor="secondary.solid"
								color="secondary.contrast"
								borderRadius="full"
								fontWeight={500}
								px="22px"
								_hover={{ bgColor: 'secondary.emphasized' }}
							>
								Soumettre un projet <LuArrowRight />
							</Button>
						</Link>
						<Link to="/contribuer">
							<Button
								size="lg"
								variant="outline"
								borderColor="border"
								color="fg"
								borderRadius="full"
								fontWeight={500}
								px="22px"
							>
								En savoir plus
							</Button>
						</Link>
					</Stack>
				</Flex>
			</Container>
		</Box>
	);
};

export default ContributeCta;
