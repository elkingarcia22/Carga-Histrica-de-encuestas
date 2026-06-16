import type {
  HistoricalConfigurationDraftId,
  HistoricalConfigurationBatchId,
  HistoricalConfigurationScenarioId,
  HistoricalConfigurationIssueId,
  HistoricalPrivacyMode,
  HistoricalVisibilityMode,
  HistoricalPeriodMode,
} from '../configuration/historicalImportConfigurationTypes';

export type HistoricalMappingDraftId = string;
export type HistoricalMappingEntityId = string;
export type HistoricalMappingIssueId = string;
export type HistoricalMappingIgnoredColumnId = string;

export type HistoricalMappingDomain =
  | 'questions'
  | 'scales'
  | 'participants'
  | 'hierarchies'
  | 'demographics'
  | 'identifiers'
  | 'relations'
  | 'ignored-columns';

export type HistoricalMappingEntityStatus =
  | 'confirmed'
  | 'needs-review'
  | 'ambiguous'
  | 'unmapped'
  | 'ignored'
  | 'blocked';

export type HistoricalImportMappingDraftStatus =
  | 'incomplete'
  | 'needs-review'
  | 'blocked'
  | 'confirmation-required'
  | 'ready-for-confirmation'
  | 'simulated-error';

export type HistoricalMappingOrigin =
  | 'inherited'
  | 'simulated-suggestion'
  | 'user-confirmed'
  | 'user-ignored'
  | 'derived';

export type HistoricalMappingIssueSeverity =
  | 'blocking'
  | 'needs-review'
  | 'confirmation-required'
  | 'deferred'
  | 'informational'
  | 'simulated-error';

export type HistoricalMappingIssueOwnership =
  | 'normalization'
  | 'configuration'
  | 'mapping-overview'
  | 'future-domain-review'
  | 'confirmation';

export type HistoricalMappingIgnoredReason =
  | 'suggested-technical'
  | 'unsupported'
  | 'optional-metadata'
  | 'user-ignored';

export interface HistoricalImportMappingIssue {
  id: HistoricalMappingIssueId;
  code: string;
  domain: HistoricalMappingDomain | 'global';
  entityId?: HistoricalMappingEntityId;
  title: string;
  description: string;
  actionConcept: string;
  sourceIssueId?: HistoricalConfigurationIssueId | string;
  resolutionStatus: 'open' | 'resolved' | 'deferred';
  ownershipStage: HistoricalMappingIssueOwnership;
  severity: HistoricalMappingIssueSeverity;
}

export interface HistoricalImportIgnoredColumn {
  id: HistoricalMappingIgnoredColumnId;
  sourceKey: string;
  label: string;
  reason: HistoricalMappingIgnoredReason;
  required: boolean;
  restorable: boolean;
  origin: HistoricalMappingOrigin;
  issueIds: HistoricalMappingIssueId[];
}

export interface HistoricalImportMappingEntity {
  id: HistoricalMappingEntityId;
  domain: HistoricalMappingDomain;
  sourceLabel: string;
  sourceKey: string;
  syntheticTargetReference?: string;
  status: HistoricalMappingEntityStatus;
  required: boolean;
  origin: HistoricalMappingOrigin;
  issueIds: HistoricalMappingIssueId[];
  ignoredReason?: HistoricalMappingIgnoredReason;
  relatedEntityId?: HistoricalMappingEntityId;
  metadata?: Record<string, string | number | boolean>;
}

export interface HistoricalImportMappingDomainSummary {
  domain: HistoricalMappingDomain;
  total: number;
  confirmed: number;
  needsReview: number;
  ambiguous: number;
  unmapped: number;
  ignored: number;
  blocked: number;
  issueCount: number;
  blockingIssueCount: number;
  status: HistoricalMappingEntityStatus;
  reviewAvailability: 'available' | 'disabled' | 'hidden';
}

export interface HistoricalImportReviewMappingSource {
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  sourceScenarioId: HistoricalConfigurationScenarioId;
  confirmedSurveyName: string;
  confirmedSurveyType: string;
  confirmedPeriodYear: number;
  confirmedPeriodMode: HistoricalPeriodMode;
  confirmedPrivacyMode: HistoricalPrivacyMode;
  confirmedMinimumThreshold?: number;
  confirmedVisibilityMode: HistoricalVisibilityMode;
  fileCount: number;
  structuralFamilies: string[];
  detectedRoles: string[];
  relationsSummary: string[];
  deferredConfigurationIssueIds: HistoricalConfigurationIssueId[];
  configurationReadiness: boolean;
  configurationSignature: string;
}

export interface HistoricalImportMappingReadiness {
  configurationValid: boolean;
  blockingMappingsCount: number;
  requiredUnmappedCount: number;
  unresolvedScaleCount: number;
  missingIdentifierCount: number;
  incompleteCriticalRelationsCount: number;
  pendingConfirmationCount: number;
  simulatedErrorCount: number;
  blockingIssueIds: HistoricalMappingIssueId[];
  pendingIssueIds: HistoricalMappingIssueId[];
  canContinueToConfirmation: boolean;
}

export interface HistoricalImportMappingDraft {
  mappingDraftId: HistoricalMappingDraftId;
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  sourceScenarioId: HistoricalConfigurationScenarioId;
  configurationSignature: string;
  entities: HistoricalImportMappingEntity[];
  ignoredColumns: HistoricalImportIgnoredColumn[];
  issues: HistoricalImportMappingIssue[];
  domainSummaries: Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary>;
  resolvedIssueIds: HistoricalMappingIssueId[];
  deferredIssueIds: HistoricalMappingIssueId[];
  globalStatus: HistoricalImportMappingDraftStatus;
  readiness: HistoricalImportMappingReadiness;
  canContinueToConfirmation: boolean;
}

export interface HistoricalImportMappingConfirmationBoundary {
  mappingDraftId: HistoricalMappingDraftId;
  configurationDraftId: HistoricalConfigurationDraftId;
  sourceBatchId: HistoricalConfigurationBatchId;
  sourceScenarioId: HistoricalConfigurationScenarioId;
  configurationSignature: string;
  confirmedConfiguration: {
    surveyName: string;
    surveyType: string;
    periodMode: HistoricalPeriodMode;
    periodYear: number;
    privacyMode: HistoricalPrivacyMode;
    minimumThreshold?: number;
    visibilityMode: HistoricalVisibilityMode;
  };
  confirmedEntityReferences: Record<HistoricalMappingDomain, string[]>;
  ignoredColumnIds: HistoricalMappingIgnoredColumnId[];
  resolvedIssueIds: HistoricalMappingIssueId[];
  deferredIssueIds: HistoricalMappingIssueId[];
  finalDomainSummaries: Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary>;
  readiness: HistoricalImportMappingReadiness;
  canContinueToConfirmation: boolean;
}

export interface HistoricalConfigurationCompatibilityCheck {
  status: 'current' | 'stale' | 'incompatible';
  currentSignature: string;
  draftSignature: string;
  reason?: string;
}
