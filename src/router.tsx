import { payloadStringifySearch } from '@payloadcms/tanstack-start/shared';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import RouterDefaultError from '@/components/standard/RouterDefaultError';
import RouterDefaultNotFound from '@/components/standard/RouterDefaultNotFound';
import { parseSearch } from '@/utils/search-params';
import * as TanstackQuery from './integrations/tanstack-query/root-provider';

import { routeTree } from './routeTree.gen';

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
		// Payload's admin needs qs-style search params (nested `where` filters); this is
		// router-global, so our own `validateSearch` schemas must coerce from strings.
		parseSearch,
		stringifySearch: payloadStringifySearch,
		defaultPreload: 'intent',
		defaultViewTransition: true,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	return router;
};
