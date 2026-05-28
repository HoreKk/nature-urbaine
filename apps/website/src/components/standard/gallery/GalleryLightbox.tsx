import {
	AspectRatio,
	Carousel,
	chakra,
	Image as ChakraImage,
	CloseButton,
	Dialog,
	Flex,
	HStack,
	IconButton,
	Portal,
	Text,
} from '@chakra-ui/react';
import { Image } from '@unpic/react';
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

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(d) => !d.open && onClose()}
			size="cover"
			placement="center"
		>
			<Portal>
				<Dialog.Backdrop bgColor="blackAlpha.800" />
				<Dialog.Positioner>
					<Dialog.Content
						bgColor="bg"
						maxW="container.xl"
						borderRadius="sm"
						overflow="hidden"
					>
						{current && (
							<Carousel.Root
								slideCount={images.length}
								page={activeIndex}
								onPageChange={(e) => onIndexChange(e.page)}
								loop
								allowMouseDrag
								gap={0}
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
												<AspectRatio ratio={16 / 9} maxH="74vh" w="full">
													<ChakraImage asChild objectFit="contain">
														<Image
															src={image.url}
															alt={image.alt}
															layout="fullWidth"
														/>
													</ChakraImage>
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
								<HStack
									gap={2}
									px={{ base: 4, md: 6 }}
									pb={5}
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
										<chakra.button
											key={image.id}
											type="button"
											aria-label={`Voir l'image ${thumbIndex + 1}`}
											aria-current={thumbIndex === activeIndex}
											onClick={() => onIndexChange(thumbIndex)}
											flexShrink={0}
											w="64px"
											aspectRatio="1"
											borderRadius="sm"
											overflow="hidden"
											borderWidth="2px"
											borderColor={
												thumbIndex === activeIndex
													? 'primary.solid'
													: 'transparent'
											}
											opacity={thumbIndex === activeIndex ? 1 : 0.6}
											transition="opacity 0.15s ease, border-color 0.15s ease"
											_hover={{ opacity: 1 }}
										>
											<ChakraImage
												src={image.url}
												alt={image.alt}
												w="full"
												h="full"
												objectFit="cover"
											/>
										</chakra.button>
									))}
								</HStack>
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
