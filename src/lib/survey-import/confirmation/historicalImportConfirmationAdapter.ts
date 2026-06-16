import type {
  HistoricalImportConfirmationSource,
  HistoricalImportConfirmationDraft,
  HistoricalImportConfirmationReadiness,
  HistoricalConfirmationStatus,
  HistoricalConfirmationCompatibility,
  HistoricalConfirmationIssueId,
  HistoricalConfirmationRole,
  HistoricalImportConfirmationExecutionBoundary,
  HistoricalImportConfirmationScenario,
} from './historicalImportConfirmationTypes';
import { HISTORICAL_IMPORT_CONFIRMATION_SCENARIOS } from '../../../mocks/survey-import/confirmation/historicalImportConfirmationScenarios';
import type { HistoricalImportMappingConfirmationBoundary } from '../review-mapping/historicalImportReviewMappingTypes';

export function getHistoricalImportConfirmationScenario(scenarioId: string) {
  return HISTORICAL_IMPORT_CONFIRMATION_SCENARIOS.find((s: HistoricalImportConfirmationScenario) => s.scenarioId === scenarioId);
}

export function buildConfirmationSourceFromMapping(
  boundary: HistoricalImportMappingConfirmationBoundary
): HistoricalImportConfirmationSource {
  return {
    mappingDraftId: boundary.mappingDraftId,
    configurationDraftId: boundary.configurationDraftId,
    sourceBatchId: boundary.sourceBatchId,
    sourceScenarioId: boundary.sourceScenarioId,
    configurationSignature: boundary.configurationSignature,
    mappingSignature: boundary.mappingSignature,
    confirmedSurveyName: boundary.confirmedConfiguration.surveyName,
    confirmedSurveyType: boundary.confirmedConfiguration.surveyType,
    confirmedPeriodYear: boundary.confirmedConfiguration.periodYear,
    confirmedPeriodMode: boundary.confirmedConfiguration.periodMode,
    confirmedPrivacyMode: boundary.confirmedConfiguration.privacyMode,
    confirmedMinimumThreshold: boundary.confirmedConfiguration.minimumThreshold,
    confirmedVisibilityMode: boundary.confirmedConfiguration.visibilityMode,
    fileCount: boundary.fileCount,
    domainSummaries: { ...boundary.finalDomainSummaries },
    ignoredColumnIds: [...boundary.ignoredColumnIds],
    resolvedIssueIds: [...boundary.resolvedIssueIds],
    deferredIssueIds: [...boundary.deferredIssueIds],
    blockingMappingIssueIds: [...boundary.readiness.blockingIssueIds],
    mappingGlobalStatus: boundary.canContinueToConfirmation ? 'ready-for-confirmation' : 'blocked',
    mappingReadiness: boundary.readiness.canContinueToConfirmation,
    canContinueToConfirmation: boundary.canContinueToConfirmation,
  };
}

export function buildConfirmationInputSignature(
  source: HistoricalImportConfirmationSource
): string {
  return [
    source.mappingDraftId,
    source.configurationDraftId,
    source.sourceBatchId,
    source.configurationSignature,
    source.mappingSignature,
    source.mappingReadiness ? 'ready' : 'not-ready',
  ].join('|');
}

export function checkConfirmationCompatibility(
  source: HistoricalImportConfirmationSource,
  draftMappingDraftId: string,
  draftInputSignature: string
): HistoricalConfirmationCompatibility {
  if (source.mappingDraftId !== draftMappingDraftId) {
    return 'incompatible';
  }
  const currentSignature = buildConfirmationInputSignature(source);
  if (currentSignature !== draftInputSignature) {
    return 'stale';
  }
  return 'current';
}

export function deriveConfirmationStatus(
  compatibility: HistoricalConfirmationCompatibility,
  hasSimulatedError: boolean,
  hasBlockingIssues: boolean,
  hasRequiredIgnoredColumns: boolean,
  hasConfirmationRequiredIssues: boolean,
  explicitConfirmationAccepted: boolean,
  isPrepared: boolean
): HistoricalConfirmationStatus {
  if (hasSimulatedError) return 'simulated-error';
  if (compatibility === 'incompatible') return 'incompatible';
  if (compatibility === 'stale') return 'stale';
  if (hasBlockingIssues || hasRequiredIgnoredColumns) return 'blocked';
  if (hasConfirmationRequiredIssues || !explicitConfirmationAccepted) return 'confirmation-required';
  if (isPrepared) return 'confirmation-prepared';
  return 'ready-for-confirmation';
}

export function determineCanPrepareSimulatedExecution(
  source: HistoricalImportConfirmationSource,
  compatibility: HistoricalConfirmationCompatibility,
  hasBlockingIssues: boolean,
  hasConfirmationRequiredIssues: boolean,
  hasRequiredIgnoredColumns: boolean,
  hasSimulatedError: boolean,
  explicitConfirmationAccepted: boolean,
  isPrepared: boolean
): boolean {
  return (
    source.canContinueToConfirmation &&
    source.mappingReadiness &&
    compatibility === 'current' &&
    !hasBlockingIssues &&
    !hasConfirmationRequiredIssues &&
    !hasRequiredIgnoredColumns &&
    !hasSimulatedError &&
    explicitConfirmationAccepted &&
    !isPrepared
  );
}

