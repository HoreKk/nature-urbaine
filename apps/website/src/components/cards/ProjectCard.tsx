import {
	Box,
	Card,
	Image as ChakraImage,
	Flex,
	Heading,
	Icon,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import type { IconType } from 'react-icons';
import { RiArrowRightLine, RiMapPinLine } from 'react-icons/ri';

type ProjectCardProps = {
	to: string;
	params: Record<string, string>;
	title: string;
	description: string;
	date: string | Date;
	imageSrc?: string;
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
	imageSrc,
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
			h="full"
			overflow="hidden"
			shadow="sm"
			transition="box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1), transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)"
			_hover={{
				boxShadow: 'lg',
				transform: 'translateY(-1.5px)',
			}}
		>
			<Box position="relative">
				{imageSrc ? (
					<ChakraImage asChild height="220px" w="full">
						<Image src={imageSrc} alt={imageAlt || title} layout="fullWidth" />
					</ChakraImage>
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
						zIndex={1}
					>
						{portrait.src ? (
							<ChakraImage asChild boxSize="full">
								<Image
									src={portrait.src}
									alt={portrait.alt || ''}
									layout="constrained"
									width={72}
									height={72}
								/>
							</ChakraImage>
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
				<Heading fontSize="lg" fontWeight="bold" lineClamp={2} lineHeight="1.3">
					{title}
				</Heading>
				{location && (
					<Flex alignItems="center" gap={1.5} mt={2}>
						<Icon as={RiMapPinLine} boxSize={3.5} color="fg.muted" />
						<Text fontSize="xs" color="fg.muted">
							{location}
						</Text>
					</Flex>
				)}
				<Text fontSize="sm" mt={2} color="fg.muted" lineClamp={5} minH="105px">
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
					<Link to={to as never} params={params as never}>
						<Flex
							align="center"
							gap={1}
							color="primary.fg"
							fontWeight="bold"
							fontSize="sm"
							transition="color 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
							_hover={{
								color: 'primary.solid',
								'& .arrow-icon': { transform: 'translateX(3px)' },
							}}
						>
							<Text>{readMoreLabel}</Text>
							<Icon
								as={RiArrowRightLine}
								boxSize={3.5}
								className="arrow-icon"
								transition="transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
							/>
						</Flex>
					</Link>
				</Flex>
			</Card.Footer>
		</Card.Root>
	);
};

export default ProjectCard;
