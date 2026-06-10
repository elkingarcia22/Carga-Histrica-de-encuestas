/**
 * common.ts
 *
 * Semantic identifiers and common state types for the canonical data model.
 * Does not implement runtime validation (Zod will be used later).
 */

// --- Identifiers ---
export type ImportSessionId = string;
export type ImportFileId = string;
export type ImportSheetId = string;
export type SourceFieldId = string;
export type SurveyQuestionId = string;
export type DemographicId = string;
export type ParticipantId = string;
export type SegmentId = string;
export type IssueId = string;

// --- Basic Types ---
/** ISO 8601 timestamp */
export type IsoTimestamp = string;

/** Percentage value, expected to be between 0 and 100 */
export type Percentage = number;

/** Confidence score, expected to be between 0 and 1 */
export type ConfidenceScore = number;

/** Count value, expected to be a non-negative integer */
export type Count = number;

// --- Modes ---
export type ImportMode = 'raw-individual' | 'aggregated-comparison' | 'unknown';

export type WizardMacroStage = 'upload' | 'configure' | 'review' | 'import';

export type ImportSessionStatus =
  | 'idle'
  | 'files-selected'
  | 'validating'
  | 'profiling'
  | 'classifying'
  | 'detection-complete'
  | 'detection-partial'
  | 'configuration-required'
  | 'review-required'
  | 'ready-for-preview'
  | 'ready-to-import'
  | 'importing'
  | 'completed'
  | 'partially-completed'
  | 'failed'
  | 'cancelled';

export type ReviewStatus =
  | 'unreviewed'
  | 'suggested'
  | 'confirmed'
  | 'modified'
  | 'rejected'
  | 'conflict';

export type MatchStatus =
  | 'aligned'
  | 'new'
  | 'review-required'
  | 'conflict'
  | 'uninterpretable'
  | 'ignored';
