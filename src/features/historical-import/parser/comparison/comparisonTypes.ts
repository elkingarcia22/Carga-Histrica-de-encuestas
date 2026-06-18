import type { CanonicalQuestionType } from '../normalization/normalizationTypes';
import type { WorkbookMetricsResult, QuestionMetrics } from '../metrics/metricsTypes';

export type PeriodComparisonStatus =
  | 'COMPARISON_CALCULATED'
  | 'COMPARISON_CALCULATED_WITH_WARNINGS'
  | 'COMPARISON_REJECTED'
  | 'COMPARISON_FAILED';

export type PeriodComparisonIssueSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type PeriodComparisonIssueCode =
  | 'BASE_METRICS_NOT_READY'
  | 'COMPARISON_METRICS_NOT_READY'
  | 'MISSING_BASE_QUESTION_METRICS'
  | 'MISSING_COMPARISON_QUESTION_METRICS'
  | 'QUESTION_NOT_FOUND_IN_COMPARISON'
  | 'QUESTION_NOT_FOUND_IN_BASE'
  | 'QUESTION_TYPE_MISMATCH'
  | 'DIVISION_BY_ZERO_FOR_DELTA'
  | 'COMPARISON_FAILED';

export interface PeriodComparisonIssue {
  code: PeriodComparisonIssueCode;
  severity: PeriodComparisonIssueSeverity;
  message: string;
}

export interface PeriodComparisonInput {
  base: WorkbookMetricsResult;
  comparison: WorkbookMetricsResult;
}

export type ComparisonDirection = 'IMPROVED' | 'DECLINED' | 'UNCHANGED' | 'NOT_COMPARABLE';

export type ComparableEntityStatus = 'COMPARABLE' | 'BASE_ONLY' | 'COMPARISON_ONLY';

export interface MetricDelta {
  baseValue: number;
  comparisonValue: number;
  absoluteDelta: number;
  relativeDelta: number | null; // null if baseValue is 0
  direction: ComparisonDirection;
}

export interface ParticipationComparison {
  totalEligibleRespondents: MetricDelta;
  totalResponses: MetricDelta;
  participationRate: MetricDelta;
}

export interface CompletionComparison {
  completedResponses: MetricDelta;
  partialResponses: MetricDelta;
  completionRate: MetricDelta;
}

export interface BlankAnswerComparison {
  blankCount: MetricDelta;
  blankRate: MetricDelta;
}

export interface DistributionComparison {
  value: string;
  baseCount: number;
  comparisonCount: number;
  countDelta: number;
  baseRate: number;
  comparisonRate: number;
  rateDelta: number;
}

export interface LikertQuestionComparison {
  averageScoreDelta: number;
  favorableRateDelta: number;
  neutralRateDelta: number;
  unfavorableRateDelta: number;
  direction: ComparisonDirection; // Based on favorableRateDelta
}

export interface EnpsQuestionComparison {
  enpsScoreDelta: number;
  promotersDelta: number;
  passivesDelta: number;
  detractorsDelta: number;
  direction: ComparisonDirection; // Based on enpsScoreDelta
}

export interface OpenTextQuestionComparison {
  commentCountDelta: number;
  averageLengthDelta: number;
  blankRateDelta: number;
}

export interface QuestionComparison {
  questionId: string;
  questionType: CanonicalQuestionType;
  status: ComparableEntityStatus;
  baseQuestionMetrics: QuestionMetrics | null;
  comparisonQuestionMetrics: QuestionMetrics | null;
  blankRateDelta: number | null;
  nonBlankAnswerDelta: number | null;
  distributionDelta: DistributionComparison[];
  likertComparison?: LikertQuestionComparison;
  enpsComparison?: EnpsQuestionComparison;
  openTextComparison?: OpenTextQuestionComparison;
}

export interface PeriodComparisonSummary {
  baseWorkbookId: string;
  comparisonWorkbookId: string;
  baseWorkbookKind: string;
  comparisonWorkbookKind: string;
  totalComparableQuestions: number;
  totalBaseOnlyQuestions: number;
  totalComparisonOnlyQuestions: number;
  participationRateDelta: number | null;
  completionRateDelta: number | null;
  blankAnswerRateDelta: number | null;
  overallDirection: ComparisonDirection;
}

export interface PeriodComparisonResult {
  status: PeriodComparisonStatus;
  summary: PeriodComparisonSummary | null;
  participation: ParticipationComparison | null;
  completion: CompletionComparison | null;
  blankAnswers: BlankAnswerComparison | null;
  questionComparisons: Record<string, QuestionComparison>;
  issues: PeriodComparisonIssue[];
}
