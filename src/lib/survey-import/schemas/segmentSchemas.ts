import { z } from 'zod';
import type {
  SegmentType,
  CanonicalSegment
} from '../../../types/survey-import';

import {
  segmentIdSchema,
  demographicIdSchema,
  confidenceScoreSchema,
  matchStatusSchema,
  reviewStatusSchema,
  countSchema,
  percentageSchema,
  issueIdSchema
} from './commonSchemas';

export const segmentTypeSchema: z.ZodType<SegmentType> = z.enum([
  'organization',
  'area',
  'department',
  'management',
  'demographic',
  'overall',
  'unknown'
]);

export const canonicalSegmentSchema: z.ZodType<CanonicalSegment> = z.object({
  internalId: segmentIdSchema,
  type: segmentTypeSchema,
  name: z.string(),
  code: z.string().optional(),
  relatedDemographicId: demographicIdSchema.optional(),
  demographicValue: z.string().optional(),
  sampleSize: countSchema,
  participationRate: percentageSchema.optional(),
  period: z.string().optional(),
  suggestedUbitsMatchId: z.string().optional(),
  matchConfidence: confidenceScoreSchema,
  matchStatus: matchStatusSchema,
  reviewStatus: reviewStatusSchema,
  relatedIssueIds: z.array(issueIdSchema)
}).strict();
