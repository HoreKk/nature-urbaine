import { Button, ChevronIcon } from '@payloadcms/ui';
import type { BeforeDocumentControlsServerProps } from 'payload';
import { formatAdminURL } from 'payload/shared';

type DocId = number | string;

const idOf = (value: unknown): DocId | undefined =>
	typeof value === 'object' && value !== null
		? (value as { id?: DocId }).id
		: (value as DocId | undefined);

const NavButton = ({
	href,
	label,
	direction,
}: {
	href: string | undefined;
	label: string;
	direction: 'left' | 'right';
}) => (
	// `Button` ignores `disabled` on `el="link"`, so the ends render a plain button.
	<Button
		buttonStyle="secondary"
		size="medium"
		{...(href ? { el: 'link', url: href } : { el: 'button', disabled: true })}
		tooltip={label}
		aria-label={label}
	>
		<ChevronIcon direction={direction} />
	</Button>
);

export const PictureNav = async ({
	id,
	payload,
	user,
}: BeforeDocumentControlsServerProps) => {
	if (id == null) return null;

	const picture = await payload.findByID({
		collection: 'pictures',
		id,
		depth: 0,
		select: { report: true },
		overrideAccess: false,
		user,
	});
	const reportId = idOf(picture.report);
	if (reportId == null) return null;

	const report = await payload.findByID({
		collection: 'reports',
		id: reportId,
		depth: 0,
		select: { relatedPictures: true },
		// The `relatedPictures` join order is the report's photo sequence.
		joins: { relatedPictures: { limit: 0 } },
		overrideAccess: false,
		user,
	});

	const ids = (report.relatedPictures?.docs ?? []).map(idOf);
	const index = ids.findIndex((docId) => String(docId) === String(id));
	const hrefOf = (docId: DocId | undefined) =>
		docId == null
			? undefined
			: formatAdminURL({
					adminRoute: payload.config.routes.admin,
					path: `/collections/pictures/${docId}`,
				});

	return (
		<div
			style={{
				display: 'flex',
				gap: 'var(--base)',
				marginRight: 'var(--base)',
			}}
		>
			<NavButton
				href={index > 0 ? hrefOf(ids[index - 1]) : undefined}
				label="Photo précédente"
				direction="left"
			/>
			<NavButton
				href={index !== -1 ? hrefOf(ids[index + 1]) : undefined}
				label="Photo suivante"
				direction="right"
			/>
		</div>
	);
};
