import {
	Box,
	Button,
	Combobox,
	Highlight,
	Portal,
	Tag,
	type UseListCollectionReturn,
	useComboboxContext,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
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

// Multi-select renders its tags inside the control, so the control draws the
// input chrome and the input itself goes borderless.
const tagsControlProps: Combobox.ControlProps = {
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	columnGap: '1.5',
	rowGap: '1',
	minH: 'var(--combobox-input-height)',
	py: '1',
	ps: 'var(--combobox-input-padding-x)',
	pe: 'var(--combobox-input-padding-end)',
	bg: 'bg',
	borderWidth: '1px',
	borderColor: 'border',
	borderRadius: 'l2',
	_focusWithin: {
		borderColor: 'colorPalette.focusRing',
		outline: '1px solid',
		outlineColor: 'colorPalette.focusRing',
	},
	_invalid: { borderColor: 'border.error' },
};

const tagsInputProps: Combobox.InputProps = {
	flex: '1',
	// Control height minus its 1px borders and py="1", so one row matches a plain input.
	minH: 'calc(var(--combobox-input-height) - 10px)',
	h: 'calc(var(--combobox-input-height) - 10px)',
	px: '0',
	bg: 'transparent',
	border: 'none',
	outline: 'none',
	_focusVisible: { outline: 'none', boxShadow: 'none' },
};

export function AutocompleteField({
	label,
	placeholder,
	collection,
	filter,
	multiple,
}: AutocompleteFieldProps) {
	const field = useFieldContext<string[]>();
	const [inputValue, setInputValue] = useState('');
	// While the list is open, picks stay in a draft so the form (and the URL it
	// drives) only changes once, when the list closes.
	const [draft, setDraft] = useState<string[] | null>(null);
	// Ark fires onValueChange and onOpenChange in one dispatch (e.g. clear while
	// open), so the close handler reads the latest draft from here, not state.
	const draftRef = useRef<string[] | null>(null);
	const controlRef = useRef<HTMLDivElement>(null);
	const committedValue = field.state.value;
	const value = draft ?? committedValue;
	const hasTags = multiple && value.length > 0;

	const updateDraft = (next: string[] | null) => {
		draftRef.current = next;
		setDraft(next);
	};

	// The URL can change under an open list (back/forward); follow it.
	useEffect(() => {
		if (!draftRef.current) return;
		draftRef.current = committedValue;
		setDraft(committedValue);
		// The ref is read for its current value, not as a trigger.
		// oxlint-disable-next-line react/exhaustive-effect-dependencies
	}, [committedValue]);

	const getLabel = (itemValue: string) =>
		collection.items.find((item) => item.value === itemValue)?.label ??
		itemValue;

	const changeValue = (next: string[]) => {
		if (draftRef.current) updateDraft(next);
		else field.handleChange(next);
	};

	const removeValue = (removed: string) => {
		changeValue(value.filter((v) => v !== removed));
	};

	return (
		<Field
			invalid={field.state.meta.errors.length > 0}
			errorText={field.state.meta.errors.map((e) => e.message).join(', ')}
		>
			<Combobox.Root
				collection={collection}
				placeholder={hasTags ? undefined : placeholder}
				value={value}
				inputValue={inputValue}
				onInputValueChange={(e) => {
					setInputValue(e.inputValue);
					filter(e.inputValue);
				}}
				onValueChange={(e) => {
					changeValue(e.value);
					if (multiple) setInputValue('');
				}}
				onOpenChange={(e) => {
					if (!multiple) return;
					if (e.open) {
						updateDraft(committedValue);
						return;
					}
					if (draftRef.current) field.handleChange(draftRef.current);
					updateDraft(null);
				}}
				onInteractOutside={(e) => {
					// Tags and padding live in the control but outside Ark's dismiss exclusions.
					if (
						controlRef.current?.contains(e.detail.originalEvent.target as Node)
					)
						e.preventDefault();
				}}
				multiple={multiple}
				openOnClick
				positioning={{ flip: false }}
			>
				<Combobox.Label>{label}</Combobox.Label>
				<Combobox.Control
					ref={controlRef}
					{...(multiple ? tagsControlProps : undefined)}
				>
					{hasTags &&
						value.map((selected) => (
							<Tag.Root
								key={selected}
								size="sm"
								colorPalette="primary"
								borderRadius="full"
							>
								<Tag.Label>{getLabel(selected)}</Tag.Label>
								<Tag.EndElement>
									<Tag.CloseTrigger
										cursor="pointer"
										onClick={() => removeValue(selected)}
										aria-label={`Retirer ${getLabel(selected)}`}
									/>
								</Tag.EndElement>
							</Tag.Root>
						))}
					<Combobox.Input
						{...(multiple
							? { ...tagsInputProps, minW: hasTags ? '4ch' : '12ch' }
							: { bg: 'bg' })}
					/>
					<Combobox.IndicatorGroup>
						<Combobox.ClearTrigger />
						{/* Focusable so closing the multi-select returns focus here, not to the input, and the mobile keyboard closes. */}
						<Combobox.Trigger focusable={multiple} />
					</Combobox.IndicatorGroup>
				</Combobox.Control>
				<Portal>
					<Combobox.Positioner>
						<Combobox.Content
							maxH={{ base: '240px', md: '280px' }}
							overflowY="hidden"
						>
							<Box flex="1" minH="0" overflowY="auto">
								<Combobox.Empty>Pas de résultat</Combobox.Empty>
								{collection.items.map((option) => (
									<ComboboxItem key={option.value} item={option} />
								))}
							</Box>
							{multiple && <ComboboxApplyFooter />}
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

function ComboboxApplyFooter() {
	const combobox = useComboboxContext();
	return (
		<Box
			flexShrink={0}
			pt="1.5"
			borderTopWidth="1px"
			borderColor="border.muted"
		>
			<Button
				size="sm"
				width="full"
				colorPalette="primary"
				borderRadius="l2"
				onClick={() => combobox.setOpen(false)}
			>
				Appliquer les filtres
			</Button>
		</Box>
	);
}
