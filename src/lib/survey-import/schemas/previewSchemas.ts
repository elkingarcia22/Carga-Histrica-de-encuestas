import { z } from 'zod';
import type { ImportPreviewCounts, ImportPreview } from '../../../types/survey-import';
import { countSchema, issueIdSchema, importModeSchema } from './commonSchemas';
import { surveyConfigurationSchema } from './configurationSchemas';
import { analyticCapabilitySchema } from './analyticsSchemas';

export const importPreviewCountsSchema: z.ZodType<ImportPreviewCounts> = z.object({
  totalFiles: countSchema,
  usedSheets: countSchema,
  ignoredSheets: countSchema,
  associatedQuestions: countSchema,
  newQuestions: countSchema,
  pendingQuestions: countSchema,
  associatedDemographics: countSchema,
  newDemographics: countSchema,
  associatedParticipants: countSchema,
  externalParticipants: countSchema,
  associatedSegments: countSchema,
  newSegments: countSchema,
  conflicts: countSchema,
  warnings: countSchema,
  blockingErrors: countSchema
}).strict();

export const importPreviewSchema: z.ZodType<ImportPreview> = z.object({
  mode: importModeSchema,
  configuration: surveyConfigurationSchema,
  capabilities: z.array(analyticCapabilitySchema),
  counts: importPreviewCountsSchema,
  openIssueIds: z.array(issueIdSchema),
  limitations: z.array(z.string()),
  isReady: z.boolean(),
  isConfirmationAllowed: z.boolean()
}).strict().superRefine((val, ctx) => {
  if (val.counts.blockingErrors > 0 && val.isConfirmationAllowed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Confirmation not allowed when there are blocking errors',
      path: ['isConfirmationAllowed']
    });
  }
  if (!val.isReady && val.isConfirmationAllowed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Confirmation not allowed when preview is not ready',
      path: ['isConfirmationAllowed']
    });
  }
});
