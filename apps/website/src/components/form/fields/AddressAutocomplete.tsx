import {
	Center,
	Combobox,
	Field as ChakraField,
	Mark,
	Portal,
	Spinner,
	useComboboxContext,
	useListCollection,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';
import { normalizeString } from '@/utils/tools';

type AddressFeature = {
	properties: {
		label: string;
	};
};

type GeocodageResponse = {
	features: AddressFeature[];
};

type AddressItem = { label: string; value: string };

async function fetchAddressSuggestions(query: string): Promise<string[]> {
	const params = new URLSearchParams({ q: query, limit: '5' });
	const res = await fetch(
		`https://data.geopf.fr/geocodage/search?${params.toString()}`,
	);
	if (!res.ok) throw new Error('Geocoding request failed');
	const data: GeocodageResponse = await res.json();
	return data.features.map((f) => f.properties.label);
}

export function AddressAutocompleteField({
	label,
	placeholder,
	required,
}: DefaultFieldProps) {
	const field = useFieldContext<string>();
	const [selectedValue, setSelectedValue] = useState(field.state.value ?? '');
	const [inputValue, setInputValue] = useState(field.state.value ?? '');
	const [isFocused, setIsFocused] = useState(false);
	const debouncedInput = useDebounce(inputValue, 350);

	const trimmedInput = inputValue.trim();
	const trimmedDebounced = debouncedInput.trim();

	const { collection, set } = useListCollection<AddressItem>({
		initialItems: [],
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
	});

	const { isFetching } = useQuery({
		queryKey: ['address-suggestions', debouncedInput],
		queryFn: async () => {
			const items = (await fetchAddressSuggestions(debouncedInput)).map(
				(l) => ({
					label: l,
					value: l,
				}),
			);
			set(items);
			return items;
		},
		enabled: trimmedDebounced.length >= 3,
	});

	const isLoading = inputValue !== debouncedInput || isFetching;
	const isOpen =
		isFocused && trimmedInput.length > 0 && inputValue !== selectedValue;

	function clear() {
		setInputValue('');
		setSelectedValue('');
		field.handleChange('');
		set([]);
	}

	function handleInputChange(nextInputValue: string) {
		setInputValue(nextInputValue);
		if (nextInputValue === '') {
			clear();
		}
	}

	function handleBlur() {
		setIsFocused(false);
		if (inputValue !== selectedValue) {
			setInputValue(selectedValue);
			field.handleChange(selectedValue);
			set([]);
		}
	}

	function handleSelect(value: string) {
		setSelectedValue(value);
		setInputValue(value);
		field.handleChange(value);
		set([]);
	}

	function renderIndicator() {
		if (isLoading && trimmedInput.length >= 3) {
			return (
				<Center pr={2}>
					<Spinner size="xs" color="fg.muted" />
				</Center>
			);
		}
		if (selectedValue) {
			return <Combobox.ClearTrigger onClick={clear} />;
		}
		return null;
	}

	function renderDropdownContent() {
		if (trimmedInput.length < 3) {
			return (
				<Combobox.Empty color="fg.muted">
					Saisissez au moins 3 caractères pour rechercher une adresse
				</Combobox.Empty>
			);
		}
		if (isLoading) {
			return (
				<Center py={3}>
					<Spinner size="sm" color="fg.muted" />
				</Center>
			);
		}
		if (collection.items.length === 0) {
			return <Combobox.Empty>Pas d'adresses trouvées</Combobox.Empty>;
		}
		return collection.items.map((item) => (
			<AddressItem key={item.value} item={item} query={debouncedInput} />
		));
	}

	return (
		<Field
			required={required}
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors.map((e) => e.message).join(', ')}
		>
			<Combobox.Root
				collection={collection}
				inputValue={inputValue}
				open={isOpen}
				onInputValueChange={(e) => {
					if (e.reason === 'input-change') handleInputChange(e.inputValue);
				}}
				onValueChange={(e) => handleSelect(e.value[0] ?? '')}
				positioning={{ flip: false }}
			>
				<Combobox.Label>
					{label} <ChakraField.RequiredIndicator />
				</Combobox.Label>
				<Combobox.Control>
					<Combobox.Input
						bg="bg"
						placeholder={placeholder}
						onFocus={() => setIsFocused(true)}
						onBlur={handleBlur}
					/>
					<Combobox.IndicatorGroup>{renderIndicator()}</Combobox.IndicatorGroup>
				</Combobox.Control>
				<Portal>
					<Combobox.Positioner>
						<Combobox.Content>{renderDropdownContent()}</Combobox.Content>
					</Combobox.Positioner>
				</Portal>
			</Combobox.Root>
		</Field>
	);
}

type AddressItemProps = {
	item: AddressItem;
	query: string;
};

function AddressItem({ item, query }: AddressItemProps) {
	const combobox = useComboboxContext();
	const activeQuery = normalizeString(combobox.inputValue || query);
	const normLabel = normalizeString(item.label);
	const idx = activeQuery ? normLabel.indexOf(activeQuery) : -1;

	if (idx === -1) {
		return (
			<Combobox.Item item={item}>
				<Combobox.ItemText>{item.label}</Combobox.ItemText>
			</Combobox.Item>
		);
	}

	return (
		<Combobox.Item item={item}>
			<Combobox.ItemText>
				{item.label.slice(0, idx)}
				<Mark fontWeight="bold" bg="transparent">
					{item.label.slice(idx, idx + activeQuery.length)}
				</Mark>
				{item.label.slice(idx + activeQuery.length)}
			</Combobox.ItemText>
		</Combobox.Item>
	);
}