export function deriveConfirmationReadiness(
  source: HistoricalImportConfirmationSource,
  compatibility: HistoricalConfirmationCompatibility,
  hasBlockingIssues: boolean,
  hasConfirmationRequiredIssues: boolean,
  hasRequiredIgnoredColumns: boolean,
  hasSimulatedError: boolean,
  explicitConfirmationAccepted: boolean,
  isPrepared: boolean
): HistoricalImportConfirmationReadiness {
  const unmetRequirementCodes: string[] = [];

  if (!source.canContinueToConfirmation) unmetRequirementCodes.push('BOUNDARY_INVALID');
  if (!source.mappingReadiness) unmetRequirementCodes.push('MAPPING_NOT_READY');
  if (compatibility === 'stale') unmetRequirementCodes.push('COMPATIBILITY_STALE');
  if (compatibility === 'incompatible') unmetRequirementCodes.push('COMPATIBILITY_INCOMPATIBLE');
  if (hasBlockingIssues) unmetRequirementCodes.push('BLOCKING_ISSUES_PRESENT');
  if (hasConfirmationRequiredIssues) unmetRequirementCodes.push('PENDING_CONFIRMATION_ISSUES');
  if (hasRequiredIgnoredColumns) unmetRequirementCodes.push('REQUIRED_IGNORED_COLUMNS');
  if (!explicitConfirmationAccepted) unmetRequirementCodes.push('EXPLICIT_CONFIRMATION_MISSING');
  if (hasSimulatedError) unmetRequirementCodes.push('SIMULATED_ERROR_PRESENT');
  if (isPrepared) unmetRequirementCodes.push('ALREADY_PREPARED');

  const canPrepare = determineCanPrepareSimulatedExecution(
    source, compatibility, hasBlockingIssues, hasConfirmationRequiredIssues,
    hasRequiredIgnoredColumns, hasSimulatedError, explicitConfirmationAccepted, isPrepared
  );

  return {
    boundaryValid: source.canContinueToConfirmation,
    mappingReady: source.mappingReadiness,
    compatibilityCurrent: compatibility === 'current',
    noBlockingIssues: !hasBlockingIssues,
    noPendingConfirmations: !hasConfirmationRequiredIssues,
    noRequiredIgnoredColumns: !hasRequiredIgnoredColumns,
    explicitConfirmationAccepted,
    noSimulatedError: !hasSimulatedError,
    isPrepared,
    unmetRequirementCodes,
    canPrepareSimulatedExecution: canPrepare,
  };
}

export function initializeHistoricalImportConfirmationDraft(
  confirmationDraftId: string,
  source: HistoricalImportConfirmationSource,
  role: HistoricalConfirmationRole = 'implementation-consultant',
  options: {
    explicitConfirmationAccepted?: boolean;
    hasBlockingIssues?: boolean;
    hasConfirmationRequiredIssues?: boolean;
    hasRequiredIgnoredColumns?: boolean;
    hasSimulatedError?: boolean;
    blockingIssueIds?: HistoricalConfirmationIssueId[];
    deferredIssueIds?: HistoricalConfirmationIssueId[];
    ignoredColumnIds?: string[];
  } = {}
): HistoricalImportConfirmationDraft {
  const inputSignature = buildConfirmationInputSignature(source);
  const compatibility = checkConfirmationCompatibility(source, source.mappingDraftId, inputSignature);

  const explicitConfirmationAccepted = options.explicitConfirmationAccepted ?? false;
  const isPrepared = false;

  const status = deriveConfirmationStatus(
    compatibility,
    options.hasSimulatedError ?? false,
    options.hasBlockingIssues ?? false,
    options.hasRequiredIgnoredColumns ?? false,
    options.hasConfirmationRequiredIssues ?? false,
    explicitConfirmationAccepted,
    isPrepared
  );

  const finalReadiness = deriveConfirmationReadiness(
    source,
    compatibility,
    options.hasBlockingIssues ?? false,
    options.hasConfirmationRequiredIssues ?? false,
    options.hasRequiredIgnoredColumns ?? false,
    options.hasSimulatedError ?? false,
    explicitConfirmationAccepted,
    isPrepared
  );

  return {
    confirmationDraftId,
    mappingDraftId: source.mappingDraftId,
    configurationDraftId: source.configurationDraftId,
    sourceBatchId: source.sourceBatchId,
    inputSignature,
    explicitConfirmationAccepted,
    confirmedByRole: role,
    compatibility,
    blockingIssueIds: options.blockingIssueIds ?? [],
    deferredIssueIds: options.deferredIssueIds ?? [],
    ignoredColumnIds: options.ignoredColumnIds ?? [],
    confirmationStatus: status,
    finalReadiness,
    canPrepareSimulatedExecution: finalReadiness.canPrepareSimulatedExecution,
    confirmationPrepared: isPrepared,
  };
}

