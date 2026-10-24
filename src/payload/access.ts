import type { Access } from 'payload';

export const loggedIn: Access = ({ req }) => Boolean(req.user);

/** Visitors read published Reports only; drafts stay in the admin. */
export const readPublishedReports: Access = ({ req }) =>
	req.user ? true : { _status: { equals: 'published' } };

/** A Report photo is public once its Report is. */
export const readPublishedReportPictures: Access = ({ req }) =>
	req.user ? true : { 'report._status': { equals: 'published' } };
