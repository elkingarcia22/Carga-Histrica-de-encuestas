import type {
  HistoricalImportConfigurationDraft,
  HistoricalImportConfigurationSource,
  HistoricalConfigurationDraftStatus,
  HistoricalConfigurationIssue,
  HistoricalImportReviewMappingBoundary,
  HistoricalPrivacyMode,
  HistoricalVisibilityMode
} from './historicalImportConfigurationTypes';
import { HISTORICAL_CONFIGURATION_LIMITS } from '../../../config/survey-import/historicalImportConfigurationConfig';
import { HISTORICAL_CONFIGURATION_SCENARIOS } from '../../../mocks/survey-import/configuration/historicalImportConfigurationScenarios';

/**
 * Retrieves the scenario fixture data by scenarioId.
 * In a real application, this might fetch from an API or local state orchestrator.
 */
export const getHistoricalConfigurationScenario = (scenarioId: string) => {
  const scenario = HISTORICAL_CONFIGURATION_SCENARIOS[scenarioId];
  if (!scenario) {
    throw new Error(`Scenario not found: ${scenarioId}`);
  }
  return { ...scenario }; // Return shallow copy to respect immutability at surface level
};

export const getHistoricalConfigurationSource = (scenarioId: string): HistoricalImportConfigurationSource => {
  return getHistoricalConfigurationScenario(scenarioId).source;
};

export const initializeHistoricalConfigurationDraft = (scenarioId: string): HistoricalImportConfigurationDraft => {
  return getHistoricalConfigurationScenario(scenarioId).initialDraft;
};

/**
 * Pure Validation Functions
 */

export const validateSurveyName = (name: string): boolean => {
  const trimmed = name.trim();
  return (
    trimmed.length >= HISTORICAL_CONFIGURATION_LIMITS.nameMinLength &&
    trimmed.length <= HISTORICAL_CONFIGURATION_LIMITS.nameMaxLength
  );
};

export const validateSurveyType = (type: string): boolean => {
  if (!type.trim()) return false;
  // If ambiguous (in real app determined by rules), it must be confirmed.
  // In mock context, we rely on the confirmed flag.
  return true; // we rely on the top-level derivation to check confirmation
};

export const validatePeriodYear = (year?: number): boolean => {
  if (!year) return false;
  return Number.isInteger(year) && year >= HISTORICAL_CONFIGURATION_LIMITS.yearMin && year <= HISTORICAL_CONFIGURATION_LIMITS.yearMax;
};

export const validatePrivacyMode = (privacy?: HistoricalPrivacyMode): boolean => {
  return privacy === 'anonymous' || privacy === 'confidential' || privacy === 'identified';
};

export const validateMinimumThreshold = (privacy?: HistoricalPrivacyMode, threshold?: number): boolean => {
  if (privacy === 'anonymous' || privacy === 'identified') {
    return true; // Not required or doesn't apply
  }
  if (privacy === 'confidential') {
    if (threshold === undefined || threshold === null) return false;
    return Number.isInteger(threshold) && threshold >= HISTORICAL_CONFIGURATION_LIMITS.thresholdMin && threshold <= HISTORICAL_CONFIGURATION_LIMITS.thresholdMax;
  }
  return false;
};

export const validateVisibilityMode = (visibility?: string): boolean => {
  return visibility === 'administrators-only' || visibility === 'administrators-and-authorized-consultants';
};

/**
 * Global derivation rule
 */
export const determineCanContinueToMapping = (
  draft: HistoricalImportConfigurationDraft,
  inheritedIssues: HistoricalConfigurationIssue[]
): boolean => {
  if (draft.draftStatus === 'simulated-error' || draft.draftStatus === 'blocked-by-inherited-issue') {
    return false;
  }

  const hasBlockingIssues = inheritedIssues.some((issue) => issue.severity === 'blocking' && !draft.resolvedInheritedIssueIds.includes(issue.id));
  if (hasBlockingIssues) return false;

  const isNameValid = validateSurveyName(draft.surveyName);
  const isTypeValid = draft.surveyType.trim() !== '' && draft.surveyTypeConfirmed;
  const isYearValid = validatePeriodYear(draft.periodYear);
  const isPrivacyValid = validatePrivacyMode(draft.privacyMode);

  const isIdentifiedValid = draft.privacyMode !== 'identified' || draft.identifiedModeConfirmed;
  const isThresholdValid = validateMinimumThreshold(draft.privacyMode, draft.minimumThreshold);
  const isVisibilityValid = validateVisibilityMode(draft.visibilityMode);

  return isNameValid && isTypeValid && isYearValid && isPrivacyValid && isIdentifiedValid && isThresholdValid && isVisibilityValid;
};

