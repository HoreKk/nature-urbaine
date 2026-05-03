import { Button, Center, Icon, Stack } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { LuMapPinned } from 'react-icons/lu';
import { EmptyState } from '@/components/ui/empty-state';

export default function RouterDefaultNotFound() {
	return (
		<Center minH="60vh" px={4}>
			<EmptyState
				size="lg"
				icon={<Icon as={LuMapPinned} boxSize={7} />}
				title="Page introuvable"
				description="Le lien est peut-etre incomplet ou la page n'existe plus."
			>
				<Stack direction={{ base: 'column', sm: 'row' }} mt={3}>
					<Link to="/">
						<Button>Retour a l'accueil</Button>
					</Link>
					<Link to="/reports">
						<Button variant="outline">Voir les reportages</Button>
					</Link>
				</Stack>
			</EmptyState>
		</Center>
	);
}
