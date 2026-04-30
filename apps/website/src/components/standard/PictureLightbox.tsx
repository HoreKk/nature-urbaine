import {
	Box,
	Button,
	Image as ChakraImage,
	CloseButton,
	Dialog,
	Flex,
	Heading,
	Portal,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import { RiArrowRightLine } from 'react-icons/ri';
import type { PictureWithReport } from '@/server/tags';
import { getBackendUrl } from '@/utils/backend-url';
import { stripExtension } from '@/utils/tools';

type PictureLightboxProps = {
	picture: PictureWithReport | null;
	onClose: () => void;
};

const PictureLightbox = ({ picture, onClose }: PictureLightboxProps) => {
	const open = picture !== null;

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
						{picture && (
							<Flex direction={{ base: 'column', md: 'row' }} h="full">
								<Box
									flex={2}
									bgColor="paper.700"
									minH={{ base: '320px', md: 'auto' }}
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<ChakraImage asChild w="full" h="full" objectFit="contain">
										<Image
											src={getBackendUrl(picture.url)}
											alt={picture.alt}
											layout="fullWidth"
										/>
									</ChakraImage>
								</Box>
								<Stack
									flex={1}
									p={{ base: 6, md: 10 }}
									gap={5}
									minW={{ md: '320px' }}
									maxW={{ md: '420px' }}
								>
									<Text textStyle="kicker">Photo</Text>
									<Heading textStyle="heading.md">
										{picture.filename
											? stripExtension(picture.filename)
											: picture.alt}
									</Heading>
									{picture.alt && (
										<Text textStyle="lead" fontSize="md">
											{picture.alt}
										</Text>
									)}
									{picture.report && (
										<Box
											borderTop="1px solid"
											borderColor="border.muted"
											pt={5}
										>
											<Text textStyle="kicker" mb={2}>
												Reportage associé
											</Text>
											<Text textStyle="title.s" mb={4}>
												{picture.report.name}
											</Text>
											<Link
												to="/reports/$id"
												params={{ id: picture.report.id.toString() }}
												onClick={onClose}
											>
												<Button>
													Voir le reportage
													<RiArrowRightLine />
												</Button>
											</Link>
										</Box>
									)}
								</Stack>
							</Flex>
						)}
						<Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
							<CloseButton bgColor="bg" size="md" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default PictureLightbox;
