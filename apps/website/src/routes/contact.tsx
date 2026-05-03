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
import { createContact } from '@/server/emails/contact';

export const Route = createFileRoute('/contact')({
	component: RouteComponent,
});

const contactSchema = z.object({
	firstName: z.string().min(1, 'Le prénom est requis'),
	lastName: z.string().min(1, 'Le nom est requis'),
	email: z.email('Adresse email invalide'),
	sector: z.string().min(1, "Le secteur d'activité est requis"),
	message: z.string().min(1, 'Le message est requis'),
});

const defaultValues: z.input<typeof contactSchema> = {
	firstName: '',
	lastName: '',
	email: '',
	sector: '',
	message: '',
};

const SECTOR_OPTIONS = [
	{ label: 'Paysagiste', value: 'paysagiste' },
	{ label: "Maîtrise d'ouvrage (MOA)", value: 'MOA' },
	{ label: "Maîtrise d'œuvre (MOE)", value: 'MOE' },
	{ label: 'Urbaniste', value: 'urbaniste' },
	{ label: 'Autre', value: 'autre' },
];

function RouteComponent() {
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues,
		validators: { onSubmit: contactSchema },
		onSubmit: async ({ value, formApi }) => {
			setSubmitError(null);
			setSubmitSuccess(false);
			try {
				await createContact({ data: value });
				formApi.reset();
				setSubmitSuccess(true);
			} catch {
				setSubmitError('Une erreur est survenue. Veuillez reessayer.');
			}
		},
	});

	return (
		<>
			<PageHeader
				eyebrow="Contact"
				title="Une question ?"
				description="Renseignez le formulaire ci-dessous. Notre équipe vous répondra dans les meilleurs délais."
			/>
			<Container maxW="container.md" py={{ base: 10, md: 16 }}>
				<Text mb={8} color="fg.muted">
					Vous souhaitez proposer un projet ?{' '}
					<Link asChild color="fg">
						<RouterLink to="/contribuer">Contribuer.</RouterLink>
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
						<form.AppField name="firstName">
							{(field) => (
								<field.TextField
									label="Prénom"
									placeholder="Votre prénom"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="lastName">
							{(field) => (
								<field.TextField label="Nom" placeholder="Votre nom" required />
							)}
						</form.AppField>
						<form.AppField name="email">
							{(field) => (
								<field.TextField
									label="Email"
									placeholder="vous@exemple.com"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="sector">
							{(field) => (
								<field.SelectField
									label="Secteur d'activité"
									placeholder="Choisir un secteur"
									options={SECTOR_OPTIONS}
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="message">
							{(field) => (
								<field.TextareaField
									label="Message"
									placeholder="Votre message…"
									required
								/>
							)}
						</form.AppField>
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" alignSelf="flex-start" px={6}>
									{isSubmitting ? 'Envoi…' : 'Envoyer'}
								</Button>
							)}
						</form.Subscribe>
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
										Merci, votre message a bien été envoyé. Notre équipe vous
										répondra rapidement.
									</Alert.Description>
								</Alert.Content>
							</Alert.Root>
						)}
					</Stack>
				</Box>
			</Container>
		</>
	);
}
