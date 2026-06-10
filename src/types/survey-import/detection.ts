/**
 * detection.ts
 *
 * Defines the AI or heuristic detection results for the import session.
 */

import type { ImportMode, ConfidenceScore, ReviewStatus, ImportSheetId, SourceFieldId, ImportFileId } from './common';
import type { IssueId } from './common';

export type EvidenceCategory =
  | 'sheet-name'
  | 'column-pattern'
  | 'row-shape'
  | 'value-distribution'
  | 'question-catalog'
  | 'participant-roster'
  | 'aggregate-triplet'
  | 'metadata'
  | 'manual-input';

export interface DetectionEvidence {
  readonly category: EvidenceCategory;
  /** Safe description of why this was detected, e.g., 'Sheet name matches "Respuestas"' */
  readonly description: string;
  readonly weight: number;
  readonly fileId?: ImportFileId;
  readonly sheetId?: ImportSheetId;
  readonly fieldId?: SourceFieldId;
}

export interface ImportDetection {
  readonly suggestedMode: ImportMode;
  readonly overallConfidence: ConfidenceScore;
  readonly evidences: readonly DetectionEvidence[];
  /** References to sheets that have been classified */
  readonly classifiedSheetIds: readonly ImportSheetId[];
  /** References to capabilities potentially unlocked by this data */
  readonly potentialCapabilities: readonly string[]; // Will refine with AnalyticsCapabilities later
  readonly relatedIssueIds: readonly IssueId[];
  readonly reviewStatus: ReviewStatus;
}
