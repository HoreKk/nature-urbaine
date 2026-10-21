import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
	eyebrow?: string;
	title: ReactNode;
	description?: ReactNode;
};

const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => {
	return (
		<Box
			as="section"
			bgColor="bg"
			borderBottom="1px solid"
			borderColor="border.muted"
		>
			<Container maxW="container.xl" py={{ base: 6, md: 10 }}>
				<Stack gap={4} maxW="900px">
					{eyebrow && <Text textStyle="kicker">{eyebrow}</Text>}
					<Heading as="h1" textStyle="heading.xl">
						{title}
					</Heading>
					{description && (
						<Text textStyle="lead" maxW="720px" mt={2}>
							{description}
						</Text>
					)}
				</Stack>
			</Container>
		</Box>
	);
};

export default PageHeader;
