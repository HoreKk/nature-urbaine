import {
	Alert,
	Box,
	Button,
	Container,
	Progress,
	SimpleGrid,
	Stack,
	Text,
} from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import { useAppForm } from '@/hooks/form-context';
import { getAllCategories } from '@/server/categories';
import {
	ARCHIVE_INVALID,
	ARCHIVE_MISSING,
	CONTRIBUTION_DESCRIPTION_MAX_LENGTH,
	CONTRIBUTION_MAX_PICTURES,
	CONTRIBUTION_MAX_SOURCE_PICTURE_BYTES,
	CONTRIBUTION_MAX_SOURCE_PICTURE_LABEL,
	clientContributionSchema,
} from '@/server/contribution-contract';
import {
	prepareContributionUpload,
	submitContribution,
} from '@/server/contributions';
import { submitErrorMessage } from '@/server/form-guard-contract';
import {
	buildContributionArchive,
	PHOTO_UNREADABLE,
	UPLOAD_FAILED,
	uploadArchive,
} from '@/utils/contribution-photos';

export const Route = createFileRoute('/contribuer')({
	component: RouteComponent,
	loader: async () => {
		const categories = await getAllCategories();
		return { categories };
	},
});

const defaultValues: z.input<typeof clientContributionSchema> = {
	title: '',
	description: '',
	category: '',
	projectOwner: '',
	projectManagement: '',
	deliveryYear: '',
	projectCost: '',
	projectArea: '',
	location: {},
	pictures: [],
	authorName: '',
	authorEmail: '',
	consent: false,
	honeypot: '',
};

type Progression =
	| { step: 'preparing'; done: number; total: number }
	| { step: 'uploading'; ratio: number }
	| { step: 'verifying' };

function describeProgress(progression: Progression): {
	label: string;
	value: number | null;
} {
	switch (progression.step) {
		case 'preparing':
			return {
				label: `Préparation des photos (${progression.done}/${progression.total})…`,
				value: (progression.done / progression.total) * 100,
			};
		case 'uploading':
			return {
				label: `Envoi des photos (${Math.round(progression.ratio * 100)} %)…`,
				value: progression.ratio * 100,
			};
		case 'verifying':
			return { label: 'Vérification de l’envoi…', value: null };
	}
}

function contributionErrorMessage(error: unknown): string {
	if (!(error instanceof Error)) return submitErrorMessage(error);
	if (error.message === PHOTO_UNREADABLE) {
		return `La photo « ${String(error.cause)} » n’a pas pu être lue. Enregistrez-la au format JPEG puis réessayez.`;
	}
	if (error.message === UPLOAD_FAILED) {
		return 'L’envoi des photos a échoué. Vérifiez votre connexion puis réessayez.';
	}
	if (error.message === ARCHIVE_INVALID || error.message === ARCHIVE_MISSING) {
		return 'Vos photos n’ont pas pu être vérifiées. Veuillez réessayer.';
	}
	return submitErrorMessage(error);
}

