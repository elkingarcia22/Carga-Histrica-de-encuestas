import { z } from 'zod';
import type {
  ImportMode,
  ImportSessionStatus,
  WizardMacroStage,
  ReviewStatus,
  MatchStatus,
  Count,
  ConfidenceScore,
  Percentage,
  IsoTimestamp,
  ImportSessionId,
  ImportFileId,
  ImportSheetId,
  SourceFieldId,
  SurveyQuestionId,
  DemographicId,
  ParticipantId,
  SegmentId,
  IssueId,
} from '../../../types/survey-import';

// --- Identifiers ---
export const importSessionIdSchema: z.ZodType<ImportSessionId> = z.string().min(1, 'Session ID cannot be empty');
export const importFileIdSchema: z.ZodType<ImportFileId> = z.string().min(1, 'File ID cannot be empty');
export const importSheetIdSchema: z.ZodType<ImportSheetId> = z.string().min(1, 'Sheet ID cannot be empty');
export const sourceFieldIdSchema: z.ZodType<SourceFieldId> = z.string().min(1, 'Field ID cannot be empty');
export const surveyQuestionIdSchema: z.ZodType<SurveyQuestionId> = z.string().min(1, 'Question ID cannot be empty');
export const demographicIdSchema: z.ZodType<DemographicId> = z.string().min(1, 'Demographic ID cannot be empty');
export const participantIdSchema: z.ZodType<ParticipantId> = z.string().min(1, 'Participant ID cannot be empty');
export const segmentIdSchema: z.ZodType<SegmentId> = z.string().min(1, 'Segment ID cannot be empty');
export const issueIdSchema: z.ZodType<IssueId> = z.string().min(1, 'Issue ID cannot be empty');

// --- Basic Types ---
export const isoTimestampSchema: z.ZodType<IsoTimestamp> = z.string().datetime({ message: 'Must be a valid ISO 8601 timestamp' });

export const percentageSchema: z.ZodType<Percentage> = z.number().min(0, 'Percentage cannot be less than 0').max(100, 'Percentage cannot be more than 100');

export const confidenceScoreSchema: z.ZodType<ConfidenceScore> = z.number().min(0, 'Confidence score cannot be less than 0').max(1, 'Confidence score cannot be more than 1');

export const countSchema: z.ZodType<Count> = z.number().int('Count must be an integer').min(0, 'Count cannot be negative');

// --- Modes ---
export const importModeSchema: z.ZodType<ImportMode> = z.enum([
  'raw-individual',
  'aggregated-comparison',
  'unknown'
]);

export const wizardMacroStageSchema: z.ZodType<WizardMacroStage> = z.enum([
  'upload',
  'configure',
  'review',
  'import'
]);

export const importSessionStatusSchema: z.ZodType<ImportSessionStatus> = z.enum([
  'idle',
  'files-selected',
  'validating',
  'profiling',
  'classifying',
  'detection-complete',
  'detection-partial',
  'configuration-required',
  'review-required',
  'ready-for-preview',
  'ready-to-import',
  'importing',
  'completed',
  'partially-completed',
  'failed',
  'cancelled'
]);

export const reviewStatusSchema: z.ZodType<ReviewStatus> = z.enum([
  'unreviewed',
  'suggested',
  'confirmed',
  'modified',
  'rejected',
  'conflict'
]);

export const matchStatusSchema: z.ZodType<MatchStatus> = z.enum([
  'aligned',
  'new',
  'review-required',
  'conflict',
  'uninterpretable',
  'ignored'
]);
