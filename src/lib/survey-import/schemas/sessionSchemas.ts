import { z } from 'zod';
import type { ImportSession } from '../../../types/survey-import';

import {
  importSessionIdSchema,
  importSessionStatusSchema,
  wizardMacroStageSchema,
  isoTimestampSchema
} from './commonSchemas';

import {
  importSourceFileSchema,
  importSourceSheetSchema,
  importSourceFieldSchema
} from './sourceSchemas';

import { importDetectionSchema } from './detectionSchemas';
import { surveyConfigurationSchema } from './configurationSchemas';
import { importModeDataSchema } from './modeDataSchemas';
import { reviewProgressSchema } from './reviewSchemas';
import { importIssueSchema } from './issueSchemas';
import { importPreviewSchema } from './previewSchemas';
import { importResultSchema } from './resultSchemas';

export const importSessionSchema: z.ZodType<ImportSession> = z.object({
  id: importSessionIdSchema,
  status: importSessionStatusSchema,
  macroStage: wizardMacroStageSchema,
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  files: z.array(importSourceFileSchema),
  sheets: z.array(importSourceSheetSchema),
  fields: z.array(importSourceFieldSchema),
  detection: importDetectionSchema.optional(),
  configuration: surveyConfigurationSchema.optional(),
  data: importModeDataSchema,
  reviewProgress: reviewProgressSchema,
  issues: z.array(importIssueSchema),
  preview: importPreviewSchema.optional(),
  result: importResultSchema.optional(),
  isCancelled: z.boolean(),
  isCommitStarted: z.boolean()
}).strict().superRefine((val, ctx) => {
  // 1. Modo unknown
  if (val.data.mode === 'unknown') {
    const invalidUnknownStates = [
      'configuration-required', 'ready-for-preview', 'ready-to-import', 'importing'
    ];
    if (invalidUnknownStates.includes(val.status)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid state for unknown mode', path: ['status'] });
    }
    if (val.preview && val.preview.isConfirmationAllowed) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Unknown mode cannot have confirmable preview', path: ['preview', 'isConfirmationAllowed'] });
    }
    if (val.configuration && (val.configuration.confirmedMode === 'raw-individual' || val.configuration.confirmedMode === 'aggregated-comparison')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Unknown mode cannot have confirmed configuration for raw/aggregated', path: ['configuration', 'confirmedMode'] });
    }
  }

  // 1b. Modo raw-individual
  if (val.data.mode === 'raw-individual') {
    if (val.configuration && val.configuration.visibility === 'aggregated-only') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Raw-individual mode cannot use aggregated-only visibility', path: ['configuration', 'visibility'] });
    }
  }

  // 2. Modo agregado
  if (val.data.mode === 'aggregated-comparison') {
    if (val.configuration && val.configuration.visibility !== 'aggregated-only') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Aggregated mode must use aggregated-only visibility', path: ['configuration', 'visibility'] });
    }
    if (val.preview?.counts.associatedParticipants && val.preview.counts.associatedParticipants > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Aggregated mode preview cannot have participants', path: ['preview', 'counts', 'associatedParticipants'] });
    }
  }

  // 4. Preview
  const previewRequiredStates = ['ready-for-preview', 'ready-to-import', 'importing'];
  if (previewRequiredStates.includes(val.status) && !val.preview) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Preview required for this state', path: ['preview'] });
  }

  if (val.status === 'ready-to-import') {
    if (!val.preview?.isReady) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Preview must be ready', path: ['preview', 'isReady'] });
    }
    if (!val.preview?.isConfirmationAllowed) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Confirmation must be allowed', path: ['preview', 'isConfirmationAllowed'] });
    }
    const hasBlocking = val.issues.some(i => i.severity === 'blocking' && i.resolutionStatus === 'open');
    if (hasBlocking) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cannot be ready to import with open blocking issues', path: ['issues'] });
    }
  }

  // Si existe al menos un issue abierto con severidad `blocking`: isConfirmationAllowed debe ser false.
  if (val.preview?.isConfirmationAllowed) {
     const hasBlocking = val.issues.some(i => val.preview!.openIssueIds.includes(i.id) && i.severity === 'blocking');
     if (hasBlocking) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Confirmation not allowed with open blocking issues', path: ['preview', 'isConfirmationAllowed'] });
     }
  }

  // 5. Commit-start
  if (val.result) {
    if (['completed', 'partially-completed', 'failed'].includes(val.result.status)) {
      if (!val.isCommitStarted) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Commit must be started for final results', path: ['isCommitStarted'] });
      }
    }
    if (val.result.status === 'cancelled') {
      if (val.isCommitStarted) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled results cannot have commit started', path: ['isCommitStarted'] });
      }
    }
  }

  // 6. Resultado y estado
  if (val.status === 'completed' && val.result?.status !== 'completed') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Completed state must have completed result', path: ['result'] });
  }
  if (val.status === 'partially-completed' && val.result?.status !== 'partially-completed') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Partially completed state must have partially-completed result', path: ['result'] });
  }
  if (val.status === 'cancelled' && ['completed', 'partially-completed'].includes(val.result?.status || '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled state cannot have successful result', path: ['result'] });
  }

  const preImportStates = ['idle', 'files-selected', 'validating', 'profiling', 'classifying', 'detection-partial', 'configuration-required', 'ready-for-preview', 'ready-to-import', 'importing'];
  if (preImportStates.includes(val.status) && val.result?.status === 'completed') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Pre-import state cannot have completed result', path: ['result'] });
  }

  // 7. Cancelación
  if (val.isCancelled) {
    if (val.status !== 'cancelled') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled flag requires cancelled state', path: ['status'] });
    }
    if (val.isCommitStarted) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled session cannot have commit started', path: ['isCommitStarted'] });
    }
    if (val.result && ['completed', 'partially-completed'].includes(val.result.status)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cancelled session cannot have successful result', path: ['result'] });
    }
  }

  // 8. Timestamps
  if (new Date(val.updatedAt) < new Date(val.createdAt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'updatedAt cannot be earlier than createdAt', path: ['updatedAt'] });
  }
});
