import { Box } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from '@tanstack/react-router';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';
import { Provider as ChakraProvider } from '@/components/ui/provider';
import '@fontsource-variable/inter/index.css';
import '@fontsource-variable/mulish/index.css';
import appCss from '../styles.css?url';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'Nature Urbaine',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ChakraProvider>
					<Box fontFamily="body">
						<Navbar />
						<Box as="main" bgColor="bg.subtle" minH="calc(100vh - 78px)">
							{children}
						</Box>
						<Footer />
					</Box>
				</ChakraProvider>
				<Scripts />
			</body>
		</html>
	);
}