export const deriveDraftStatus = (
  draft: HistoricalImportConfigurationDraft,
  inheritedIssues: HistoricalConfigurationIssue[]
): HistoricalConfigurationDraftStatus => {
  if (draft.draftStatus === 'simulated-error') return 'simulated-error';

  const hasBlockingIssues = inheritedIssues.some((issue) => issue.severity === 'blocking' && !draft.resolvedInheritedIssueIds.includes(issue.id));
  if (hasBlockingIssues) return 'blocked-by-inherited-issue';

  if (!draft.surveyTypeConfirmed && draft.surveyType.trim() !== '') return 'confirmation-required';
  if (draft.privacyMode === 'identified' && !draft.identifiedModeConfirmed) return 'confirmation-required';

  const canContinue = determineCanContinueToMapping(draft, inheritedIssues);
  if (canContinue) {
    // If it's fully valid and it was explicitly asked to be ready-for-mapping via scenario status
    if (draft.draftStatus === 'ready-for-mapping') return 'ready-for-mapping';
    return 'valid';
  }

  return 'incomplete';
};

/**
 * Builds the output boundary
 */
export const buildReviewMappingBoundary = (
  draft: HistoricalImportConfigurationDraft,
  source: HistoricalImportConfigurationSource
): HistoricalImportReviewMappingBoundary | null => {
  const canContinue = determineCanContinueToMapping(draft, source.inheritedIssues);
  if (!canContinue) return null;

  return {
    configurationDraftId: draft.draftId,
    sourceBatchId: draft.sourceBatchId,
    sourceScenarioId: draft.sourceScenarioId,
    confirmedConfiguration: {
      surveyName: draft.surveyName,
      surveyType: draft.surveyType,
      periodMode: draft.periodMode,
      periodYear: draft.periodYear as number,
      privacyMode: draft.privacyMode as HistoricalPrivacyMode,
      minimumThreshold: draft.privacyMode === 'confidential' ? draft.minimumThreshold : undefined,
      visibilityMode: draft.visibilityMode as HistoricalVisibilityMode,
    },
    deferredIssueIds: source.inheritedIssues.filter((i) => i.severity === 'deferred-to-mapping').map((i) => i.id),
    isReadyForMapping: true,
    syntheticTimestamp: '2026-06-16T12:00:00Z',
  };
};

/**
 * Validates the contract references and consistency
 */
export const validateContractReferences = (
  draft: HistoricalImportConfigurationDraft,
  source: HistoricalImportConfigurationSource
): string[] => {
  const errors: string[] = [];

  if (draft.sourceBatchId !== source.batchId) {
    errors.push(`Draft sourceBatchId (${draft.sourceBatchId}) does not match Source batchId (${source.batchId})`);
  }

  if (draft.sourceScenarioId !== source.scenarioId) {
    errors.push(`Draft sourceScenarioId (${draft.sourceScenarioId}) does not match Source scenarioId (${source.scenarioId})`);
  }

  for (const id of draft.resolvedInheritedIssueIds) {
    if (!source.inheritedIssues.some((issue) => issue.id === id)) {
      errors.push(`Resolved issue ID (${id}) not found in inherited issues`);
    }
  }

  const derivedCanContinue = determineCanContinueToMapping(draft, source.inheritedIssues);
  if (derivedCanContinue !== draft.canContinueToMapping) {
    errors.push(`Derived canContinueToMapping (${derivedCanContinue}) does not match draft property (${draft.canContinueToMapping})`);
  }

  return errors;
};
