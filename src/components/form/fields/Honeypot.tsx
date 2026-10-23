import { Box } from '@chakra-ui/react';
import { useFieldContext } from '@/hooks/form-context';

/** Off-screen field only bots fill in; must remain empty. */
export function HoneypotField() {
	const field = useFieldContext<string | undefined>();

	return (
		<Box aria-hidden="true" position="absolute" left="-9999px" tabIndex={-1}>
			<input
				type="text"
				tabIndex={-1}
				autoComplete="off"
				value={field.state.value ?? ''}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
		</Box>
	);
}
