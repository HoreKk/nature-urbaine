import {
	Box,
	Card,
	Image as ChakraImage,
	Flex,
	Icon,
	Text,
} from '@chakra-ui/react';
import { Image } from '@unpic/react';
import { RiMapPinLine } from 'react-icons/ri';
import type { PictureWithReport } from '@/server/tags';
import { getBackendUrl } from '@/utils/backend-url';
import { stripExtension } from '@/utils/tools';

type PictureCardProps = {
	picture: PictureWithReport;
	onSelect: (picture: PictureWithReport) => void;
};

const PictureCard = ({ picture, onSelect }: PictureCardProps) => {
	const title = picture.filename
		? stripExtension(picture.filename)
		: picture.alt;
	const city = picture.report?.locationDetails?.city;
	const reportDate = picture.report?.date;

	return (
		<Card.Root
			asChild
			overflow="hidden"
			borderRadius="sm"
			borderWidth="1px"
			borderColor="border.muted"
			bg="bg"
			textAlign="left"
			cursor="pointer"
			transition="transform 0.2s ease, box-shadow 0.2s ease"
			_hover={{
				transform: 'translateY(-2px)',
				boxShadow: 'md',
				borderColor: 'border.emphasized',
			}}
			_focusVisible={{
				outline: '2px solid',
				outlineColor: 'primary.solid',
				outlineOffset: '2px',
			}}
		>
			<button type="button" onClick={() => onSelect(picture)}>
				<Box bgColor="bg.muted" aspectRatio="4 / 3" w="full">
					<ChakraImage asChild w="full" h="full">
						<Image
							src={getBackendUrl(picture.url)}
							alt={picture.alt}
							layout="fullWidth"
						/>
					</ChakraImage>
				</Box>
				<Box p={3}>
					<Text textStyle="title.s" lineClamp={2}>
						{title}
					</Text>
					{picture.report?.name && (
						<Text textStyle="mono.s" mt={1} color="fg.muted" truncate>
							{picture.report.name}
						</Text>
					)}
					{(city || reportDate) && (
						<Flex
							align="center"
							gap={1.5}
							mt={2}
							color="fg.muted"
							fontSize="xs"
						>
							{city && (
								<>
									<Icon as={RiMapPinLine} boxSize={3.5} />
									<Text as="span" truncate>
										{city}
									</Text>
								</>
							)}
							{city && reportDate && (
								<Text as="span" aria-hidden>
									·
								</Text>
							)}
							{reportDate && (
								<Text as="span">
									{new Date(reportDate).toLocaleDateString('fr-FR', {
										year: 'numeric',
										month: 'short',
									})}
								</Text>
							)}
						</Flex>
					)}
				</Box>
			</button>
		</Card.Root>
	);
};

export default PictureCard;
