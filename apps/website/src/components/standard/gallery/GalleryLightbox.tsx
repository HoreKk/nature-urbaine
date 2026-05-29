import {
	AspectRatio,
	Carousel,
	Image as ChakraImage,
	CloseButton,
	Dialog,
	Flex,
	IconButton,
	Portal,
	Text,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

export type GalleryImage = {
	id: string | number;
	url: string;
	alt: string;
	caption?: string;
};

type GalleryLightboxProps = {
	images: GalleryImage[];
	index: number | null;
	onIndexChange: (index: number) => void;
	onClose: () => void;
};

const GalleryLightbox = ({
	images,
	index,
	onIndexChange,
	onClose,
}: GalleryLightboxProps) => {
	const open = index !== null;
	const activeIndex = index ?? 0;
	const current = open ? images[activeIndex] : null;
	const thumbStripRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		thumbStripRef.current?.querySelector('[data-current]')?.scrollIntoView({
			behavior: 'smooth',
			inline: 'center',
			block: 'nearest',
		});
	}, [activeIndex]);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(d) => !d.open && onClose()}
			placement="center"
		>
			<Portal>
				<Dialog.Backdrop bgColor="blackAlpha.800" />
				<Dialog.Positioner padding={{ base: 4, md: 6 }}>
					<Dialog.Content
						bgColor="bg"
						w="full"
						maxW={{ base: 'full', md: 'container.xl' }}
						maxH={{ base: '92dvh', md: '95vh' }}
						borderRadius="sm"
						overflow="hidden"
						display="flex"
						flexDirection="column"
					>
						{current && (
							<Carousel.Root
								slideCount={images.length}
								page={activeIndex}
								onPageChange={(e) => onIndexChange(e.page)}
								loop
								allowMouseDrag
								gap={0}
								display="flex"
								flexDirection="column"
								width="full"
							>
								<Carousel.Control
									position="relative"
									width="full"
									bgColor="paper.700"
								>
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
										{images.map((image, itemIndex) => (
											<Carousel.Item key={image.id} index={itemIndex}>
												<AspectRatio
													ratio={16 / 9}
													w="full"
													maxH={{ base: '70dvh', md: '78vh' }}
												>
													<ChakraImage
														src={image.url}
														alt={image.alt}
														objectFit="contain"
													/>
												</AspectRatio>
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
								<Flex
									align="center"
									justify="space-between"
									gap={4}
									px={{ base: 4, md: 6 }}
									py={3}
									flexShrink={0}
								>
									<Text textStyle="mono.s" color="fg.muted" whiteSpace="nowrap">
										{activeIndex + 1} / {images.length}
									</Text>
									{current.caption ? (
										<Text fontSize="sm" color="fg.muted" truncate>
											{current.caption}
										</Text>
									) : null}
								</Flex>
								<Carousel.IndicatorGroup
									ref={thumbStripRef}
									gap={2}
									px={{ base: 4, md: 6 }}
									pt={{ base: 2, md: 0 }}
									pb={{ base: 4, md: 5 }}
									flexShrink={0}
									overflowX="auto"
									css={{
										'&::-webkit-scrollbar': { height: '6px' },
										'&::-webkit-scrollbar-thumb': {
											background: 'var(--chakra-colors-border)',
											borderRadius: '3px',
										},
									}}
								>
									{images.map((image, thumbIndex) => (
										<Carousel.Indicator
											key={image.id}
											index={thumbIndex}
											unstyled
											aria-label={`Voir l'image ${thumbIndex + 1}`}
											flexShrink={0}
											w="64px"
											aspectRatio="1"
											borderRadius="sm"
											overflow="hidden"
											borderWidth="2px"
											borderColor="transparent"
											opacity={0.6}
											cursor="button"
											transition="opacity 0.15s ease, border-color 0.15s ease"
											_hover={{ opacity: 1 }}
											_current={{ borderColor: 'primary.solid', opacity: 1 }}
										>
											<ChakraImage
												src={image.url}
												alt={image.alt}
												w="full"
												h="full"
												objectFit="cover"
											/>
										</Carousel.Indicator>
									))}
								</Carousel.IndicatorGroup>
							</Carousel.Root>
						)}
						<Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
							<CloseButton aria-label="Fermer" bgColor="bg" size="md" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default GalleryLightbox;
