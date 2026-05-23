import {
	Box,
	createTreeCollection,
	Icon,
	Spinner,
	Text,
	TreeView,
} from '@chakra-ui/react';
import type { Tag } from '@nature-urbaine/database';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState, type JSX } from 'react';
import { LuLayers, LuTag, LuTags } from 'react-icons/lu';
import { childTagsQueryOptions } from '@/queries/tags';
import type { TagCategoryWithCount } from '@/server/tags';

type TagTreeNode = {
	id: string;
	name: string;
	kind: 'category' | 'tag';
	tagId?: number;
	tagCategoryId?: number;
	childrenCount?: number;
	children?: TagTreeNode[];
};

type ChildTag = Tag & { relatedChildTags?: { totalDocs?: number } };

const idOf = (kind: 'category' | 'tag', id: number) => `${kind}-${id}`;
const tagIdFromValue = (value: string) =>
	value.startsWith('tag-') ? Number(value.replace('tag-', '')) : null;

const toTagNode = (t: ChildTag): TagTreeNode => {
	const count = t.relatedChildTags?.totalDocs ?? 0;
	return {
		id: idOf('tag', t.id),
		name: t.name,
		kind: 'tag',
		tagId: t.id,
		...(count > 0 ? { childrenCount: count } : {}),
	};
};

const buildInitialCollection = (categories: TagCategoryWithCount[]) =>
	createTreeCollection<TagTreeNode>({
		rootNode: {
			id: 'ROOT',
			name: '',
			kind: 'category',
			children: categories.map((c) => ({
				id: idOf('category', c.id),
				name: c.name,
				kind: 'category',
				tagCategoryId: c.id,
				childrenCount: c.rootTagCount,
			})),
		},
		nodeToValue: (node) => node.id,
		nodeToString: (node) => node.name,
		nodeToChildren: (node) => node.children ?? [],
		nodeToChildrenCount: (node) => node.childrenCount,
	});

type TagTreeViewProps = {
	categories: TagCategoryWithCount[];
};

export function TagTreeView({ categories }: TagTreeViewProps): JSX.Element {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const initialCollection = useMemo(
		() => buildInitialCollection(categories),
		[categories],
	);
	const [collection, setCollection] = useState(initialCollection);

	if (categories.length === 0) {
		return (
			<Box color="fg.muted" pb={20}>
				<Text>Aucune catégorie d'étiquette disponible pour le moment.</Text>
			</Box>
		);
	}

	return (
		<Box pb={{ base: 16, md: 24 }}>
			<TreeView.Root
				collection={collection}
				animateContent
				selectionMode="single"
				onSelectionChange={(details) => {
					const value = details.selectedValue[0];
					if (!value) return;
					const tagId = tagIdFromValue(value);
					if (tagId === null) return;
					// Only leaf tags navigate; parents only expand.
					const node = collection.findNode(value);
					if (node?.childrenCount && node.childrenCount > 0) return;
					navigate({ to: '/tags/$id', params: { id: tagId.toString() } });
				}}
				loadChildren={async ({ node }) => {
					if (node.kind === 'category' && node.tagCategoryId !== undefined) {
						const data = await queryClient.fetchQuery(
							childTagsQueryOptions({
								parentId: null,
								tagCategoryId: node.tagCategoryId,
							}),
						);
						return data.map(toTagNode);
					}
					if (node.kind === 'tag' && node.tagId !== undefined) {
						const data = await queryClient.fetchQuery(
							childTagsQueryOptions({
								parentId: node.tagId,
								tagCategoryId: null,
							}),
						);
						return data.map(toTagNode);
					}
					return [];
				}}
				onLoadChildrenComplete={(details) => setCollection(details.collection)}
			>
				<TreeView.Label srOnly>Taxonomie d'étiquettes</TreeView.Label>
				<TreeView.Tree>
					<TreeView.Node<TagTreeNode>
						indentGuide={<TreeView.BranchIndentGuide />}
						render={({ node, nodeState }) => {
							const branchIcon = node.kind === 'category' ? LuLayers : LuTags;
							return nodeState.isBranch ? (
								<TreeView.BranchControl cursor="pointer">
									{nodeState.loading ? (
										<Spinner size="xs" />
									) : (
										<Icon
											as={branchIcon}
											color={
												node.kind === 'category' ? 'primary.fg' : 'fg.muted'
											}
										/>
									)}
									<TreeView.BranchText>
										{node.name}
										{node.childrenCount !== undefined && (
											<Text as="span" color="fg.muted" ml={1.5}>
												({node.childrenCount})
											</Text>
										)}
									</TreeView.BranchText>
								</TreeView.BranchControl>
							) : (
								<TreeView.Item cursor="pointer">
									<Icon as={LuTag} color="fg.subtle" />
									<TreeView.ItemText>{node.name}</TreeView.ItemText>
								</TreeView.Item>
							);
						}}
					/>
				</TreeView.Tree>
			</TreeView.Root>
		</Box>
	);
}
