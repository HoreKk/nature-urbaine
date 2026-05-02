import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { AddressAutocompleteField } from '@/components/form/fields/AddressAutocomplete';
import { AutocompleteField } from '@/components/form/fields/Autocomplete';
import { SelectField } from '@/components/form/fields/Select';
import { TextField } from '@/components/form/fields/Text';
import { TextareaField } from '@/components/form/fields/Textarea';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		TextareaField,
		SelectField,
		AutocompleteField,
		AddressAutocompleteField,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	label: string;
	placeholder?: string;
	required?: boolean;
};
