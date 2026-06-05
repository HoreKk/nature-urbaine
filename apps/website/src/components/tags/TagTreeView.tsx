import {
	Box,
	createTreeCollection,
	Flex,
	HStack,
	Icon,
	Spinner,
	Text,
	TreeView,
} from '@chakra-ui/react';
import type { Tag } from '@nature-urbaine/database';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState, type JSX } from 'react';
import { LuImages, LuLayers, LuListTree, LuTag, LuTags } from 'react-icons/lu';
import { childTagsQueryOptions } from '@/queries/tags';
import type {
	TagCategoryWithCount,
	TagNodeStats,
	TagTaxonomyStats,
} from '@/server/tags';

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

const numberFormatter = new Intl.NumberFormat('fr-FR');
const EMPTY_STATS: TagNodeStats = { pictureCount: 0, descendantCount: 0 };

const pictureLabel = (count: number) =>
	`${numberFormatter.format(count)} photo${count > 1 ? 's' : ''}`;
const descendantLabel = (count: number) =>
	`${numberFormatter.format(count)} sous-étiquette${count > 1 ? 's' : ''}`;

function NodeStats({
	pictureCount,
	descendantCount,
}: TagNodeStats): JSX.Element {
	const pictureTone = pictureCount > 0 ? 'fg.muted' : 'fg.subtle';
	return (
		<HStack gap={3.5} ml="auto" flexShrink={0}>
			{descendantCount > 0 && (
				<HStack
					gap={1}
					color="fg.subtle"
					title={descendantLabel(descendantCount)}
					aria-label={descendantLabel(descendantCount)}
				>
					<Icon as={LuListTree} boxSize="13px" aria-hidden />
					<Text textStyle="mono.s" color="inherit">
						{numberFormatter.format(descendantCount)}
					</Text>
				</HStack>
			)}
			<HStack
				gap={1}
				color={pictureTone}
				title={pictureLabel(pictureCount)}
				aria-label={pictureLabel(pictureCount)}
			>
				<Icon as={LuImages} boxSize="13px" aria-hidden />
				<Text textStyle="mono.s" color="inherit">
					{numberFormatter.format(pictureCount)}
				</Text>
			</HStack>
		</HStack>
	);
}

function TaxonomyLegend(): JSX.Element {
	return (
		<Flex
			justify="flex-end"
			align="center"
			gap={4}
			mb={3}
			color="fg.subtle"
			textStyle="mono.s"
		>
			<HStack gap={1.5}>
				<Icon as={LuListTree} boxSize="13px" aria-hidden />
				<Text color="inherit">sous-étiquettes</Text>
			</HStack>
			<HStack gap={1.5}>
				<Icon as={LuImages} boxSize="13px" aria-hidden />
				<Text color="inherit">photos</Text>
			</HStack>
		</Flex>
	);
}

type TagTreeViewProps = {
	categories: TagCategoryWithCount[];
	stats: TagTaxonomyStats;
};

export function TagTreeView({
	categories,
	stats,
}: TagTreeViewProps): JSX.Element {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const initialCollection = useMemo(
		() => buildInitialCollection(categories),
		[categories],
	);
	const [collection, setCollection] = useState(initialCollection);

	const statsForNode = (node: TagTreeNode): TagNodeStats => {
		if (node.kind === 'category' && node.tagCategoryId !== undefined) {
			return stats.categories[node.tagCategoryId] ?? EMPTY_STATS;
		}
		if (node.kind === 'tag' && node.tagId !== undefined) {
			return stats.tags[node.tagId] ?? EMPTY_STATS;
		}
		return EMPTY_STATS;
	};

	if (categories.length === 0) {
		return (
			<Box color="fg.muted" pb={20}>
				<Text>Aucune catégorie d'étiquette disponible pour le moment.</Text>
			</Box>
		);
	}

	return (
		<Box pb={{ base: 16, md: 24 }}>
			<TaxonomyLegend />
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
							const nodeStats = statsForNode(node);
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
									<TreeView.BranchText flex="1" minW={0} truncate>
										{node.name}
									</TreeView.BranchText>
									<NodeStats {...nodeStats} />
								</TreeView.BranchControl>
							) : (
								<TreeView.Item cursor="pointer">
									<Icon as={LuTag} color="fg.subtle" />
									<TreeView.ItemText flex="1" minW={0} truncate>
										{node.name}
									</TreeView.ItemText>
									<NodeStats {...nodeStats} />
								</TreeView.Item>
							);
						}}
					/>
				</TreeView.Tree>
			</TreeView.Root>
		</Box>
	);
}
