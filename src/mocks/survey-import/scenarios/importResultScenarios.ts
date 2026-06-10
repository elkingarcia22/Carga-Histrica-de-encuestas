import type { ImportSession } from '../../../types/survey-import';
import { rawHappyPathScenario } from './rawHappyPathScenario';

export const resultCompletedScenario: ImportSession = {
  ...rawHappyPathScenario,
  id: 'demo-session-result-completed',
  status: 'completed',
  macroStage: 'import',
  isCommitStarted: true,
  result: {
    status: 'completed',
    simulatedSurveyId: 'simulated-survey-123',
    completionDate: '2026-06-10T10:10:00Z',
    counts: { importedItems: 5, skippedItems: 0 },
    enabledCapabilities: [
      { type: 'participation', status: 'available', evidences: [], missingRequirements: [], limitations: [] },
      { type: 'favorability', status: 'available', evidences: [], missingRequirements: [], limitations: [] }
    ],
    finalIssueIds: [],
  }
};

export const resultPartialScenario: ImportSession = {
  ...rawHappyPathScenario,
  id: 'demo-session-result-partial',
  status: 'partially-completed',
  macroStage: 'import',
  isCommitStarted: true,
  result: {
    status: 'partially-completed',
    simulatedSurveyId: 'simulated-survey-123',
    completionDate: '2026-06-10T10:10:00Z',
    counts: { importedItems: 4, skippedItems: 1 },
    enabledCapabilities: [
      { type: 'participation', status: 'available', evidences: [], missingRequirements: [], limitations: [] }
    ],
    finalIssueIds: ['demo-issue-002'],
    conceptualErrorReport: 'Algunos participantes fueron omitidos debido a errores de validación.',
  }
};

export const resultFailedScenario: ImportSession = {
  ...rawHappyPathScenario,
  id: 'demo-session-result-failed',
  status: 'failed',
  macroStage: 'import',
  isCommitStarted: true,
  result: {
    status: 'failed',
    completionDate: '2026-06-10T10:10:00Z',
    counts: { importedItems: 0, skippedItems: 5 },
    enabledCapabilities: [],
    finalIssueIds: ['demo-issue-001'],
    conceptualErrorReport: 'Error interno en la transformación de datos. La operación fue abortada de forma segura.',
  }
};

export const resultCancelledScenario: ImportSession = {
  id: 'demo-session-result-cancelled',
  status: 'cancelled',
  macroStage: 'upload',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:05:00Z',
  files: [],
  sheets: [],
  fields: [],
  data: { mode: 'unknown' },
  reviewProgress: {
    overall: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byQuestion: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byDemographic: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byParticipant: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    bySegment: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
  },
  issues: [],
  isCancelled: true,
  isCommitStarted: false,
};
