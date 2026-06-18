import type { PeriodComparisonResult } from '../comparison/comparisonTypes';
import type { CanonicalQuestionType } from '../normalization/normalizationTypes';

export interface ComparisonViewModelInput {
  comparisonResult: PeriodComparisonResult;
  locale?: string;
  numberFormat?: 'percent' | 'decimal';
}

export type ComparisonViewModelStatus =
  | 'VIEW_MODEL_READY'
  | 'VIEW_MODEL_READY_WITH_WARNINGS'
  | 'VIEW_MODEL_REJECTED'
  | 'VIEW_MODEL_FAILED';

export type ComparisonViewModelIssueSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type ComparisonViewModelIssueCode =
  | 'COMPARISON_RESULT_NOT_READY'
  | 'MISSING_COMPARISON_SUMMARY'
  | 'MISSING_QUESTION_COMPARISONS'
  | 'UNSUPPORTED_COMPARISON_DIRECTION'
  | 'VIEW_MODEL_FAILED';

export interface ComparisonViewModelIssue {
  code: ComparisonViewModelIssueCode;
  severity: ComparisonViewModelIssueSeverity;
  message: string;
}

export type ComparisonSemanticTone = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'WARNING' | 'INFO' | 'MUTED';
export type ComparisonDisplayDirection = 'UP' | 'DOWN' | 'FLAT' | 'NONE';

export interface ComparisonValueDisplay {
  rawValue: number | null;
  displayValue: string;
  unit: string;
}

export interface ComparisonSummaryCardViewModel {
  id: string;
  label: string;
  primaryValue: ComparisonValueDisplay;
  secondaryValue: ComparisonValueDisplay | null;
  delta: ComparisonValueDisplay | null;
  direction: ComparisonDisplayDirection;
  tone: ComparisonSemanticTone;
  helperText: string | null;
}

export interface ComparisonKpiCardViewModel {
  id: string;
  label: string;
  delta: ComparisonValueDisplay | null;
  direction: ComparisonDisplayDirection;
  tone: ComparisonSemanticTone;
}

export interface ComparisonDistributionRowViewModel {
  questionId: string;
  bucketLabel: string;
  baseCount: number;
  comparisonCount: number;
  countDelta: ComparisonValueDisplay;
  baseRate: ComparisonValueDisplay;
  comparisonRate: ComparisonValueDisplay;
  rateDelta: ComparisonValueDisplay;
  direction: ComparisonDisplayDirection;
  tone: ComparisonSemanticTone;
}

export interface ComparisonQuestionRowViewModel {
  questionId: string;
  questionLabel: string;
  questionType: CanonicalQuestionType;
  baseValue: ComparisonValueDisplay | null;
  comparisonValue: ComparisonValueDisplay | null;
  deltaValue: ComparisonValueDisplay | null;
  direction: ComparisonDisplayDirection;
  tone: ComparisonSemanticTone;
  blankRateDelta: ComparisonValueDisplay | null;
  hasDistribution: boolean;
  hasLikertMetrics: boolean;
  hasEnpsMetrics: boolean;
  hasOpenTextMetrics: boolean;
}

export interface ComparisonFilterOptionViewModel {
  id: string;
  label: string;
  value: string;
}

export interface ComparisonEmptyStateViewModel {
  title: string;
  description: string;
  recommendedActionLabel: string;
}

export interface ComparisonDashboardViewModel {
  dashboardTitle: string;
  dashboardSubtitle: string;
  summaryCards: ComparisonSummaryCardViewModel[];
  kpiCards: ComparisonKpiCardViewModel[];
  questionRows: ComparisonQuestionRowViewModel[];
  distributionRows: ComparisonDistributionRowViewModel[];
  filters: {
    questionTypes: ComparisonFilterOptionViewModel[];
    directions: ComparisonFilterOptionViewModel[];
    tones: ComparisonFilterOptionViewModel[];
  };
  emptyState: ComparisonEmptyStateViewModel | null;
  metadata: {
    baseWorkbookId: string;
    comparisonWorkbookId: string;
    totalComparableQuestions: number;
    generatedAt: string;
  };
}

export interface ComparisonViewModelResult {
  status: ComparisonViewModelStatus;
  dashboard: ComparisonDashboardViewModel | null;
  issues: ComparisonViewModelIssue[];
}
