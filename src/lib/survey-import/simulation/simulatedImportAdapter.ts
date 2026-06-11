import type { SimulationPlan, SimulationFileProgress } from './simulationTypes';
import { SIMULATION_PHASES } from '@/config/survey-import/simulationConfig';
import { aggregatedHappyPathScenario } from '@/mocks/survey-import/scenarios/aggregatedHappyPathScenario';
import { resultCompletedScenario } from '@/mocks/survey-import/scenarios/importResultScenarios';

export interface SimulationInputFileMetadata {
  readonly fileId: string;
  readonly displayName: string;
}

export type NonEmptySimulationInputFiles = readonly [SimulationInputFileMetadata, ...SimulationInputFileMetadata[]];

export const SYNTHETIC_SCENARIO_ID = 'aggregated-happy-path';
const SYNTHETIC_PERIOD_COUNT = 1; // Synthetic rule: visually derived from '2025-Q1' as there is no distinct period array in fixture

export function createSimulatedImportPlan(
  files: NonEmptySimulationInputFiles
): SimulationPlan {
  const progressFiles: SimulationFileProgress[] = files.map((file) => ({
    fileId: file.fileId,
    displayName: file.displayName,
    status: 'pending',
    completedPhases: [],
    issueCount: 0,
    hasWarning: false,
  }));

  const issueCount = aggregatedHappyPathScenario.issues.length;
  const requiresReview = issueCount > 0 || !aggregatedHappyPathScenario.preview?.isConfirmationAllowed;
  const availableCapabilities = aggregatedHappyPathScenario.preview?.capabilities.filter(
    (c) => c.status === 'available'
  ).length ?? 0;
  
  const surveyCount = resultCompletedScenario.result?.simulatedSurveyId ? 1 : 0;

  return {
    planId: `sim-plan-${SYNTHETIC_SCENARIO_ID}`,
    scenarioId: SYNTHETIC_SCENARIO_ID,
    phases: SIMULATION_PHASES,
    files: progressFiles,
    result: {
      scenarioId: SYNTHETIC_SCENARIO_ID,
      mode: 'aggregated-comparison',
      status: 'completed',
      surveyCount: surveyCount,
      periodCount: SYNTHETIC_PERIOD_COUNT,
      requiresReview: requiresReview,
      issueCount: issueCount,
      capabilitySummary: `${availableCapabilities} capacidades analíticas disponibles`,
      nextView: 'historical-preview-simulated',
    },
    isSynthetic: true,
  };
}
