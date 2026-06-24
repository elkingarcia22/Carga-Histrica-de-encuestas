export type HistoricalLoadDraftStatus =
  | 'not_started'
  | 'ready_to_prepare'
  | 'draft_created'
  | 'needs_review'
  | 'blocked_by_privacy'
  | 'blocked_by_missing_mapping'
  | 'approved_for_future_import'; // approved_for_future_import no ejecuta importación ni persistencia.

export type HistoricalLoadDraftReadinessBlocker =
  | 'missing_cycles'
  | 'missing_dimensions'
  | 'missing_questions'
  | 'missing_question_dimension_mapping'
  | 'missing_metrics'
  | 'privacy_boundary_blocked'
  | 'pii_detected'
  | 'raw_rows_detected'
  | 'unresolved_blocking_decisions'
  | 'unsupported_file_set';

export type HistoricalLoadDraftPreparationMode =
  | 'demo_fixture'
  | 'manual_review'
  | 'future_secure_parser';

export type HistoricalLoadDraftSourceKind =
  | 'source_fixture'
  | 'review_overlay'
  | 'resolved_view'
  | 'manual_review';

export interface HistoricalLoadDraftSurvey {
  id: string;
  name: string;
  displayName: string;
  surveyType: 'climate' | 'engagement' | 'enps' | 'mixed' | 'unknown';
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftCycle {
  id: string;
  label: string;
  yearLabel: string;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftSourceFile {
  id: string;
  fileName: string;
  fileRole: string;
  cycleId: string;
  segmentId?: string;
  includedInDraft: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftDimension {
  id: string;
  sourceDimensionId: string;
  label: string;
  originalLabel: string;
  hasLocalAdjustment: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftQuestion {
  id: string;
  sourceQuestionId: string;
  label: string;
  originalLabel: string;
  questionType: string;
  hasLocalAdjustment: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftQuestionMapping {
  id: string;
  questionId: string;
  dimensionId: string;
  mappingSource: string;
  hasLocalAdjustment: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftMetric {
  id: string;
  label: string;
  metricType: string;
  includedInDraft: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftDemographic {
  id: string;
  label: string;
  demographicType: string;
  includedInDraft: boolean;
  isSegmentable: boolean;
  isSensitive: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftSegment {
  id: string;
  label: string;
  segmentType: string;
  sourceFileIds: string[];
  includedInDraft: boolean;
  sourceKind: HistoricalLoadDraftSourceKind;
  reviewState: 'pending' | 'reviewed' | 'modified';
}

export interface HistoricalLoadDraftReviewDecision {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'blocking';
  status: 'pending' | 'resolved' | 'dismissed';
  relatedEntityType: string;
  relatedEntityId?: string;
  sourceKind: HistoricalLoadDraftSourceKind;
}

export interface HistoricalLoadDraftPrivacyBoundary {
  realResponsesIncluded: boolean;
  openTextIncluded: boolean;
  piiIncluded: boolean;
  rawRowsIncluded: boolean;
  workbookDumpIncluded: boolean;
  apiConnected: boolean;
  storageConnected: boolean;
  claudeConnected: boolean;
  privacyRiskLevel: 'low' | 'medium' | 'high' | 'blocked';
  notes: string;
}

export interface HistoricalLoadDraftReadiness {
  status: 'ready' | 'not_ready' | 'blocked';
  canPrepareDraft: boolean;
  canProceedToFutureImport: boolean; // canProceedToFutureImport no ejecuta importación; solo representa elegibilidad futura.
  blockers: HistoricalLoadDraftReadinessBlocker[];
  warnings: string[];
  summary: string;
}

export interface HistoricalLoadDraft {
  id: string;
  status: HistoricalLoadDraftStatus;
  preparationMode: HistoricalLoadDraftPreparationMode;
  survey: HistoricalLoadDraftSurvey;
  cycles: HistoricalLoadDraftCycle[];
  sourceFiles: HistoricalLoadDraftSourceFile[];
  dimensions: HistoricalLoadDraftDimension[];
  questions: HistoricalLoadDraftQuestion[];
  questionMappings: HistoricalLoadDraftQuestionMapping[];
  metrics: HistoricalLoadDraftMetric[];
  demographics: HistoricalLoadDraftDemographic[];
  segments: HistoricalLoadDraftSegment[];
  reviewDecisions: HistoricalLoadDraftReviewDecision[];
  privacyBoundary: HistoricalLoadDraftPrivacyBoundary;
  readiness: HistoricalLoadDraftReadiness;
  sourceKind: HistoricalLoadDraftSourceKind;
  notes: string;
}
