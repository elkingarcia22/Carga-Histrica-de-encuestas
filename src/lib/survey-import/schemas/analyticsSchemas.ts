import { z } from 'zod';
import type {
  AnalyticCapabilityType,
  CapabilityStatus,
  AnalyticCapability,
  SentimentDistribution,
  AggregatedResult
} from '../../../types/survey-import';

import {
  percentageSchema,
  countSchema,
  surveyQuestionIdSchema,
  segmentIdSchema
} from './commonSchemas';
import { detectionEvidenceSchema } from './detectionSchemas';

export const analyticCapabilityTypeSchema: z.ZodType<AnalyticCapabilityType> = z.enum([
  'participation',
  'favorability',
  'questions',
  'responses',
  'comments',
  'nps',
  'demographics',
  'heatmap',
  'ai-analysis',
  'dimensions',
  'response-distribution',
  'area-comparison',
  'demographic-comparison',
  'trends'
]);

export const capabilityStatusSchema: z.ZodType<CapabilityStatus> = z.enum([
  'available',
  'partial',
  'unavailable'
]);

export const analyticCapabilitySchema: z.ZodType<AnalyticCapability> = z.object({
  type: analyticCapabilityTypeSchema,
  status: capabilityStatusSchema,
  reason: z.string().optional(),
  evidences: z.array(detectionEvidenceSchema),
  missingRequirements: z.array(z.string()),
  limitations: z.array(z.string())
}).strict();

export const sentimentDistributionSchema: z.ZodType<SentimentDistribution> = z.object({
  positivePercentage: percentageSchema.optional(),
  neutralPercentage: percentageSchema.optional(),
  negativePercentage: percentageSchema.optional(),
  noResponsePercentage: percentageSchema.optional(),
  positiveCount: countSchema.optional(),
  neutralCount: countSchema.optional(),
  negativeCount: countSchema.optional(),
  noResponseCount: countSchema.optional()
}).strict().superRefine((val, ctx) => {
  const p = val.positivePercentage;
  const n = val.neutralPercentage;
  const ng = val.negativePercentage;
  const nr = val.noResponsePercentage;
  const hasSome = p !== undefined || n !== undefined || ng !== undefined || nr !== undefined;
  if (hasSome) {
     const total = (p || 0) + (n || 0) + (ng || 0) + (nr || 0);
     if (p !== undefined && n !== undefined && ng !== undefined) {
         if (Math.abs(total - 100) > 0.01) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'La suma de porcentajes debe ser 100 (tolerancia 0.01)',
              path: []
            });
         }
     } else if (total > 100.01) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La suma de porcentajes no puede exceder 100',
            path: []
         });
     }
  }
});

export const aggregatedResultSchema: z.ZodType<AggregatedResult> = z.object({
  questionId: surveyQuestionIdSchema.optional(),
  segmentId: segmentIdSchema.optional(),
  dimension: z.string().optional(),
  overallScore: z.number().optional(),
  distribution: sentimentDistributionSchema.optional(),
  totalResponses: countSchema,
  participationRate: percentageSchema.optional(),
  period: z.string().optional()
}).strict();
