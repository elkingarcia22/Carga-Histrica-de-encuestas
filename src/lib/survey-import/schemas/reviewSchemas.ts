import { z } from 'zod';
import type { ReviewProgressDetails, ReviewProgress } from '../../../types/survey-import';
import { countSchema } from './commonSchemas';

export const reviewProgressDetailsSchema: z.ZodType<ReviewProgressDetails> = z.object({
  total: countSchema,
  confirmed: countSchema,
  modified: countSchema,
  pending: countSchema,
  conflicting: countSchema,
  ignored: countSchema,
  blocking: countSchema
}).strict().superRefine((val, ctx) => {
  const sumStates = val.confirmed + val.modified + val.pending + val.conflicting + val.ignored;
  if (sumStates > val.total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sum of states cannot exceed total',
      path: ['total']
    });
  }
  if (val.blocking > val.total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Blocking count cannot exceed total',
      path: ['blocking']
    });
  }
});

export const reviewProgressSchema: z.ZodType<ReviewProgress> = z.object({
  overall: reviewProgressDetailsSchema,
  byQuestion: reviewProgressDetailsSchema,
  byDemographic: reviewProgressDetailsSchema,
  byParticipant: reviewProgressDetailsSchema,
  bySegment: reviewProgressDetailsSchema
}).strict();
