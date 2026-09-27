import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useRef } from 'react';

type FilterValue = string | string[];
type FilterValues = Record<string, FilterValue>;

const isSameValue = (a: FilterValue, b: FilterValue) =>
	Array.isArray(a) && Array.isArray(b)
		? a.length === b.length && a.every((v, i) => v === b[i])
		: a === b;

const isSameValues = <T extends FilterValues>(a: T, b: T) =>
	Object.keys(a).every((key) => isSameValue(a[key], b[key]));

type UseUrlSyncedFiltersOptions<T extends FilterValues> = {
	formValues: T;
	urlValues: T;
	setFormValues: (values: T) => void;
	onCommit: (values: T) => void;
	delay?: number;
};

/**
 * Two-way sync between a filter form and the URL search params, which stay
 * the single source of truth. Form edits are debounced as a whole object so a
 * URL→form sync (back/forward) never races a stale half-debounced value back
 * into the URL.
 */
export function useUrlSyncedFilters<T extends FilterValues>({
	formValues,
	urlValues,
	setFormValues,
	onCommit,
	delay = 400,
}: UseUrlSyncedFiltersOptions<T>) {
	const debouncedValues = useDebounce(formValues, delay);
	const debouncedKey = JSON.stringify(debouncedValues);
	const urlKey = JSON.stringify(urlValues);

	const latest = useRef({ urlValues, formValues, setFormValues, onCommit });
	latest.current = { urlValues, formValues, setFormValues, onCommit };
	const lastCommittedKey = useRef<string | null>(null);

	useEffect(() => {
		const { urlValues: url, onCommit: commit } = latest.current;
		if (isSameValues(debouncedValues, url)) return;
		lastCommittedKey.current = debouncedKey;
		commit(debouncedValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedKey]);

	// A URL change we committed ourselves must not overwrite what the user has
	// typed since; only external changes (back/forward, links) flow back.
	useEffect(() => {
		if (urlKey === lastCommittedKey.current) {
			lastCommittedKey.current = null;
			return;
		}
		const { formValues: form, setFormValues: setForm } = latest.current;
		if (!isSameValues(urlValues, form)) setForm(urlValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urlKey]);

	return { isPending: JSON.stringify(formValues) !== debouncedKey };
}
