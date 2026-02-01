import { createFileRoute } from '@tanstack/react-router';
import { getReportById } from '@/server/reports';

export const Route = createFileRoute('/reports/$id')({
	component: RouteComponent,
	loader: async ({ params }) => getReportById({ data: Number(params.id) }),
});

function RouteComponent() {
	const report = Route.useLoaderData();

	return <div>Hello "/reports/{report.id}"!</div>;
}
