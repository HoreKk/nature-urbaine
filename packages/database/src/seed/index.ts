import { getPayload } from "payload";
import config from "../default-config";
import seedCategories from "./categories";
import seedInterviews from "./interviews";
import seedReports from "./reports";
import seedTags from "./tags";

const seed = async () => {
	const payload = await getPayload({ config });
	const adminEmail = "admin@test.loc";
	const adminPassword = "admin123";

	const existingAdmin = await payload.find({
		collection: "users",
		limit: 1,
		pagination: false,
		where: {
			email: {
				equals: adminEmail,
			},
		},
	});

	if (existingAdmin.docs[0]) {
		await payload.update({
			collection: "users",
			id: existingAdmin.docs[0].id,
			data: {
				email: adminEmail,
				password: adminPassword,
			},
		});
	} else {
		await payload.create({
			collection: "users",
			data: {
				email: adminEmail,
				password: adminPassword,
			},
		});
	}

	await seedCategories(payload);
	await seedReports(payload);
	await seedInterviews(payload);
	await seedTags(payload);
};

await seed();
