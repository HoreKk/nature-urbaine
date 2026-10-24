import { Box } from '@chakra-ui/react';
import { withPayloadRoot } from '@payloadcms/tanstack-start/client';
import type { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from '@tanstack/react-router';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';
import { Provider as ChakraProvider } from '@/components/ui/provider';
import { umamiBeforeSend } from '@/utils/umami';
import '@fontsource-variable/newsreader/index.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource-variable/jetbrains-mono/index.css';
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
			{
				rel: 'icon',
				type: 'image/svg+xml',
				href: '/favicon.svg',
			},
		],
	}),
	// `/admin/*` renders Payload's own shell; everything else gets the site's.
	shellComponent: withPayloadRoot(RootDocument),
});

const umamiUrl = import.meta.env.VITE_UMAMI_URL?.replace(/\/+$/, '');
const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
const umamiDomains = import.meta.env.VITE_UMAMI_DOMAINS;

const isUmamiConfigured = Boolean(umamiUrl && umamiWebsiteId && umamiDomains);

// The tracker reads this on every send, and the first page it loads on is
// never an admin one, so setting it from the bundle is early enough.
if (typeof window !== 'undefined') window.umamiBeforeSend = umamiBeforeSend;

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<head>
				<HeadContent />
				{/* Here rather than in `head()`: the admin shell renders `head()` too, and admin visits must stay out of the stats. */}
				{isUmamiConfigured ? (
					<script
						defer
						src={`${umamiUrl}/script.js`}
						data-website-id={umamiWebsiteId}
						data-domains={umamiDomains}
						data-before-send="umamiBeforeSend"
					/>
				) : null}
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