function RouteComponent() {
	const { categories } = Route.useLoaderData();
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [progression, setProgression] = useState<Progression | null>(null);
	const progress = progression && describeProgress(progression);
	const [mountedAt] = useState(() => Date.now());

	const categoryOptions = categories.map((cat) => ({
		label: cat.name,
		value: String(cat.id),
	}));

	const form = useAppForm({
		defaultValues,
		validators: { onSubmit: clientContributionSchema },
		onSubmit: async ({ value, formApi }) => {
			setSubmitError(null);
			setSubmitSuccess(false);
			const { pictures, honeypot, category, deliveryYear, ...fields } = value;
			try {
				const total = pictures.length;
				setProgression({ step: 'preparing', done: 0, total });
				const { archive, photosTakenAt } = await buildContributionArchive(
					pictures,
					(done) => setProgression({ step: 'preparing', done, total }),
				);

				const { upload } = await prepareContributionUpload({
					data: {
						archiveSize: archive.size,
						honeypot,
						fillMs: Date.now() - mountedAt,
					},
				});

				if (upload) {
					setProgression({ step: 'uploading', ratio: 0 });
					await uploadArchive(upload, archive, (ratio) =>
						setProgression({ step: 'uploading', ratio }),
					);

					setProgression({ step: 'verifying' });
					await submitContribution({
						data: {
							...fields,
							category: Number(category),
							deliveryYear:
								deliveryYear === '' ? undefined : Number(deliveryYear),
							photosTakenAt,
							uploadKey: upload.key,
						},
					});
				}

				formApi.reset();
				setSubmitSuccess(true);
			} catch (error) {
				setSubmitError(contributionErrorMessage(error));
			} finally {
				setProgression(null);
			}
		},
	});

	return (
		<>
			<PageHeader
				eyebrow="Contribuer"
				title="Proposez votre projet."
				description="Renseignez quelques informations sur votre projet. Notre équipe mettra en ligne vos photographies."
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
						<form.AppField name="title">
							{(field) => (
								<field.TextField
									label="Titre du projet"
									placeholder="Ex : PARIS, RUE DE LA PAIX"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="description">
							{(field) => (
								<field.TextareaField
									label="Description"
									placeholder={`Décrivez votre projet en quelques phrases (${CONTRIBUTION_DESCRIPTION_MAX_LENGTH} caractères max)`}
									maxLength={CONTRIBUTION_DESCRIPTION_MAX_LENGTH}
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
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
							<form.AppField name="projectOwner">
								{(field) => (
									<field.TextField
										label="Maître d’ouvrage"
										placeholder="Ex. Ville de Paris"
									/>
								)}
							</form.AppField>
							<form.AppField name="projectManagement">
								{(field) => (
									<field.TextField
										label="Maître d’œuvre"
										placeholder="Ex. Agence de paysage"
									/>
								)}
							</form.AppField>
						</SimpleGrid>
						<SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
							<form.AppField name="deliveryYear">
								{(field) => (
									<field.TextField
										label="Année de livraison"
										placeholder="Ex. 2022"
									/>
								)}
							</form.AppField>
							<form.AppField name="projectCost">
								{(field) => (
									<field.TextField label="Coût" placeholder="Ex. 1,2 M€ HT" />
								)}
							</form.AppField>
							<form.AppField name="projectArea">
								{(field) => (
									<field.TextField
										label="Superficie"
										placeholder="Ex. 4 500 m²"
									/>
								)}
							</form.AppField>
						</SimpleGrid>
						<form.AppField name="location">
							{(field) => (
								<field.AddressAutocompleteField
									label="Adresse"
									placeholder="Ex. 12 rue de la Paix, Paris"
								/>
							)}
						</form.AppField>
						<form.AppField name="pictures">
							{(field) => (
								<field.FilesField
									label="Photographies"
									accept={['image/*']}
									maxFiles={CONTRIBUTION_MAX_PICTURES}
									maxFileSize={CONTRIBUTION_MAX_SOURCE_PICTURE_BYTES}
									helperText={`Formats image uniquement, ${CONTRIBUTION_MAX_PICTURES} photos maximum, ${CONTRIBUTION_MAX_SOURCE_PICTURE_LABEL} par photo.`}
									required
								/>
							)}
						</form.AppField>
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
							<form.AppField name="authorName">
								{(field) => (
									<field.TextField
										label="Auteur des photographies"
										placeholder="Prénom Nom"
										required
									/>
								)}
							</form.AppField>
							<form.AppField name="authorEmail">
								{(field) => (
									<field.TextField
										label="Email de l’auteur"
										placeholder="vous@exemple.com"
										required
									/>
								)}
							</form.AppField>
						</SimpleGrid>
						<form.AppField name="consent">
							{(field) => (
								<field.CheckboxField
									label="Je certifie être l’auteur de ces photographies et j’autorise Nature Urbaine à les publier avec mention de mon nom."
									required
								/>
							)}
						</form.AppField>
						<Text color="fg.muted" fontSize="sm">
							Votre adresse email sert uniquement à vous prévenir de la mise en
							ligne de vos photographies, ou de la raison d’un refus. Elle n’est
							jamais publiée.
						</Text>
						<form.AppField name="honeypot">
							{(field) => <field.HoneypotField />}
						</form.AppField>
						{progress && (
							<Progress.Root
								value={progress.value}
								size="sm"
								colorPalette="primary"
							>
								<Progress.Label mb={2} fontWeight={400} color="fg.muted">
									{progress.label}
								</Progress.Label>
								<Progress.Track>
									<Progress.Range />
								</Progress.Track>
							</Progress.Root>
						)}
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
										Merci, vos photographies ont bien été envoyées. Nous vous
										écrirons dès leur mise en ligne.
									</Alert.Description>
								</Alert.Content>
							</Alert.Root>
						)}
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									alignSelf="flex-start"
									px={6}
									loading={isSubmitting}
									loadingText="Envoi…"
								>
									Envoyer ma contribution
								</Button>
							)}
						</form.Subscribe>
					</Stack>
				</Box>
			</Container>
		</>
	);
}
