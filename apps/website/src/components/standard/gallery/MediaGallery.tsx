import {
	Button,
	Carousel,
	chakra,
	Image as ChakraImage,
	Flex,
	Grid,
	HStack,
	Icon,
	IconButton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Image } from '@unpic/react';
import { type JSX, useState } from 'react';
import {
	RiAddLine,
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiImage2Line,
} from 'react-icons/ri';
import GalleryLightbox, { type GalleryImage } from './GalleryLightbox';

type MediaGalleryProps = {
	images: GalleryImage[];
	initialGridCount?: number;
	emptyLabel?: string;
	/**
	 * The first image is the entity's hero (banner + thumbnail) shown above the
	 * gallery, so by default it is moved to the end to avoid repeating it as the
	 * carousel's opening slide. Set to `false` when no hero precedes the gallery.
	 */
	firstImageIsHero?: boolean;
};

const DEFAULT_GRID_COUNT = 8;
const FEATURED_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';

type FeaturedIndicatorsProps = {
	count: number;
	current: number;
	onJump: (index: number) => void;
};

/**
 * Story-style progress strip: one segment per image, seen segments filled,
 * the active one terracotta. Click-to-jump on `sm`+ where segments are wide
 * enough to hit; on smaller screens the strip is a pure progress indicator
 * and navigation falls back to swipe + the carousel arrows.
 */
const FeaturedIndicators = ({
	count,
	current,
	onJump,
}: FeaturedIndicatorsProps) => (
	<Flex align="center" gap={3}>
		<HStack gap={1} flex={1} minW={0}>
			{Array.from({ length: count }, (_, index) => {
				const seen = index < current;
				const active = index === current;
				return (
					<chakra.button
						key={index}
						type="button"
						aria-label={`Image ${index + 1}`}
						aria-current={active}
						onClick={() => onJump(index)}
						position="relative"
						flex={1}
						minW="3px"
						h="3px"
						borderRadius="full"
						bgColor={active ? 'primary.solid' : seen ? 'fg.muted' : 'border'}
						pointerEvents={{ base: 'none', sm: 'auto' }}
						cursor={{ base: 'default', sm: 'pointer' }}
						transition={`background-color 0.2s ${FEATURED_EASE}, height 0.15s ${FEATURED_EASE}`}
						_after={{
							content: '""',
							position: 'absolute',
							insetInline: 0,
							insetBlock: '-7px',
						}}
						_hover={{ h: '6px' }}
					/>
				);
			})}
		</HStack>
		<Text textStyle="mono.s" color="fg.muted" whiteSpace="nowrap">
			{current + 1} / {count}
		</Text>
	</Flex>
);

