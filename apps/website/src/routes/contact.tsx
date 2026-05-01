import { Box, Button, Container, Stack } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import { useAppForm } from '@/hooks/form-context';

export const Route = createFileRoute('/contact')({
	component: RouteComponent,
});

const contributionSchema = z.object({
	name: z.string().min(1, 'Le nom est requis'),
	email: z.email('Adresse email invalide'),
	projectTitle: z.string().min(1, 'Le titre du projet est requis'),
	city: z.string().min(1, 'La ville est requise'),
	description: z
		.string()
		.min(20, 'La description doit contenir au moins 20 caractères'),
});

const defaultValues: z.input<typeof contributionSchema> = {
	name: '',
	email: '',
	projectTitle: '',
	city: '',
	description: '',
};

function RouteComponent() {
	const form = useAppForm({
		defaultValues,
		validators: { onSubmit: contributionSchema },
		onSubmit: ({ value, formApi }) => {
			console.log('Contribution submitted:', value);
			formApi.reset();
		},
	});

	return (
		<>
			<PageHeader
				eyebrow="Contact · Contribution"
				title="Proposez votre projet."
				description="Renseignez quelques informations sur votre projet. Notre équipe revient vers vous après validation pour la mise en forme et la publication."
			/>
			<Container maxW="container.md" py={{ base: 10, md: 16 }}>
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
								<field.TextField label="Nom" placeholder="Votre nom" />
							)}
						</form.AppField>
						<form.AppField name="email">
							{(field) => (
								<field.TextField label="Email" placeholder="vous@exemple.com" />
							)}
						</form.AppField>
						<form.AppField name="projectTitle">
							{(field) => (
								<field.TextField
									label="Titre du projet"
									placeholder="Ex. Réaménagement de la place Jourdan"
								/>
							)}
						</form.AppField>
						<form.AppField name="city">
							{(field) => (
								<field.TextField label="Ville" placeholder="Ex. Paris" />
							)}
						</form.AppField>
						<form.AppField name="description">
							{(field) => (
								<field.TextField
									label="Description"
									placeholder="Décrivez votre projet en quelques phrases"
								/>
							)}
						</form.AppField>
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
