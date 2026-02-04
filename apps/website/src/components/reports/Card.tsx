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

type ReportCardProps = {
	report: AugmentedReport;
};

const ReportCard = ({ report }: ReportCardProps) => {
	return (
		<Card.Root key={report.id} overflow="hidden" shadow="md">
			<ChakraImage asChild height="250px">
				<Image
					src={`http://localhost:3001${report.thumbnail.url}`}
					alt={report.thumbnail.alt || report.name}
					layout="fullWidth"
				/>
			</ChakraImage>
			<Card.Header>
				<Flex alignItems="center" gap={2} color="fg.muted">
					<Text fontSize={12}>{report.category.name}</Text>
					<Box
						width={1.5}
						height={1.5}
						borderRadius="full"
						bgColor="bg.emphasized"
					/>
					<Text fontSize={12}>
						{new Date(report.date).toLocaleDateString()}
					</Text>
				</Flex>
			</Card.Header>
			<Card.Body pt={2}>
				<Heading fontSize="lg" fontWeight="bold" lineClamp={1}>
					{report.name}
				</Heading>
				<Text
					fontSize="sm"
					mt={2}
					color="fg.muted"
					lineClamp={5}
					minHeight="105px"
				>
					{report.description}
				</Text>
			</Card.Body>
			<Card.Footer>
				<Flex justifyContent="space-between" width="full">
					<Flex gap={1} alignItems="center" color="fg.muted">
						<Icon as={RiEyeLine} />
						<Text fontSize="sm">0</Text>
					</Flex>
					<Link to="/reports/$id" params={{ id: report.id.toString() }}>
						<Text fontSize="sm" color="fg.info" fontWeight="bold">
							Lire plus
							<Icon as={RiArrowRightLine} ml={1} />
						</Text>
					</Link>
				</Flex>
			</Card.Footer>
		</Card.Root>
	);
};

export default ReportCard;
