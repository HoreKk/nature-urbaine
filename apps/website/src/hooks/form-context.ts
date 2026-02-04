import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { AutocompleteField } from '@/components/form/fields/Autocomplete';
import { TextField } from '@/components/form/fields/Text';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		AutocompleteField,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	label: string;
	placeholder?: string;
}