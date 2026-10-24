import { FieldLabel } from '@payloadcms/ui';
import type { UIFieldServerProps } from 'payload';
import { formatAdminURL } from 'payload/shared';

const linkStyle = { color: 'inherit', textDecoration: 'underline' };

/** Where a Report's photos came from, when Valider created it (ADR-0005). */
export const ReportContribution = async ({
	id,
	payload,
	req,
}: UIFieldServerProps) => {
	if (id == null) return null;

	const {
		docs: [contribution],
	} = await payload.find({
		collection: 'contributions',
		where: { report: { equals: id } },
		limit: 1,
		depth: 1,
		overrideAccess: false,
		req,
	});
	if (!contribution) return null;

	const archive =
		typeof contribution.archive === 'object' ? contribution.archive : null;

	return (
		<div className="field-type" style={{ marginBottom: 'var(--spacer-6)' }}>
			<FieldLabel label="Contribution" />
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 'var(--spacer-2)',
				}}
			>
				<span>
					{contribution.authorName} ·{' '}
					<a href={`mailto:${contribution.authorEmail}`} style={linkStyle}>
						{contribution.authorEmail}
					</a>
				</span>
				{archive?.url && (
					<a href={archive.url} style={linkStyle}>
						Télécharger les photos (zip)
					</a>
				)}
				<a
					href={formatAdminURL({
						adminRoute: payload.config.routes.admin,
						path: `/collections/contributions/${contribution.id}`,
					})}
					style={linkStyle}
				>
					Ouvrir la contribution
				</a>
			</div>
		</div>
	);
};
