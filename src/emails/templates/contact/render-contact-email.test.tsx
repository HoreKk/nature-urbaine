import { describe, expect, it } from "vitest";
import { getContactSubject, renderContactEmail } from "./render-contact-email";

describe("renderContactEmail", () => {
	it("renders french contract for contact notification", async () => {
		const rendered = await renderContactEmail({
			firstName: "Claire",
			lastName: "Martin",
			email: "claire.martin@example.com",
			sector: "paysagiste",
			message: "Bonjour,\nJe vous contacte pour un projet.",
			submittedAtParis: "03/05/2026 14:20",
			source: "/contact",
		});

		expect(rendered.subject).toBe(
			getContactSubject({
				firstName: "Claire",
				lastName: "Martin",
				sector: "paysagiste",
			}),
		);
		expect(rendered.html).toContain("Nouveau message de contact");
		expect(rendered.html).toContain("Secteur d&#x27;activité");
		expect(rendered.html).toContain("Source: <!-- -->/contact");
		expect(rendered.text).toContain("Prénom");
		expect(rendered.text).toContain("Message");
		expect(rendered.text).toContain("Bonjour,");
	});
});
