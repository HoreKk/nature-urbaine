import { Box, Button, Image as ChakraImage, Text } from '@chakra-ui/react';
import { Image } from '@unpic/react';
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

	return (
		<Button
			tabIndex={0}
			onClick={() => onSelect(picture)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onSelect(picture);
				}
			}}
			textAlign="left"
			cursor="pointer"
			outline="none"
			transition="transform 0.2s ease"
			_hover={{ transform: 'translateY(-2px)' }}
			_focusVisible={{
				outline: '2px solid',
				outlineColor: 'primary.solid',
				outlineOffset: '2px',
			}}
		>
			<Box
				bgColor="bg.muted"
				border="1px solid"
				borderColor="border.muted"
				borderRadius="sm"
				overflow="hidden"
				aspectRatio="4 / 3"
			>
				<ChakraImage asChild w="full" h="full">
					<Image
						src={getBackendUrl(picture.url)}
						alt={picture.alt}
						layout="fullWidth"
					/>
				</ChakraImage>
			</Box>
			<Text textStyle="title.s" mt={3} truncate>
				{title}
			</Text>
			{picture.report?.name && (
				<Text textStyle="mono.s" mt={1} truncate>
					{picture.report.name}
				</Text>
			)}
		</Button>
	);
};

export default PictureCard;
