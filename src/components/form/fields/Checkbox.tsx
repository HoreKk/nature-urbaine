import { Checkbox } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface CheckboxFieldProps extends Omit<DefaultFieldProps, 'placeholder'> {}

export function CheckboxField({ label, required }: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();

	return (
		<Field
			required={required}
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors[0]?.message}
		>
			<Checkbox.Root
				alignItems="flex-start"
				checked={field.state.value === true}
				onCheckedChange={(details) =>
					field.handleChange(details.checked === true)
				}
			>
				<Checkbox.HiddenInput />
				<Checkbox.Control bg="bg" mt="2px" />
				<Checkbox.Label fontWeight={400}>{label}</Checkbox.Label>
			</Checkbox.Root>
		</Field>
	);
}
