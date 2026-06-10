import { z } from 'zod';
import type { ImportModeData } from '../../../types/survey-import';

import { canonicalQuestionSchema } from './questionSchemas';
import { canonicalDemographicSchema } from './demographicSchemas';
import { canonicalParticipantSchema } from './participantSchemas';
import { canonicalSegmentSchema } from './segmentSchemas';
import { rawResponseSchema } from './responseSchemas';
import { aggregatedResultSchema } from './analyticsSchemas';

export const rawImportDataSchema = z.object({
  mode: z.literal('raw-individual'),
  questions: z.array(canonicalQuestionSchema),
  demographics: z.array(canonicalDemographicSchema),
  participants: z.array(canonicalParticipantSchema),
  responses: z.array(rawResponseSchema)
}).strict();

export const aggregatedImportDataSchema = z.object({
  mode: z.literal('aggregated-comparison'),
  questions: z.array(canonicalQuestionSchema),
  demographics: z.array(canonicalDemographicSchema),
  segments: z.array(canonicalSegmentSchema),
  aggregatedResults: z.array(aggregatedResultSchema)
}).strict();

export const unknownImportDataSchema = z.object({
  mode: z.literal('unknown')
}).strict();

export const importModeDataSchema: z.ZodType<ImportModeData> = z.discriminatedUnion('mode', [
  rawImportDataSchema,
  aggregatedImportDataSchema,
  unknownImportDataSchema
]);
