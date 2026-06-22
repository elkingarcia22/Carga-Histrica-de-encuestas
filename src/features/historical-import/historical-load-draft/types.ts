export type HistoricalLoadDraftStatus =
  | 'drafting'
  | 'needs_decisions'
  | 'ready_for_review'
  | 'blocked_by_risk'
  | 'approved_for_later_import';

export type HistoricalLoadMappingSemantic =
  | 'matched_to_existing'
  | 'survey_only'
  | 'new_historical_question'
  | 'excluded'
  | 'needs_review'
  | 'not_applicable';

export type HistoricalLoadPiiPolicy =
  | 'anonymous_survey'
  | 'exclude_identifiers'
  | 'keep_identifiers_with_warning'
  | 'needs_privacy_review';

export interface HistoricalLoadAuditTrailEvent {
  eventId: string;
  eventType: string;
  timestampLabel: string;
  description: string;
  source: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface HistoricalLoadReadinessSummary {
  totalFiles: number;
  selectedSurveyGroupName: string;
  mappedDemographicsCount: number;
  surveyOnlyValuesCount: number;
  mappedQuestionsCount: number;
  newHistoricalQuestionsCount: number;
  matchedDimensionsCount: number;
  scaleCompatibilityStatus: string;
  piiPolicyStatus: HistoricalLoadPiiPolicy;
  unresolvedDecisionsCount: number;
  blockingRisksCount: number;
}

export interface HistoricalLoadDraft {
  draftId: string;
  status: HistoricalLoadDraftStatus;
  sourceSurveyGroup: unknown;
  sourceFiles: unknown[];
  surveyIdentity: unknown;
  historicalCycle: unknown;
  demographicsMapping: unknown;
  demographicValuesMapping: unknown;
  questionsMapping: unknown;
  dimensionsMapping: unknown;
  responseScalesMapping: unknown;
  participantPolicy: HistoricalLoadPiiPolicy;
  surveyOnlyEntities: unknown;
  excludedFields: unknown[];
  warnings: unknown[];
  resolvedDecisions: unknown[];
  unresolvedDecisions: unknown[];
  auditTrail: HistoricalLoadAuditTrailEvent[];
  readinessSummary: HistoricalLoadReadinessSummary;
}

export interface HistoricalLoadDraftCapabilities {
  isTypeScaffoldingOnly: true;
  builderImplemented: false;
  uiIntegrated: false;
  storageEnabled: false;
  backendEnabled: false;
  claudeEnabled: false;
  createsGlobalData: false;
  comparisonOutputEnabled: false;
}

export const HISTORICAL_LOAD_DRAFT_CAPABILITIES: HistoricalLoadDraftCapabilities = {
  isTypeScaffoldingOnly: true,
  builderImplemented: false,
  uiIntegrated: false,
  storageEnabled: false,
  backendEnabled: false,
  claudeEnabled: false,
  createsGlobalData: false,
  comparisonOutputEnabled: false,
};
