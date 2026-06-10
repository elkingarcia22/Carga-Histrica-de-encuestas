/**
 * issues.ts
 *
 * Defines contracts for issues (errors, warnings, info) detected during the import process.
 */

import type { IssueId, ImportFileId, ImportSheetId, SourceFieldId } from './common';

export type IssueSeverity = 'blocking' | 'review-required' | 'informational';

export type IssueResolutionStatus =
  | 'open'
  | 'acknowledged'
  | 'resolved'
  | 'ignored'
  | 'not-applicable';

export type IssueCategory =
  | 'file'
  | 'sheet'
  | 'field'
  | 'batch'
  | 'question'
  | 'scale'
  | 'demographic'
  | 'participant'
  | 'segment'
  | 'privacy'
  | 'analytics'
  | 'import';

export interface IssueSourceReference {
  readonly fileId?: ImportFileId;
  readonly sheetId?: ImportSheetId;
  readonly fieldId?: SourceFieldId;
  /** Row index, if applicable and safe to expose */
  readonly rowIndex?: number;
}

export interface ImportIssue {
  readonly id: IssueId;
  readonly code: string;
  readonly severity: IssueSeverity;
  readonly category: IssueCategory;
  readonly entity: string;
  
  /** Safe references to the source, without including PII or full rows */
  readonly sourceReferences: readonly IssueSourceReference[];
  
  /** User-facing message explaining the issue */
  readonly userMessage: string;
  
  /** Safe technical detail, strictly excluding sensitive data */
  readonly technicalDetail?: string;
  
  /** Recommended action for the user to resolve the issue */
  readonly recommendedAction?: string;
  
  readonly resolutionStatus: IssueResolutionStatus;
  readonly isBlocking: boolean;
  readonly requiresHumanReview: boolean;
}
