import { createListCollection, Portal, Select } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface SelectOption {
	label: string;
	value: string;
}

interface SelectFieldProps extends DefaultFieldProps {
	options: SelectOption[];
}

export function SelectField({
	label,
	placeholder,
	options,
	required,
}: SelectFieldProps) {
	const field = useFieldContext<string>();
	const collection = createListCollection({ items: options });

	return (
		<Field
			label={label}
			required={required}
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors[0]?.message}
		>
			<Select.Root
				collection={collection}
				value={field.state.value ? [field.state.value] : []}
				onValueChange={(details) => field.handleChange(details.value[0] ?? '')}
			>
				<Select.Trigger bg="bg">
					<Select.ValueText placeholder={placeholder} />
				</Select.Trigger>
				<Portal>
					<Select.Positioner>
						<Select.Content>
							{collection.items.map((item) => (
								<Select.Item key={item.value} item={item}>
									{item.label}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Positioner>
				</Portal>
			</Select.Root>
		</Field>
	);
}
