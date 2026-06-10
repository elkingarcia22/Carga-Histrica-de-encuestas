/**
 * session.ts
 *
 * Defines the root entity for the survey import process: ImportSession.
 */

import type { ImportSessionId, ImportSessionStatus, WizardMacroStage, IsoTimestamp, Count } from './common';
import type { ImportSourceFile, ImportSourceSheet, ImportSourceField } from './source';
import type { ImportDetection } from './detection';
import type { SurveyConfiguration } from './configuration';
import type { ImportModeData } from './data';
import type { ImportIssue } from './issues';
import type { ImportPreview } from './preview';
import type { ImportResult } from './result';

export interface ReviewProgressDetails {
  readonly total: Count;
  readonly confirmed: Count;
  readonly modified: Count;
  readonly pending: Count;
  readonly conflicting: Count;
  readonly ignored: Count;
  readonly blocking: Count;
}

export interface ReviewProgress {
  readonly overall: ReviewProgressDetails;
  readonly byQuestion: ReviewProgressDetails;
  readonly byDemographic: ReviewProgressDetails;
  readonly byParticipant: ReviewProgressDetails;
  readonly bySegment: ReviewProgressDetails;
}

export interface ImportSession {
  readonly id: ImportSessionId;
  readonly status: ImportSessionStatus;
  readonly macroStage: WizardMacroStage;
  
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
  
  // --- Source ---
  readonly files: readonly ImportSourceFile[];
  readonly sheets: readonly ImportSourceSheet[];
  readonly fields: readonly ImportSourceField[];
  
  // --- Interpretation ---
  readonly detection?: ImportDetection;
  readonly configuration?: SurveyConfiguration;
  
  // --- Canonical Domain Data (Discriminated by Mode) ---
  readonly data: ImportModeData;
  
  // --- Review & Tracking ---
  readonly reviewProgress: ReviewProgress;
  readonly issues: readonly ImportIssue[];
  
  // --- Outcomes ---
  readonly preview?: ImportPreview;
  readonly result?: ImportResult;
  
  // --- State Flags ---
  readonly isCancelled: boolean;
  /** True when the user has confirmed the import and processing should begin */
  readonly isCommitStarted: boolean;
}
