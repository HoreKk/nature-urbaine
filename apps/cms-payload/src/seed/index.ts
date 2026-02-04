import config from "@payload-config";
import { getPayload } from "payload";
import seedCategories from "./categories";
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
	await seedTags(payload);
};

await seed();
