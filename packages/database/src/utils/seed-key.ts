import { createHash } from "node:crypto";

export function slugify(value: string): string {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

export function shortHash(
	...parts: (string | number | undefined | null)[]
): string {
	const input = parts.map((p) => (p ?? "").toString().trim()).join("|");
	return createHash("sha1").update(input).digest("hex").slice(0, 10);
}

export function reportSeedKey(input: {
	wordpressPostId?: number | string | null;
	pays?: string | null;
	ville?: string | null;
	projet?: string | null;
	datePhoto?: number | string | null;
}): string {
	const wp = input.wordpressPostId;
	if (wp !== undefined && wp !== null && wp !== "") {
		const wpStr = wp.toString().trim();
		if (wpStr) return `report-wp-${wpStr}`;
	}
	return `report-h-${shortHash(input.pays, input.ville, input.projet, input.datePhoto)}`;
}

export function interviewSeedKey(input: {
	projectName?: string | null;
	interviewee?: string | null;
}): string {
	return `interview-h-${shortHash(input.projectName, input.interviewee)}`;
}

export function categorySeedKey(name: string): string {
	return `category-${slugify(name)}`;
}

export function tagCategorySeedKey(name: string): string {
	return `tag-category-${slugify(name)}`;
}

export function tagSeedKey(name: string, parentName?: string): string {
	return parentName
		? `tag-${slugify(parentName)}-${slugify(name)}`
		: `tag-${slugify(name)}`;
}

export const DEFAULT_THUMBNAIL_SEED_KEY = "default-thumbnail";
