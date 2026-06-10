import { z } from 'zod';
import type {
  EvidenceCategory,
  DetectionEvidence,
  ImportDetection,
} from '../../../types/survey-import';

import {
  importModeSchema,
  confidenceScoreSchema,
  reviewStatusSchema,
  importFileIdSchema,
  importSheetIdSchema,
  sourceFieldIdSchema,
  issueIdSchema,
} from './commonSchemas';

export const evidenceCategorySchema: z.ZodType<EvidenceCategory> = z.enum([
  'sheet-name',
  'column-pattern',
  'row-shape',
  'value-distribution',
  'question-catalog',
  'participant-roster',
  'aggregate-triplet',
  'metadata',
  'manual-input'
]);

export const detectionEvidenceSchema: z.ZodType<DetectionEvidence> = z.object({
  category: evidenceCategorySchema,
  description: z.string(),
  weight: z.number().min(0).max(10, 'Weight must be reasonable'), // basic sanity limit
  fileId: importFileIdSchema.optional(),
  sheetId: importSheetIdSchema.optional(),
  fieldId: sourceFieldIdSchema.optional(),
}).strict();

export const importDetectionSchema: z.ZodType<ImportDetection> = z.object({
  suggestedMode: importModeSchema,
  overallConfidence: confidenceScoreSchema,
  evidences: z.array(detectionEvidenceSchema),
  classifiedSheetIds: z.array(importSheetIdSchema),
  potentialCapabilities: z.array(z.string()),
  relatedIssueIds: z.array(issueIdSchema),
  reviewStatus: reviewStatusSchema,
}).strict();
