import type { CollectionSlug, Payload } from "payload";

export async function upsertBySeedKey<TSlug extends CollectionSlug>(
	payload: Payload,
	args: {
		collection: TSlug;
		seedKey: string;
		// biome-ignore lint/suspicious/noExplicitAny: payload's per-collection data type is too narrow to express here
		data: any;
		draft?: boolean;
		filePath?: string;
	},
) {
	const { collection, seedKey, data, draft, filePath } = args;

	const existing = await payload.find({
		collection,
		limit: 1,
		pagination: false,
		where: { seedKey: { equals: seedKey } },
	});

	if (existing.docs[0]) {
		return payload.update({
			collection,
			id: existing.docs[0].id,
			draft,
			data: { ...data, seedKey },
		});
	}

	return payload.create({
		collection,
		draft,
		data: { ...data, seedKey },
		...(filePath ? { filePath } : {}),
	});
}
