import { RiCameraLensLine, RiMicLine } from 'react-icons/ri';
import type { SafeInterview } from '@/server/interviews';
import type { AugmentedReport } from '@/server/report-catalog';
import { getBackendUrl } from '@/utils/backend-url';

export const reportToProjectCardProps = (report: AugmentedReport) => ({
	to: '/reports/$id',
	params: { id: report.id.toString() },
	title: report.name,
	description: report.description,
	date: report.date,
	imageSrc: report.frontPicture?.url
		? getBackendUrl(report.frontPicture.url)
		: undefined,
	imageAlt: report.frontPicture?.alt || report.name,
	badge: report.category.name,
	footerIcon: RiCameraLensLine,
	footerLabel: 'Reportage',
	readMoreLabel: 'Lire plus',
});

const getInitials = (fullName: string) =>
	fullName
		.split(' ')
		.map((part) => part[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

export const interviewToProjectCardProps = (interview: SafeInterview) => ({
	to: '/interviews/$id',
	params: { id: interview.id.toString() },
	title: interview.name,
	description: interview.summary,
	date: interview.publishedAt,
	imageSrc: interview.thumbnail?.url
		? getBackendUrl(interview.thumbnail.url)
		: undefined,
	imageAlt: interview.thumbnail?.alt || interview.name,
	location: interview.department
		? `${interview.city} — ${interview.department}`
		: interview.city,
	footerIcon: RiMicLine,
	footerLabel: 'Interview',
	readMoreLabel: "Lire l'interview",
	portrait: {
		src: interview.intervieweePicture?.url
			? getBackendUrl(interview.intervieweePicture.url)
			: undefined,
		alt: interview.intervieweePicture?.alt || interview.interviewee,
		initials: getInitials(interview.interviewee),
	},
});
