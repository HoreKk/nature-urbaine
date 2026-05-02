import {
	Badge,
	Combobox,
	Highlight,
	Portal,
	type UseListCollectionReturn,
	useComboboxContext,
	Wrap,
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface AutocompleteFieldProps extends DefaultFieldProps {
	collection: UseListCollectionReturn<{
		value: string;
		label: string;
	}>['collection'];
	filter: UseListCollectionReturn<{
		value: string;
		label: string;
	}>['filter'];
	multiple?: boolean;
}

export function AutocompleteField({
	label,
	placeholder,
	collection,
	filter,
	multiple,
}: AutocompleteFieldProps) {
	const field = useFieldContext<string[]>();

	return (
		<Field
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors.map((e) => e.message).join(', ')}
		>
			<Combobox.Root
				collection={collection}
				placeholder={placeholder}
				value={field.state.value}
				onInputValueChange={(e) => filter(e.inputValue)}
				onValueChange={(e) => field.handleChange(e.value)}
				multiple={multiple}
				openOnClick
				positioning={{ flip: false }}
			>
				<Combobox.Label>{label}</Combobox.Label>
				{multiple && (
					<Wrap gap="2">
						{field.state.value.map((skill) => (
							<Badge key={skill}>{skill}</Badge>
						))}
					</Wrap>
				)}
				<Combobox.Control>
					<Combobox.Input bg="bg" placeholder={placeholder} />
					<Combobox.IndicatorGroup>
						<Combobox.ClearTrigger />
						<Combobox.Trigger />
					</Combobox.IndicatorGroup>
				</Combobox.Control>
				<Portal>
					<Combobox.Positioner>
						<Combobox.Content maxH="350px">
							<Combobox.Empty>Pas de résultat</Combobox.Empty>
							{collection.items.map((option) => (
								<ComboboxItem key={option.value} item={option} />
							))}
						</Combobox.Content>
					</Combobox.Positioner>
				</Portal>
			</Combobox.Root>
		</Field>
	);
}

function ComboboxItem(props: { item: { label: string; value: string } }) {
	const { item } = props;
	const combobox = useComboboxContext();
	return (
		<Combobox.Item item={item} key={item.value}>
			<Combobox.ItemText>
				<Highlight
					ignoreCase
					query={combobox.inputValue}
					styles={{ bg: 'yellow.emphasized', fontWeight: 'medium' }}
				>
					{item.label}
				</Highlight>
			</Combobox.ItemText>
		</Combobox.Item>
	);
}
