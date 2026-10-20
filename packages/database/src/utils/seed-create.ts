import type { CollectionSlug, Payload } from "payload";

const created = new Map<string, Promise<{ id: number | string }>>();

/** Creates one doc per `key` within a seed run: the xlsx repeats rows, and the
 * first one wins. `seed:dev` starts from a dropped database, so nothing to update. */
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
