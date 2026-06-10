import { z } from 'zod';
import type {
  IssueSeverity,
  IssueResolutionStatus,
  IssueCategory,
  IssueSourceReference,
  ImportIssue,
} from '../../../types/survey-import';

import {
  issueIdSchema,
  importFileIdSchema,
  importSheetIdSchema,
  sourceFieldIdSchema,
} from './commonSchemas';

export const issueSeveritySchema: z.ZodType<IssueSeverity> = z.enum([
  'blocking',
  'review-required',
  'informational'
]);

export const issueResolutionStatusSchema: z.ZodType<IssueResolutionStatus> = z.enum([
  'open',
  'acknowledged',
  'resolved',
  'ignored',
  'not-applicable'
]);

export const issueCategorySchema: z.ZodType<IssueCategory> = z.enum([
  'file',
  'sheet',
  'field',
  'batch',
  'question',
  'scale',
  'demographic',
  'participant',
  'segment',
  'privacy',
  'analytics',
  'import'
]);

export const issueSourceReferenceSchema: z.ZodType<IssueSourceReference> = z.object({
  fileId: importFileIdSchema.optional(),
  sheetId: importSheetIdSchema.optional(),
  fieldId: sourceFieldIdSchema.optional(),
  rowIndex: z.number().int().nonnegative().optional(),
}).strict();

export const importIssueSchema: z.ZodType<ImportIssue> = z.object({
  id: issueIdSchema,
  code: z.string(),
  severity: issueSeveritySchema,
  category: issueCategorySchema,
  entity: z.string(),
  sourceReferences: z.array(issueSourceReferenceSchema),
  userMessage: z.string(),
  technicalDetail: z.string().optional(),
  recommendedAction: z.string().optional(),
  resolutionStatus: issueResolutionStatusSchema,
  isBlocking: z.boolean(),
  requiresHumanReview: z.boolean(),
}).strict();
