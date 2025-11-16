import {
	AspectRatio,
	Box,
	Button,
	ButtonGroup,
	Center,
	Flex,
	Grid,
	GridItem,
	Heading,
	Text,
} from "@chakra-ui/react";
import Link from "next/link";
import ReportCard from "~/components/report/Card";
import { api } from "~/utils/api";

export default function Home() {
	const { data: reports } = api.report.getAll.useQuery();

	return (
		<Flex direction="column" gap={12}>
			<AspectRatio
				bgImage="url('/hero-section.jpg')"
				bgRepeat="no-repeat"
				bgSize="cover"
				borderRadius="xl"
				maxH="540px"
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
							Nature Urbaine est la plateforme collaborative qui connecte les
							maîtres d’ouvrage, maîtres d’œuvre et professionnels de
							l’aménagement extérieur.
						</Text>
						<ButtonGroup gap={4} mt={6}>
							<Link href="/reports">
								<Button colorPalette="green" size="lg">
									Nos Reportages
								</Button>
							</Link>
							<Link href="/interviews">
								<Button colorPalette="green" size="lg" variant="surface">
									Nos Interviews
								</Button>
							</Link>
						</ButtonGroup>
					</Center>
				</Box>
			</AspectRatio>
			<Flex direction="column" gap={6}>
				<Heading fontSize="4xl" fontWeight="bold">
					Nos dernier Reportages
				</Heading>
				<Grid
					gap={6}
					templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
				>
					{reports?.map((report) => (
						<GridItem key={report.id} mb={4}>
							<ReportCard report={report} />
						</GridItem>
					))}
				</Grid>
			</Flex>
		</Flex>
	);
}
