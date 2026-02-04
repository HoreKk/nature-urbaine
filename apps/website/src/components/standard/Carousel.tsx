import {
	Carousel,
	Image as ChakraImage,
	Icon,
	IconButton,
} from '@chakra-ui/react';
import { Image } from '@unpic/react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

type UICarouselProps = {
	images: { url: string; label: string }[];
};

const UICarousel = ({ images }: UICarouselProps) => {
	return (
		<Carousel.Root slideCount={images.length} loop autoplay mx="auto" gap={4}>
			<Carousel.Control position="relative" width="full">
				<Carousel.PrevTrigger asChild>
					<IconButton
						size="xs"
						insetStart="4"
						pos="absolute"
						borderRadius="full"
					>
						<Icon as={RiArrowLeftSLine} />
					</IconButton>
				</Carousel.PrevTrigger>

				<Carousel.ItemGroup width="full">
					{images.map((item, index) => (
						<Carousel.Item key={item.url} index={index}>
							<ChakraImage
								aspectRatio="16/9"
								src={item.url}
								alt={item.label}
								w="100%"
								h="100%"
								objectFit="contain"
								asChild
							>
								<Image src={item.url} alt={item.label} layout="fullWidth" />
							</ChakraImage>
						</Carousel.Item>
					))}
				</Carousel.ItemGroup>

				<Carousel.NextTrigger asChild>
					<IconButton size="xs" insetEnd="4" pos="absolute" borderRadius="full">
						<Icon as={RiArrowRightSLine} />
					</IconButton>
				</Carousel.NextTrigger>
			</Carousel.Control>
			<Carousel.Indicators
				transition="width 0.2s ease-in-out"
				transformOrigin="center"
				opacity="0.5"
				bgColor="bg.inverted"
				_current={{ width: '10', bg: 'bg.inverted', opacity: 1 }}
			/>
		</Carousel.Root>
	);
};

export default UICarousel;
