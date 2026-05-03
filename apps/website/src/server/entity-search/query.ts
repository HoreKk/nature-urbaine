import { getCategoryById } from '@/server/categories';
import { getTagById } from '@/server/tags';
import type { EntityKind, FieldKind } from './kinds';

export async function getEntityByKind({
	kind,
	id,
}: {
	kind: EntityKind;
	id: number;
}) {
	switch (kind) {
		case 'category':
			return getCategoryById({ data: id });
		case 'tag':
			return getTagById({ data: id });
	}
}

export async function getFieldByKind({
	field,
	value,
}: {
	field: FieldKind;
	value: string;
}) {
	switch (field) {
		case 'city':
			return { label: value };
	}
}
