import type { FieldHook } from "payload";
import type { Report } from "../payload-types";
import { computeReportName } from "./report-name";

type season = "spring" | "summer" | "autumn" | "winter";
type TGetSeasonFromDate = FieldHook<
	Report,
	season | undefined,
	Partial<Report>
>;

export const getSeasonFromDate: TGetSeasonFromDate = async (args) => {
	const { data } = args;

	if (!data?.date) return;

	const date = new Date(data.date);
	const month = date.getMonth() + 1;
	return month >= 3 && month <= 5
		? "spring"
		: month >= 6 && month <= 8
			? "summer"
			: month >= 9 && month <= 11
				? "autumn"
				: "winter";
};

type TComputeReportName = FieldHook<Report, string, Partial<Report>>;

// `data` only holds the submitted fields on a partial update, so each part
// falls back to the stored document.
export const computeReportNameHook: TComputeReportName = ({
	data,
	originalDoc,
}) => {
	const location = {
		...originalDoc?.locationDetails,
		...data?.locationDetails,
	};
	return computeReportName({
		country: location.country,
		city: location.city,
		projectName:
			data && "projectName" in data
				? data.projectName
				: originalDoc?.projectName,
	});
};
