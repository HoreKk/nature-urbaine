import { Field, Textarea } from '@chakra-ui/react';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface TextareaFieldProps extends DefaultFieldProps {
	maxLength?: number;
}

export function TextareaField({
	label,
	placeholder,
	maxLength,
	required,
}: TextareaFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Field.Root
			invalid={field.state.meta.errors.length > 0}
			required={required}
		>
			<Field.Label>
				{label} <Field.RequiredIndicator />
			</Field.Label>
			<Textarea
				placeholder={placeholder}
				value={field.state.value}
				maxLength={maxLength}
				onChange={(e) => field.handleChange(e.currentTarget.value)}
				rows={5}
			/>
			<Field.ErrorText>{field.state.meta.errors[0]?.message}</Field.ErrorText>
		</Field.Root>
	);
}
