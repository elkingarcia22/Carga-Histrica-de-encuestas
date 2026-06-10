import type { ImportSession } from '../../../types/survey-import';
import { fileResponsesMock } from '../shared/sourceFixtures';
import { questionLikertMock, questionNpsMock } from '../shared/questionFixtures';
import { demographicAreaMock } from '../shared/demographicFixtures';

export const rawHappyPathScenario: ImportSession = {
  id: 'demo-session-raw-happy',
  status: 'ready-for-preview',
  macroStage: 'review',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:05:00Z',
  files: [fileResponsesMock],
  sheets: [],
  fields: [],
  detection: {
    suggestedMode: 'raw-individual',
    overallConfidence: 0.95,
    evidences: [],
    classifiedSheetIds: ['demo-sheet-1'],
    potentialCapabilities: ['participation', 'favorability'],
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
    questions: [questionLikertMock, questionNpsMock],
    demographics: [demographicAreaMock],
    participants: [
      {
        internalId: 'demo-participant-1',
        visibleName: 'Persona Demo 001',
        identityType: 'anonymous-participant',
        matchConfidence: 0.9,
        matchStatus: 'aligned',
        isDuplicate: false,
        demographics: [{ demographicId: 'demo-demographic-1', value: 'operaciones-demo' }],
        privacyState: 'anonymized',
        relatedIssueIds: [],
        reviewStatus: 'confirmed',
      }
    ],
    responses: [
      {
        participantId: 'demo-participant-1',
        questionId: 'demo-question-1',
        valueType: 'numeric',
        numericValue: 4,
      }
    ],
  },
  reviewProgress: {
    overall: { total: 4, confirmed: 4, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byQuestion: { total: 2, confirmed: 2, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byDemographic: { total: 1, confirmed: 1, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byParticipant: { total: 1, confirmed: 1, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    bySegment: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
  },
  issues: [],
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
      { type: 'favorability', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
      { type: 'nps', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
      { type: 'ai-analysis', status: 'available', evidences: [], missingRequirements: [], limitations: [] }
    ],
    counts: {
      totalFiles: 1, usedSheets: 1, ignoredSheets: 0,
      associatedQuestions: 2, newQuestions: 0, pendingQuestions: 0,
      associatedDemographics: 1, newDemographics: 0,
      associatedParticipants: 1, externalParticipants: 0,
      associatedSegments: 0, newSegments: 0,
      conflicts: 0, warnings: 0, blockingErrors: 0,
    },
    openIssueIds: [],
    limitations: [],
    isReady: true,
    isConfirmationAllowed: true,
  },
  isCancelled: false,
  isCommitStarted: false,
};
