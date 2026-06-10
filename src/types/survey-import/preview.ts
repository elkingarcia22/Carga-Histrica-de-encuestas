/**
 * preview.ts
 *
 * Defines the preview of the impact before importing.
 */

import type { ImportMode, Count } from './common';
import type { IssueId } from './common';
import type { SurveyConfiguration } from './configuration';
import type { AnalyticCapability } from './analytics';

export interface ImportPreviewCounts {
  readonly totalFiles: Count;
  readonly usedSheets: Count;
  readonly ignoredSheets: Count;
  
  readonly associatedQuestions: Count;
  readonly newQuestions: Count;
  readonly pendingQuestions: Count;
  
  readonly associatedDemographics: Count;
  readonly newDemographics: Count;
  
  readonly associatedParticipants: Count;
  readonly externalParticipants: Count;
  
  readonly associatedSegments: Count;
  readonly newSegments: Count;
  
  readonly conflicts: Count;
  readonly warnings: Count;
  readonly blockingErrors: Count;
}

export interface ImportPreview {
  readonly mode: ImportMode;
  readonly configuration: SurveyConfiguration;
  readonly capabilities: readonly AnalyticCapability[];
  
  readonly counts: ImportPreviewCounts;
  
  /** IDs of issues that are still open at preview time */
  readonly openIssueIds: readonly IssueId[];
  
  /** Safe descriptions of limitations that will apply to this import */
  readonly limitations: readonly string[];
  
  readonly isReady: boolean;
  readonly isConfirmationAllowed: boolean;
}
