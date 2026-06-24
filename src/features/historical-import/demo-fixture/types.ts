export type DemoFixtureSurveyCycleId = 'qs_clima_2024' | 'qs_clima_2025';

export interface DemoFixtureSurveyCycle {
  id: DemoFixtureSurveyCycleId;
}

export interface DemoFixtureSourceTrace {
  sourceFileName: string;
  sourceSheetName?: string;
  sourceLayout?: 'aggregated_items_by_rows' | 'raw_responses_by_columns' | 'segment_summary' | 'unknown';
  sourceRowReference?: number | string;
  sourceColumnReference?: string;
  sourceLabel: string;
  sourceKind: string;
}

export type DemoFixtureReviewState = 'pending' | 'confirmed' | 'overridden' | 'ignored';

export interface DemoFixtureSheet {
  id: string;
  fileId: string;
  name: string;
  layout: 'aggregated_items_by_rows' | 'raw_responses_by_columns' | 'segment_summary' | 'unknown';
  rowCount?: number;
  columnCount?: number;
  detectedPurpose: string;
}

export interface DemoFixturePrivacySignal {
  containsDirectIdentifiers: boolean;
  containsPseudonymousIds: boolean;
  containsOpenText: boolean;
  containsRawResponses: boolean;
  containsAggregatedOnly: boolean;
  privacyRiskLevel: 'low' | 'medium' | 'high' | 'blocked';
  notes: string;
}

export interface DemoFixtureSourceFile {
  id: string;
  fileName: string;
  cycleId: DemoFixtureSurveyCycleId;
  fileRole: 'total_report' | 'segment_report' | 'raw_responses' | 'supporting_catalog' | 'unknown';
  segmentId?: string;
  sheets: DemoFixtureSheet[];
  privacyLevel: DemoFixturePrivacySignal;
  sourceTrace: DemoFixtureSourceTrace;
}

export interface DemoFixtureDimension {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  sourceLabel: string;
  displayLabel: string;
  normalizedLabel: string;
  sourceTrace: DemoFixtureSourceTrace;
  reviewState: DemoFixtureReviewState;
}

export interface DemoFixtureQuestion {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  sourceLabel: string;
  displayLabel: string;
  normalizedLabel: string;
  questionType: 'likert' | 'enps' | 'engagement' | 'open_text' | 'metadata' | 'unknown';
  sourceTrace: DemoFixtureSourceTrace;
  reviewState: DemoFixtureReviewState;
}

export interface DemoFixtureQuestionDimensionMapping {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  questionId: string;
  detectedDimensionId: string;
  reviewedDimensionId?: string;
  mappingSource: 'source_row_order' | 'source_dimension_column' | 'manual_overlay' | 'fixture_curated' | 'unknown';
  confidence: number | string;
  reviewState: DemoFixtureReviewState;
  sourceTrace: DemoFixtureSourceTrace;
}

export interface DemoFixtureMetric {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  sourceLabel: string;
  displayLabel: string;
  metricType: 'negative_perception' | 'neutral_perception' | 'positive_perception' | 'total_responses' | 'favorability' | 'participation' | 'enps_score' | 'promoters' | 'passives' | 'detractors' | 'unknown';
  sourceTrace: DemoFixtureSourceTrace;
  reviewState: DemoFixtureReviewState;
}

export interface DemoFixtureDemographic {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  sourceLabel: string;
  displayLabel: string;
  demographicType: 'area' | 'department' | 'management' | 'role' | 'seniority' | 'country' | 'city' | 'site' | 'team' | 'generation' | 'level' | 'range' | 'unknown';
  isSegmentableByDefault: boolean;
  isSensitive: boolean;
  sourceTrace: DemoFixtureSourceTrace;
  reviewState: DemoFixtureReviewState;
}

export interface DemoFixtureSegment {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  sourceLabel: string;
  displayLabel: string;
  segmentType: 'management' | 'area' | 'department' | 'cycle_total' | 'unknown';
  sourceFileIds: string[];
  sourceTrace: DemoFixtureSourceTrace;
  reviewState: DemoFixtureReviewState;
}

export interface DemoFixtureReviewDecision {
  id: string;
  cycleId: DemoFixtureSurveyCycleId;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  decisionType: 'confirm_dimension' | 'confirm_question' | 'confirm_question_dimension_mapping' | 'confirm_metric' | 'confirm_demographic' | 'confirm_segment' | 'confirm_privacy';
  severity: 'low' | 'medium' | 'high' | 'blocking';
  recommendedAction: string;
  reviewState: DemoFixtureReviewState;
}

export interface DemoFixtureOverlayAction {
  id: string;
  actionType: 'rename_dimension_label' | 'rename_question_label' | 'move_question_to_dimension' | 'mark_demographic_as_segmentable' | 'mark_demographic_as_ignored' | 'confirm_metric_mapping' | 'confirm_segment_mapping' | 'resolve_decision' | 'add_review_note';
  targetEntityType: string;
  targetEntityId: string;
  previousValue: string | null;
  nextValue: string;
  reason: string;
  sourceTrace: DemoFixtureSourceTrace;
}

export interface DemoFixtureSourceLayer {
  files: DemoFixtureSourceFile[];
  dimensions: DemoFixtureDimension[];
  questions: DemoFixtureQuestion[];
  mappings: DemoFixtureQuestionDimensionMapping[];
  metrics: DemoFixtureMetric[];
  demographics: DemoFixtureDemographic[];
  segments: DemoFixtureSegment[];
  decisions: DemoFixtureReviewDecision[];
}

export interface DemoFixtureOverlayLayer {
  actions: DemoFixtureOverlayAction[];
}

export interface DemoFixturePrivacyBoundary {
  realResponsesIncluded: false;
  openTextIncluded: false;
  piiIncluded: false;
  rawRowsIncluded: false;
  workbookDumpIncluded: false;
  apiConnected: false;
  storageConnected: false;
  claudeConnected: false;
}

export interface DemoFixtureDataset {
  fixtureMode: 'demo_fixture';
  fixtureScope: 'qs_clima_2024_2025';
  surveyCycles: DemoFixtureSurveyCycleId[];
  sourceLayer: DemoFixtureSourceLayer;
  overlayLayer: DemoFixtureOverlayLayer;
  privacyBoundary: DemoFixturePrivacyBoundary;
}
