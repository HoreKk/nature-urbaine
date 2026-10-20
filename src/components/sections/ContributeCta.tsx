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
		<Box as="section" bgColor="bg" py={{ base: 16, md: 24 }}>
			<Container maxW="container.lg">
				<Flex
					direction={{ base: 'column', md: 'row' }}
					gap={{ base: 10, md: 16 }}
					align={{ base: 'flex-start', md: 'flex-end' }}
					justify="space-between"
				>
					<Stack gap={5} maxW="560px">
						<Text textStyle="kicker">Communauté · MVP</Text>
						<Heading
							as="h2"
							textStyle="heading.lg"
							fontSize={{ base: '40px', md: '56px' }}
							lineHeight={0.95}
						>
							Proposez votre{' '}
							<Text as="em" textStyle="emphasis">
								projet
							</Text>
							.
						</Heading>
						<Text textStyle="lead" fontSize="md" maxW="520px">
							Renseignez le titre, une courte description et joignez vos
							photographies. Notre équipe se charge de la mise en forme, du
							tagage des images et de la publication.
						</Text>
					</Stack>
					<Stack gap={3} direction={{ base: 'column', sm: 'row' }}>
						<Link to="/contribuer">
							<Button size="lg" px="22px">
								Soumettre un projet <LuArrowRight />
							</Button>
						</Link>
						<Link to="/contribuer">
							<Button size="lg" variant="outline" px="22px">
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
