import { z } from 'zod';
import type {
  DemographicType,
  DemographicAction,
  DemographicValueEquivalence,
  CanonicalDemographic
} from '../../../types/survey-import';

import {
  demographicIdSchema,
  confidenceScoreSchema,
  matchStatusSchema,
  reviewStatusSchema,
  issueIdSchema
} from './commonSchemas';

export const demographicTypeSchema: z.ZodType<DemographicType> = z.enum([
  'categorical',
  'hierarchical',
  'numeric-range',
  'date-derived',
  'unknown'
]);

export const demographicActionSchema: z.ZodType<DemographicAction> = z.enum([
  'associate',
  'create',
  'ignore',
  'block'
]);

export const demographicValueEquivalenceSchema: z.ZodType<DemographicValueEquivalence> = z.object({
  originalValue: z.string(),
  normalizedValue: z.string(),
  suggestedUbitsValueId: z.string().optional(),
  confidence: confidenceScoreSchema,
  reviewStatus: reviewStatusSchema
}).strict();

export const canonicalDemographicSchema: z.ZodType<CanonicalDemographic> = z.object({
  internalId: demographicIdSchema,
  originalName: z.string(),
  normalizedName: z.string(),
  type: demographicTypeSchema,
  originalValues: z.array(z.string()),
  normalizedValues: z.array(z.string()),
  suggestedUbitsMatchId: z.string().optional(),
  matchConfidence: confidenceScoreSchema,
  valueEquivalences: z.array(demographicValueEquivalenceSchema),
  matchStatus: matchStatusSchema,
  reviewStatus: reviewStatusSchema,
  action: demographicActionSchema,
  relatedIssueIds: z.array(issueIdSchema)
}).strict();
