import { getPayload } from "payload";
import config from "../default-config";
import seedCategories from "./categories";
import seedInterviews from "./interviews";
import seedReports from "./reports";
import seedTags from "./tags";

const seedUpdate = async () => {
	const payload = await getPayload({ config });

	await seedCategories(payload);
	await seedTags(payload);
	await seedReports(payload);
	await seedInterviews(payload);

	console.log("✅ Mise à jour des seeds terminée.");
};

await seedUpdate();
