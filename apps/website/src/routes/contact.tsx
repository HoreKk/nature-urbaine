import { createFileRoute } from '@tanstack/react-router';
import UnderConstruction from '../components/sections/UnderConstruction';

export const Route = createFileRoute('/contact')({
	component: RouteComponent,
});

function RouteComponent() {
	return <UnderConstruction />;
}
