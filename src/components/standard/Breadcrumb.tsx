import { Box, Breadcrumb, Container } from '@chakra-ui/react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { Fragment } from 'react';

type UIBreadcrumbProps = {
	links: Array<{ label: string; to: LinkProps['to'] }>;
	currentLinkLabel: string;
};

export const UIBreadcrumb = ({
	links,
	currentLinkLabel,
}: UIBreadcrumbProps) => {
	return (
		<Box
			py={3}
			bgColor="bg"
			borderBottom="1px solid"
			borderColor="border.muted"
		>
			<Container maxW="container.xl">
				<Breadcrumb.Root>
					<Breadcrumb.List flexWrap="nowrap" overflow="hidden">
						{links.map((link, index) => (
							<Fragment key={link.to}>
								<Breadcrumb.Item flexShrink={0}>
									<Breadcrumb.Link asChild outline="none">
										<Link to={link.to}>{link.label}</Link>
									</Breadcrumb.Link>
								</Breadcrumb.Item>
								{index < links.length - 1 && (
									<Breadcrumb.Separator flexShrink={0} />
								)}
							</Fragment>
						))}
						<Breadcrumb.Separator flexShrink={0} />
						<Breadcrumb.Item key="current" overflow="hidden" minW={0}>
							<Breadcrumb.CurrentLink
								overflow="hidden"
								textOverflow="ellipsis"
								whiteSpace="nowrap"
								display="block"
							>
								{currentLinkLabel}
							</Breadcrumb.CurrentLink>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</Container>
		</Box>
	);
};

export default Breadcrumb;
