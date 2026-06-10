import type { ImportSession } from '../../../types/survey-import';
import { fileResponsesMock } from '../shared/sourceFixtures';
import { questionLikertMock } from '../shared/questionFixtures';
import { demographicAreaMock } from '../shared/demographicFixtures';

export const aggregatedHappyPathScenario: ImportSession = {
  id: 'demo-session-agg-happy',
  status: 'ready-for-preview',
  macroStage: 'review',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:05:00Z',
  files: [fileResponsesMock],
  sheets: [],
  fields: [],
  detection: {
    suggestedMode: 'aggregated-comparison',
    overallConfidence: 0.9,
    evidences: [],
    classifiedSheetIds: ['demo-sheet-1'],
    potentialCapabilities: ['favorability', 'area-comparison'],
    relatedIssueIds: [],
    reviewStatus: 'confirmed',
  },
  configuration: {
    name: 'Encuesta de clima demo 2025',
    surveyType: 'climate',
    visibility: 'aggregated-only',
    confidentialityThreshold: 5,
    period: '2025-Q1',
    sourceSummary: 'Importado de Excel',
    confirmedMode: 'aggregated-comparison',
    reviewStatus: 'confirmed',
  },
  data: {
    mode: 'aggregated-comparison',
    questions: [questionLikertMock],
    demographics: [demographicAreaMock],
    segments: [
      {
        internalId: 'demo-segment-1',
        type: 'area',
        name: 'Operaciones Demo',
        relatedDemographicId: 'demo-demographic-1',
        demographicValue: 'operaciones-demo',
        sampleSize: 100,
        participationRate: 85,
        period: '2025-Q1',
        matchConfidence: 0.95,
        matchStatus: 'aligned',
        reviewStatus: 'confirmed',
        relatedIssueIds: [],
      }
    ],
    aggregatedResults: [
      {
        questionId: 'demo-question-1',
        segmentId: 'demo-segment-1',
        overallScore: 82,
        distribution: {
          positivePercentage: 80,
          neutralPercentage: 15,
          negativePercentage: 5,
          noResponsePercentage: 0,
        },
        totalResponses: 100,
        participationRate: 85,
        period: '2025-Q1',
      }
    ],
  },
  reviewProgress: {
    overall: { total: 3, confirmed: 3, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byQuestion: { total: 1, confirmed: 1, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byDemographic: { total: 1, confirmed: 1, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byParticipant: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    bySegment: { total: 1, confirmed: 1, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
  },
  issues: [],
  preview: {
    mode: 'aggregated-comparison',
    configuration: {
      name: 'Encuesta de clima demo 2025',
      surveyType: 'climate',
      visibility: 'aggregated-only',
      confidentialityThreshold: 5,
      period: '2025-Q1',
      sourceSummary: 'Importado de Excel',
      confirmedMode: 'aggregated-comparison',
      reviewStatus: 'confirmed',
    },
    capabilities: [
      { type: 'participation', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
      { type: 'favorability', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
      { type: 'area-comparison', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
      { type: 'trends', status: 'partial', evidences: [], missingRequirements: ['Requiere periodo anterior'], limitations: [] },
      { type: 'responses', status: 'unavailable', evidences: [], missingRequirements: ['Requiere modo raw-individual'], limitations: [] }
    ],
    counts: {
      totalFiles: 1, usedSheets: 1, ignoredSheets: 0,
      associatedQuestions: 1, newQuestions: 0, pendingQuestions: 0,
      associatedDemographics: 1, newDemographics: 0,
      associatedParticipants: 0, externalParticipants: 0,
      associatedSegments: 1, newSegments: 0,
      conflicts: 0, warnings: 0, blockingErrors: 0,
    },
    openIssueIds: [],
    limitations: ['No se podrán visualizar respuestas individuales.'],
    isReady: true,
    isConfirmationAllowed: true,
  },
  isCancelled: false,
  isCommitStarted: false,
};
