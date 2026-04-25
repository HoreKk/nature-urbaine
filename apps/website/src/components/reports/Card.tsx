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
import { RiArrowRightLine, RiEyeLine } from 'react-icons/ri';
import type { AugmentedReport } from '@/server/reports';
import { getBackendUrl } from '@/utils/tools';

type ReportCardProps = {
	report: AugmentedReport;
};

const ReportCard = ({ report }: ReportCardProps) => {
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
			<Box position="relative">
				<ChakraImage asChild height="220px" w="full">
					<Image
						src={getBackendUrl(report.thumbnail.url)}
						alt={report.thumbnail.alt || report.name}
						layout="fullWidth"
					/>
				</ChakraImage>
				<Box
					position="absolute"
					bottom={0}
					left={0}
					right={0}
					height="90px"
					background="linear-gradient(to top, rgba(0,0,0,0.58) 0%, transparent 100%)"
					pointerEvents="none"
				/>
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
					{report.category.name}
				</Box>
			</Box>
			<Card.Body>
				<Text fontSize="xs" color="fg.muted" mb={2}>
					{new Date(report.date).toLocaleDateString('fr-FR', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					})}
				</Text>
				<Heading fontSize="lg" fontWeight="bold" lineClamp={1} lineHeight="1.3">
					{report.name}
				</Heading>
				<Text fontSize="sm" mt={2} color="fg.muted" lineClamp={5} minH="105px">
					{report.description}
				</Text>
			</Card.Body>
			<Card.Footer bgColor="primary.muted" py={3}>
				<Flex justifyContent="space-between" width="full" alignItems="center">
					<Flex gap={1.5} alignItems="center" color="primary.fg">
						<Icon as={RiEyeLine} boxSize={3.5} />
						<Text fontSize="xs" fontWeight="medium">
							0 vue
						</Text>
					</Flex>
					<Link to="/reports/$id" params={{ id: report.id.toString() }}>
						<Flex
							align="center"
							gap={1}
							color="primary.fg"
							fontWeight="bold"
							fontSize="sm"
							_hover={{ color: 'primary.solid' }}
							transition="color 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
						>
							<Text>Lire plus</Text>
							<Icon as={RiArrowRightLine} />
						</Flex>
					</Link>
				</Flex>
			</Card.Footer>
		</Card.Root>
	);
};

export default ReportCard;
