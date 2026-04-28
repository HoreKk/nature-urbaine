import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/contribuer')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/contribuer"!</div>;
}
