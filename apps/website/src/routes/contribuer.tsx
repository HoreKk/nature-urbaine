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
import z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import { useAppForm } from '@/hooks/form-context';
import { getAllCategories } from '@/server/categories';
import { sendSubmissionNotification } from '@/server/emails/submission';
import { createSubmission } from '@/server/submissions';

export const Route = createFileRoute('/contribuer')({
	component: RouteComponent,
	loader: async () => {
		const categories = await getAllCategories();
		return { categories };
	},
});

const submissionSchema = z.object({
	name: z.string().min(1, 'Le titre du projet est requis'),
	description: z
		.string()
		.min(1, 'La description est requise')
		.max(500, 'La description ne doit pas dépasser 500 caractères'),
	category: z.string().min(1, 'La catégorie est requise'),
	deliveryYear: z.coerce
		.number({ message: "L'année de livraison est requise" })
		.int()
		.min(1900)
		.max(2100),
	address: z.string().min(1, "L'adresse est requise"),
	contributorEmail: z.string().email('Adresse email invalide'),
	honeypot: z.string().optional(),
});

const defaultValues: z.input<typeof submissionSchema> = {
	name: '',
	description: '',
	category: '',
	deliveryYear: undefined as unknown as number,
	address: '',
	contributorEmail: '',
	honeypot: '',
};

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
		validators: { onSubmit: submissionSchema },
		onSubmit: async ({ value, formApi }) => {
			setSubmitError(null);
			setSubmitSuccess(false);
			try {
				await createSubmission({ data: value });
				const categoryLabel =
					categoryOptions.find((option) => option.value === value.category)
						?.label ?? value.category;
				await sendSubmissionNotification({
					data: {
						name: value.name,
						description: value.description,
						category: categoryLabel,
						deliveryYear: value.deliveryYear,
						address: value.address,
						contributorEmail: value.contributorEmail,
					},
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
									placeholder="Décrivez votre projet en quelques phrases (500 caractères max)"
									maxLength={500}
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
