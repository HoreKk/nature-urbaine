import type { WidgetServerProps } from 'payload';
import {
	fetchUmamiSummary,
	getUmamiConfig,
	type UmamiMetric,
	type UmamiSummary,
	type UmamiTotals,
} from '../../server/umami';
import type { AnalyticsWidget as AnalyticsWidgetType } from '../payload-types';

const numberFormat = new Intl.NumberFormat('fr-FR');
const percentFormat = new Intl.NumberFormat('fr-FR', {
	style: 'percent',
	maximumFractionDigits: 0,
});
const dayFormat = new Intl.DateTimeFormat('fr-FR', {
	day: 'numeric',
	month: 'short',
	timeZone: 'UTC',
});

const ratio = (part: number, total: number) => (total > 0 ? part / total : 0);

function formatDuration(totalSeconds: number) {
	const rounded = Math.round(totalSeconds);
	const minutes = Math.floor(rounded / 60);
	const seconds = rounded % 60;
	return minutes > 0
		? `${minutes} min ${String(seconds).padStart(2, '0')} s`
		: `${seconds} s`;
}

const visitsLabel = (count: number) =>
	`${numberFormat.format(count)} visite${count > 1 ? 's' : ''}`;

function formatDay(value: string) {
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return value;
	return dayFormat.format(new Date(Date.UTC(year, month - 1, day)));
}

interface Kpi {
	label: string;
	value: string;
	current: number;
	previous: number;
	lowerIsBetter?: boolean;
}

function buildKpis(totals: UmamiTotals, previous: UmamiTotals): Kpi[] {
	return [
		{
			label: 'Visiteurs',
			value: numberFormat.format(totals.visitors),
			current: totals.visitors,
			previous: previous.visitors,
		},
		{
			label: 'Visites',
			value: numberFormat.format(totals.visits),
			current: totals.visits,
			previous: previous.visits,
		},
		{
			label: 'Pages vues',
			value: numberFormat.format(totals.pageviews),
			current: totals.pageviews,
			previous: previous.pageviews,
		},
		{
			label: 'Durée moyenne',
			value: formatDuration(ratio(totals.totaltime, totals.visits)),
			current: ratio(totals.totaltime, totals.visits),
			previous: ratio(previous.totaltime, previous.visits),
		},
		{
			label: 'Taux de rebond',
			value: percentFormat.format(ratio(totals.bounces, totals.visits)),
			current: ratio(totals.bounces, totals.visits),
			previous: ratio(previous.bounces, previous.visits),
			lowerIsBetter: true,
		},
	];
}

const KpiTile = ({ label, value, current, previous, lowerIsBetter }: Kpi) => {
	const change = previous > 0 ? (current - previous) / previous : null;
	const trend =
		change === null || Math.abs(change) < 0.005
			? 'flat'
			: change > 0 !== Boolean(lowerIsBetter)
				? 'up'
				: 'down';

	return (
		<div className="stats-widget__kpi">
			<span className="stats-widget__kpi-label">{label}</span>
			<span className="stats-widget__kpi-value">{value}</span>
			<span
				className={`stats-widget__kpi-change stats-widget__kpi-change--${trend}`}
			>
				{change === null
					? 'Pas de comparaison'
					: `${change > 0 ? '+' : ''}${percentFormat.format(change)} vs période précédente`}
			</span>
		</div>
	);
};

const DailyChart = ({ days }: { days: UmamiSummary['dailyVisitors'] }) => {
	const max = Math.max(1, ...days.map((day) => day.y));
	const first = days.at(0);
	const last = days.at(-1);

	return (
		<div className="stats-widget__chart">
			<span className="stats-widget__section-title">Visites par jour</span>
			<ul className="stats-widget__bars">
				{days.map((day) => (
					<li
						className="stats-widget__bar"
						key={day.x}
						title={`${formatDay(day.x)} : ${visitsLabel(day.y)}`}
						aria-label={`${formatDay(day.x)} : ${visitsLabel(day.y)}`}
					>
						<span style={{ height: `${(day.y / max) * 100}%` }} />
					</li>
				))}
			</ul>
			{first && last ? (
				<div className="stats-widget__chart-axis">
					<span>{formatDay(first.x)}</span>
					<span>{formatDay(last.x)}</span>
				</div>
			) : null}
		</div>
	);
};

const TopList = ({
	title,
	items,
	emptyLabel,
}: {
	title: string;
	items: UmamiMetric[];
	emptyLabel: string;
}) => (
	<div className="stats-widget__list">
		<span className="stats-widget__section-title">{title}</span>
		{items.length === 0 ? (
			<p className="stats-widget__muted">Aucune donnée sur la période.</p>
		) : (
			<ol>
				{items.map((item) => (
					<li key={item.x ?? emptyLabel}>
						<span className="stats-widget__list-label">
							{item.x || emptyLabel}
						</span>
						<span className="stats-widget__list-value">
							{numberFormat.format(item.y)}
						</span>
					</li>
				))}
			</ol>
		)}
	</div>
);

export const AnalyticsWidget = async ({
	req,
	widgetData,
}: WidgetServerProps<AnalyticsWidgetType>) => {
	const config = getUmamiConfig();
	const days = Number(widgetData?.days ?? 30);

	if (!config) {
		return (
			<div className="card stats-widget">
				<h3 className="stats-widget__title">Audience du site</h3>
				<p className="stats-widget__muted">
					Les statistiques s’afficheront une fois Umami configuré
					(VITE_UMAMI_URL, VITE_UMAMI_WEBSITE_ID et UMAMI_API_KEY).
				</p>
			</div>
		);
	}

	let summary: UmamiSummary | null = null;
	try {
		summary = await fetchUmamiSummary(config, days);
	} catch (error) {
		req.payload.logger.error(
			{ err: error },
			'[analytics] Umami request failed',
		);
	}

	return (
		<div className="card stats-widget">
			<div className="stats-widget__header">
				<div>
					<h3 className="stats-widget__title">Audience du site</h3>
					<span className="stats-widget__muted">
						{days} derniers jours
						{summary
							? ` · ${numberFormat.format(summary.activeVisitors)} visiteur${summary.activeVisitors > 1 ? 's' : ''} en ce moment`
							: null}
					</span>
				</div>
				<a
					className="stats-widget__link"
					href={`${config.url}/websites/${config.websiteId}`}
					target="_blank"
					rel="noreferrer"
				>
					Voir le détail dans Umami
				</a>
			</div>
			{summary ? (
				<>
					<div className="stats-widget__kpis">
						{buildKpis(summary.totals, summary.previous).map((kpi) => (
							<KpiTile key={kpi.label} {...kpi} />
						))}
					</div>
					<DailyChart days={summary.dailyVisitors} />
					<div className="stats-widget__lists">
						<TopList
							title="Pages les plus vues"
							items={summary.topPages}
							emptyLabel="/"
						/>
						<TopList
							title="Sources de trafic"
							items={summary.topReferrers}
							emptyLabel="Accès direct"
						/>
					</div>
				</>
			) : (
				<p className="stats-widget__muted">
					Les statistiques sont momentanément indisponibles. Réessayez dans
					quelques minutes.
				</p>
			)}
		</div>
	);
};
