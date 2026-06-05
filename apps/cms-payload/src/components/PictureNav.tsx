"use client";

import {
	Button,
	ChevronIcon,
	useConfig,
	useDocumentInfo,
} from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DocId = number | string;

const toId = (value: unknown): DocId | null => {
	if (value == null) return null;
	if (typeof value === "object") {
		const id = (value as { id?: DocId }).id;
		return id ?? null;
	}
	return value as DocId;
};

/**
 * Prev/next buttons rendered in the Photo edit header. Lets editors step
 * through the photos of a report in their ordered sequence (the report's
 * `relatedPictures` join) without bouncing back to the list view.
 */
export const PictureNav = () => {
	const router = useRouter();
	const { id, savedDocumentData } = useDocumentInfo();
	const { config } = useConfig();
	const apiRoute = config.routes.api || "/api";
	const adminRoute = config.routes.admin || "/";

	const reportRef = savedDocumentData?.report;

	const [prev, setPrev] = useState<DocId | null>(null);
	const [next, setNext] = useState<DocId | null>(null);

	useEffect(() => {
		if (!id) return;
		let cancelled = false;
		// Reset so stale neighbors from the previous photo can't be clicked
		// while the new siblings are still loading.
		setPrev(null);
		setNext(null);

		const load = async () => {
			// Resolve the report this photo belongs to. Prefer the already-loaded
			// document data; fall back to fetching the photo if it's missing.
			let reportId = toId(reportRef);
			if (reportId == null) {
				const res = await fetch(`${apiRoute}/pictures/${id}?depth=0`, {
					credentials: "include",
				});
				reportId = toId((await res.json())?.report);
			}
			if (reportId == null) return;

			// Pull the report's photos in their ordered sequence (the join order).
			const res = await fetch(
				`${apiRoute}/reports/${reportId}?depth=0&joins[relatedPictures][limit]=1000`,
				{ credentials: "include" },
			);
			const report = await res.json();
			const docs: unknown[] = report?.relatedPictures?.docs ?? [];
			const ids = docs
				.map(toId)
				.filter((value): value is DocId => value != null);
			const index = ids.findIndex((docId) => String(docId) === String(id));
			if (index === -1 || cancelled) return;

			setPrev(index > 0 ? (ids[index - 1] ?? null) : null);
			setNext(index < ids.length - 1 ? (ids[index + 1] ?? null) : null);
		};

		load().catch((err) => {
			console.error("PictureNav: failed to load sibling photos", err);
		});
		return () => {
			cancelled = true;
		};
	}, [id, apiRoute, reportRef]);

	if (!id) return null;

	const base = adminRoute === "/" ? "" : adminRoute;
	const goTo = (pictureId: DocId | null) => {
		if (pictureId == null) return;
		router.push(`${base}/collections/pictures/${pictureId}`);
	};

	return (
		<div
			style={{
				display: "flex",
				gap: "var(--base)",
				marginRight: "var(--base)",
			}}
		>
			<Button
				buttonStyle="secondary"
				size="small"
				el="button"
				disabled={prev == null}
				onClick={() => goTo(prev)}
				tooltip="Photo précédente"
				aria-label="Photo précédente"
			>
				<ChevronIcon direction="left" />
			</Button>
			<Button
				buttonStyle="secondary"
				size="small"
				el="button"
				disabled={next == null}
				onClick={() => goTo(next)}
				tooltip="Photo suivante"
				aria-label="Photo suivante"
			>
				<ChevronIcon direction="right" />
			</Button>
		</div>
	);
};