const MediaGallery = ({
	images: rawImages,
	initialGridCount = DEFAULT_GRID_COUNT,
	emptyLabel = 'Aucune photo disponible',
	firstImageIsHero = true,
}: MediaGalleryProps): JSX.Element => {
	const [featuredPage, setFeaturedPage] = useState(0);
	const [showAll, setShowAll] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

	const images =
		firstImageIsHero && rawImages.length > 1
			? [...rawImages.slice(1), rawImages[0]]
			: rawImages;

	if (images.length === 0) {
		return (
			<Flex
				direction="column"
				align="center"
				justify="center"
				gap={2}
				py={16}
				color="fg.subtle"
			>
				<Icon as={RiImage2Line} boxSize={8} />
				<Text>{emptyLabel}</Text>
			</Flex>
		);
	}

	const gridImages = showAll ? images : images.slice(0, initialGridCount);
	const hiddenCount = images.length - gridImages.length;
	const hasGrid = images.length > 1;

	return (
		<Stack gap={8}>
			<Carousel.Root
				slideCount={images.length}
				page={featuredPage}
				onPageChange={(e) => setFeaturedPage(e.page)}
				loop
				allowMouseDrag
				gap={4}
			>
				<Carousel.Control position="relative" width="full">
					<Carousel.PrevTrigger asChild>
						<IconButton
							aria-label="Image précédente"
							size="sm"
							insetStart="4"
							pos="absolute"
							zIndex={1}
							borderRadius="full"
							bgColor="primary.solid"
							color="primary.contrast"
							shadow="md"
							_hover={{ bgColor: 'primary.emphasized' }}
						>
							<RiArrowLeftSLine />
						</IconButton>
					</Carousel.PrevTrigger>
					<Carousel.ItemGroup width="full">
						{images.map((image, index) => (
							<Carousel.Item key={image.id} index={index}>
								<chakra.button
									type="button"
									aria-label="Agrandir l'image"
									display="block"
									w="full"
									aspectRatio={16 / 9}
									bgColor="bg.subtle"
									borderRadius="md"
									overflow="hidden"
									cursor="zoom-in"
									onClick={() => setLightboxIndex(index)}
								>
									<ChakraImage asChild w="full" h="full" objectFit="cover">
										<Image src={image.url} alt={image.alt} layout="fullWidth" />
									</ChakraImage>
								</chakra.button>
							</Carousel.Item>
						))}
					</Carousel.ItemGroup>
					<Carousel.NextTrigger asChild>
						<IconButton
							aria-label="Image suivante"
							size="sm"
							insetEnd="4"
							pos="absolute"
							zIndex={1}
							borderRadius="full"
							bgColor="primary.solid"
							color="primary.contrast"
							shadow="md"
							_hover={{ bgColor: 'primary.emphasized' }}
						>
							<RiArrowRightSLine />
						</IconButton>
					</Carousel.NextTrigger>
				</Carousel.Control>
				<FeaturedIndicators
					count={images.length}
					current={featuredPage}
					onJump={setFeaturedPage}
				/>
			</Carousel.Root>
			{hasGrid ? (
				<Stack gap={4}>
					<Flex align="baseline" justify="space-between" gap={4}>
						<Text textStyle="kicker">Toutes les photos</Text>
						<Text textStyle="mono.s" color="fg.subtle">
							{images.length}
						</Text>
					</Flex>
					<Grid
						templateColumns={{
							base: 'repeat(2, 1fr)',
							sm: 'repeat(3, 1fr)',
							lg: 'repeat(4, 1fr)',
						}}
						gap={{ base: 3, md: 4 }}
					>
						{gridImages.map((image, index) => (
							<chakra.button
								key={image.id}
								type="button"
								aria-label={`Agrandir : ${image.alt}`}
								w="full"
								aspectRatio={4 / 3}
								onClick={() => setLightboxIndex(index)}
								borderRadius="sm"
								overflow="hidden"
								borderWidth="1px"
								borderColor="border.muted"
								cursor="pointer"
								transition="transform 0.2s ease, box-shadow 0.2s ease"
								_hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
								_focusVisible={{
									outline: '2px solid',
									outlineColor: 'primary.solid',
									outlineOffset: '2px',
								}}
							>
								<ChakraImage asChild w="full" h="full" objectFit="cover">
									<Image src={image.url} alt={image.alt} layout="fullWidth" />
								</ChakraImage>
							</chakra.button>
						))}
					</Grid>
					{hiddenCount > 0 ? (
						<Flex justify="center">
							<Button variant="outline" onClick={() => setShowAll(true)}>
								<RiAddLine />
								Voir plus de photos ({hiddenCount})
							</Button>
						</Flex>
					) : showAll && images.length > initialGridCount ? (
						<Flex justify="center">
							<Button variant="ghost" onClick={() => setShowAll(false)}>
								Réduire
							</Button>
						</Flex>
					) : null}
				</Stack>
			) : null}
			<GalleryLightbox
				images={images}
				index={lightboxIndex}
				onIndexChange={setLightboxIndex}
				onClose={() => setLightboxIndex(null)}
			/>
		</Stack>
	);
};

export default MediaGallery;
