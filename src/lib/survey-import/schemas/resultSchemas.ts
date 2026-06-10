import { z } from 'zod';
import type { ImportResultStatus, ImportResultCounts, ImportResult } from '../../../types/survey-import';
import { isoTimestampSchema, countSchema, issueIdSchema } from './commonSchemas';
import { analyticCapabilitySchema } from './analyticsSchemas';

export const importResultStatusSchema: z.ZodType<ImportResultStatus> = z.enum([
  'completed',
  'partially-completed',
  'failed',
  'cancelled'
]);

export const importResultCountsSchema: z.ZodType<ImportResultCounts> = z.object({
  importedItems: countSchema,
  skippedItems: countSchema
}).strict();

const baseImportResultSchema = z.object({
  simulatedSurveyId: z.string().optional(),
  completionDate: isoTimestampSchema,
  counts: importResultCountsSchema,
  enabledCapabilities: z.array(analyticCapabilitySchema),
  finalIssueIds: z.array(issueIdSchema),
  conceptualErrorReport: z.string().optional(),
  nextAction: z.string().optional()
});

export const importResultCompletedSchema = baseImportResultSchema.extend({ status: z.literal('completed') }).strict();
export const importResultPartiallyCompletedSchema = baseImportResultSchema.extend({ status: z.literal('partially-completed') }).strict();
export const importResultFailedSchema = baseImportResultSchema.extend({ status: z.literal('failed') }).strict();
export const importResultCancelledSchema = baseImportResultSchema.extend({ status: z.literal('cancelled') }).strict().superRefine((val, ctx) => {
  if (val.simulatedSurveyId !== undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled results cannot have simulated survey ID', path: ['simulatedSurveyId'] });
  }
  if (val.counts.importedItems > 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled results cannot have imported items', path: ['counts', 'importedItems'] });
  }
  if (val.enabledCapabilities.length > 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled results cannot have enabled capabilities', path: ['enabledCapabilities'] });
  }
});

export const importResultSchema: z.ZodType<ImportResult> = z.discriminatedUnion('status', [
  importResultCompletedSchema,
  importResultPartiallyCompletedSchema,
  importResultFailedSchema,
  importResultCancelledSchema
]);
