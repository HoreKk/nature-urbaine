import { getPayload } from "payload";
import config from "../default-config";
import {
	categorySeedKey,
	DEFAULT_THUMBNAIL_SEED_KEY,
	interviewSeedKey,
	reportSeedKey,
	tagCategorySeedKey,
	tagSeedKey,
} from "../utils/seed-key";

const backfill = async () => {
	const payload = await getPayload({ config });

	const categories = await payload.find({
		collection: "categories",
		limit: 0,
		pagination: false,
	});
	for (const cat of categories.docs) {
		if (cat.seedKey) continue;
		await payload.update({
			collection: "categories",
			id: cat.id,
			data: { seedKey: categorySeedKey(cat.name) },
		});
	}
	console.log(`✓ Catégories: ${categories.docs.length} traitées.`);

	const tagCategories = await payload.find({
		collection: "tag-categories",
		limit: 0,
		pagination: false,
	});
	for (const tc of tagCategories.docs) {
		if (tc.seedKey) continue;
		await payload.update({
			collection: "tag-categories",
			id: tc.id,
			data: { seedKey: tagCategorySeedKey(tc.name) },
		});
	}
	console.log(
		`✓ Catégories d'étiquettes: ${tagCategories.docs.length} traitées.`,
	);

	const tags = await payload.find({
		collection: "tags",
		limit: 0,
		pagination: false,
		depth: 1,
	});
	for (const tag of tags.docs) {
		if (tag.seedKey) continue;
		const parent = tag.parentId;
		const parentName =
			parent && typeof parent === "object" && "name" in parent
				? (parent as { name: string }).name
				: undefined;
		await payload.update({
			collection: "tags",
			id: tag.id,
			data: { seedKey: tagSeedKey(tag.name, parentName) },
		});
	}
	console.log(`✓ Étiquettes: ${tags.docs.length} traitées.`);

	const reports = await payload.find({
		collection: "reports",
		limit: 0,
		pagination: false,
	});
	for (const report of reports.docs) {
		if (report.seedKey) continue;
		const dateStr = report.date
			? new Date(report.date).toISOString().slice(0, 10).replace(/-/g, "")
			: "";
		await payload.update({
			collection: "reports",
			id: report.id,
			data: {
				seedKey: reportSeedKey({
					wordpressPostId: report.projectDetails?.wordpressPostId,
					pays: report.locationDetails?.country,
					ville: report.locationDetails?.city,
					projet: report.projectName ?? report.name,
					datePhoto: dateStr,
				}),
			},
		});
	}
	console.log(`✓ Reportages: ${reports.docs.length} traités.`);

	const interviews = await payload.find({
		collection: "interviews",
		limit: 0,
		pagination: false,
	});
	for (const interview of interviews.docs) {
		if (interview.seedKey) continue;
		await payload.update({
			collection: "interviews",
			id: interview.id,
			data: {
				seedKey: interviewSeedKey({
					projectName: interview.name,
					interviewee: interview.interviewee,
				}),
			},
		});
	}
	console.log(`✓ Interviews: ${interviews.docs.length} traités.`);

	const defaultMedia = await payload.find({
		collection: "media",
		limit: 1,
		pagination: false,
		where: { alt: { equals: "Default Thumbnail" } },
	});
	if (defaultMedia.docs[0] && !defaultMedia.docs[0].seedKey) {
		await payload.update({
			collection: "media",
			id: defaultMedia.docs[0].id,
			data: { seedKey: DEFAULT_THUMBNAIL_SEED_KEY },
		});
		console.log("✓ Vignette par défaut taggée.");
	}

	console.log("✅ Backfill des seedKeys terminé.");
};

await backfill();
