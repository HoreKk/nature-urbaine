'use client';

import {
	FieldDescription,
	FieldError,
	FieldLabel,
	useField,
} from '@payloadcms/ui';
import type { TextFieldClientProps } from 'payload';

export const ColorPickerField = ({ field, path }: TextFieldClientProps) => {
	const { value, setValue, showError, disabled } = useField<string>({ path });
	const inputId = `field-${path.replace(/\./g, '__')}`;

	return (
		<div className="field-type text" style={{ flex: '1 1 auto' }}>
			<FieldLabel
				htmlFor={inputId}
				label={field.label}
				required={field.required}
				path={path}
			/>
			<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				<input
					id={inputId}
					type="color"
					value={value ?? '#000000'}
					onChange={(e) => setValue(e.target.value.toUpperCase())}
					disabled={disabled}
					style={{
						width: 48,
						height: 40,
						padding: 2,
						border: '1px solid var(--theme-elevation-150)',
						borderRadius: 'var(--style-radius-s)',
						background: 'var(--theme-input-bg)',
						cursor: disabled ? 'not-allowed' : 'pointer',
					}}
				/>
				<code>{value ?? '—'}</code>
			</div>
			<FieldError path={path} showError={showError} />
			<FieldDescription description={field.admin?.description} path={path} />
		</div>
	);
};
