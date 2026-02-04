import {
	Box,
	Image as ChakraImage,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	Separator,
	Text,
} from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import { UIBreadcrumb } from '@/components/standard/Breadcrumb';
import UICarousel from '@/components/standard/Carousel';
import { getReportById } from '@/server/reports';

export const Route = createFileRoute('/reports/$id')({
	component: RouteComponent,
	loader: async ({ params }) => getReportById({ data: Number(params.id) }),
});

function RouteComponent() {
	const report = Route.useLoaderData();

	return (
		<>
			<UIBreadcrumb
				links={[
					{ label: 'Accueil', to: '/' },
					{ label: 'Reportages', to: '/reports' },
				]}
				currentLinkLabel={report.name}
			/>
			<ChakraImage asChild height={200} width="full">
				<Image
					src={`http://localhost:3001${report.thumbnail.url}`}
					alt={report.thumbnail.alt || report.name}
					layout="fullWidth"
				/>
			</ChakraImage>
			<Container maxW="container.xl" pt={8} pb={12}>
				<Flex justifyContent="space-between">
					<Flex flexDir="column" gap={4}>
						<Heading size="5xl" fontWeight="black">
							{report.name}
						</Heading>
						<Text fontSize="lg" color="fg.muted" whiteSpace="pre-line">
							{report.description}
						</Text>
						<Flex alignItems="center" gap={6} mt={4}>
							<Flex flexDir="column" gap={2}>
								<Text color="fg.muted">Date de publication</Text>
								<Text>{new Date(report.date).toLocaleDateString()}</Text>
							</Flex>
							<Separator orientation="vertical" height="full" />
							<Flex flexDir="column" gap={2}>
								<Text color="fg.muted">Localisation</Text>
								<Text>xxx</Text>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
				<Separator my={8} />
				<Grid templateColumns="repeat(12, 1fr)">
					<GridItem colSpan={{ base: 12, md: 8 }} mr={{ base: 0, md: 8 }}>
						<Box bgColor="bg.muted" p={8} borderRadius="lg" boxShadow="sm">
							{report.relatedPictures.length > 0 ? (
								<UICarousel
									images={report.relatedPictures.map((picture) => ({
										label: picture.filename || picture.alt || 'Photo associée',
										url: `http://localhost:3001${picture.url}`,
									}))}
								/>
							) : (
								<Text>Aucune photo disponbile</Text>
							)}
						</Box>
					</GridItem>
					<GridItem
						colSpan={{ base: 12, md: 4 }}
						position="sticky"
						top={12}
						alignSelf="start"
					>
						<Flex flexDir="column" gap={6}>
							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Informations
								</Heading>
								<Flex flexDir="column" gap={3}>
									<Flex flexDir="column" gap={1}>
										<Text color="fg.muted" fontSize="sm">
											Catégorie
										</Text>
										<Text>{report.category.name}</Text>
									</Flex>
									<Separator />
									<Flex flexDir="column" gap={1}>
										<Text color="fg.muted" fontSize="sm">
											Surface
										</Text>
										<Text>{report.cityStratum}</Text>
									</Flex>
									<Separator />
									<Flex flexDir="column" gap={1}>
										<Text color="fg.muted" fontSize="sm">
											Nombre d'habitants
										</Text>
										<Text>{report.nbPopulations}</Text>
									</Flex>
								</Flex>
							</Box>
							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Étiquettes
								</Heading>
							</Box>
							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Contact
								</Heading>
							</Box>
							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Partager
								</Heading>
							</Box>
						</Flex>
					</GridItem>
				</Grid>
			</Container>
		</>
	);
}
