import {
	Box,
	Card,
	Flex,
	Heading,
	Icon,
	LinkBox,
	LinkOverlay,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import type { IconType } from 'react-icons';
import { RiArrowRightLine, RiMapPinLine } from 'react-icons/ri';
import PictureImg from '@/components/standard/PictureImg';
import type { ImageSource } from '@/utils/picture-src';

type ProjectCardProps = {
	to: string;
	params: Record<string, string>;
	title: string;
	description: string;
	date: string | Date;
	image?: ImageSource;
	imageAlt?: string;
	badge?: string;
	location?: string;
	footerIcon: IconType;
	footerLabel: string;
	readMoreLabel: string;
	portrait?: {
		src?: string;
		alt?: string;
		initials?: string;
	};
};

const ProjectCard = ({
	to,
	params,
	title,
	description,
	date,
	image,
	imageAlt,
	badge,
	location,
	footerIcon,
	footerLabel,
	readMoreLabel,
	portrait,
}: ProjectCardProps) => {
	return (
		<Card.Root
			asChild
			className="group"
			h="full"
			overflow="hidden"
			shadow="sm"
			transition="box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1), transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)"
			_hover={{
				boxShadow: 'lg',
				transform: 'translateY(-1.5px)',
			}}
			_focusWithin={{
				outline: '2px solid',
				outlineColor: 'primary.solid',
				outlineOffset: '2px',
			}}
		>
			<LinkBox>
				<Box position="relative">
					{image ? (
						<PictureImg
							source={image}
							alt={imageAlt || title}
							height="220px"
							w="full"
						/>
					) : (
						<Box
							height="220px"
							w="full"
							bgColor="bg.muted"
							backgroundImage="repeating-linear-gradient(45deg, transparent 0 12px, rgba(0,0,0,0.025) 12px 24px)"
						/>
					)}
					<Box
						position="absolute"
						bottom={0}
						left={0}
						right={0}
						height="90px"
						background="linear-gradient(to top, rgba(0,0,0,0.58) 0%, transparent 100%)"
						pointerEvents="none"
					/>
					{badge && (
						<Box
							position="absolute"
							bottom={3}
							left={3}
							bgColor="primary.solid"
							color="fg.inverted"
							fontSize="2xs"
							fontWeight="bold"
							px={2.5}
							py={1}
							borderRadius="full"
							letterSpacing="widest"
							textTransform="uppercase"
							lineHeight={1}
						>
							{badge}
						</Box>
					)}
					{portrait && (
						<Flex
							position="absolute"
							bottom="-28px"
							right={4}
							boxSize="72px"
							borderRadius="full"
							bgColor="bg.subtle"
							borderWidth="3px"
							borderColor="bg"
							overflow="hidden"
							alignItems="center"
							justifyContent="center"
							shadow="sm"
						>
							{portrait.src ? (
								<PictureImg
									source={{ src: portrait.src }}
									alt={portrait.alt || ''}
									boxSize="full"
								/>
							) : (
								<Text
									fontSize="lg"
									fontWeight="bold"
									color="fg.muted"
									letterSpacing="wide"
								>
									{portrait.initials}
								</Text>
							)}
						</Flex>
					)}
				</Box>
				<Card.Body pt={portrait ? 8 : undefined}>
					<Text fontSize="xs" color="fg.muted" mb={2}>
						{new Date(date).toLocaleDateString('fr-FR', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					</Text>
					<Heading
						fontSize="lg"
						fontWeight="bold"
						lineClamp={2}
						lineHeight="1.3"
					>
						<LinkOverlay asChild _focusVisible={{ outline: 'none' }}>
							<Link to={to as never} params={params as never}>
								{title}
							</Link>
						</LinkOverlay>
					</Heading>
					{location && (
						<Flex alignItems="center" gap={1.5} mt={2}>
							<Icon as={RiMapPinLine} boxSize={3.5} color="fg.muted" />
							<Text fontSize="xs" color="fg.muted">
								{location}
							</Text>
						</Flex>
					)}
					<Text
						fontSize="sm"
						mt={2}
						color="fg.muted"
						lineClamp={5}
						minH="105px"
					>
						{description}
					</Text>
				</Card.Body>
				<Card.Footer bgColor="primary.muted" py={3}>
					<Flex justifyContent="space-between" width="full" alignItems="center">
						<Flex gap={1.5} alignItems="center" color="primary.fg">
							<Icon as={footerIcon} boxSize={3.5} />
							<Text
								fontSize="2xs"
								fontWeight="bold"
								letterSpacing="wide"
								textTransform="uppercase"
							>
								{footerLabel}
							</Text>
						</Flex>
						<Flex
							aria-hidden
							align="center"
							gap={1}
							color="primary.fg"
							fontWeight="bold"
							fontSize="sm"
							transition="color 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
							_groupHover={{ color: 'primary.solid' }}
						>
							<Text>{readMoreLabel}</Text>
							<Icon as={RiArrowRightLine} boxSize={3.5} />
						</Flex>
					</Flex>
				</Card.Footer>
			</LinkBox>
		</Card.Root>
	);
};

export default ProjectCard;
