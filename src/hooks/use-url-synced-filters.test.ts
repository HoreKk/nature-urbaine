// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUrlSyncedFilters } from './use-url-synced-filters';

type Values = { search: string; category: string[] };

const empty: Values = { search: '', category: [] };

/** URL commits wait for `flushNavigation` so tests can model the router catching up late. */
function useCatalogHarness(initialUrl: Values) {
	const [url, setUrl] = useState(initialUrl);
	const [form, setForm] = useState(initialUrl);
	const [pending, setPending] = useState<Values | null>(null);
	const commits = useState<Values[]>([])[0];

	const { isPending } = useUrlSyncedFilters({
		formValues: form,
		urlValues: url,
		debouncedKeys: ['search'],
		setFormValues: setForm,
		onCommit: (values) => {
			commits.push(values);
			setPending(values);
		},
	});

	const flushNavigation = () => {
		if (pending) setUrl(pending);
		setPending(null);
	};

	return { url, form, isPending, commits, setUrl, setForm, flushNavigation };
}

const settle = () =>
	act(() => {
		vi.advanceTimersByTime(5_000);
	});

describe('useUrlSyncedFilters', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('commits form edits to the URL once, after the debounce', () => {
		const { result } = renderHook(() => useCatalogHarness(empty));

		act(() => result.current.setForm({ ...empty, search: 'jar' }));
		act(() => result.current.setForm({ ...empty, search: 'jardin' }));
		expect(result.current.isPending).toBe(true);
		expect(result.current.commits).toHaveLength(0);

		settle();
		act(() => result.current.flushNavigation());
		settle();

		expect(result.current.commits).toEqual([{ ...empty, search: 'jardin' }]);
		expect(result.current.url.search).toBe('jardin');
		expect(result.current.isPending).toBe(false);
	});

	// Regression for #4: arriving on /reports?category=[9] then removing the
	// category made the form and the URL overwrite each other forever.
	it('settles in one step when the URL filter is cleared externally', () => {
		const { result } = renderHook(() =>
			useCatalogHarness({ ...empty, category: ['9'] }),
		);

		act(() => result.current.setUrl(empty));
		settle();
		act(() => result.current.flushNavigation());
		settle();

		expect(result.current.form).toEqual(empty);
		expect(result.current.url).toEqual(empty);
		expect(result.current.commits).toHaveLength(0);
	});

	it('settles in one step when the category is removed from the form', () => {
		const { result } = renderHook(() =>
			useCatalogHarness({ ...empty, category: ['9'] }),
		);

		act(() => result.current.setForm(empty));
		settle();
		act(() => result.current.flushNavigation());
		settle();
		act(() => result.current.flushNavigation());
		settle();

		expect(result.current.commits).toEqual([empty]);
		expect(result.current.url).toEqual(empty);
		expect(result.current.form).toEqual(empty);
	});

	it('restores the form from the URL on back/forward without committing', () => {
		const { result } = renderHook(() => useCatalogHarness(empty));

		act(() => result.current.setUrl({ search: 'parc', category: ['9', '3'] }));
		settle();

		expect(result.current.form).toEqual({
			search: 'parc',
			category: ['9', '3'],
		});
		expect(result.current.commits).toHaveLength(0);
	});

	it('keeps what the user typed while its own commit is still navigating', () => {
		const { result } = renderHook(() => useCatalogHarness(empty));

		act(() => result.current.setForm({ ...empty, search: 'parc' }));
		settle();
		act(() => result.current.setForm({ ...empty, search: 'parcs et' }));
		act(() => result.current.flushNavigation());

		expect(result.current.url.search).toBe('parc');
		expect(result.current.form.search).toBe('parcs et');

		settle();
		act(() => result.current.flushNavigation());
		settle();

		expect(result.current.commits.map((c) => c.search)).toEqual([
			'parc',
			'parcs et',
		]);
		expect(result.current.url.search).toBe('parcs et');
		expect(result.current.form.search).toBe('parcs et');
	});

	it('commits a pick at once and stays pending until the URL catches up', () => {
		const { result } = renderHook(() => useCatalogHarness(empty));

		act(() => result.current.setForm({ ...empty, category: ['9'] }));

		expect(result.current.commits).toEqual([{ ...empty, category: ['9'] }]);
		expect(result.current.isPending).toBe(true);

		settle();
		expect(result.current.isPending).toBe(true);

		act(() => result.current.flushNavigation());
		expect(result.current.isPending).toBe(false);
		expect(result.current.commits).toHaveLength(1);
	});

	it('does not revert a pick once the debounce settles behind it', () => {
		const { result } = renderHook(() => useCatalogHarness(empty));

		act(() => result.current.setForm({ search: 'parc', category: [] }));
		act(() => result.current.setForm({ search: 'parc', category: ['9'] }));
		act(() => result.current.flushNavigation());

		expect(result.current.url).toEqual({ search: '', category: ['9'] });

		settle();
		act(() => result.current.flushNavigation());
		settle();

		expect(result.current.commits).toEqual([
			{ search: '', category: ['9'] },
			{ search: 'parc', category: ['9'] },
		]);
		expect(result.current.url).toEqual({ search: 'parc', category: ['9'] });
	});
});
