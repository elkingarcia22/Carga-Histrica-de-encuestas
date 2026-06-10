import type { ImportSession } from '../../../types/survey-import';
import { fileResponsesMock } from '../shared/sourceFixtures';
import { questionConflictMock, questionLikertMock } from '../shared/questionFixtures';
import { demographicLocationMock } from '../shared/demographicFixtures';
import { blockingIssueMock, reviewRequiredIssueMock } from '../shared/issueFixtures';

export const rawReviewRequiredScenario: ImportSession = {
  id: 'demo-session-raw-review',
  status: 'review-required',
  macroStage: 'review',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:05:00Z',
  files: [fileResponsesMock],
  sheets: [],
  fields: [],
  detection: {
    suggestedMode: 'raw-individual',
    overallConfidence: 0.6,
    evidences: [],
    classifiedSheetIds: ['demo-sheet-1'],
    potentialCapabilities: ['participation'],
    relatedIssueIds: [],
    reviewStatus: 'confirmed',
  },
  configuration: {
    name: 'Encuesta de clima demo 2025',
    surveyType: 'climate',
    visibility: 'anonymous',
    confidentialityThreshold: 5,
    sourceSummary: 'Importado de Excel',
    confirmedMode: 'raw-individual',
    reviewStatus: 'confirmed',
  },
  data: {
    mode: 'raw-individual',
    questions: [questionLikertMock, questionConflictMock],
    demographics: [demographicLocationMock],
    participants: [
      {
        internalId: 'demo-participant-2',
        visibleName: 'Persona Demo 002',
        identityType: 'external-participant',
        matchConfidence: 0.5,
        matchStatus: 'review-required',
        isDuplicate: true,
        demographics: [{ demographicId: 'demo-demographic-2', value: 'sede-norte' }],
        privacyState: 'visible',
        relatedIssueIds: [],
        reviewStatus: 'unreviewed',
      }
    ],
    responses: [],
  },
  reviewProgress: {
    overall: { total: 4, confirmed: 1, modified: 0, pending: 2, conflicting: 1, ignored: 0, blocking: 1 },
    byQuestion: { total: 2, confirmed: 1, modified: 0, pending: 0, conflicting: 1, ignored: 0, blocking: 1 },
    byDemographic: { total: 1, confirmed: 0, modified: 0, pending: 1, conflicting: 0, ignored: 0, blocking: 0 },
    byParticipant: { total: 1, confirmed: 0, modified: 0, pending: 1, conflicting: 0, ignored: 0, blocking: 0 },
    bySegment: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
  },
  issues: [blockingIssueMock, reviewRequiredIssueMock],
  preview: {
    mode: 'raw-individual',
    configuration: {
      name: 'Encuesta de clima demo 2025',
      surveyType: 'climate',
      visibility: 'anonymous',
      confidentialityThreshold: 5,
      sourceSummary: 'Importado de Excel',
      confirmedMode: 'raw-individual',
      reviewStatus: 'confirmed',
    },
    capabilities: [
      { type: 'participation', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
    ],
    counts: {
      totalFiles: 1, usedSheets: 1, ignoredSheets: 0,
      associatedQuestions: 1, newQuestions: 0, pendingQuestions: 1,
      associatedDemographics: 0, newDemographics: 1,
      associatedParticipants: 0, externalParticipants: 1,
      associatedSegments: 0, newSegments: 0,
      conflicts: 1, warnings: 1, blockingErrors: 1,
    },
    openIssueIds: ['demo-issue-001', 'demo-issue-002'],
    limitations: ['Algunas preguntas no podrán ser analizadas sin escala.'],
    isReady: false,
    isConfirmationAllowed: false,
  },
  isCancelled: false,
  isCommitStarted: false,
};
