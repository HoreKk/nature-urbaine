import { describe, expect, it } from 'vitest';
import {
	DEFAULT_INTERVIEW_QUESTIONS,
	interviewQuestionRowLabel,
} from './interview-questions';

describe('interviewQuestionRowLabel', () => {
	it('falls back to a numbered label while the question is empty', () => {
		expect(interviewQuestionRowLabel(undefined, 0)).toBe('Question 1');
		expect(interviewQuestionRowLabel('   ', 2)).toBe('Question 3');
	});

	it('shows a short question as is', () => {
		expect(interviewQuestionRowLabel('  Quel budget ? ', 0)).toBe(
			'Quel budget ?',
		);
	});

	it('cuts a long question with an ellipsis', () => {
		const label = interviewQuestionRowLabel(DEFAULT_INTERVIEW_QUESTIONS[0], 0);
		expect(label.length).toBeLessThanOrEqual(60);
		expect(label.endsWith('…')).toBe(true);
	});
});
