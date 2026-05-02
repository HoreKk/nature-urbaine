import { Textarea } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
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
		<Field
			label={label}
			required={required}
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors[0]?.message}
		>
			<Textarea
				bg="bg"
				placeholder={placeholder}
				value={field.state.value}
				maxLength={maxLength}
				onChange={(e) => field.handleChange(e.currentTarget.value)}
				rows={5}
			/>
		</Field>
	);
}
