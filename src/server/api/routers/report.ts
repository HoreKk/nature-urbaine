import { fetchOrReturnRealValue } from "~/payload/helpers";
import type { Category, Picture, Report } from "~/payload/payload-types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export interface AugmentedReport
	extends Omit<Report, "thumbnail" | "category"> {
	thumbnail: Picture;
	category: Category;
}

export const reportRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const reports = await ctx.db.find({
			collection: "reports",
			limit: 10,
			sort: "-createdAt",
			depth: 1,
		});

		const sanitizedReports = (await Promise.all(
			reports.docs.map(async ({ thumbnail, category, ...rest }) => ({
				...rest,
				thumbnail: await fetchOrReturnRealValue(thumbnail, "media"),
				category: await fetchOrReturnRealValue(category, "categories"),
			})),
		)) as AugmentedReport[];

		return sanitizedReports;
	}),
});
