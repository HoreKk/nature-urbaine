import { Button, Center, Icon, Stack } from '@chakra-ui/react';
import { ErrorComponent, Link, useRouterState } from '@tanstack/react-router';
import { LuCircleAlert } from 'react-icons/lu';
import { EmptyState } from '@/components/ui/empty-state';

interface RouterDefaultErrorProps {
	error: unknown;
	reset: () => void;
}

export default function RouterDefaultError(props: RouterDefaultErrorProps) {
	// `/admin` renders Payload's shell (`withPayloadRoot`), outside the site's
	// ChakraProvider: the Chakra page would crash and hide the real error.
	const inPayload = useRouterState({
		select: (state) =>
			state.matches.some((match) => match.routeId.startsWith('/_payload')),
	});
	if (inPayload) return <ErrorComponent error={props.error} />;

	const errorMessage =
		props.error instanceof Error
			? props.error.message
			: 'Une erreur inattendue est survenue.';

	return (
		<Center minH="60vh" px={4}>
			<EmptyState
				size="lg"
				icon={<Icon as={LuCircleAlert} boxSize={7} />}
				title="Une erreur est survenue"
				description={errorMessage}
			>
				<Stack direction={{ base: 'column', sm: 'row' }} mt={3}>
					<Button onClick={props.reset}>Reessayer</Button>
					<Link to="/">
						<Button variant="outline">Retour a l'accueil</Button>
					</Link>
				</Stack>
			</EmptyState>
		</Center>
	);
}
