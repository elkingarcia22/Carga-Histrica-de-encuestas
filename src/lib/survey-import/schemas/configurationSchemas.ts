import { z } from 'zod';
import type {
  SurveyType,
  SurveyVisibility,
  SurveyConfiguration,
} from '../../../types/survey-import';

import {
  isoTimestampSchema,
  importModeSchema,
  reviewStatusSchema,
} from './commonSchemas';

export const surveyTypeSchema: z.ZodType<SurveyType> = z.enum([
  'climate',
  'culture',
  'enps',
  'ai-adoption',
  'evaluation',
  'other'
]);

export const surveyVisibilitySchema: z.ZodType<SurveyVisibility> = z.enum([
  'public',
  'anonymous',
  'aggregated-only'
]);

export const surveyConfigurationSchema: z.ZodType<SurveyConfiguration> = z.object({
  name: z.string().min(1, 'Survey name cannot be empty'),
  surveyType: surveyTypeSchema,
  suggestedSurveyType: surveyTypeSchema.optional(),
  period: z.string().optional(),
  startDate: isoTimestampSchema.optional(),
  endDate: isoTimestampSchema.optional(),
  visibility: surveyVisibilitySchema,
  suggestedVisibility: surveyVisibilitySchema.optional(),
  confidentialityThreshold: z.number().int().nonnegative('Threshold must be non-negative'),
  sourceSummary: z.string(),
  confirmedMode: importModeSchema.optional(),
  reviewStatus: reviewStatusSchema,
}).strict();
