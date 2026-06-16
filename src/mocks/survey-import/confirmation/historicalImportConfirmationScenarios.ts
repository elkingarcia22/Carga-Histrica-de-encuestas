import type {
  HistoricalImportConfirmationSource,
  HistoricalImportConfirmationDraft,
  HistoricalConfirmationStatus,
  HistoricalConfirmationCompatibility,
  HistoricalConfirmationIssueId,
  HistoricalConfirmationIgnoredColumnId,
  HistoricalImportConfirmationIssue,
  HistoricalImportConfirmationIgnoredColumnReference
} from '../../../lib/survey-import/confirmation/historicalImportConfirmationTypes';

import { initializeHistoricalImportConfirmationDraft } from '../../../lib/survey-import/confirmation/historicalImportConfirmationAdapter';

const baseSource: HistoricalImportConfirmationSource = {
  mappingDraftId: 'map-draft-001',
  configurationDraftId: 'config-draft-001',
  sourceBatchId: 'batch-001',
  sourceScenarioId: 'scenario-001',
  configurationSignature: 'config-sig-abc',
  mappingSignature: 'map-sig-def',
  confirmedSurveyName: 'Clima Organizacional 2026',
  confirmedSurveyType: 'Clima organizacional',
  confirmedPeriodYear: 2026,
  confirmedPeriodMode: 'year',
  confirmedPrivacyMode: 'confidential',
  confirmedMinimumThreshold: 5,
  confirmedVisibilityMode: 'administrators-and-authorized-consultants',
  fileCount: 1,
  domainSummaries: {
    questions: { domain: 'questions', total: 10, confirmed: 10, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    scales: { domain: 'scales', total: 5, confirmed: 5, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    participants: { domain: 'participants', total: 0, confirmed: 0, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    hierarchies: { domain: 'hierarchies', total: 0, confirmed: 0, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    demographics: { domain: 'demographics', total: 0, confirmed: 0, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    identifiers: { domain: 'identifiers', total: 0, confirmed: 0, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    relations: { domain: 'relations', total: 0, confirmed: 0, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 0, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
    'ignored-columns': { domain: 'ignored-columns', total: 1, confirmed: 1, needsReview: 0, ambiguous: 0, unmapped: 0, ignored: 1, blocked: 0, issueCount: 0, blockingIssueCount: 0, status: 'confirmed', reviewAvailability: 'available' },
  },
  ignoredColumnIds: ['ignored-col-1'],
  resolvedIssueIds: [],
  deferredIssueIds: [],
  blockingMappingIssueIds: [],
  mappingGlobalStatus: 'ready-for-confirmation',
  mappingReadiness: true,
  canContinueToConfirmation: true,
};

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

export const HISTORICAL_IMPORT_CONFIRMATION_SCENARIOS: readonly HistoricalImportConfirmationScenario[] = [
  {
    scenarioId: 'ready-for-confirmation',
    qaPurpose: 'Happy path where everything is valid, explicitly confirmed, ready to be prepared.',
    source: baseSource,
    issues: [],
    ignoredColumns: [{ id: 'ign-conf-1', mappingIgnoredColumnId: 'ignored-col-1', required: false, technical: true }],
    expectedStatus: 'ready-for-confirmation',
    expectedCompatibility: 'current',
    expectedCTA: true,
    expectedBoundaryAvailableAfterPrepare: true,
    expectedIssueIds: [],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: ['ign-conf-1'],
    expectedUnmetRequirementCodes: [],
    draft: initializeHistoricalImportConfirmationDraft('conf-draft-001', baseSource, 'implementation-consultant', {
      explicitConfirmationAccepted: true,
      hasBlockingIssues: false,
      hasConfirmationRequiredIssues: false,
      hasRequiredIgnoredColumns: false,
      hasSimulatedError: false,
      ignoredColumnIds: ['ign-conf-1'],
    }),
  },
  {
    scenarioId: 'explicit-confirmation-required',
    qaPurpose: 'Valid source but explicit checkbox is not checked.',
    source: baseSource,
    issues: [],
    ignoredColumns: [{ id: 'ign-conf-1', mappingIgnoredColumnId: 'ignored-col-1', required: false, technical: true }],
    expectedStatus: 'confirmation-required',
    expectedCompatibility: 'current',
    expectedCTA: false,
    expectedBoundaryAvailableAfterPrepare: false,
    expectedIssueIds: [],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: ['ign-conf-1'],
    expectedUnmetRequirementCodes: ['EXPLICIT_CONFIRMATION_MISSING'],
    draft: initializeHistoricalImportConfirmationDraft('conf-draft-002', baseSource, 'implementation-consultant', {
      explicitConfirmationAccepted: false,
      ignoredColumnIds: ['ign-conf-1'],
    }),
  },
  {
    scenarioId: 'stale-mapping',
    qaPurpose: 'Mapping signature changed externally.',
    source: { ...baseSource, mappingSignature: 'new-map-sig' },
    issues: [],
    ignoredColumns: [],
    expectedStatus: 'stale',
    expectedCompatibility: 'stale',
    expectedCTA: false,
    expectedBoundaryAvailableAfterPrepare: false,
    expectedIssueIds: [],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: [],
    expectedUnmetRequirementCodes: ['COMPATIBILITY_STALE', 'EXPLICIT_CONFIRMATION_MISSING'],
    draft: (() => {
      const oldSource = baseSource;
      const initialDraft = initializeHistoricalImportConfirmationDraft('conf-draft-003', oldSource, 'implementation-consultant', { explicitConfirmationAccepted: false });
      const staleDraft = { ...initialDraft, inputSignature: 'old-sig-123', compatibility: 'stale' as const, confirmationStatus: 'stale' as const };
      staleDraft.finalReadiness = { ...staleDraft.finalReadiness, compatibilityCurrent: false, unmetRequirementCodes: ['COMPATIBILITY_STALE', 'EXPLICIT_CONFIRMATION_MISSING'] };
      return staleDraft;
    })(),
  },
  {
    scenarioId: 'blocking-issue-present',
    qaPurpose: 'There is a blocking issue preventing confirmation.',
    source: { ...baseSource, blockingMappingIssueIds: ['issue-block-1'] },
    issues: [{ id: 'issue-conf-1', code: 'BLOCKING_1', severity: 'blocking', scope: 'mapping', title: 'Error block', description: 'desc', relatedReferenceIds: [] }],
    ignoredColumns: [],
    expectedStatus: 'blocked',
    expectedCompatibility: 'current',
    expectedCTA: false,
    expectedBoundaryAvailableAfterPrepare: false,
    expectedIssueIds: ['issue-conf-1'],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: [],
    expectedUnmetRequirementCodes: ['BLOCKING_ISSUES_PRESENT', 'EXPLICIT_CONFIRMATION_MISSING'],
    draft: initializeHistoricalImportConfirmationDraft('conf-draft-004', { ...baseSource, blockingMappingIssueIds: ['issue-block-1'] }, 'implementation-consultant', {
      explicitConfirmationAccepted: false,
      hasBlockingIssues: true,
      blockingIssueIds: ['issue-conf-1'],
    }),
  },
  {
    scenarioId: 'deferred-issues-present',
    qaPurpose: 'Deferred issues exist, but do not block preparation.',
    source: { ...baseSource, deferredIssueIds: ['issue-def-1'] },
    issues: [{ id: 'issue-conf-def-1', code: 'DEF_1', severity: 'deferred', scope: 'deferred-resolution', title: 'Def title', description: 'desc', relatedReferenceIds: [] }],
    ignoredColumns: [],
    expectedStatus: 'ready-for-confirmation',
    expectedCompatibility: 'current',
    expectedCTA: true,
    expectedBoundaryAvailableAfterPrepare: true,
    expectedIssueIds: [],
    expectedDeferredIssueIds: ['issue-conf-def-1'],
    expectedIgnoredColumnIds: [],
    expectedUnmetRequirementCodes: [],
    draft: initializeHistoricalImportConfirmationDraft('conf-draft-005', { ...baseSource, deferredIssueIds: ['issue-def-1'] }, 'implementation-consultant', {
      explicitConfirmationAccepted: true,
      deferredIssueIds: ['issue-conf-def-1'],
    }),
  },
  {
    scenarioId: 'ignored-required-column',
    qaPurpose: 'A required column was manually ignored, which is blocking.',
    source: baseSource,
    issues: [],
    ignoredColumns: [{ id: 'ign-conf-req', mappingIgnoredColumnId: 'ignored-col-2', required: true, technical: false }],
    expectedStatus: 'blocked',
    expectedCompatibility: 'current',
    expectedCTA: false,
    expectedBoundaryAvailableAfterPrepare: false,
    expectedIssueIds: [],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: ['ign-conf-req'],
    expectedUnmetRequirementCodes: ['REQUIRED_IGNORED_COLUMNS', 'EXPLICIT_CONFIRMATION_MISSING'],
    draft: initializeHistoricalImportConfirmationDraft('conf-draft-006', baseSource, 'implementation-consultant', {
      explicitConfirmationAccepted: false,
      hasRequiredIgnoredColumns: true,
      ignoredColumnIds: ['ign-conf-req'],
    }),
  },
  {
    scenarioId: 'configuration-mismatch',
    qaPurpose: 'Draft mapping ID differs from source.',
    source: baseSource,
    issues: [],
    ignoredColumns: [],
    expectedStatus: 'incompatible',
    expectedCompatibility: 'incompatible',
    expectedCTA: false,
    expectedBoundaryAvailableAfterPrepare: false,
    expectedIssueIds: [],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: [],
    expectedUnmetRequirementCodes: ['COMPATIBILITY_INCOMPATIBLE', 'EXPLICIT_CONFIRMATION_MISSING'],
    draft: (() => {
      const draft = initializeHistoricalImportConfirmationDraft('conf-draft-007', baseSource, 'implementation-consultant', { explicitConfirmationAccepted: false });
      draft.mappingDraftId = 'different-map-draft-001';
      draft.compatibility = 'incompatible';
      draft.confirmationStatus = 'incompatible';
      draft.finalReadiness.compatibilityCurrent = false;
      draft.finalReadiness.unmetRequirementCodes = ['COMPATIBILITY_INCOMPATIBLE', 'EXPLICIT_CONFIRMATION_MISSING'];
      return draft;
    })(),
  },
  {
    scenarioId: 'simulated-error',
    qaPurpose: 'A simulated system error takes precedence.',
    source: baseSource,
    issues: [{ id: 'issue-conf-sim', code: 'SIM_ERR', severity: 'simulated-error', scope: 'system', title: 'System err', description: 'err', relatedReferenceIds: [] }],
    ignoredColumns: [],
    expectedStatus: 'simulated-error',
    expectedCompatibility: 'current',
    expectedCTA: false,
    expectedBoundaryAvailableAfterPrepare: false,
    expectedIssueIds: ['issue-conf-sim'],
    expectedDeferredIssueIds: [],
    expectedIgnoredColumnIds: [],
    expectedUnmetRequirementCodes: ['EXPLICIT_CONFIRMATION_MISSING', 'SIMULATED_ERROR_PRESENT'],
    draft: initializeHistoricalImportConfirmationDraft('conf-draft-008', baseSource, 'implementation-consultant', {
      explicitConfirmationAccepted: false,
      hasSimulatedError: true,
      blockingIssueIds: ['issue-conf-sim'],
    }),
  },
];
