import type { FieldHook } from 'payload';
import type { Report } from '../payload-types';

type season = 'spring' | 'summer' | 'autumn' | 'winter';
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
		? 'spring'
		: month >= 6 && month <= 8
			? 'summer'
			: month >= 9 && month <= 11
				? 'autumn'
				: 'winter';
};

type ReportNameParts = {
	country?: string | null;
	city?: string | null;
	projectName?: string | null;
};

export function computeReportName({
	country,
	city,
	projectName,
}: ReportNameParts): string {
	const isAbroad =
		!!country?.trim() && country.trim().toLowerCase() !== 'france';

	return [isAbroad ? country : undefined, city, projectName]
		.map((part) => part?.trim())
		.filter(Boolean)
		.join(', ');
}

// Partial Local API updates omit untouched fields, so fall back to the stored doc.
export const computeReportNameHook: FieldHook<
	Report,
	string | undefined,
	Partial<Report>
> = ({ data, originalDoc, value }) => {
	const locationDetails = data?.locationDetails ?? originalDoc?.locationDetails;
	const projectName =
		data && 'projectName' in data ? data.projectName : originalDoc?.projectName;

	const name = computeReportName({
		country: locationDetails?.country,
		city: locationDetails?.city,
		projectName,
	});

	return name || value;
};
