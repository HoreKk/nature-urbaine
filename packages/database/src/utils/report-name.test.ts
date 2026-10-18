import assert from "node:assert/strict";
import { test } from "node:test";
import { computeReportName } from "./report-name.ts";

test("a French report is named city, project", () => {
	assert.equal(
		computeReportName({
			country: "France",
			city: "AMIENS",
			projectName: "GARE",
		}),
		"AMIENS, GARE",
	);
});

test("a report outside France is prefixed with its country", () => {
	assert.equal(
		computeReportName({
			country: "Espagne",
			city: "BARCELONE",
			projectName: "SUPERILLA",
		}),
		"Espagne, BARCELONE, SUPERILLA",
	);
});

test("a report without a country is treated as French", () => {
	for (const country of [undefined, null, "", "  "]) {
		assert.equal(
			computeReportName({ country, city: "LYON", projectName: "BERGES" }),
			"LYON, BERGES",
		);
	}
});

test("France is recognised whatever its casing or padding", () => {
	assert.equal(
		computeReportName({
			country: " FRANCE ",
			city: "LYON",
			projectName: "BERGES",
		}),
		"LYON, BERGES",
	);
});

test("a missing city or project name leaves no dangling comma", () => {
	assert.equal(
		computeReportName({ country: "France", city: "AMIENS", projectName: "" }),
		"AMIENS",
	);
	assert.equal(
		computeReportName({ country: "France", city: null, projectName: "GARE" }),
		"GARE",
	);
	assert.equal(
		computeReportName({
			country: "Italie",
			city: "  ",
			projectName: "PIAZZA",
		}),
		"Italie, PIAZZA",
	);
});

test("a report with neither city nor project name gets a placeholder", () => {
	assert.equal(computeReportName({}), "Reportage sans nom");
	assert.equal(
		computeReportName({ country: "Italie", city: "", projectName: " " }),
		"Reportage sans nom",
	);
});

test("hyphens in the project name become spaces, the city keeps its own", () => {
	assert.equal(
		computeReportName({
			country: "France",
			city: "SEVRAN",
			projectName: "PARC-NATIONAL-FORESTIER-DE-LA-POUDRERIE-DE-SEVRAN",
		}),
		"SEVRAN, PARC NATIONAL FORESTIER DE LA POUDRERIE DE SEVRAN",
	);
	assert.equal(
		computeReportName({
			country: "France",
			city: "SAINT-DENIS",
			projectName: "PARVIS - GARE",
		}),
		"SAINT-DENIS, PARVIS GARE",
	);
});

test("an elided L or D in the project name gets its apostrophe back", () => {
	assert.equal(
		computeReportName({
			country: "France",
			city: "VILLENEUVE LE ROI",
			projectName: "JARDIN DU BORD DE L EAU",
		}),
		"VILLENEUVE LE ROI, JARDIN DU BORD DE L'EAU",
	);
	assert.equal(
		computeReportName({
			country: "France",
			city: "ÉTRETAT",
			projectName: "LES-JARDINS-D-ÉTRETAT",
		}),
		"ÉTRETAT, LES JARDINS D'ÉTRETAT",
	);
	assert.equal(
		computeReportName({
			country: "France",
			city: "PARIS",
			projectName: "PARC DU PEUPLE DE L HERBE",
		}),
		"PARIS, PARC DU PEUPLE DE L'HERBE",
	);
	assert.equal(
		computeReportName({
			country: "France",
			city: "PARIS",
			projectName: "RUE D'ABOUKIR",
		}),
		"PARIS, RUE D'ABOUKIR",
	);
	assert.equal(
		computeReportName({
			country: "France",
			city: "PARIS",
			projectName: "BATIMENT D BLOC L",
		}),
		"PARIS, BATIMENT D BLOC L",
	);
});
