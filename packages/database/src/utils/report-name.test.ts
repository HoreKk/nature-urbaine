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
