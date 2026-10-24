import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useRef } from 'react';

type FilterValue = string | string[];
type FilterValues = Record<string, FilterValue>;

const isSameValue = (a?: FilterValue, b?: FilterValue) =>
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
	/** Free-text keys, committed after `delay`. Every other key commits at once. */
	debouncedKeys: (keyof T)[];
	delay?: number;
};

/**
 * The URL stays the source of truth. Form edits are debounced as a whole object so a
 * back/forward sync never races a stale half-debounced value back into the URL.
 */
export function useUrlSyncedFilters<T extends FilterValues>({
	formValues,
	urlValues,
	setFormValues,
	onCommit,
	debouncedKeys,
	delay = 400,
}: UseUrlSyncedFiltersOptions<T>) {
	const debouncedValues = useDebounce(formValues, delay);
	// Picks (select, categories) commit as soon as they change. Free text keeps the
	// URL's value until its debounce settles, even when a pick commits alongside it.
	const commitValues = { ...formValues };
	for (const key of debouncedKeys) {
		const settled = isSameValue(debouncedValues[key], formValues[key]);
		commitValues[key] = settled ? formValues[key] : urlValues[key];
	}
	const commitKey = JSON.stringify(commitValues);
	const urlKey = JSON.stringify(urlValues);

	const latest = useRef({
		urlValues,
		commitValues,
		formValues,
		setFormValues,
		onCommit,
	});
	latest.current = {
		urlValues,
		commitValues,
		formValues,
		setFormValues,
		onCommit,
	};
	const lastCommittedKey = useRef<string | null>(null);

	useEffect(() => {
		const {
			urlValues: url,
			commitValues: next,
			onCommit: commit,
		} = latest.current;
		if (isSameValues(next, url)) return;
		lastCommittedKey.current = commitKey;
		commit(next);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [commitKey]);

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

	// Pending until the URL has caught up with the form, so the loading state runs
	// straight into the navigation instead of flashing the old results between them.
	return { isPending: !isSameValues(formValues, urlValues) };
}
