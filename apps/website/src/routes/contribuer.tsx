import { Box, Button, Container, Link, Stack, Text } from '@chakra-ui/react';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import { useAppForm } from '@/hooks/form-context';

export const Route = createFileRoute('/contribuer')({
	component: RouteComponent,
});

const submissionSchema = z.object({
	name: z.string().min(1, 'Le titre du projet est requis'),
	description: z
		.string()
		.min(1, 'La description est requise')
		.max(500, 'La description ne doit pas dépasser 500 caractères'),
	category: z.string().min(1, 'La catégorie est requise'),
	deliveryYear: z
		.number({ message: "L'année de livraison est requise" })
		.int()
		.min(1900)
		.max(2100),
	address: z.string().min(1, "L'adresse est requise"),
	contributorEmail: z.email('Adresse email invalide'),
});

const defaultValues: z.input<typeof submissionSchema> = {
	name: '',
	description: '',
	category: '',
	deliveryYear: '' as unknown as number,
	address: '',
	contributorEmail: '',
};

const CATEGORY_OPTIONS = [
	{ label: 'Parc urbain', value: 'parc-urbain' },
	{ label: 'Jardin partagé', value: 'jardin-partage' },
	{ label: 'Toit végétalisé', value: 'toit-vegetalise' },
	{ label: 'Mur végétal', value: 'mur-vegetal' },
	{ label: 'Coulée verte', value: 'coulee-verte' },
	{ label: 'Place végétalisée', value: 'place-vegetalisee' },
	{ label: 'Forêt urbaine', value: 'foret-urbaine' },
	{ label: 'Corridor écologique', value: 'corridor-ecologique' },
	{ label: 'Agriculture urbaine', value: 'agriculture-urbaine' },
	{ label: 'Berge renaturée', value: 'berge-renaturee' },
	{ label: 'Aire de jeux naturelle', value: 'aire-jeux-naturelle' },
	{ label: 'Autre', value: 'autre' },
];

function RouteComponent() {
	const form = useAppForm({
		defaultValues,
		validators: { onSubmit: submissionSchema },
		onSubmit: ({ value, formApi }) => {
			console.log('Submission:', value);
			formApi.reset();
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
									options={CATEGORY_OPTIONS}
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
								<field.TextField
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
