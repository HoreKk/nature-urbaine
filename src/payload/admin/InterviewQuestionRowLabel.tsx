'use client';

import { useRowLabel } from '@payloadcms/ui';
import { interviewQuestionRowLabel } from '../collections/interview-questions';

export const InterviewQuestionRowLabel = () => {
	const { data, rowNumber: rowIndex = 0 } = useRowLabel<{
		question?: string;
	}>();
	return <span>{interviewQuestionRowLabel(data?.question, rowIndex)}</span>;
};
