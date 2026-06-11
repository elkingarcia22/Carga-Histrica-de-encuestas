/**
 * Local simulation contracts for U3-SIM.
 * These types are exclusive to the simulated visual progress domain.
 * They do not contain binaries, classes, or references to full canonical fixtures.
 */

export type SimulationStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type SimulationPhaseId =
  | 'validating-metadata'
  | 'profiling-structure'
  | 'detecting-survey-type'
  | 'building-historical-result';

export type SimulationFileStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'warning'
  | 'failed'
  | 'cancelled';

export interface SimulationFileProgress {
  readonly fileId: string;
  readonly displayName: string;
  readonly status: SimulationFileStatus;
  readonly activePhase?: SimulationPhaseId;
  readonly completedPhases: readonly SimulationPhaseId[];
  readonly issueCount: number;
  readonly hasWarning: boolean;
}

export interface SimulationPhaseDefinition {
  readonly id: SimulationPhaseId;
  readonly label: string;
  readonly description: string;
  readonly durationMs: number;
  readonly accessibleLabel: string;
}

export interface SimulationResultSummary {
  readonly scenarioId: string;
  readonly mode: 'aggregated-comparison';
  readonly status: 'completed';
  readonly surveyCount: number;
  readonly periodCount: number;
  readonly requiresReview: boolean;
  readonly issueCount: number;
  readonly capabilitySummary: string;
  readonly nextView: 'historical-preview-simulated';
}

export interface SimulationPlan {
  readonly planId: string;
  readonly scenarioId: string;
  readonly phases: readonly SimulationPhaseDefinition[];
  readonly files: readonly SimulationFileProgress[];
  readonly result: SimulationResultSummary;
  readonly isSynthetic: true;
}

export interface SimulationState {
  readonly status: SimulationStatus;
  readonly activePhase?: SimulationPhaseId;
  readonly activeFileId?: string;
  readonly files: readonly SimulationFileProgress[];
  readonly completedPhaseIds: readonly SimulationPhaseId[];
  readonly result?: SimulationResultSummary;
  readonly errorCode?: string;
}

export type SimulationEvent =
  | { readonly type: 'simulation_started' }
  | { readonly type: 'phase_activated'; readonly phaseId: SimulationPhaseId }
  | { readonly type: 'file_completed'; readonly fileId: string; readonly nextFileId?: string }
  | { readonly type: 'batch_completed'; readonly resultSummary: SimulationResultSummary }
  | { readonly type: 'simulation_failed'; readonly errorCode: string }
  | { readonly type: 'simulation_cancelled' }
  | { readonly type: 'simulation_reset' };
