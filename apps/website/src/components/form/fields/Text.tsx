import { Field, Input } from '@chakra-ui/react';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface TextFieldProps extends DefaultFieldProps {}

export function TextField({ label, placeholder }: TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Field.Root invalid={field.state.meta.errors.length > 0}>
			<Field.Label>
				{label} <Field.RequiredIndicator />
			</Field.Label>
			<Input
				placeholder={placeholder}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.currentTarget.value)}
			/>
			<Field.ErrorText>{field.state.meta.errors[0]?.message}</Field.ErrorText>
		</Field.Root>
	);
}
