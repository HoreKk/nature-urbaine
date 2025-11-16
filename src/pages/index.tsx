import {
	AspectRatio,
	Box,
	Button,
	ButtonGroup,
	Center,
	Flex,
	Heading,
	Text,
} from "@chakra-ui/react";

export default function Home() {
	return (
		<Flex direction="column">
			<AspectRatio
				bgImage="url('/hero-section.jpg')"
				bgRepeat="no-repeat"
				bgSize="cover"
				borderRadius="xl"
				maxH="600px"
				mb={6}
				ratio={16 / 9}
			>
				<Box
					bg="linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.3))"
					borderRadius="xl"
				>
					<Center
						flexDirection="column"
						maxW="65%"
						mx="auto"
						py={8}
						textAlign="center"
					>
						<Heading
							color="white"
							fontWeight="extrabold"
							lineHeight="70px"
							size="7xl"
						>
							Façonner la ville de demain, ensemble.
						</Heading>
						<Text color="white" fontSize="xl" mt={4}>
							NATURE URBAINE est la plateforme collaborative qui connecte les
							maîtres d’ouvrage, maîtres d’œuvre et professionnels de
							l’aménagement extérieur.
						</Text>
						<ButtonGroup gap={4} mt={6}>
							<Button colorPalette="green" size="lg">
								Nos Reportages
							</Button>
							<Button colorPalette="green" size="lg" variant="surface">
								Nos Interviews
							</Button>
						</ButtonGroup>
					</Center>
				</Box>
			</AspectRatio>
		</Flex>
	);
}
