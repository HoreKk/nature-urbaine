import { createHash } from 'node:crypto';
import type { CollectionSlug, Payload } from 'payload';

function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function shortHash(...parts: (string | number | undefined | null)[]): string {
	const input = parts.map((p) => (p ?? '').toString().trim()).join('|');
	return createHash('sha1').update(input).digest('hex').slice(0, 10);
}

export function reportKey(input: {
	wordpressPostId?: number | string | null;
	pays?: string | null;
	ville?: string | null;
	projet?: string | null;
	datePhoto?: number | string | null;
}): string {
	const wp = input.wordpressPostId;
	if (wp !== undefined && wp !== null && wp !== '') {
		const wpStr = wp.toString().trim();
		if (wpStr) return `report-wp-${wpStr}`;
	}
	return `report-h-${shortHash(input.pays, input.ville, input.projet, input.datePhoto)}`;
}

export function interviewKey(input: {
	projectName?: string | null;
	interviewee?: string | null;
}): string {
	return `interview-h-${shortHash(input.projectName, input.interviewee)}`;
}

export function categoryKey(name: string): string {
	return `category-${slugify(name)}`;
}

export function tagCategoryKey(name: string): string {
	return `tag-category-${slugify(name)}`;
}

export function tagKey(name: string, parentName?: string): string {
	return parentName
		? `tag-${slugify(parentName)}-${slugify(name)}`
		: `tag-${slugify(name)}`;
}

const created = new Map<string, Promise<{ id: number | string }>>();

/** Creates one doc per `key` within a seed run: the xlsx repeats rows, and the
 * first one wins. Keys share one map, so each key helper above prefixes its entity. */
export function createOnce<TSlug extends CollectionSlug>(
	payload: Payload,
	args: {
		collection: TSlug;
		key: string;
		// oxlint-disable-next-line typescript/no-explicit-any -- payload's per-collection data type is too narrow to express here
		data: any;
		draft?: boolean;
	},
) {
	const { collection, key, data, draft } = args;
	let doc = created.get(key);
	if (!doc) {
		doc = payload.create({ collection, draft, data, overrideAccess: true });
		created.set(key, doc);
	}
	return doc;
}
