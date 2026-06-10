/**
 * result.ts
 *
 * Defines the result of the import process.
 */

import type { IsoTimestamp, Count } from './common';
import type { AnalyticCapability } from './analytics';
import type { IssueId } from './common';

export type ImportResultStatus =
  | 'completed'
  | 'partially-completed'
  | 'failed'
  | 'cancelled';

export interface ImportResultCounts {
  readonly importedItems: Count;
  readonly skippedItems: Count;
}

export interface ImportResult {
  readonly status: ImportResultStatus;
  
  /** Simulated ID of the newly created or updated survey. Not a real productive ID yet. */
  readonly simulatedSurveyId?: string;
  readonly completionDate: IsoTimestamp;
  
  readonly counts: ImportResultCounts;
  
  readonly enabledCapabilities: readonly AnalyticCapability[];
  
  /** Final issues remaining after import */
  readonly finalIssueIds: readonly IssueId[];
  
  /** Safe conceptual report of errors that occurred during the actual import execution */
  readonly conceptualErrorReport?: string;
  
  /** Suggested next step for the user */
  readonly nextAction?: string;
}
