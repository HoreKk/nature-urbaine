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
		<Box py={4} bgColor="bg.muted" borderY="1px solid" borderColor="border">
			<Container maxW="container.xl">
				<Breadcrumb.Root>
					<Breadcrumb.List>
						{links.map((link, index) => (
							<Fragment key={link.to}>
								<Breadcrumb.Item>
									<Breadcrumb.Link asChild outline="none">
										<Link to={link.to}>{link.label}</Link>
									</Breadcrumb.Link>
								</Breadcrumb.Item>
								{index < links.length - 1 && <Breadcrumb.Separator />}
							</Fragment>
						))}
						<Breadcrumb.Separator />
						<Breadcrumb.Item key="current">
							<Breadcrumb.CurrentLink>
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
