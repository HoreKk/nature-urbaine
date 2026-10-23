import { Button, ChevronIcon } from '@payloadcms/ui';
import type { BeforeDocumentControlsServerProps } from 'payload';
import { formatAdminURL } from 'payload/shared';
import type { PictureNavTarget } from '../collections/picture-collection';

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

type PictureNavProps = BeforeDocumentControlsServerProps & PictureNavTarget;

/** ‹ › through the owner's photos, in the order of its `relatedPictures` join. */
export const PictureNav = async ({
	id,
	payload,
	user,
	collection,
	ownerField,
	ownerCollection,
}: PictureNavProps) => {
	if (id == null) return null;

	// `collection` is dynamic, so Payload types the row as any collection's document.
	const picture = (await payload.findByID({
		collection,
		id,
		depth: 0,
		overrideAccess: false,
		user,
	})) as unknown as Record<string, unknown>;
	const ownerId = idOf(picture[ownerField]);
	if (ownerId == null) return null;

	const owner = await payload.findByID({
		collection: ownerCollection,
		id: ownerId,
		depth: 0,
		select: { relatedPictures: true },
		joins: { relatedPictures: { limit: 0 } },
		overrideAccess: false,
		user,
	});

	const ids = (owner.relatedPictures?.docs ?? []).map(idOf);
	const index = ids.findIndex((docId) => String(docId) === String(id));
	const hrefOf = (docId: DocId | undefined) =>
		docId == null
			? undefined
			: formatAdminURL({
					adminRoute: payload.config.routes.admin,
					path: `/collections/${collection}/${docId}`,
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
