import { Input } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface TextFieldProps extends DefaultFieldProps {}

export function TextField({ label, placeholder, required }: TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Field
			label={label}
			required={required}
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors[0]?.message}
		>
			<Input
				bg="bg"
				placeholder={placeholder}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.currentTarget.value)}
			/>
		</Field>
	);
}
