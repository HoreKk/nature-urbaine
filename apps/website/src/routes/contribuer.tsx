import {
	Alert,
	Box,
	Button,
	Container,
	Link,
	Stack,
	Text,
} from '@chakra-ui/react';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { useState } from 'react';
import type z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import { useAppForm } from '@/hooks/form-context';
import { getAllCategories } from '@/server/categories';
import { sendSubmissionNotification } from '@/server/emails/submission';
import {
	clientSubmissionSchema,
	SUBMISSION_DESCRIPTION_MAX_LENGTH,
	SUBMISSION_MAX_PICTURE_SIZE_LABEL,
	SUBMISSION_MAX_PICTURES,
} from '@/server/submission-contract';
import { createSubmission } from '@/server/submissions';

export const Route = createFileRoute('/contribuer')({
	component: RouteComponent,
	loader: async () => {
		const categories = await getAllCategories();
		return { categories };
	},
});

const defaultValues: z.input<typeof clientSubmissionSchema> = {
	name: '',
	description: '',
	category: '',
	deliveryYear: undefined as unknown as number,
	address: '',
	pictures: [],
	contributorEmail: '',
	honeypot: '',
};

async function toBase64(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	let binary = '';
	const bytes = new Uint8Array(arrayBuffer);
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function RouteComponent() {
	const { categories } = Route.useLoaderData();
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const categoryOptions = categories.map((cat) => ({
		label: cat.name,
		value: String(cat.id),
	}));

	const form = useAppForm({
		defaultValues,
		validators: { onSubmit: clientSubmissionSchema },
		onSubmit: async ({ value, formApi }) => {
			setSubmitError(null);
			setSubmitSuccess(false);
			try {
				const pictures = await Promise.all(
					value.pictures.map(async (picture) => ({
						name: picture.name,
						type: picture.type,
						size: picture.size,
						base64: await toBase64(picture),
					})),
				);

				await createSubmission({
					data: {
						...value,
						category: Number(value.category),
						deliveryYear: Number(value.deliveryYear),
						pictures,
					},
				});

				const categoryLabel =
					categoryOptions.find((option) => option.value === value.category)
						?.label ?? value.category;

				await sendSubmissionNotification({
					data: { ...value, category: categoryLabel },
				});

				formApi.reset();
				setSubmitSuccess(true);
			} catch {
				setSubmitError('Une erreur est survenue. Veuillez réessayer.');
			}
		},
	});

	return (
		<>
			<PageHeader
				eyebrow="Contribuer"
				title="Proposez votre projet."
				description="Renseignez quelques informations sur votre projet. Notre équipe revient vers vous après validation pour la mise en forme et la publication."
			/>
			<Container maxW="container.md" py={{ base: 10, md: 16 }}>
				<Text mb={8} color="fg.muted">
					Une question ou une erreur à signaler ?{' '}
					<Link asChild color="fg">
						<RouterLink to="/contact">Contact.</RouterLink>
					</Link>
				</Text>
				<Box
					as="form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<Stack gap={6}>
						<form.AppField name="name">
							{(field) => (
								<field.TextField
									label="Titre du projet"
									placeholder="Ex. Réaménagement de la place Jourdan"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="description">
							{(field) => (
								<field.TextareaField
									label="Description"
									placeholder={`Décrivez votre projet en quelques phrases (${SUBMISSION_DESCRIPTION_MAX_LENGTH} caractères max)`}
									maxLength={SUBMISSION_DESCRIPTION_MAX_LENGTH}
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="category">
							{(field) => (
								<field.SelectField
									label="Catégorie"
									placeholder="Choisir une catégorie"
									options={categoryOptions}
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="deliveryYear">
							{(field) => (
								<field.TextField
									label="Année de livraison"
									placeholder="Ex. 2022"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="address">
							{(field) => (
								<field.AddressAutocompleteField
									label="Adresse"
									placeholder="Ex. 12 rue de la Paix, Paris"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="contributorEmail">
							{(field) => (
								<field.TextField
									label="Votre email"
									placeholder="vous@exemple.com"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="pictures">
							{(field) => (
								<field.FilesField
									label="Images du projet"
									accept={['image/*']}
									helperText={`Formats image uniquement, ${SUBMISSION_MAX_PICTURES} images maximum, ${SUBMISSION_MAX_PICTURE_SIZE_LABEL} par image.`}
									required
								/>
							)}
						</form.AppField>
						{/* Honeypot — must remain empty */}
						<form.AppField name="honeypot">
							{(field) => (
								<Box
									aria-hidden="true"
									position="absolute"
									left="-9999px"
									tabIndex={-1}
								>
									<input
										type="text"
										autoComplete="off"
										value={field.state.value ?? ''}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</Box>
							)}
						</form.AppField>
						{submitError && (
							<Alert.Root status="error">
								<Alert.Indicator />
								<Alert.Content>
									<Alert.Description>{submitError}</Alert.Description>
								</Alert.Content>
							</Alert.Root>
						)}
						{submitSuccess && (
							<Alert.Root status="success" variant="surface">
								<Alert.Indicator />
								<Alert.Content>
									<Alert.Description>
										Merci, votre contribution a bien ete envoyee. Notre equipe
										l'examinera et vous contactera a l'adresse indiquee.
									</Alert.Description>
								</Alert.Content>
							</Alert.Root>
						)}
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" alignSelf="flex-start" px={6}>
									{isSubmitting ? 'Envoi…' : 'Envoyer ma contribution'}
								</Button>
							)}
						</form.Subscribe>
					</Stack>
				</Box>
			</Container>
		</>
	);
}
