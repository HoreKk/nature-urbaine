import { Center } from '@chakra-ui/react';
import { LuConstruction } from 'react-icons/lu';
import { EmptyState } from '../ui/empty-state';

const UnderConstruction = () => {
	return (
		<Center minH="60vh">
			<EmptyState
				icon={<LuConstruction size={48} />}
				title="En cours de construction"
				description="Cette page sera bientôt disponible."
			/>
		</Center>
	);
};

export default UnderConstruction;
