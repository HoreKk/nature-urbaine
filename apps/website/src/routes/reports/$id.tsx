import {
	Box,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	Separator,
	Text,
} from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { UIBreadcrumb } from '@/components/standard/Breadcrumb';
import MediaGallery from '@/components/standard/gallery/MediaGallery';
import PictureImg from '@/components/standard/PictureImg';
import { findReportById } from '@/server/report-catalog';
import { fullSource, heroSource, thumbnailSource } from '@/utils/picture-src';
import {
	formatDepartmentLabel,
	formatOptionalDate,
	formatOptionalInteger,
	joinNonEmpty,
} from '@/utils/tools';

export const Route = createFileRoute('/reports/$id')({
	component: RouteComponent,
	loader: async ({ params }) => findReportById({ data: Number(params.id) }),
	head: ({ loaderData: report }) => {
		if (!report) return {};
		const description = report.description
			? report.description.slice(0, 160)
			: `Reportage Nature Urbaine — ${report.category.name}`;
		const imageUrl = report.frontPicture?.url ?? undefined;
		return {
			meta: [
				{ title: `${report.name} — Nature Urbaine` },
				{ name: 'description', content: description },
				{ property: 'og:title', content: report.name },
				{ property: 'og:description', content: description },
				...(imageUrl ? [{ property: 'og:image', content: imageUrl }] : []),
				{ property: 'og:type', content: 'article' },
			],
		};
	},
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
		{
			label: 'Département',
			value: formatDepartmentLabel(
				report.locationDetails?.departmentCode,
				report.locationDetails?.department,
			),
		},
		{ label: 'Région', value: report.locationDetails?.region },
		{ label: 'Strate urbaine', value: report.locationDetails?.cityStratum },
		{ label: 'Adresse', value: report.locationDetails?.address },
	].filter((item) => item.value);

	const photoAuthor = report.projectDetails?.photoAuthor;

	const projectItems = [
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
			{report.frontPicture?.url ? (
				<PictureImg
					source={heroSource(report.frontPicture)}
					alt={report.frontPicture.alt || report.name}
					height={{ base: 240, md: 380 }}
					width="full"
					priority
				/>
			) : (
				<Box
					height={{ base: 240, md: 380 }}
					width="full"
					bgColor="bg.muted"
					backgroundImage="repeating-linear-gradient(45deg, transparent 0 12px, rgba(0,0,0,0.025) 12px 24px)"
				/>
			)}
			<Container maxW="container.xl" pt={8} pb={12}>
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
					<Flex
						alignItems={{ base: 'flex-start', md: 'center' }}
						flexDir={{ base: 'column', md: 'row' }}
						gap={{ base: 3, md: 6 }}
						mt={4}
					>
						<Flex flexDir="column" gap={2}>
							<Text color="fg.muted">Date du reportage</Text>
							<Text>{publicationDate}</Text>
						</Flex>
						{photoAuthor ? (
							<>
								<Separator
									orientation={{ base: 'horizontal', md: 'vertical' }}
									height={{ base: 'auto', md: 'full' }}
								/>
								<Flex flexDir="column" gap={2}>
									<Text color="fg.muted">Auteur des photographies</Text>
									<Text>{photoAuthor}</Text>
								</Flex>
							</>
						) : null}
						<Separator
							orientation={{ base: 'horizontal', md: 'vertical' }}
							height={{ base: 'auto', md: 'full' }}
						/>
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
				<Separator my={8} />
				<Grid templateColumns="repeat(12, 1fr)" rowGap={{ base: 10, md: 0 }}>
					<GridItem colSpan={{ base: 12, md: 8 }} mr={{ base: 0, md: 8 }}>
						<MediaGallery
							images={(report.relatedPictures.docs ?? [])
								.filter((picture) => picture.url)
								.map((picture) => ({
									id: picture.id,
									source: fullSource(picture),
									thumbnail: thumbnailSource(picture),
									alt: picture.alt,
									caption: picture.alt,
								}))}
							emptyLabel="Aucune photo disponible pour ce reportage"
						/>
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
