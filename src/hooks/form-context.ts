import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { AddressAutocompleteField } from '@/components/form/fields/AddressAutocomplete';
import { AutocompleteField } from '@/components/form/fields/Autocomplete';
import { CheckboxField } from '@/components/form/fields/Checkbox';
import { FilesField } from '@/components/form/fields/Files';
import { HoneypotField } from '@/components/form/fields/Honeypot';
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
		CheckboxField,
		FilesField,
		HoneypotField,
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
