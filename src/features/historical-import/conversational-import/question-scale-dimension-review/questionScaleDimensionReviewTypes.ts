export type QuestionType =
  | 'rating_scale'
  | 'single_choice'
  | 'multiple_choice'
  | 'open_text'
  | 'nps'
  | 'enps'
  | 'matrix'
  | 'unknown';

export type ScaleType =
  | 'likert_5'
  | 'likert_7'
  | 'nps_0_10'
  | 'binary_yes_no'
  | 'frequency'
  | 'agreement'
  | 'custom'
  | 'not_applicable'
  | 'unknown';

export type ScoreDirection = 'positive_up' | 'positive_down';

export interface ScaleDetail {
  scaleLabel: string;
  scaleValueRange: string;
  scaleAnchors: string[];
  scoreDirection: ScoreDirection;
  favorableValues: number[];
  neutralValues: number[];
  unfavorableValues: number[];
}

export type DimensionSource =
  | 'detected_by_sheet'
  | 'detected_by_column'
  | 'inferred_by_dictionary'
  | 'user_corrected'
  | 'not_assigned';

export interface DimensionAssignment {
  dimensionId: string;
  dimensionName: string;
  parentDimensionId?: string;
  source: DimensionSource;
  confidence: 'high' | 'medium' | 'low';
}

export type QuestionReviewStatus =
  | 'aligned'
  | 'needs_review'
  | 'new_question'
  | 'uninterpretable'
  | 'edited'
  | 'confirmed';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface QuestionReviewItem {
  questionId: string;
  displayIndex: number;
  questionText: string;
  questionType: QuestionType;
  scaleType: ScaleType;
  scaleDetail: ScaleDetail;
  dimensionAssignment: DimensionAssignment;
  status: QuestionReviewStatus;
  reviewNotes?: string;
  sourceSheetLabel: string;
  confidenceLevel: ConfidenceLevel;
}

export interface DimensionSummary {
  dimensionId: string;
  dimensionName: string;
  questionCount: number;
  scaleType: ScaleType;
}

export interface ScaleTypeSummary {
  scaleType: ScaleType;
  questionCount: number;
}

export interface CriticalIssue {
  questionId: string;
  displayIndex: number;
  issueType: 'missing_question_type' | 'missing_scale_type' | 'missing_dimension' | 'uninterpretable' | 'needs_review';
  description: string;
}

export interface QuestionReviewStepSummary {
  totalQuestions: number;
  alignedQuestions: number;
  needsReviewQuestions: number;
  newQuestions: number;
  uninterpretableQuestions: number;
  questionsByDimension: DimensionSummary[];
  questionsByScaleType: ScaleTypeSummary[];
  criticalIssues: CriticalIssue[];
  canConfirmSection: boolean;
}

export interface ConversationalCommandSuggestion {
  command: string;
  description: string;
}

export interface QuestionReviewMockDataset {
  questions: QuestionReviewItem[];
  summary: QuestionReviewStepSummary;
  suggestedCommands: ConversationalCommandSuggestion[];
}

export const QUESTION_TYPE_ORDER: QuestionType[] = [
  'rating_scale',
  'single_choice',
  'multiple_choice',
  'open_text',
  'nps',
  'enps',
  'matrix',
  'unknown',
];

export const SCALE_TYPE_ORDER: ScaleType[] = [
  'likert_5',
  'likert_7',
  'nps_0_10',
  'binary_yes_no',
  'frequency',
  'agreement',
  'custom',
  'not_applicable',
  'unknown',
];

export const QUESTION_REVIEW_STATUS_ORDER: QuestionReviewStatus[] = [
  'aligned',
  'needs_review',
  'new_question',
  'uninterpretable',
  'edited',
  'confirmed',
];

export const DIMENSION_SOURCE_ORDER: DimensionSource[] = [
  'detected_by_sheet',
  'detected_by_column',
  'inferred_by_dictionary',
  'user_corrected',
  'not_assigned',
];
