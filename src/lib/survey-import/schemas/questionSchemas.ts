import { z } from 'zod';
import type {
  QuestionType,
  LikertScale,
  NpsScale,
  LinearScale,
  StarsScale,
  EmotionScale,
  CategoricalScale,
  NoScale,
  QuestionScale,
  QuestionAction,
  CanonicalQuestion
} from '../../../types/survey-import';

import {
  surveyQuestionIdSchema,
  confidenceScoreSchema,
  matchStatusSchema,
  reviewStatusSchema,
  issueIdSchema
} from './commonSchemas';
import { detectionEvidenceSchema } from './detectionSchemas';

export const questionTypeSchema: z.ZodType<QuestionType> = z.enum([
  'likert',
  'nps',
  'open-text',
  'single-choice',
  'multiple-choice',
  'dropdown',
  'stars',
  'emotion',
  'linear',
  'unknown'
]);

const scaleBaseSchema = z.object({
  originalRange: z.tuple([z.number(), z.number()]).optional(),
  canonicalRange: z.tuple([z.number(), z.number()]).optional(),
  suggestedTransformationRule: z.string().optional(),
  transformationRequiresReview: z.boolean(),
  confirmationStatus: reviewStatusSchema
}).strict();

export const likertScaleSchema: z.ZodType<LikertScale> = scaleBaseSchema.extend({
  kind: z.literal('likert'),
  points: z.number().int().min(2)
}).strict();

export const npsScaleSchema: z.ZodType<NpsScale> = scaleBaseSchema.extend({
  kind: z.literal('nps')
}).strict();

export const linearScaleSchema: z.ZodType<LinearScale> = scaleBaseSchema.extend({
  kind: z.literal('linear')
}).strict();

export const starsScaleSchema: z.ZodType<StarsScale> = scaleBaseSchema.extend({
  kind: z.literal('stars'),
  maxStars: z.number().int().min(1)
}).strict();

export const emotionScaleSchema: z.ZodType<EmotionScale> = scaleBaseSchema.extend({
  kind: z.literal('emotion')
}).strict();

export const categoricalScaleSchema: z.ZodType<CategoricalScale> = scaleBaseSchema.extend({
  kind: z.literal('categorical'),
  options: z.array(z.string())
}).strict();

export const noScaleSchema: z.ZodType<NoScale> = scaleBaseSchema.extend({
  kind: z.literal('no-scale')
}).strict();

export const questionScaleSchema: z.ZodType<QuestionScale> = z.union([
  likertScaleSchema,
  npsScaleSchema,
  linearScaleSchema,
  starsScaleSchema,
  emotionScaleSchema,
  categoricalScaleSchema,
  noScaleSchema
]);

export const questionActionSchema: z.ZodType<QuestionAction> = z.enum(['import', 'ignore', 'block']);

export const canonicalQuestionSchema: z.ZodType<CanonicalQuestion> = z.object({
  internalId: surveyQuestionIdSchema,
  externalId: z.string().optional(),
  normalizedText: z.string(),
  originalText: z.string(),
  questionType: questionTypeSchema,
  scale: questionScaleSchema,
  dimensionOrSection: z.string().optional(),
  suggestedUbitsMatchId: z.string().optional(),
  matchConfidence: confidenceScoreSchema,
  matchEvidences: z.array(detectionEvidenceSchema),
  matchStatus: matchStatusSchema,
  reviewStatus: reviewStatusSchema,
  relatedIssueIds: z.array(issueIdSchema),
  action: questionActionSchema
}).strict();
