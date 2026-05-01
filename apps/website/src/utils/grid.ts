/**
 * Responsive card grid columns.
 * 1 col on mobile → 2 cols on md → 3 cols on lg.
 * Use as: <Grid templateColumns={cardGridColumns} />
 */
export const cardGridColumns = {
	base: '1fr',
	md: 'repeat(2, 1fr)',
	lg: 'repeat(3, 1fr)',
};
