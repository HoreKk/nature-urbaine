import { getPayload } from "payload";
import config from "../config";
import seedCategories from "./categories";
import seedInterviews from "./interviews";
import seedReports from "./reports";
import seedTags from "./tags";

const seed = async () => {
	const payload = await getPayload({ config });

	await payload.create({
		collection: "users",
		data: {
			email: "admin@test.loc",
			password: "admin123",
		},
	});

	await seedCategories(payload);
	await seedReports(payload);
	await seedInterviews(payload);
	await seedTags(payload);
};

await seed();
