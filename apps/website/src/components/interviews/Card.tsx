import { Box, Card, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { RiArrowRightLine, RiMapPinLine, RiMicLine } from 'react-icons/ri';
import type { SafeInterview } from '@/server/interviews';

type InterviewCardProps = {
	interview: SafeInterview;
};

const InterviewCard = ({ interview }: InterviewCardProps) => {
	return (
		<Card.Root
			h="full"
			overflow="hidden"
			shadow="md"
			transition="box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
			_hover={{
				boxShadow: 'xl',
				transform: 'translateY(-3px)',
			}}
		>
			{/* Person hero — saturated primary green, interviewee as visual headline */}
			<Box
				bgColor="primary.solid"
				px={5}
				pt={6}
				pb={5}
				position="relative"
				overflow="hidden"
			>
				{/* Decorative guillemet — editorial texture, French locale, aria-hidden */}
				<Text
					aria-hidden
					position="absolute"
					bottom="-16px"
					right="10px"
					fontSize="9xl"
					fontWeight="bold"
					color="primary.emphasized"
					lineHeight={1}
					userSelect="none"
					pointerEvents="none"
				>
					«
				</Text>

				<Flex flexDir="column" gap={1.5} position="relative" zIndex={1}>
					{interview.intervieweeRole && (
						<Text
							fontSize="2xs"
							fontWeight="bold"
							letterSpacing="widest"
							textTransform="uppercase"
							color="fg.inverted"
							lineClamp={1}
						>
							{interview.intervieweeRole}
						</Text>
					)}

					{/* Name is the visual hero — large, white, extrabold */}
					<Heading
						fontSize="2xl"
						fontWeight="extrabold"
						color="fg.inverted"
						lineHeight="1.1"
						lineClamp={2}
					>
						{interview.interviewee}
					</Heading>
				</Flex>
			</Box>

			<Card.Body>
				<Text fontSize="xs" color="fg.muted" mb={2}>
					{new Date(interview.publishedAt).toLocaleDateString('fr-FR', {
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
					mb={2}
				>
					{interview.name}
				</Heading>

				<Flex alignItems="center" gap={1.5} mb={3}>
					<Icon as={RiMapPinLine} boxSize={3.5} color="fg.muted" />
					<Text fontSize="xs" color="fg.muted">
						{interview.city}
						{interview.department ? ` — ${interview.department}` : ''}
					</Text>
				</Flex>

				<Text fontSize="sm" color="fg.muted" lineClamp={5} minH="105px">
					{interview.summary}
				</Text>
			</Card.Body>

			<Card.Footer bgColor="primary.muted" py={3}>
				<Flex justifyContent="space-between" width="full" alignItems="center">
					<Flex gap={1.5} alignItems="center" color="primary.fg">
						<Icon as={RiMicLine} boxSize={3.5} />
						<Text
							fontSize="2xs"
							fontWeight="bold"
							letterSpacing="wide"
							textTransform="uppercase"
						>
							Interview
						</Text>
					</Flex>
					<Link to="/interviews/$id" params={{ id: interview.id.toString() }}>
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
							<Text>Lire l'interview</Text>
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

export default InterviewCard;
