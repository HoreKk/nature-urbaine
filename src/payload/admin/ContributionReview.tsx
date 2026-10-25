'use client';

import {
	Button,
	DialogConfirm,
	DialogBody,
	DialogCancel,
	DialogFooter,
	DialogHeader,
	DialogModal,
	TextareaInput,
	toast,
	useConfig,
	useDocumentInfo,
	useFormFields,
	useFormModified,
	useModal,
	useRouter,
} from '@payloadcms/ui';
import { formatAdminURL } from 'payload/shared';
import { useState } from 'react';
import { CONTRIBUTION_REJECTION_NOTE_MAX_LENGTH } from '../../server/contribution-contract';

const ACCEPT_MODAL = 'contribution-accept';
const REJECT_MODAL = 'contribution-reject';

async function readMessage(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as {
		message?: string;
	};
	return body.message ?? 'Une erreur est survenue. Réessayez.';
}

export function ContributionReview() {
	const { id } = useDocumentInfo();
	const status = useFormFields(([fields]) => fields.status?.value);
	const authorName = useFormFields(([fields]) => fields.authorName?.value);
	const modified = useFormModified();
	const { openModal, closeModal } = useModal();
	const router = useRouter();
	const {
		config: { routes, serverURL },
	} = useConfig();
	const [note, setNote] = useState('');
	const [noteError, setNoteError] = useState<string | null>(null);
	const [rejecting, setRejecting] = useState(false);

	if (id == null || (status !== 'pending' && status !== 'accepted')) {
		return null;
	}

	const post = (action: 'accept' | 'reject', body: object = {}) =>
		fetch(
			formatAdminURL({
				apiRoute: routes.api,
				path: `/contributions/${id}/${action}`,
				serverURL,
			}),
			{
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			},
		);

	const accept = async () => {
		const response = await post('accept');
		if (!response.ok) {
			toast.error(await readMessage(response));
			return;
		}
		const { report } = (await response.json()) as { report: number };
		toast.success('Contribution validée : le reportage brouillon est créé.');
		router.push(
			formatAdminURL({
				adminRoute: routes.admin,
				path: `/collections/reports/${report}`,
			}),
		);
	};

	const reject = async () => {
		const trimmed = note.trim();
		if (!trimmed) {
			setNoteError('Indiquez le motif du refus.');
			return;
		}
		if (trimmed.length > CONTRIBUTION_REJECTION_NOTE_MAX_LENGTH) {
			setNoteError(
				`Le motif dépasse ${CONTRIBUTION_REJECTION_NOTE_MAX_LENGTH} caractères.`,
			);
			return;
		}

		setRejecting(true);
		try {
			const response = await post('reject', { note: trimmed });
			if (!response.ok) {
				toast.error(await readMessage(response));
				return;
			}
			const { emailSent } = (await response.json()) as {
				emailSent: boolean;
			};
			closeModal(REJECT_MODAL);
			setNote('');
			if (emailSent) {
				toast.success('Contribution refusée : l’auteur a reçu le motif.');
			} else {
				toast.warning(
					'Contribution refusée, mais l’email n’a pas pu partir : prévenez l’auteur vous-même.',
				);
			}
			router.refresh();
		} finally {
			setRejecting(false);
		}
	};

	// Valider copies the saved fields: unsaved edits would be lost.
	const unsaved = modified
		? 'Enregistrez d’abord vos modifications.'
		: undefined;

	return (
		// `contents`: the buttons take the controls row's own gap.
		<div style={{ display: 'contents' }}>
			{status === 'pending' && (
				<Button
					buttonStyle="primary"
					size="medium"
					disabled={modified}
					tooltip={unsaved}
					onClick={() => openModal(ACCEPT_MODAL)}
				>
					Valider
				</Button>
			)}
			<Button
				buttonStyle="destructive"
				size="medium"
				disabled={modified}
				tooltip={unsaved}
				onClick={() => {
					setNoteError(null);
					openModal(REJECT_MODAL);
				}}
			>
				Refuser
			</Button>
			<DialogModal slug={ACCEPT_MODAL} size="medium">
				<DialogHeader showClose title="Valider la contribution" />
				<DialogBody>
					<p
						style={{
							marginBottom: 'var(--spacer-4)',
							paddingTop: 'var(--spacer-2)',
						}}
					>
						Un reportage brouillon sera créé avec les informations de cette
						contribution, et « {String(authorName ?? '')} » comme auteur des
						photographies.
					</p>
					<p>
						Vous y serez redirigé pour ajouter les photos de l’archive, puis le
						publier. L’auteur sera prévenu par email à la publication. La
						contribution ne sera plus modifiable.
					</p>
				</DialogBody>
				<DialogFooter>
					<DialogCancel />
					<DialogConfirm
						label="Valider et ouvrir le reportage"
						loadingLabel="Création du reportage…"
						onClick={accept}
					/>
				</DialogFooter>
			</DialogModal>
			<DialogModal slug={REJECT_MODAL} size="medium">
				<DialogHeader showClose title="Refuser la contribution" />
				<DialogBody>
					<p
						style={{
							marginBottom: 'var(--spacer-4)',
							paddingTop: 'var(--spacer-2)',
						}}
					>
						L’auteur recevra ce motif par email et l’archive de photos sera
						supprimée.
						{status === 'accepted' &&
							' Le reportage brouillon créé à la validation, et les photos qui y ont été ajoutées, seront supprimés aussi.'}
					</p>
					<TextareaInput
						path="rejectionNote"
						label="Motif du refus"
						required
						rows={5}
						value={note}
						onChange={(event) => {
							setNote(event.target.value);
							setNoteError(null);
						}}
						showError={noteError !== null}
						Error={
							noteError && (
								<p role="alert" style={{ color: 'var(--color-text-danger)' }}>
									{noteError}
								</p>
							)
						}
					/>
				</DialogBody>
				<DialogFooter>
					<DialogCancel />
					<Button
						buttonStyle="destructive"
						size="medium"
						margin={false}
						disabled={rejecting}
						onClick={reject}
					>
						{rejecting ? 'Refus en cours…' : 'Refuser et prévenir l’auteur'}
					</Button>
				</DialogFooter>
			</DialogModal>
		</div>
	);
}
