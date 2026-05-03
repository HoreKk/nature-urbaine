import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import RouterDefaultError from '@/components/standard/RouterDefaultError';
import RouterDefaultNotFound from '@/components/standard/RouterDefaultNotFound';
import * as TanstackQuery from './integrations/tanstack-query/root-provider';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
export const getRouter = () => {
	const rqContext = TanstackQuery.getContext();

	const router = createRouter({
		routeTree,
		defaultNotFoundComponent: RouterDefaultNotFound,
		defaultErrorComponent: RouterDefaultError,
		context: {
			...rqContext,
		},
		scrollRestoration: true,
		defaultPreload: 'intent',
		defaultViewTransition: true,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	return router;
};
