import {
	Combobox,
	Highlight,
	Portal,
	Tag,
	type UseListCollectionReturn,
	useComboboxContext,
	Wrap,
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
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
	const [inputValue, setInputValue] = useState('');

	const getLabel = (value: string) =>
		collection.items.find((item) => item.value === value)?.label ?? value;

	const removeValue = (value: string) => {
		field.handleChange(field.state.value.filter((v) => v !== value));
	};

	return (
		<Field
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors.map((e) => e.message).join(', ')}
		>
			<Combobox.Root
				collection={collection}
				placeholder={placeholder}
				value={field.state.value}
				inputValue={inputValue}
				onInputValueChange={(e) => {
					setInputValue(e.inputValue);
					filter(e.inputValue);
				}}
				onValueChange={(e) => {
					field.handleChange(e.value);
					if (multiple) setInputValue('');
				}}
				multiple={multiple}
				openOnClick
				positioning={{ flip: false }}
			>
				<Combobox.Label>{label}</Combobox.Label>
				{multiple && field.state.value.length > 0 && (
					<Wrap gap={2} mb={2}>
						{field.state.value.map((value) => (
							<Tag.Root
								key={value}
								size="md"
								colorPalette="primary"
								borderRadius="full"
							>
								<Tag.Label>{getLabel(value)}</Tag.Label>
								<Tag.EndElement>
									<Tag.CloseTrigger
										cursor="pointer"
										onClick={() => removeValue(value)}
										aria-label={`Retirer ${getLabel(value)}`}
									/>
								</Tag.EndElement>
							</Tag.Root>
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
			<Combobox.ItemIndicator>
				<LuCheck />
			</Combobox.ItemIndicator>
		</Combobox.Item>
	);
}
