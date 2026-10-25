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
				colorPalette="primary"
				checked={field.state.value === true}
				onCheckedChange={(details) =>
					field.handleChange(details.checked === true)
				}
			>
				<Checkbox.HiddenInput />
				<Checkbox.Control
					mt="2px"
					bg="bg"
					borderColor="border"
					_checked={{ bg: 'primary.solid', borderColor: 'primary.solid' }}
				>
					<Checkbox.Indicator />
				</Checkbox.Control>
				<Checkbox.Label fontWeight={400}>{label}</Checkbox.Label>
			</Checkbox.Root>
		</Field>
	);
}
