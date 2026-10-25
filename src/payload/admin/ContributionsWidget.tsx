import type { PayloadRequest, WidgetServerProps } from 'payload';
import { formatAdminURL } from 'payload/shared';
import { CONTRIBUTION_STATUSES } from '../fields/contribution-statuses';
import type { Contribution } from '../payload-types';
import { contributionAdminURL } from '../utilities/contribution-admin-url';

const MONTHS_SHOWN = 12;
const LATEST_PENDING = 5;

const numberFormat = new Intl.NumberFormat('fr-FR');
const monthFormat = new Intl.DateTimeFormat('fr-FR', {
	month: 'short',
	year: 'numeric',
	timeZone: 'Europe/Paris',
});
const relativeFormat = new Intl.RelativeTimeFormat('fr-FR', {
	numeric: 'auto',
});

function daysAgo(value: string, now: Date) {
	const days = Math.floor(
		(now.getTime() - new Date(value).getTime()) / (24 * 60 * 60 * 1000),
	);
	return relativeFormat.format(-days, 'day');
}

function lastMonths(now: Date) {
	return Array.from({ length: MONTHS_SHOWN }, (_, index) => {
		const month = new Date(now.getFullYear(), now.getMonth(), 1);
		month.setMonth(month.getMonth() - (MONTHS_SHOWN - 1 - index));
		return month;
	});
}

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

async function loadQueue(req: PayloadRequest) {
	const { payload } = req;
	const now = new Date();
	const months = lastMonths(now);
	const [counts, pending, oldest, received] = await Promise.all([
		Promise.all(
			CONTRIBUTION_STATUSES.map(({ value }) =>
				payload
					.count({
						collection: 'contributions',
						where: { status: { equals: value } },
						overrideAccess: false,
						req,
					})
					.then(({ totalDocs }) => totalDocs),
			),
		),
		payload.find({
			collection: 'contributions',
			where: { status: { equals: 'pending' } },
			sort: '-createdAt',
			limit: LATEST_PENDING,
			depth: 0,
			select: { title: true, authorName: true, createdAt: true },
			overrideAccess: false,
			req,
		}),
		payload.find({
			collection: 'contributions',
			where: { status: { equals: 'pending' } },
			sort: 'createdAt',
			limit: 1,
			depth: 0,
			select: { createdAt: true },
			overrideAccess: false,
			req,
		}),
		payload.find({
			collection: 'contributions',
			where: { createdAt: { greater_than_equal: months[0]?.toISOString() } },
			pagination: false,
			depth: 0,
			select: { createdAt: true },
			overrideAccess: false,
			req,
		}),
	]);

	const perMonth = new Map(months.map((month) => [monthKey(month), 0]));
	for (const { createdAt } of received.docs) {
		const key = monthKey(new Date(createdAt));
		perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
	}
	const bars = months.map((month) => ({
		label: monthFormat.format(month),
		count: perMonth.get(monthKey(month)) ?? 0,
	}));
	const oldestPending = oldest.docs[0];

	return {
		counts,
		bars,
		max: Math.max(1, ...bars.map((bar) => bar.count)),
		oldestReceived: oldestPending
			? daysAgo(oldestPending.createdAt, now)
			: null,
		pending: pending.docs.map((contribution) => ({
			...contribution,
			received: daysAgo(contribution.createdAt, now),
		})),
	};
}

export const ContributionsWidget = async ({ req }: WidgetServerProps) => {
	const { payload } = req;
	const { counts, bars, max, oldestReceived, pending } = await loadQueue(req);
	const listURL = (status?: Contribution['status']) =>
		formatAdminURL({
			adminRoute: payload.config.routes.admin,
			path: `/collections/contributions${status ? `?where[status][equals]=${status}` : ''}`,
		});

	return (
		<div className="card stats-widget">
			<div className="stats-widget__header">
				<div>
					<h3 className="stats-widget__title">Contributions</h3>
					<span className="stats-widget__muted">
						{oldestReceived
							? `La plus ancienne à traiter a été reçue ${oldestReceived}.`
							: 'Aucune contribution à traiter.'}
					</span>
				</div>
				<a className="stats-widget__link" href={listURL()}>
					Toutes les contributions
				</a>
			</div>
			<div className="stats-widget__kpis">
				{CONTRIBUTION_STATUSES.map(({ value, queueLabel }, index) => (
					<a key={value} className="stats-widget__kpi" href={listURL(value)}>
						<span className="stats-widget__kpi-label">{queueLabel}</span>
						<span className="stats-widget__kpi-value">
							{numberFormat.format(counts[index] ?? 0)}
						</span>
					</a>
				))}
			</div>
			<div className="stats-widget__lists">
				<div className="stats-widget__chart">
					<span className="stats-widget__section-title">Reçues par mois</span>
					<ul className="stats-widget__bars">
						{bars.map((bar) => (
							<li
								className="stats-widget__bar"
								key={bar.label}
								title={`${bar.label} : ${bar.count}`}
								aria-label={`${bar.label} : ${bar.count}`}
							>
								<span style={{ height: `${(bar.count / max) * 100}%` }} />
							</li>
						))}
					</ul>
					<div className="stats-widget__chart-axis">
						<span>{bars.at(0)?.label}</span>
						<span>{bars.at(-1)?.label}</span>
					</div>
				</div>
				<div className="stats-widget__list">
					<span className="stats-widget__section-title">
						Dernières à traiter
					</span>
					{pending.length === 0 ? (
						<p className="stats-widget__muted">Rien en attente.</p>
					) : (
						<ol>
							{pending.map((contribution) => (
								<li key={contribution.id}>
									<a
										className="stats-widget__list-label stats-widget__link"
										href={contributionAdminURL(payload, contribution.id)}
									>
										{contribution.title} · {contribution.authorName}
									</a>
									<span className="stats-widget__muted">
										{contribution.received}
									</span>
								</li>
							))}
						</ol>
					)}
				</div>
			</div>
		</div>
	);
};
