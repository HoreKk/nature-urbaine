/**
 * Every upload collection, each stored under a bucket prefix equal to its slug. The
 * website's `media-urls.ts` and `scripts/check-storage.ts` rely on this layout, and
 * `storageCoverageGuard` refuses to start when an upload collection is missing here.
 * Dependency-free so the website can import it without the S3 plugin.
 */
export const storageCollections = [
	'media',
	'pictures',
	'interview-pictures',
] as const;
