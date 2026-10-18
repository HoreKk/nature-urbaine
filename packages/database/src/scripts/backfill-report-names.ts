/**
 * Applies the computed Report name (utils/report-name.ts) to Reports whose
 * stored `name` was typed by hand — in production, the ~650 imported rows.
 *
 *   pnpm reports:names:backfill                          # dry run: list only
 *   pnpm -s reports:names:backfill > report-names.tsv    # for client review
 *   REPORT_NAMES_WRITE=1 pnpm reports:names:backfill     # write
 *
 * The dry run prints one tab-separated line per row it would change
 * (`table  report  current  computed`) on stdout and a summary on stderr, so
 * the redirect above yields a clean sheet. A Report with an unpublished draft
 * shows up twice: its `reports` row and its latest `_reports_v` row. Writing updates `reports.name` and the
 * latest `_reports_v` row of each Report (what the admin edits); older
 * versions keep their history. Plain SQL like `backfill-variants.ts`: no
 * hooks run and no new version is created. Rerunning is a no-op once applied.
 */
import pg from "pg";
import { computeReportName } from "../utils/report-name";

const write = process.env.REPORT_NAMES_WRITE === "1";

if (!process.env.DATABASE_URL) {
	console.error("[report-names] DATABASE_URL must be set.");
	process.exit(2);
}

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

type Row = {
	id: number;
	report: number;
	name: string | null;
	country: string | null;
	city: string | null;
	project_name: string | null;
};

const mismatches = (rows: Row[]) =>
	rows
		.map((row) => ({
			...row,
			computed: computeReportName({
				country: row.country,
				city: row.city,
				projectName: row.project_name,
			}),
		}))
		.filter((row) => row.computed !== row.name);

const reports = mismatches(
	(
		await db.query<Row>(
			`select id, id as report, name, location_details_country as country,
				location_details_city as city, project_name
			from reports order by id`,
		)
	).rows,
);

const latestVersions = mismatches(
	(
		await db.query<Row>(
			`select id, parent_id as report, version_name as name,
				version_location_details_country as country,
				version_location_details_city as city,
				version_project_name as project_name
			from _reports_v where latest order by id`,
		)
	).rows,
);

console.log(["table", "report", "current", "computed"].join("\t"));
for (const [table, rows] of [
	["reports", reports],
	["_reports_v", latestVersions],
] as const) {
	for (const row of rows) {
		console.log([table, row.report, row.name ?? "", row.computed].join("\t"));
	}
}
console.error(
	`[report-names] ${reports.length} report(s) and ${latestVersions.length} latest version(s) differ from the computed name.`,
);

if (!write) {
	console.error("[report-names] Dry run. Set REPORT_NAMES_WRITE=1 to apply.");
	await db.end();
	process.exit(0);
}

const client = await db.connect();
try {
	await client.query("begin");
	for (const row of reports) {
		await client.query("update reports set name = $1 where id = $2", [
			row.computed,
			row.id,
		]);
	}
	for (const row of latestVersions) {
		await client.query(
			"update _reports_v set version_name = $1 where id = $2",
			[row.computed, row.id],
		);
	}
	await client.query("commit");
	console.error(
		`[report-names] Updated ${reports.length} report(s) and ${latestVersions.length} version(s).`,
	);
} catch (error) {
	await client.query("rollback");
	throw error;
} finally {
	client.release();
	await db.end();
}
