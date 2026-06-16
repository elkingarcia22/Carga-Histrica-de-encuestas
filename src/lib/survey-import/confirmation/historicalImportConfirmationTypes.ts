import type {
  HistoricalConfigurationDraftId,
  HistoricalConfigurationBatchId,
  HistoricalConfigurationScenarioId,
  HistoricalPeriodMode,
  HistoricalPrivacyMode,
  HistoricalVisibilityMode,
} from '../configuration/historicalImportConfigurationTypes';

import type {
  HistoricalMappingDraftId,
  HistoricalMappingIssueId,
  HistoricalMappingIgnoredColumnId,
  HistoricalImportMappingDomainSummary,
  HistoricalMappingDomain,
} from '../review-mapping/historicalImportReviewMappingTypes';

export type HistoricalConfirmationDraftId = string;
export type HistoricalConfirmationScenarioId = string;
export type HistoricalConfirmationIssueId = string;
export type HistoricalConfirmationIgnoredColumnId = string;

export type HistoricalConfirmationRole =
  | 'implementation-consultant'
  | 'client-administrator';

export type HistoricalConfirmationCompatibility =
  | 'current'
  | 'stale'
  | 'incompatible';

export type HistoricalConfirmationStatus =
  | 'incomplete'
  | 'confirmation-required'
  | 'blocked'
  | 'stale'
  | 'incompatible'
  | 'ready-for-confirmation'
  | 'confirmation-prepared'
  | 'simulated-error';

export type HistoricalConfirmationIssueSeverity =
  | 'blocking'
  | 'confirmation-required'
  | 'deferred'
  | 'informational'
  | 'simulated-error';

export type HistoricalConfirmationIssueScope =
  | 'mapping'
  | 'configuration'
  | 'ignored-column'
  | 'deferred-resolution'
  | 'confirmation'
  | 'system';

export interface HistoricalImportConfirmationSource {
  mappingDraftId: HistoricalMappingDraftId;
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  sourceScenarioId: HistoricalConfigurationScenarioId;
  configurationSignature: string;
  mappingSignature: string;
  confirmedSurveyName: string;
  confirmedSurveyType: string;
  confirmedPeriodYear: number;
  confirmedPeriodMode: HistoricalPeriodMode;
  confirmedPrivacyMode: HistoricalPrivacyMode;
  confirmedMinimumThreshold?: number;
  confirmedVisibilityMode: HistoricalVisibilityMode;
  fileCount: number;
  domainSummaries: Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary>;
  ignoredColumnIds: HistoricalMappingIgnoredColumnId[];
  resolvedIssueIds: HistoricalMappingIssueId[];
  deferredIssueIds: HistoricalMappingIssueId[];
  blockingMappingIssueIds: HistoricalMappingIssueId[];
  mappingGlobalStatus: string;
  mappingReadiness: boolean;
  canContinueToConfirmation: boolean;
}

export interface HistoricalImportConfirmationIssue {
  id: HistoricalConfirmationIssueId;
  code: string;
  severity: HistoricalConfirmationIssueSeverity;
  scope: HistoricalConfirmationIssueScope;
  title: string;
  description: string;
  relatedReferenceIds: string[];
  isResolved?: boolean;
}

export interface HistoricalImportConfirmationIgnoredColumnReference {
  id: HistoricalConfirmationIgnoredColumnId;
  mappingIgnoredColumnId: HistoricalMappingIgnoredColumnId;
  required: boolean;
  technical: boolean;
}

export interface HistoricalImportConfirmationReadiness {
  boundaryValid: boolean;
  mappingReady: boolean;
  compatibilityCurrent: boolean;
  noBlockingIssues: boolean;
  noPendingConfirmations: boolean;
  noRequiredIgnoredColumns: boolean;
  explicitConfirmationAccepted: boolean;
  noSimulatedError: boolean;
  isPrepared: boolean;
  unmetRequirementCodes: string[];
  canPrepareSimulatedExecution: boolean;
}

export interface HistoricalImportConfirmationDraft {
  confirmationDraftId: HistoricalConfirmationDraftId;
  mappingDraftId: HistoricalMappingDraftId;
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  inputSignature: string;
  explicitConfirmationAccepted: boolean;
  confirmedByRole: HistoricalConfirmationRole;
  compatibility: HistoricalConfirmationCompatibility;
  blockingIssueIds: HistoricalConfirmationIssueId[];
  deferredIssueIds: HistoricalConfirmationIssueId[];
  ignoredColumnIds: HistoricalConfirmationIgnoredColumnId[];
  confirmationStatus: HistoricalConfirmationStatus;
  finalReadiness: HistoricalImportConfirmationReadiness;
  canPrepareSimulatedExecution: boolean;
  confirmationPrepared: boolean;
}

export interface HistoricalImportConfirmationExecutionBoundary {
  confirmationDraftId: HistoricalConfirmationDraftId;
  mappingDraftId: HistoricalMappingDraftId;
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  inputSignature: string;
  configurationSignature: string;
  mappingSignature: string;
  confirmedByRole: HistoricalConfirmationRole;
  explicitConfirmationAccepted: boolean;
  blockingIssueIds: HistoricalConfirmationIssueId[];
  deferredIssueIds: HistoricalConfirmationIssueId[];
  ignoredColumnIds: HistoricalConfirmationIgnoredColumnId[];
  confirmationStatus: HistoricalConfirmationStatus;
  finalReadiness: HistoricalImportConfirmationReadiness;
  canPrepareSimulatedExecution: boolean;
}

export interface HistoricalImportConfirmationScenario {
  scenarioId: string;
  qaPurpose: string;
  source: HistoricalImportConfirmationSource;
  draft: HistoricalImportConfirmationDraft;
  issues: HistoricalImportConfirmationIssue[];
  ignoredColumns: HistoricalImportConfirmationIgnoredColumnReference[];
  expectedStatus: HistoricalConfirmationStatus;
  expectedCompatibility: HistoricalConfirmationCompatibility;
  expectedCTA: boolean;
  expectedBoundaryAvailableAfterPrepare: boolean;
  expectedIssueIds: HistoricalConfirmationIssueId[];
  expectedDeferredIssueIds: HistoricalConfirmationIssueId[];
  expectedIgnoredColumnIds: HistoricalConfirmationIgnoredColumnId[];
  expectedUnmetRequirementCodes: string[];
}
