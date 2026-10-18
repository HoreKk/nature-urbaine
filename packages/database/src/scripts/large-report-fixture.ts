/**
 * Dev only: creates one report with as many photos as the largest production
 * reports (200+), each a 4000×3000 JPEG of a few megabytes like the real
 * ones, uploaded through Payload so RustFS gets the same `thumbnail`,
 * `medium` and `large` variants production does.
 *
 *   pnpm storage:fixtures:large-report            # 240 photos
 *   FIXTURE_COUNT=60 pnpm storage:fixtures:large-report
 *
 * Idempotent per size: deletes the previous fixture report of that size and its photos (files
 * included) first. Refuses to run against anything but a local bucket.
 */
import { getPayload } from "payload";
import sharp from "sharp";
import config from "../read-config";
import { readS3Env } from "../storage";

// No `[fixture]` prefix: `storage:fixtures` deletes those rows with raw SQL.
const count = Number(process.env.FIXTURE_COUNT ?? 240);
// One report per size, so a 5-photo run leaves the 240-photo one alone.
const NAME = `Reportage de test · ${count} photos`;
const concurrency = 4;

const env = readS3Env();
if (!env || !process.env.DATABASE_URL) {
	console.error("[large-report] DATABASE_URL and S3_* env vars must be set.");
	process.exit(2);
}
if (
	process.env.RAILWAY_ENVIRONMENT_NAME ||
	!["localhost", "127.0.0.1", "::1"].includes(new URL(env.endpoint).hostname)
) {
	console.error(
		`[large-report] Refusing to run against ${env.endpoint}: local buckets only.`,
	);
	process.exit(2);
}

const payload = await getPayload({ config });

const hues = [24, 48, 96, 140, 170, 200, 260, 320];

/**
 * Noise keeps the JPEG as heavy as a real photo (~3–5 MB); the label makes
 * each slide recognisable. Every fifth photo is portrait, as some are in prod.
 */
async function photo(index: number) {
	const portrait = index % 5 === 4;
	const [width, height] = portrait ? [3000, 4000] : [4000, 3000];
	const hue = hues[index % hues.length]!;
	const label = `${String(index + 1).padStart(3, "0")} / ${count}`;
	const overlay = Buffer.from(`
		<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stop-color="hsl(${hue} 45% 55%)" stop-opacity="0.85"/>
					<stop offset="1" stop-color="hsl(${(hue + 40) % 360} 40% 30%)" stop-opacity="0.85"/>
				</linearGradient>
			</defs>
			<rect width="100%" height="100%" fill="url(#g)"/>
			<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 3}" fill="none" stroke="white" stroke-opacity="0.5" stroke-width="24"/>
			<text x="50%" y="50%" font-family="Helvetica, Arial, sans-serif" font-size="360" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
			<text x="50%" y="${height - 240}" font-family="Helvetica, Arial, sans-serif" font-size="120" fill="white" fill-opacity="0.8" text-anchor="middle">${width}×${height}</text>
		</svg>`);
	return sharp({
		create: {
			width,
			height,
			channels: 3,
			background: "#808080",
			noise: { type: "gaussian", mean: 128, sigma: 40 },
		},
	})
		.composite([{ input: overlay }])
		.jpeg({ quality: 88 })
		.toBuffer();
}

// Clean up the previous run; deleting through Payload removes the files too.
const previous = await payload.find({
	collection: "reports",
	overrideAccess: true,
	where: { name: { equals: NAME } },
	draft: true,
	limit: 10,
	depth: 0,
});
for (const report of previous.docs) {
	await payload.delete({
		collection: "pictures",
		overrideAccess: true,
		where: { report: { equals: report.id } },
	});
	await payload.delete({
		collection: "reports",
		overrideAccess: true,
		id: report.id,
	});
}

const category =
	(
		await payload.find({
			collection: "categories",
			overrideAccess: true,
			limit: 1,
			depth: 0,
		})
	).docs[0] ??
	(await payload.create({
		collection: "categories",
		overrideAccess: true,
		data: { name: "Galeries de test" },
	}));

const report = await payload.create({
	collection: "reports",
	overrideAccess: true,
	draft: false,
	data: {
		name: NAME,
		description: `Reportage de test : ${count} photos de 4000×3000 pixels, comme les plus gros reportages en production.`,
		category: category.id,
		date: new Date().toISOString(),
		locationDetails: { city: "Paris" },
		_status: "published",
	},
});

let done = 0;
const started = Date.now();
const queue = Array.from({ length: count }, (_, index) => index);
await Promise.all(
	Array.from({ length: concurrency }, async () => {
		for (
			let index = queue.shift();
			index !== undefined;
			index = queue.shift()
		) {
			const data = await photo(index);
			await payload.create({
				collection: "pictures",
				overrideAccess: true,
				data: {
					alt: `Photo ${index + 1} du reportage de test`,
					report: report.id,
				},
				file: {
					data,
					mimetype: "image/jpeg",
					name: `fixture-galerie-${String(index + 1).padStart(3, "0")}.jpg`,
					size: data.length,
				},
			});
			done++;
			if (done % 20 === 0 || done === count) {
				console.log(
					`[large-report] ${done}/${count} photos (${Math.round((Date.now() - started) / 1000)} s)`,
				);
			}
		}
	}),
);

console.log(`[large-report] Report ${report.id}: /reports/${report.id}`);
process.exit(0);
