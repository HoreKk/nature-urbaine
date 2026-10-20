import { describe, expect, it } from "vitest";
import {
	getSubmissionSubject,
	renderSubmissionEmail,
} from "./render-submission-email";

describe("renderSubmissionEmail", () => {
	it("renders french content for submission notification", async () => {
		const rendered = await renderSubmissionEmail({
			name: "Reamenagement de la place Jourdan",
			description:
				"Transformation des sols et plantation de strates basses.\nValidation en concertation locale.",
			category: "Espaces publics",
			deliveryYear: 2024,
			address: "12 rue de la Paix, Paris",
			contributorEmail: "contributeur@example.com",
			submittedAtParis: "03/05/2026 14:20",
			source: "/contribuer",
		});

		expect(rendered.subject).toBe(
			getSubmissionSubject({
				name: "Reamenagement de la place Jourdan",
				category: "Espaces publics",
			}),
		);
		expect(rendered.html).toContain("Nouvelle contribution");
		expect(rendered.html).toContain("Titre du projet");
		expect(rendered.html).toContain("Source: <!-- -->/contribuer");
		expect(rendered.text).toContain("Description");
		expect(rendered.text).toContain("Email contributeur");
		expect(rendered.text).toContain("Transformation des sols");
	});
});
