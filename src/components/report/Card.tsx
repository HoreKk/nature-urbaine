import {
	AspectRatio,
	Badge,
	Card,
	HStack,
	Image,
	Text,
} from "@chakra-ui/react";
import Link from "next/link";
import type { AugmentedReport } from "~/server/api/routers/report";

interface ReportCardProps {
	report: AugmentedReport;
}

const ReportCard = ({ report }: ReportCardProps) => {
	return (
		<Link href={`/reports/${report.id}`}>
			<Card.Root borderRadius="xl" overflow="hidden">
				<AspectRatio ratio={16 / 9}>
					<Image alt={report.thumbnail.alt} src={report.thumbnail.url ?? ""} />
				</AspectRatio>
				<Card.Body>
					<HStack mb={2}>
						<Badge>{report.category.name}</Badge>
					</HStack>
					<Card.Title>{report.name}</Card.Title>
					<Card.Description>{report.description}</Card.Description>
					<HStack mt={4}>
						<Text color="gray.500" fontSize="sm">
							Publié le {new Date(report.createdAt).toLocaleDateString()}
						</Text>
					</HStack>
				</Card.Body>
			</Card.Root>
		</Link>
	);
};

export default ReportCard;
