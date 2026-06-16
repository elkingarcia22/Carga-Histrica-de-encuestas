export type HistoricalConfigurationBatchId = string;
export type HistoricalConfigurationScenarioId = string;
export type HistoricalConfigurationDraftId = string;
export type HistoricalConfigurationIssueId = string;

export type HistoricalPrivacyMode =
  | 'anonymous'
  | 'confidential'
  | 'identified';

export type HistoricalVisibilityMode =
  | 'administrators-only'
  | 'administrators-and-authorized-consultants';

export type HistoricalPeriodMode = 'year';

export type HistoricalConfigurationDraftStatus =
  | 'incomplete'
  | 'valid'
  | 'confirmation-required'
  | 'blocked-by-inherited-issue'
  | 'simulated-error'
  | 'ready-for-mapping';

export type HistoricalFieldOrigin =
  | 'inherited'
  | 'simulated-suggestion'
  | 'user-edited'
  | 'user-confirmed';

export type HistoricalConfigurationIssueSeverity =
  | 'blocking'
  | 'confirmation-required'
  | 'deferred-to-mapping'
  | 'simulated-error';

export type HistoricalConfigurationIssueScope =
  | 'global'
  | 'name'
  | 'type'
  | 'period'
  | 'privacy'
  | 'threshold'
  | 'visibility'
  | 'inherited';

export interface HistoricalConfigurationIssue {
  id: HistoricalConfigurationIssueId;
  code: string;
  severity: HistoricalConfigurationIssueSeverity;
  scope: HistoricalConfigurationIssueScope;
  field?: string;
  title: string;
  description: string;
  conceptualAction: string;
  sourceIssueId?: string;
}

export interface HistoricalImportConfigurationSource {
  batchId: HistoricalConfigurationBatchId;
  scenarioId: HistoricalConfigurationScenarioId;
  sourceStatus: string;
  suggestedSurveyName?: string;
  suggestedSurveyType?: string;
  suggestedPeriodYear?: number;
  fileCount: number;
  primarySourceFileId?: string;
  familySummary: Record<string, number>;
  roleSummary: Record<string, number>;
  inheritedIssues: HistoricalConfigurationIssue[];
  pendingConfirmations: string[];
  readyForConfiguration: boolean;
}

export interface HistoricalImportConfigurationDraft {
  draftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  sourceScenarioId: HistoricalConfigurationScenarioId;

  surveyName: string;
  surveyNameOrigin: HistoricalFieldOrigin;

  surveyType: string;
  surveyTypeOrigin: HistoricalFieldOrigin;
  surveyTypeConfirmed: boolean;

  periodMode: HistoricalPeriodMode;
  periodYear?: number;
  periodYearOrigin: HistoricalFieldOrigin;

  privacyMode?: HistoricalPrivacyMode;
  identifiedModeConfirmed: boolean;

  minimumThreshold?: number;

  visibilityMode?: HistoricalVisibilityMode;

  resolvedInheritedIssueIds: HistoricalConfigurationIssueId[];
  resolvedConfirmationIds: string[];

  draftStatus: HistoricalConfigurationDraftStatus;
  canContinueToMapping: boolean;
}

export interface HistoricalImportReviewMappingBoundary {
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  sourceScenarioId: HistoricalConfigurationScenarioId;
  confirmedConfiguration: {
    surveyName: string;
    surveyType: string;
    periodMode: HistoricalPeriodMode;
    periodYear: number;
    privacyMode: HistoricalPrivacyMode;
    minimumThreshold?: number;
    visibilityMode: HistoricalVisibilityMode;
  };
  deferredIssueIds: HistoricalConfigurationIssueId[];
  isReadyForMapping: boolean;
  syntheticTimestamp: string;
}
