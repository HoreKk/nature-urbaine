import {
	Box,
	Card,
	Flex,
	Heading,
	Icon,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import {
	RiArrowRightLine,
	RiMapPinLine,
	RiMicLine,
	RiUserLine,
} from 'react-icons/ri';
import type { SafeInterview } from '@/server/interviews';

type InterviewCardProps = {
	interview: SafeInterview;
};

const InterviewCard = ({ interview }: InterviewCardProps) => {
	return (
		<Card.Root
			overflow="hidden"
			shadow="sm"
			transition="box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1), transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)"
			_hover={{
				boxShadow: 'lg',
				transform: 'translateY(-1.5px)',
			}}
		>
			{/* Person header — structural equivalent of the image in ReportCard */}
			<Box bgColor="primary.muted" px={5} py={4}>
				<Flex gap={3} alignItems="center">
					<Flex
						flexShrink={0}
						w={9}
						h={9}
						borderRadius="full"
						bgColor="primary.subtle"
						alignItems="center"
						justifyContent="center"
					>
						<Icon as={RiUserLine} boxSize={4} color="primary.fg" />
					</Flex>
					<Flex flexDir="column" gap={0} minW={0}>
						<Text fontWeight="bold" fontSize="sm" lineClamp={1} color="primary.fg">
							{interview.interviewee}
						</Text>
						<Text fontSize="xs" color="primary.fg" opacity={0.75} lineClamp={1}>
							{interview.intervieweeRole}
						</Text>
					</Flex>
				</Flex>
			</Box>

			<Card.Body pt={4}>
				<Text fontSize="xs" color="fg.muted" mb={1.5}>
					{new Date(interview.publishedAt).toLocaleDateString('fr-FR', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					})}
				</Text>

				<Heading fontSize="lg" fontWeight="bold" lineClamp={2} lineHeight="1.3" mb={2}>
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
						<Text fontSize="xs" fontWeight="medium">
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
							_hover={{ color: 'primary.solid' }}
							transition="color 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
						>
							<Text>Lire l'interview</Text>
							<Icon as={RiArrowRightLine} />
						</Flex>
					</Link>
				</Flex>
			</Card.Footer>
		</Card.Root>
	);
};

export default InterviewCard;
