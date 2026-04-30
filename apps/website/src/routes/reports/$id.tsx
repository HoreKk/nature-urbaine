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
import { getBackendUrl } from '@/utils/backend-url';
import {
	formatDepartmentLabel,
	formatOptionalDate,
	formatOptionalInteger,
	formatOptionalNumber,
	joinNonEmpty,
} from '@/utils/tools';

export const Route = createFileRoute('/reports/$id')({
	component: RouteComponent,
	loader: async ({ params }) => getReportById({ data: Number(params.id) }),
});

function RouteComponent() {
	const report = Route.useLoaderData();
	const publicationDate = formatOptionalDate(report.date);
	const locationLabel = joinNonEmpty([
		report.locationDetails?.city,
		report.locationDetails?.department,
		report.locationDetails?.region,
	]);

	const locationItems = [
		{ label: 'Catégorie', value: report.category.name },
		{ label: 'Ville', value: report.locationDetails?.city },
		{ label: 'Code postal', value: report.locationDetails?.postalCode },
		{
			label: 'Département',
			value: formatDepartmentLabel(
				report.locationDetails?.departmentCode,
				report.locationDetails?.department,
			),
		},
		{ label: 'Région', value: report.locationDetails?.region },
		{ label: 'Strate urbaine', value: report.locationDetails?.cityStratum },
		{
			label: "Nombre d'habitants",
			value: formatOptionalNumber(report.locationDetails?.nbPopulations),
		},
		{ label: 'Adresse', value: report.locationDetails?.address },
	].filter((item) => item.value);

	const projectItems = [
		{ label: 'Auteur', value: report.projectDetails?.photoAuthor },
		{ label: 'Maître d’ouvrage', value: report.projectDetails?.projectOwner },
		{
			label: 'Maître d’œuvre',
			value: report.projectDetails?.projectManagement,
		},
		{
			label: 'Année de livraison',
			value: formatOptionalInteger(report.projectDetails?.deliveryYear),
		},
		{ label: 'Coût', value: report.projectDetails?.projectCost },
		{ label: 'Superficie', value: report.projectDetails?.projectArea },
		{
			label: 'Code WordPress',
			value: formatOptionalInteger(report.projectDetails?.wordpressPostId),
		},
	].filter((item) => item.value);

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
					src={getBackendUrl(report.thumbnail.url)}
					alt={report.thumbnail.alt || report.name}
					layout="fullWidth"
				/>
			</ChakraImage>
			<Container maxW="container.xl" pt={8} pb={12}>
				<Flex justifyContent="space-between">
					<Flex flexDir="column" gap={4}>
						<Text textStyle="kicker">Reportage · {report.category.name}</Text>
						<Heading as="h1" textStyle="heading.xl">
							{report.name}
						</Heading>
						{report.projectName ? (
							<Text fontSize="xl" color="fg.muted">
								{report.projectName}
							</Text>
						) : null}
						<Text fontSize="lg" color="fg.muted" whiteSpace="pre-line">
							{report.description}
						</Text>
						<Flex alignItems="center" gap={6} mt={4}>
							<Flex flexDir="column" gap={2}>
								<Text color="fg.muted">Date de publication</Text>
								<Text>{publicationDate}</Text>
							</Flex>
							<Separator orientation="vertical" height="full" />
							<Flex flexDir="column" gap={2}>
								<Text color="fg.muted">Localisation</Text>
								<Text>
									{locationLabel ||
										report.locationDetails?.address ||
										'Non renseignée'}
								</Text>
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
										url: getBackendUrl(picture.url),
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
									Localisation
								</Heading>
								<Flex flexDir="column" gap={3}>
									{locationItems.map((item, index) => (
										<Box key={item.label}>
											<Flex flexDir="column" gap={1}>
												<Text color="fg.muted" fontSize="sm">
													{item.label}
												</Text>
												<Text>{item.value}</Text>
											</Flex>
											{index < locationItems.length - 1 ? (
												<Separator mt={3} />
											) : null}
										</Box>
									))}
								</Flex>
							</Box>
							{projectItems.length > 0 ? (
								<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
									<Heading size="2xl" mb={4}>
										Projet
									</Heading>
									<Flex flexDir="column" gap={3}>
										{projectItems.map((item, index) => (
											<Box key={item.label}>
												<Flex flexDir="column" gap={1}>
													<Text color="fg.muted" fontSize="sm">
														{item.label}
													</Text>
													<Text>{item.value}</Text>
												</Flex>
												{index < projectItems.length - 1 ? (
													<Separator mt={3} />
												) : null}
											</Box>
										))}
									</Flex>
								</Box>
							) : null}
						</Flex>
					</GridItem>
				</Grid>
			</Container>
		</>
	);
}
