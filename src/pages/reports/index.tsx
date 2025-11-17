import { Flex, Grid, GridItem, Heading } from "@chakra-ui/react";
import ReportCard from "~/components/report/Card";
import { api } from "~/utils/api";

export default function Home() {
	const { data: reports } = api.report.getAll.useQuery();

	return (
		<Flex direction="column" gap={8}>
			<Heading fontSize="4xl" fontWeight="bold">
				Découvrez nos reportages
			</Heading>
			<Grid
				gap={6}
				templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
			>
				{reports?.map((report) => (
					<GridItem key={report.id} mb={4}>
						<ReportCard report={report} />
					</GridItem>
				))}
			</Grid>
		</Flex>
	);
}