export function prepareConfirmationDraft(
  draft: HistoricalImportConfirmationDraft,
  source: HistoricalImportConfirmationSource,
  hasBlockingIssues: boolean,
  hasConfirmationRequiredIssues: boolean,
  hasRequiredIgnoredColumns: boolean,
  hasSimulatedError: boolean
): HistoricalImportConfirmationDraft | null {
  const compatibility = checkConfirmationCompatibility(source, draft.mappingDraftId, draft.inputSignature);

  const canPrepare = determineCanPrepareSimulatedExecution(
    source,
    compatibility,
    hasBlockingIssues,
    hasConfirmationRequiredIssues,
    hasRequiredIgnoredColumns,
    hasSimulatedError,
    draft.explicitConfirmationAccepted,
    draft.confirmationPrepared
  );

  if (!canPrepare) {
    return null;
  }

  const isPrepared = true;
  const newStatus = deriveConfirmationStatus(
    compatibility,
    hasSimulatedError,
    hasBlockingIssues,
    hasRequiredIgnoredColumns,
    hasConfirmationRequiredIssues,
    draft.explicitConfirmationAccepted,
    isPrepared
  );

  const finalReadiness = deriveConfirmationReadiness(
    source,
    compatibility,
    hasBlockingIssues,
    hasConfirmationRequiredIssues,
    hasRequiredIgnoredColumns,
    hasSimulatedError,
    draft.explicitConfirmationAccepted,
    isPrepared
  );

  return {
    ...draft,
    confirmationStatus: newStatus,
    confirmationPrepared: isPrepared,
    finalReadiness,
    canPrepareSimulatedExecution: finalReadiness.canPrepareSimulatedExecution,
  };
}

export function buildConfirmationExecutionBoundary(
  draft: HistoricalImportConfirmationDraft,
  source: HistoricalImportConfirmationSource
): HistoricalImportConfirmationExecutionBoundary | null {
  if (!draft.confirmationPrepared || draft.confirmationStatus !== 'confirmation-prepared') {
    return null;
  }

  return {
    confirmationDraftId: draft.confirmationDraftId,
    mappingDraftId: draft.mappingDraftId,
    configurationDraftId: draft.configurationDraftId,
    sourceBatchId: draft.sourceBatchId,
    inputSignature: draft.inputSignature,
    configurationSignature: source.configurationSignature,
    mappingSignature: source.mappingSignature,
    confirmedByRole: draft.confirmedByRole,
    explicitConfirmationAccepted: draft.explicitConfirmationAccepted,
    blockingIssueIds: [...draft.blockingIssueIds],
    deferredIssueIds: [...draft.deferredIssueIds],
    ignoredColumnIds: [...draft.ignoredColumnIds],
    confirmationStatus: draft.confirmationStatus,
    finalReadiness: {
      ...draft.finalReadiness,
      unmetRequirementCodes: [...draft.finalReadiness.unmetRequirementCodes],
    },
    canPrepareSimulatedExecution: draft.canPrepareSimulatedExecution,
  };
}

export function validateConfirmationContractReferences(
  scenarios: readonly HistoricalImportConfirmationScenario[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const scenarioIds = new Set<string>();
  const draftIds = new Set<string>();

  for (const s of scenarios) {
    if (scenarioIds.has(s.scenarioId)) errors.push(`Duplicate scenarioId: ${s.scenarioId}`);
    scenarioIds.add(s.scenarioId);

    if (draftIds.has(s.draft.confirmationDraftId)) errors.push(`Duplicate draftId: ${s.draft.confirmationDraftId}`);
    draftIds.add(s.draft.confirmationDraftId);

    if (s.draft.confirmationStatus !== s.expectedStatus) {
      errors.push(`Status mismatch in ${s.scenarioId}: expected ${s.expectedStatus}, got ${s.draft.confirmationStatus}`);
    }

    if (s.draft.compatibility !== s.expectedCompatibility) {
      errors.push(`Compatibility mismatch in ${s.scenarioId}: expected ${s.expectedCompatibility}, got ${s.draft.compatibility}`);
    }

    if (s.draft.canPrepareSimulatedExecution !== s.expectedCTA) {
      errors.push(`CTA mismatch in ${s.scenarioId}: expected ${s.expectedCTA}, got ${s.draft.canPrepareSimulatedExecution}`);
    }

    const expectedUnmetString = [...s.expectedUnmetRequirementCodes].sort().join(',');
    const actualUnmetString = [...s.draft.finalReadiness.unmetRequirementCodes].sort().join(',');
    if (expectedUnmetString !== actualUnmetString) {
      errors.push(`Unmet requirements mismatch in ${s.scenarioId}: expected ${expectedUnmetString}, got ${actualUnmetString}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
