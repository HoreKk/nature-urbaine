import {
	Box,
	FileUpload,
	Icon,
	IconButton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuImagePlus, LuTrash2 } from 'react-icons/lu';
import { Field } from '@/components/ui/field';
import { type DefaultFieldProps, useFieldContext } from '@/hooks/form-context';

interface FilesFieldProps extends DefaultFieldProps {
	maxFiles?: number;
	maxFileSize?: number;
	accept?: string[];
	helperText?: string;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

export function FilesField({
	label,
	required,
	maxFiles = DEFAULT_MAX_FILES,
	maxFileSize = DEFAULT_MAX_FILE_SIZE,
	accept = ['image/*'],
	helperText,
}: FilesFieldProps) {
	const field = useFieldContext<File[]>();
	const [uploadError, setUploadError] = useState<string | null>(null);
	const resolvedHelperText =
		helperText ??
		`Images uniquement, ${maxFiles} maximum, ${Math.round(maxFileSize / (1024 * 1024))} Mo par fichier.`;
	const validationError = field.state.meta.errors[0]?.message;
	const errorText = uploadError ?? validationError;

	return (
		<Field
			label={label}
			required={required}
			invalid={Boolean(errorText)}
			errorText={errorText}
			helperText={resolvedHelperText}
		>
			<FileUpload.Root
				accept={accept}
				maxFiles={maxFiles}
				maxFileSize={maxFileSize}
				acceptedFiles={field.state.value ?? []}
				onFileChange={(details) => {
					setUploadError(null);
					field.handleChange(details.acceptedFiles);
				}}
				onFileReject={(details) => {
					const hasRejectedFiles = details.files.length > 0;
					setUploadError(
						hasRejectedFiles
							? `Certains fichiers ont ete refuses. Verifiez le format (${accept.join(', ')}) et la taille maximale.`
							: 'Certains fichiers ne sont pas valides.',
					);
				}}
			>
				<FileUpload.HiddenInput />
				<FileUpload.Dropzone
					w="full"
					bg="bg"
					border="1px dashed"
					borderColor="border"
					borderRadius="sm"
					cursor="pointer"
					px={4}
					py={6}
					transition="border-color 150ms ease"
					_hover={{ borderColor: 'fg.muted' }}
				>
					<FileUpload.DropzoneContent>
						<Stack align="center" gap={2} textAlign="center">
							<Icon as={LuImagePlus} boxSize={5} color="fg.muted" />
							<Text color="fg" fontWeight={500}>
								Deposez vos images ici
							</Text>
							<Text color="fg.muted" fontSize="sm">
								ou cliquez pour parcourir vos fichiers
							</Text>
							<FileUpload.Context>
								{({ acceptedFiles }) => (
									<Text color="fg.subtle" fontSize="11px" fontFamily="mono">
										{Math.max(maxFiles - acceptedFiles.length, 0)} fichiers
										restants
									</Text>
								)}
							</FileUpload.Context>
						</Stack>
					</FileUpload.DropzoneContent>
				</FileUpload.Dropzone>
				<FileUpload.ItemGroup
					listStyleType="none"
					m={0}
					mt={4}
					p={0}
					display="grid"
					gridTemplateColumns={{
						base: '1fr',
						sm: '1fr 1fr',
						md: 'repeat(3, 1fr)',
					}}
					gap={3}
				>
					<FileUpload.Context>
						{({ acceptedFiles }) =>
							acceptedFiles.map((file) => (
								<FileUpload.Item
									key={`${file.name}-${file.lastModified}`}
									file={file}
									bg="bg"
									border="1px solid"
									borderColor="border"
									borderRadius="sm"
									position="relative"
									overflow="hidden"
								>
									<Stack p={2} gap={2}>
										<FileUpload.ItemPreview
											h="64px"
											bg="bg.muted"
											borderRadius="sm"
											overflow="hidden"
										>
											<FileUpload.ItemPreviewImage
												objectFit="cover"
												w="full"
												h="full"
											/>
										</FileUpload.ItemPreview>
										<Stack gap={0} minW={0}>
											<FileUpload.ItemName
												fontSize="sm"
												color="fg"
												lineClamp={1}
											/>
											<FileUpload.ItemSizeText
												fontSize="11px"
												color="fg.subtle"
											/>
										</Stack>
									</Stack>
									<Box position="absolute" top={2} right={2}>
										<FileUpload.ItemDeleteTrigger asChild>
											<IconButton
												aria-label="Supprimer l'image"
												variant="surface"
												size="2xs"
												colorPalette="secondary"
												border="1px solid"
												borderColor="border"
											>
												<LuTrash2 />
											</IconButton>
										</FileUpload.ItemDeleteTrigger>
									</Box>
								</FileUpload.Item>
							))
						}
					</FileUpload.Context>
				</FileUpload.ItemGroup>
			</FileUpload.Root>
		</Field>
	);
}
