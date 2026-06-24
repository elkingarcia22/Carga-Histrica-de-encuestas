export type HomologationPrecheckEntityType =
  | 'question_or_item'
  | 'dimension'
  | 'metric'
  | 'segment'
  | 'participant_identifier'
  | 'response_scale'
  | 'survey_cycle'
  | 'source_file_role';

export type HomologationPrecheckState =
  | 'matched'
  | 'suggested_match'
  | 'needs_review'
  | 'not_found'
  | 'blocked'
  | 'not_applicable';

export type HomologationPrecheckConfidence =
  | 'high'
  | 'medium'
  | 'low'
  | 'blocked';

export interface HomologationPrecheckInput {
  fileName: string;
  sheetName: string;
  sheetLayout: string;
  rowCount: number;
  columnCount: number;
  sampleColumnLabels: string[];
  detectedSignals: string[];
  classificationReason: string;
  confidence: string;
  participantIdentificationState: string;
  sourceFileRole: string;
}

export interface HomologationPrecheckEntity {
  id: string;
  entityType: HomologationPrecheckEntityType;
  state: HomologationPrecheckState;
  confidence: HomologationPrecheckConfidence;
  sourceLabel?: string;
  normalizedLabel?: string;
  suggestedTarget?: string;
  reason: string;
  detectedSignals: string[];
}

export interface HomologationDecisionOption {
  id: string;
  label: string;
}

export interface HomologationPrecheckDecision {
  id: string;
  title: string;
  entityType: HomologationPrecheckEntityType;
  sourceLabel: string;
  suggestedTarget: string;
  reason: string;
  confidence: HomologationPrecheckConfidence;
  impact: string;
  options: HomologationDecisionOption[];
  recommendedOptionId: string;
}

export interface HomologationPrecheckSummary {
  itemsStatus: string;
  dimensionsStatus: string;
  metricsStatus: string;
  segmentsStatus: string;
  participantIdentificationStatus: string;
  responseScaleStatus: string;
  decisionsCount: number;
  blockingDecisionsCount: number;
  recommendedNextStep: string;
}

export interface HomologationPrecheckPrivacyBoundary {
  privacyAssured: boolean;
  classificationReason: string;
  rawRowsIncluded: boolean;
  fullWorkbookIncluded: boolean;
  rawJsonIncluded: boolean;
  containsOnlyMetadata: boolean;
  localOnly: boolean;
}

export interface HomologationPrecheckCapabilities {
  canHomologate: boolean;
  classificationReason: string;
  requiresHumanReview: boolean;
}

export interface HomologationPrecheckResult {
  entities: HomologationPrecheckEntity[];
  decisions: HomologationPrecheckDecision[];
  summary: HomologationPrecheckSummary;
  privacyBoundary: HomologationPrecheckPrivacyBoundary;
  capabilities: HomologationPrecheckCapabilities;
}
