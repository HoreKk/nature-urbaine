import {
	Box,
	Button,
	ButtonGroup,
	Container,
	Heading,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';

const ContributeCta = () => {
	return (
		<Box py={12} bgColor="bg.emphasized">
			<Container
				maxW="container.lg"
				display="flex"
				flexDir="column"
				alignItems="center"
			>
				<Heading as="h2" size="3xl" textAlign="center">
					Vous avez un projet à partager ?
				</Heading>
				<Text
					fontSize="md"
					color="fg.muted"
					textAlign="center"
					mt={4}
					maxW="600px"
				>
					Rejoignez notre communauté et contribuez à faire connaître les
					initiatives qui allient urbanisme et nature.
				</Text>
				<ButtonGroup mt={8} gap={4}>
					<Link to="/">
						<Button size="lg">Soumettre un projet</Button>
					</Link>
					<Button variant="outline" borderColor="bg.inverted" size="lg">
						En savoir plus
					</Button>
				</ButtonGroup>
			</Container>
		</Box>
	);
};

export default ContributeCta;
