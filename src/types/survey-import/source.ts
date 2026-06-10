/**
 * source.ts
 *
 * Defines the original data source structure (files, sheets, fields).
 * Keeps raw browser/parser objects decoupled from the canonical state.
 */

import type { ImportFileId, ImportSheetId, SourceFieldId, ConfidenceScore, ReviewStatus, Count, IsoTimestamp } from './common';
import type { IssueId } from './common';

export type FileExtension = 'xlsx' | 'xls' | 'csv' | 'unknown';

export type FileValidationStatus = 'pending' | 'valid' | 'invalid' | 'warning';
export type FileAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type FileAcceptanceStatus = 'accepted' | 'rejected' | 'ignored' | 'deleted' | 'pending';

export interface ImportSourceFile {
  readonly id: ImportFileId;
  readonly visibleName: string;
  readonly extension: FileExtension;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly lastModified?: IsoTimestamp;
  readonly validationStatus: FileValidationStatus;
  readonly analysisStatus: FileAnalysisStatus;
  readonly acceptanceStatus: FileAcceptanceStatus;
  readonly detectedSheetIds: readonly ImportSheetId[];
  readonly relatedIssueIds: readonly IssueId[];
}

export type SheetSuggestedRole =
  | 'responses'
  | 'questions-catalog'
  | 'participants-roster'
  | 'organizational-hierarchy'
  | 'aggregated-results'
  | 'demographic-cross-tab'
  | 'metadata'
  | 'unknown'
  | 'ignored';

export type SheetStatus = 'pending' | 'active' | 'ignored' | 'error';

export interface ImportSourceSheet {
  readonly id: ImportSheetId;
  readonly fileId: ImportFileId;
  readonly name: string;
  readonly index: number;
  readonly approximateRowCount: Count;
  readonly approximateColumnCount: Count;
  readonly suggestedRole: SheetSuggestedRole;
  readonly roleConfidence: ConfidenceScore;
  readonly status: SheetStatus;
  readonly relatedIssueIds: readonly IssueId[];
}

export type FieldDetectedType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'identifier'
  | 'percentage'
  | 'categorical'
  | 'unknown';

export type FieldSuggestedRole =
  | 'question'
  | 'demographic'
  | 'participant-identifier'
  | 'metadata'
  | 'segment-identifier'
  | 'aggregate-value'
  | 'unknown'
  | 'ignored';

export interface ImportSourceField {
  readonly id: SourceFieldId;
  readonly sheetId: ImportSheetId;
  readonly originalName: string;
  readonly normalizedName: string;
  readonly position: number;
  readonly detectedType: FieldDetectedType;
  /** Sanitized samples must not contain PII or sensitive data. Useful for debugging or UI hints */
  readonly sanitizedSamples?: readonly string[];
  readonly suggestedRole: FieldSuggestedRole;
  readonly roleConfidence: ConfidenceScore;
  readonly reviewStatus: ReviewStatus;
}
