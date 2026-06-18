import type {
  CanonicalWorkbook,
  CanonicalQuestionType
} from '../normalization/normalizationTypes';
import type { WorkbookSchemaKind } from '../schema/schemaTypes';

export type WorkbookMetricsStatus =
  | 'METRICS_CALCULATED'
  | 'METRICS_CALCULATED_WITH_WARNINGS'
  | 'METRICS_REJECTED'
  | 'METRICS_FAILED';

export type WorkbookMetricsIssueSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type WorkbookMetricsIssueCode =
  | 'CANONICAL_WORKBOOK_NOT_READY'
  | 'MISSING_CANONICAL_COLLECTION'
  | 'EMPTY_QUESTION_SET'
  | 'EMPTY_RESPONDENT_SET'
  | 'EMPTY_RESPONSE_SET'
  | 'UNSUPPORTED_QUESTION_TYPE_FOR_METRICS'
  | 'INVALID_NUMERIC_ANSWER'
  | 'METRICS_FAILED';

export interface WorkbookMetricsIssue {
  code: WorkbookMetricsIssueCode;
  severity: WorkbookMetricsIssueSeverity;
  message: string;
}

export interface WorkbookMetricsInput {
  canonicalWorkbook: CanonicalWorkbook | null;
  schemaKind: WorkbookSchemaKind;
}

export interface ParticipationMetrics {
  totalEligibleRespondents: number;
  totalResponses: number;
  participationRate: number;
}

export interface CompletionMetrics {
  completedResponses: number;
  partialResponses: number;
  completionRate: number;
}

export interface QuestionDistributionBucket {
  value: string;
  count: number;
  rate: number;
}

export interface LikertQuestionMetrics {
  averageScore: number;
  favorableCount: number;
  neutralCount: number;
  unfavorableCount: number;
  favorableRate: number;
  neutralRate: number;
  unfavorableRate: number;
}

export interface EnpsQuestionMetrics {
  promotersCount: number;
  passivesCount: number;
  detractorsCount: number;
  enpsScore: number;
}

export interface OpenTextQuestionMetrics {
  commentCount: number;
  blankCount: number;
  averageLength: number;
}

export interface BlankAnswerMetrics {
  blankCount: number;
  blankRate: number;
}

export interface QuestionMetrics {
  questionId: string;
  questionType: CanonicalQuestionType;
  totalAnswers: number;
  nonBlankAnswers: number;
  blankAnswers: number;
  blankRate: number;
  distribution: QuestionDistributionBucket[];
  likertMetrics?: LikertQuestionMetrics;
  enpsMetrics?: EnpsQuestionMetrics;
  openTextMetrics?: OpenTextQuestionMetrics;
}

export interface WorkbookMetricsSummary {
  workbookId: string;
  workbookKind: string;
  totalEligibleRespondents: number;
  totalResponses: number;
  completedResponses: number;
  partialResponses: number;
  participationRate: number;
  completionRate: number;
  totalQuestions: number;
  totalAnswerValues: number;
  blankAnswerCount: number;
  blankAnswerRate: number;
  questionMetricsCount: number;
}

export interface WorkbookMetricsResult {
  status: WorkbookMetricsStatus;
  summary: WorkbookMetricsSummary | null;
  questionMetrics: Record<string, QuestionMetrics>;
  issues: WorkbookMetricsIssue[];
}
