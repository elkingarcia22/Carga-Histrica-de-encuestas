import { z } from 'zod';
import type {
  FileExtension,
  FileValidationStatus,
  FileAnalysisStatus,
  FileAcceptanceStatus,
  ImportSourceFile,
  SheetSuggestedRole,
  SheetStatus,
  ImportSourceSheet,
  FieldDetectedType,
  FieldSuggestedRole,
  ImportSourceField,
} from '../../../types/survey-import';

import {
  importFileIdSchema,
  importSheetIdSchema,
  sourceFieldIdSchema,
  isoTimestampSchema,
  countSchema,
  confidenceScoreSchema,
  reviewStatusSchema,
  issueIdSchema,
} from './commonSchemas';

// --- File Schemas ---

export const fileExtensionSchema: z.ZodType<FileExtension> = z.enum([
  'xlsx',
  'xls',
  'csv',
  'unknown'
]);

export const fileValidationStatusSchema: z.ZodType<FileValidationStatus> = z.enum([
  'pending',
  'valid',
  'invalid',
  'warning'
]);

export const fileAnalysisStatusSchema: z.ZodType<FileAnalysisStatus> = z.enum([
  'pending',
  'analyzing',
  'completed',
  'failed'
]);

export const fileAcceptanceStatusSchema: z.ZodType<FileAcceptanceStatus> = z.enum([
  'accepted',
  'rejected',
  'ignored',
  'deleted',
  'pending'
]);

export const importSourceFileSchema: z.ZodType<ImportSourceFile> = z.object({
  id: importFileIdSchema,
  visibleName: z.string().min(1, 'Visible name cannot be empty'),
  extension: fileExtensionSchema,
  mimeType: z.string(),
  sizeBytes: z.number().int('Size must be an integer').nonnegative('Size cannot be negative'),
  lastModified: isoTimestampSchema.optional(),
  validationStatus: fileValidationStatusSchema,
  analysisStatus: fileAnalysisStatusSchema,
  acceptanceStatus: fileAcceptanceStatusSchema,
  detectedSheetIds: z.array(importSheetIdSchema),
  relatedIssueIds: z.array(issueIdSchema),
}).strict();

// --- Sheet Schemas ---

export const sheetSuggestedRoleSchema: z.ZodType<SheetSuggestedRole> = z.enum([
  'responses',
  'questions-catalog',
  'participants-roster',
  'organizational-hierarchy',
  'aggregated-results',
  'demographic-cross-tab',
  'metadata',
  'unknown',
  'ignored'
]);

export const sheetStatusSchema: z.ZodType<SheetStatus> = z.enum([
  'pending',
  'active',
  'ignored',
  'error'
]);

export const importSourceSheetSchema: z.ZodType<ImportSourceSheet> = z.object({
  id: importSheetIdSchema,
  fileId: importFileIdSchema,
  name: z.string().min(1, 'Sheet name cannot be empty'),
  index: z.number().int().nonnegative('Index must be non-negative'),
  approximateRowCount: countSchema,
  approximateColumnCount: countSchema,
  suggestedRole: sheetSuggestedRoleSchema,
  roleConfidence: confidenceScoreSchema,
  status: sheetStatusSchema,
  relatedIssueIds: z.array(issueIdSchema),
}).strict();

// --- Field Schemas ---

export const fieldDetectedTypeSchema: z.ZodType<FieldDetectedType> = z.enum([
  'text',
  'number',
  'boolean',
  'date',
  'identifier',
  'percentage',
  'categorical',
  'unknown'
]);

export const fieldSuggestedRoleSchema: z.ZodType<FieldSuggestedRole> = z.enum([
  'question',
  'demographic',
  'participant-identifier',
  'metadata',
  'segment-identifier',
  'aggregate-value',
  'unknown',
  'ignored'
]);

export const importSourceFieldSchema: z.ZodType<ImportSourceField> = z.object({
  id: sourceFieldIdSchema,
  sheetId: importSheetIdSchema,
  originalName: z.string(),
  normalizedName: z.string(),
  position: z.number().int().nonnegative('Position must be non-negative'),
  detectedType: fieldDetectedTypeSchema,
  sanitizedSamples: z.array(z.string().max(255, 'Sample is too long')).max(5, 'Maximum of 5 samples allowed').optional(),
  suggestedRole: fieldSuggestedRoleSchema,
  roleConfidence: confidenceScoreSchema,
  reviewStatus: reviewStatusSchema,
}).strict();
