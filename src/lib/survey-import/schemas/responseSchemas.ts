import { z } from 'zod';
import type {
  ResponseValueType,
  RawResponse
} from '../../../types/survey-import';

import {
  participantIdSchema,
  surveyQuestionIdSchema
} from './commonSchemas';

export const responseValueTypeSchema: z.ZodType<ResponseValueType> = z.enum([
  'numeric',
  'text',
  'single-choice',
  'multiple-choice',
  'no-response'
]);

export const rawResponseSchema: z.ZodType<RawResponse> = z.object({
  participantId: participantIdSchema,
  questionId: surveyQuestionIdSchema,
  valueType: responseValueTypeSchema,
  numericValue: z.number().optional(),
  textValue: z.string().optional(),
  choiceValues: z.array(z.string()).optional()
}).strict();
