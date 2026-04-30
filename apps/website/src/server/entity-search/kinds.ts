export const ENTITY_KINDS = ['category', 'tag'] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export const FIELD_KINDS = ['city'] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];

export function isEntityKind(kind: string): kind is EntityKind {
	return ENTITY_KINDS.includes(kind as EntityKind);
}

export function isFieldKind(kind: string): kind is FieldKind {
	return FIELD_KINDS.includes(kind as FieldKind);
}
