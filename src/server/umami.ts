const DAY_MS = 24 * 60 * 60 * 1000;
const TIMEZONE = 'Europe/Paris';

export interface UmamiConfig {
	url: string;
	websiteId: string;
	apiKey: string;
}

export interface UmamiTotals {
	visitors: number;
	visits: number;
	pageviews: number;
	bounces: number;
	totaltime: number;
}

export interface UmamiMetric {
	x: string | null;
	y: number;
}

export interface UmamiSummary {
	totals: UmamiTotals;
	previous: UmamiTotals;
	activeVisitors: number;
	dailyVisitors: Array<{ x: string; y: number }>;
	topPages: UmamiMetric[];
	topReferrers: UmamiMetric[];
}

const parisDay = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE });

/** `YYYY-MM-DD` in Paris time, from a local "YYYY-MM-DD HH:mm:ss" or a zoned ISO date. */
export function dayKey(value: string) {
	return /(Z|[+-]\d{2}:?\d{2})$/.test(value)
		? parisDay.format(new Date(value))
		: value.slice(0, 10);
}

export function daysBetween(startAt: number, endAt: number) {
	const days = new Set<string>();
	// Half-day steps so a DST change never skips a calendar day.
	for (let time = startAt; time < endAt; time += DAY_MS / 2) {
		days.add(parisDay.format(time));
	}
	days.add(parisDay.format(endAt));
	return [...days];
}

/** Null until the Umami instance, website and API key are all set. */
export function getUmamiConfig(): UmamiConfig | null {
	const url = process.env.VITE_UMAMI_URL?.replace(/\/+$/, '');
	const websiteId = process.env.VITE_UMAMI_WEBSITE_ID;
	const apiKey = process.env.UMAMI_API_KEY;
	if (!url || !websiteId || !apiKey) return null;
	return { url, websiteId, apiKey };
}

export async function fetchUmamiSummary(
	config: UmamiConfig,
	days: number,
	now = Date.now(),
): Promise<UmamiSummary> {
	const get = async <T>(
		endpoint: string,
		params: Record<string, string | number> = {},
	): Promise<T> => {
		const url = new URL(
			`/api/websites/${config.websiteId}/${endpoint}`,
			config.url,
		);
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, String(value));
		}
		const response = await fetch(url, {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${config.apiKey}`,
			},
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) {
			throw new Error(`Umami ${endpoint} responded ${response.status}`);
		}
		return (await response.json()) as T;
	};

	const range = {
		startAt: now - days * DAY_MS,
		endAt: now,
		timezone: TIMEZONE,
	};

	const [stats, active, pageviews, topPages, topReferrers] = await Promise.all([
		get<UmamiTotals & { comparison: UmamiTotals }>('stats', {
			...range,
			compare: 'prev',
		}),
		get<{ visitors: number }>('active'),
		get<{ sessions: Array<{ x: string; y: number }> }>('pageviews', {
			...range,
			unit: 'day',
		}),
		get<UmamiMetric[]>('metrics', { ...range, type: 'path', limit: 5 }),
		get<UmamiMetric[]>('metrics', { ...range, type: 'referrer', limit: 5 }),
	]);

	const { comparison, ...totals } = stats;

	// Umami leaves out days without visits; the chart needs one bar per day.
	const visitsByDay = new Map<string, number>();
	for (const { x, y } of pageviews.sessions) {
		const day = dayKey(x);
		visitsByDay.set(day, (visitsByDay.get(day) ?? 0) + y);
	}
	const dailyVisitors = daysBetween(range.startAt, range.endAt).map((day) => ({
		x: day,
		y: visitsByDay.get(day) ?? 0,
	}));

	return {
		totals,
		previous: comparison,
		activeVisitors: active.visitors,
		dailyVisitors,
		topPages,
		topReferrers,
	};
}
