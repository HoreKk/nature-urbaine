export type ReportNameParts = {
	country?: string | null;
	city?: string | null;
	projectName?: string | null;
};

/** Shown while a Report has neither a city nor a project name (drafts). */
export const UNNAMED_REPORT = "Reportage sans nom";

/**
 * A Report's `name`: "CITY, PROJECT" in France, "Country, CITY, PROJECT"
 * elsewhere. An empty country counts as France. Hyphens in the project name
 * become spaces ("PARC-NATIONAL" → "PARC NATIONAL") and an elided L or D
 * gets its apostrophe back ("DE L EAU" → "DE L'EAU"). Missing parts are
 * dropped (no dangling comma); with neither city nor project name the
 * country alone says nothing, so the name falls back to UNNAMED_REPORT.
 */
export function computeReportName({
	country,
	city,
	projectName,
}: ReportNameParts): string {
	const place = [city?.trim(), formatProjectName(projectName)].filter(Boolean);
	if (place.length === 0) return UNNAMED_REPORT;

	return (isFrance(country) ? place : [country?.trim(), ...place]).join(", ");
}

// The historic spreadsheet writes "L'EAU" as "L-EAU": once hyphens become
// spaces, a lone L or D before a vowel or H is an elision.
const ELISION = /(^|\s)([LD]) (?=[AEIOUYHÀÂÄÆÉÈÊËÎÏÔŒÖÙÛÜ])/giu;

function formatProjectName(projectName: string | null | undefined) {
	return projectName
		?.replace(/-/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.replace(ELISION, "$1$2'");
}

/** An empty country counts as France (imported rows, BAN contributions). */
export function isFrance(country: string | null | undefined) {
	const value = country?.trim().toLowerCase();
	return !value || value === "france";
}
