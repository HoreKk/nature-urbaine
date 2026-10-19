/**
 * Dev only. To test a migration: `pnpm storage:fixtures` on the old schema, `pnpm migrate`,
 * start the app, then `pnpm storage:fixtures:verify` (FIXTURES_BASE_URL, default localhost:3000).
 */
import {
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import pg from "pg";
import sharp from "sharp";
import { readS3Env, storageCollections } from "../storage";

const MARKER = "[fixture]";

type Collection = (typeof storageCollections)[number];

type UploadCase = {
	collection: Collection;
	/** What production case this row stands for. */
	label: string;
	prefix: string;
	objectKey?: string;
	filename: string;
	withThumbnail?: boolean;
	color: string;
};

// Filenames go through NFD on purpose: files uploaded from macOS reach the
// bucket with decomposed accents, and prod keys keep them that way.
const nfd = (value: string) => value.normalize("NFD");

const cases: UploadCase[] = [
	{
		collection: "media",
		label:
			"media, empty prefix (77 prod rows uploaded before the prefix existed)",
		prefix: "",
		filename: "fixture-hero-legacy.jpg",
		color: "#8a5a44",
	},
	{
		collection: "media",
		label: "media, prefix media",
		prefix: "media",
		filename: "fixture-portrait.jpg",
		color: "#4a6d5a",
	},
	{
		collection: "media",
		label: "media, accents + curly apostrophe + parentheses",
		prefix: "media",
		filename: nfd("fixture-Écoquartier d’Ivry (2).jpg"),
		color: "#6d4a6a",
	},
	{
		collection: "pictures",
		label: "picture with 400x300 thumbnail (the ~19k prod rows)",
		prefix: "pictures",
		filename: "fixture-parc-urbain.jpg",
		withThumbnail: true,
		color: "#3a7a5a",
	},
	{
		collection: "pictures",
		label: "picture uploaded before the thumbnail size existed",
		prefix: "pictures",
		filename: "fixture-avant-vignettes.jpg",
		color: "#7a6a3a",
	},
	{
		collection: "pictures",
		label: "picture, accents + apostrophe + commas + parentheses",
		prefix: "pictures",
		filename: nfd(
			"fixture-export-ministère-chargé-de-l'agriculture,-de-la-forêt-2025-06-26 (4).png",
		),
		withThumbnail: true,
		color: "#3a5a7a",
	},
	{
		collection: "pictures",
		label: "picture, macOS screenshot name",
		prefix: "pictures",
		filename: nfd("fixture-Capture d’écran 2026-04-22 à 12.21.03.png"),
		withThumbnail: true,
		color: "#5a3a7a",
	},
	{
		collection: "pictures",
		label: "picture, empty prefix (defensive: none seen in prod)",
		prefix: "",
		filename: "fixture-sans-prefixe.jpg",
		withThumbnail: true,
		color: "#7a3a3a",
	},
	{
		collection: "pictures",
		label: "picture with an _objectKey folder (3.9x client uploads; defensive)",
		prefix: "pictures",
		objectKey: "fixture-0b5e9c1d",
		filename: "fixture-objectkey.jpg",
		withThumbnail: true,
		color: "#3a7a7a",
	},
];

const thumbnailName = (filename: string) =>
	filename.replace(/(\.[^.]+)$/, "-400x300$1");

// Payload 3.x and 4.x alike fall back to the collection prefix when both are empty.
const folderOf = (
	collection: string,
	prefix: string | null,
	objectKey: string | null,
) => [prefix, objectKey].filter(Boolean).join("/") || collection;

const env = readS3Env();
if (!env || !process.env.DATABASE_URL) {
	console.error(
		"[storage:fixtures] DATABASE_URL and S3_* env vars must be set.",
	);
	process.exit(2);
}
const endpointHost = new URL(env.endpoint).hostname;
if (
	process.env.RAILWAY_ENVIRONMENT_NAME ||
	!["localhost", "127.0.0.1", "::1"].includes(endpointHost)
) {
	console.error(
		`[storage:fixtures] Refusing to run against ${env.endpoint}: local buckets only.`,
	);
	process.exit(2);
}

const s3 = new S3Client({
	endpoint: env.endpoint,
	region: env.region,
	forcePathStyle: true,
	credentials: {
		accessKeyId: env.accessKeyId,
		secretAccessKey: env.secretAccessKey,
	},
});

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const columnsOf = async (table: string) =>
	(
		await db.query<{ column_name: string }>(
			"select column_name from information_schema.columns where table_schema = 'public' and table_name = $1",
			[table],
		)
	).rows.map((row) => row.column_name);

const pictureColumns = await columnsOf("pictures");
const thumbnailBase = pictureColumns.includes("variants_thumbnail_filename")
	? "variants_thumbnail"
	: "sizes_thumbnail";
const hasObjectKey = pictureColumns.includes("_objectkey");
const schema =
	thumbnailBase === "variants_thumbnail" ? "Payload 4" : "Payload 3";

async function fixtureIds() {
	const ids = async (sql: string) =>
		(await db.query<{ id: number }>(sql, [`${MARKER}%`])).rows.map((r) => r.id);
	return {
		report: (await ids("select id from reports where name like $1"))[0],
		interview: (await ids("select id from interviews where name like $1"))[0],
		media: await ids("select id from media where alt like $1"),
		pictures: await ids("select id from pictures where alt like $1"),
	};
}

async function seed() {
	await db.query("BEGIN");
	// Idempotent: drop the previous fixture rows first.
	await db.query("delete from interviews where name like $1", [`${MARKER}%`]);
	await db.query("delete from pictures where alt like $1", [`${MARKER}%`]);
	await db.query("delete from media where alt like $1", [`${MARKER}%`]);
	await db.query("delete from reports where name like $1", [`${MARKER}%`]);
	await db.query("delete from categories where name like $1", [`${MARKER}%`]);

	const category = (
		await db.query<{ id: number }>(
			"insert into categories (name) values ($1) returning id",
			[`${MARKER} Stockage`],
		)
	).rows[0]!.id;
	const drafts = (await columnsOf("reports")).includes("_status");
	const report = (
		await db.query<{ id: number }>(
			`insert into reports (name, description, category_id, location_details_city${drafts ? ", _status" : ""}) values ($1, $2, $3, 'Paris'${drafts ? ", 'published'" : ""}) returning id`,
			[
				`${MARKER} Cas de stockage prod`,
				"Une image par cas de stockage présent en production.",
				category,
			],
		)
	).rows[0]!.id;

	const mediaIds: number[] = [];
	for (const item of cases) {
		const keyColumn = hasObjectKey ? ", _objectkey" : "";
		const keyValue = hasObjectKey ? ", $6" : "";
		const common = [
			`${MARKER} ${item.label}`,
			item.filename,
			`/api/${item.collection}/file/${encodeURIComponent(item.filename)}`,
			item.filename.endsWith(".png") ? "image/png" : "image/jpeg",
			item.prefix,
			...(hasObjectKey ? [item.objectKey ?? null] : []),
		];
		if (item.collection === "media") {
			const { rows } = await db.query<{ id: number }>(
				`insert into media (alt, filename, url, mime_type, prefix${keyColumn}, width, height, filesize) values ($1, $2, $3, $4, $5${keyValue}, 1200, 800, 1000) returning id`,
				common,
			);
			mediaIds.push(rows[0]!.id);
			continue;
		}
		const thumb = item.withThumbnail ? thumbnailName(item.filename) : null;
		const next = common.length + 1;
		await db.query(
			`insert into pictures (alt, filename, url, mime_type, prefix${keyColumn}, width, height, filesize, report_id, ${thumbnailBase}_filename, ${thumbnailBase}_url, ${thumbnailBase}_width, ${thumbnailBase}_height, ${thumbnailBase}_mime_type)
			 values ($1, $2, $3, $4, $5${keyValue}, 1200, 800, 1000, $${next}, $${next + 1}, $${next + 2}, ${thumb ? "400, 300" : "null, null"}, $${next + 3})`,
			[
				...common,
				report,
				thumb,
				thumb ? `/api/pictures/file/${encodeURIComponent(thumb)}` : null,
				thumb ? common[3] : null,
			],
		);
	}

	const empty = JSON.stringify([]);
	await db.query(
		`insert into interviews (name, interviewee, interviewee_role, city, department, area, project_owner, project_management, summary, project_details_objectives, project_details_impacts, project_details_challenges, realised_at, published_at, thumbnail_id, interviewee_picture_id)
		 values ($1, 'Camille Fixture', 'Paysagiste', 'Ivry-sur-Seine', 'Val-de-Marne', '1 ha', 'Ville', 'Atelier', 'Interview de test du stockage.', $2, $2, $2, now(), now(), $3, $4)`,
		[`${MARKER} Interview stockage`, empty, mediaIds[0], mediaIds[1]],
	);
	await db.query("COMMIT");
	console.log(
		`[storage:fixtures] ${schema} schema: ${cases.length} fixture uploads, report ${report}, category ${category}.`,
	);
}

async function exists(key: string) {
	try {
		await s3.send(new HeadObjectCommand({ Bucket: env!.bucket, Key: key }));
		return true;
	} catch (error) {
		const status = (error as { $metadata?: { httpStatusCode?: number } })
			.$metadata?.httpStatusCode;
		if (status === 404) return false;
		throw error;
	}
}

async function placeholder(
	color: string,
	width: number,
	height: number,
	png: boolean,
) {
	const image = sharp({
		create: { width, height, channels: 3, background: color },
	});
	return png ? image.png().toBuffer() : image.jpeg({ quality: 70 }).toBuffer();
}

async function writeObjects() {
	const colors = new Map(cases.map((item) => [item.filename, item.color]));
	let written = 0;
	let present = 0;
	for (const collection of storageCollections) {
		const columns = await columnsOf(collection);
		const thumbnail = columns.find((name) =>
			/^(sizes|variants)_thumbnail_filename$/.test(name),
		);
		const { rows } = await db.query<Record<string, string | null>>(
			`select filename, prefix, ${columns.includes("_objectkey") ? "_objectkey" : "null"} as object_key${thumbnail ? `, "${thumbnail}" as thumbnail` : ""} from "${collection}" where filename is not null`,
		);
		for (const row of rows) {
			const folder = folderOf(
				collection,
				row.prefix ?? null,
				row.object_key ?? null,
			);
			const files: [string, number, number][] = [[row.filename!, 1200, 800]];
			if (row.thumbnail) files.push([row.thumbnail, 400, 300]);
			for (const [file, width, height] of files) {
				const key = `${folder}/${file}`;
				if (await exists(key)) {
					present++;
					continue;
				}
				const color = colors.get(row.filename!) ?? "#9a9a8a";
				await s3.send(
					new PutObjectCommand({
						Bucket: env!.bucket,
						Key: key,
						Body: await placeholder(
							color,
							width,
							height,
							file.endsWith(".png"),
						),
						ContentType: file.endsWith(".png") ? "image/png" : "image/jpeg",
					}),
				);
				written++;
			}
		}
	}
	console.log(
		`[storage:fixtures] Bucket "${env!.bucket}": ${written} object(s) written, ${present} already there.`,
	);
}

type Check = { what: string; url: string; status: number | string };

async function verify(baseUrl: string) {
	const ids = await fixtureIds();
	if (!ids.report) {
		console.error(
			"[storage:fixtures] No fixture rows: run `pnpm storage:fixtures` first.",
		);
		process.exit(2);
	}
	const checks: Check[] = [];
	const fetchImage = async (what: string, url: string) => {
		try {
			const response = await fetch(new URL(url, baseUrl));
			const type = response.headers.get("content-type") ?? "";
			checks.push({
				what,
				url: url.split("?")[0] ?? url,
				status:
					response.ok && type.startsWith("image/")
						? response.status
						: `${response.status} ${type}`,
			});
		} catch (error) {
			checks.push({ what, url, status: String(error) });
		}
	};

	// Payload's own file route, as the admin uses it (302 to the bucket).
	for (const [collection, list] of [
		["media", ids.media],
		["pictures", ids.pictures],
	] as const) {
		for (const id of list) {
			const doc = await (
				await fetch(new URL(`/api/${collection}/${id}?depth=0`, baseUrl))
			).json();
			await fetchImage(`api ${collection}/${id}`, doc.url);
			for (const [name, variant] of Object.entries(
				(doc.variants ?? {}) as Record<string, { url?: string | null }>,
			)) {
				if (variant?.url)
					await fetchImage(`api ${collection}/${id} ${name}`, variant.url);
			}
		}
	}

	// Images on the public pages, signed by the website (see ADR-0003).
	for (const page of [
		`/reports/${ids.report}`,
		`/interviews/${ids.interview}`,
	]) {
		const html = await (await fetch(new URL(page, baseUrl))).text();
		const urls = new Set<string>();
		for (const match of html.matchAll(
			/(?:src|srcSet|srcset|href)="([^"]+)"/g,
		)) {
			for (const candidate of (match[1] ?? "").split(",")) {
				const url = (candidate.trim().split(/\s+/)[0] ?? "").replaceAll(
					"&amp;",
					"&",
				);
				if (url.includes("fixture-") && /\/(media|pictures)\//.test(url))
					urls.add(url);
			}
		}
		if (urls.size === 0)
			checks.push({
				what: `page ${page}`,
				url: page,
				status: "no fixture image found",
			});
		for (const url of urls) await fetchImage(`page ${page}`, url);
	}

	const failed = checks.filter((check) => typeof check.status !== "number");
	console.log(
		`[storage:fixtures] ${checks.length} image URLs checked against ${baseUrl}.`,
	);
	if (failed.length === 0) {
		console.log(
			"[storage:fixtures] OK: every production upload layout resolves.",
		);
		return true;
	}
	console.error(`[storage:fixtures] ${failed.length} failure(s):`);
	console.table(failed);
	return false;
}

let ok = true;
if (process.env.FIXTURES_VERIFY) {
	ok = await verify(process.env.FIXTURES_BASE_URL ?? "http://localhost:3000");
} else {
	await seed();
	await writeObjects();
}
await db.end();
process.exit(ok ? 0 : 1);
