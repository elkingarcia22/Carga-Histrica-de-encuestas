import type {
  HistoricalImportConfigurationSource,
  HistoricalImportConfigurationDraft,
  HistoricalConfigurationDraftStatus,
} from '../../../lib/survey-import/configuration/historicalImportConfigurationTypes';

export interface HistoricalImportConfigurationScenarioFixture {
  scenarioId: string;
  source: HistoricalImportConfigurationSource;
  initialDraft: HistoricalImportConfigurationDraft;
  expectedStatus: HistoricalConfigurationDraftStatus;
  expectedCanContinue: boolean;
  expectedBoundaryAvailability: boolean;
}

const baseSource: HistoricalImportConfigurationSource = {
  batchId: 'mock-batch-123',
  scenarioId: '',
  sourceStatus: 'ready-for-configuration',
  suggestedSurveyName: 'Clima Organizacional 2026',
  suggestedSurveyType: 'Clima',
  suggestedPeriodYear: 2026,
  fileCount: 4,
  primarySourceFileId: 'mock-file-1',
  familySummary: {
    'individual-responses-raw': 1,
    'participant-roster': 1,
    'organizational-hierarchy': 2,
  },
  roleSummary: {
    'primary-source': 1,
    'complementary-source': 1,
    'hierarchy-auxiliary': 2,
  },
  inheritedIssues: [],
  pendingConfirmations: [],
  readyForConfiguration: true,
};

const baseDraft: HistoricalImportConfigurationDraft = {
  draftId: 'mock-draft-123',
  sourceBatchId: 'mock-batch-123',
  sourceScenarioId: '',
  surveyName: 'Clima Organizacional 2026',
  surveyNameOrigin: 'simulated-suggestion',
  surveyType: 'Clima',
  surveyTypeOrigin: 'simulated-suggestion',
  surveyTypeConfirmed: true,
  periodMode: 'year',
  periodYear: 2026,
  periodYearOrigin: 'simulated-suggestion',
  privacyMode: 'confidential',
  identifiedModeConfirmed: false,
  minimumThreshold: 5,
  visibilityMode: 'administrators-and-authorized-consultants',
  resolvedInheritedIssueIds: [],
  resolvedConfirmationIds: [],
  draftStatus: 'valid',
  canContinueToMapping: true,
};

export const HISTORICAL_CONFIGURATION_SCENARIOS: Record<string, HistoricalImportConfigurationScenarioFixture> = {
  'ready-for-mapping': {
    scenarioId: 'ready-for-mapping',
    source: { ...baseSource, scenarioId: 'ready-for-mapping' },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'ready-for-mapping',
      draftStatus: 'ready-for-mapping',
      canContinueToMapping: true,
    },
    expectedStatus: 'ready-for-mapping',
    expectedCanContinue: true,
    expectedBoundaryAvailability: true,
  },
  'incomplete-name': {
    scenarioId: 'incomplete-name',
    source: { ...baseSource, scenarioId: 'incomplete-name', suggestedSurveyName: '' },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'incomplete-name',
      surveyName: '',
      surveyNameOrigin: 'user-edited',
      draftStatus: 'incomplete',
      canContinueToMapping: false,
    },
    expectedStatus: 'incomplete',
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
  'ambiguous-survey-type': {
    scenarioId: 'ambiguous-survey-type',
    source: { ...baseSource, scenarioId: 'ambiguous-survey-type', suggestedSurveyType: 'Otro', pendingConfirmations: ['type-confirmation'] },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'ambiguous-survey-type',
      surveyType: 'Otro',
      surveyTypeConfirmed: false,
      draftStatus: 'confirmation-required',
      canContinueToMapping: false,
    },
    expectedStatus: 'confirmation-required',
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
  'missing-period': {
    scenarioId: 'missing-period',
    source: { ...baseSource, scenarioId: 'missing-period', suggestedPeriodYear: undefined },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'missing-period',
      periodYear: undefined,
      periodYearOrigin: 'user-edited',
      draftStatus: 'incomplete',
      canContinueToMapping: false,
    },
    expectedStatus: 'incomplete',
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
  'privacy-confirmation-required': {
    scenarioId: 'privacy-confirmation-required',
    source: { ...baseSource, scenarioId: 'privacy-confirmation-required' },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'privacy-confirmation-required',
      privacyMode: 'identified',
      identifiedModeConfirmed: false,
      minimumThreshold: undefined,
      draftStatus: 'confirmation-required',
      canContinueToMapping: false,
    },
    expectedStatus: 'confirmation-required',
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
  'invalid-threshold': {
    scenarioId: 'invalid-threshold',
    source: { ...baseSource, scenarioId: 'invalid-threshold' },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'invalid-threshold',
      privacyMode: 'confidential',
      minimumThreshold: 2, // below minimum 3
      draftStatus: 'incomplete',
      canContinueToMapping: false,
    },
    expectedStatus: 'incomplete', // or invalid based on contract. Let's use incomplete.
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
  'inherited-blocking-issue': {
    scenarioId: 'inherited-blocking-issue',
    source: {
      ...baseSource,
      scenarioId: 'inherited-blocking-issue',
      inheritedIssues: [
        {
          id: 'issue-inherited-1',
          code: 'BLOCKING_MOCK',
          severity: 'blocking',
          scope: 'inherited',
          title: 'Error de estructura',
          description: 'Fallo heredado.',
          conceptualAction: 'Volver a normalización',
        },
      ],
    },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'inherited-blocking-issue',
      draftStatus: 'blocked-by-inherited-issue',
      canContinueToMapping: false,
    },
    expectedStatus: 'blocked-by-inherited-issue',
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
  'simulated-error': {
    scenarioId: 'simulated-error',
    source: { ...baseSource, scenarioId: 'simulated-error' },
    initialDraft: {
      ...baseDraft,
      sourceScenarioId: 'simulated-error',
      draftStatus: 'simulated-error',
      canContinueToMapping: false,
    },
    expectedStatus: 'simulated-error',
    expectedCanContinue: false,
    expectedBoundaryAvailability: false,
  },
};
