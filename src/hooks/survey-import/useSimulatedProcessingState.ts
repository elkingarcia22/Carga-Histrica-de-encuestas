import { useReducer, useEffect, useRef, useCallback } from 'react';
import type {
  SimulationPlan,
  SimulationState,
  SimulationEvent
} from '../../lib/survey-import/simulation/simulationTypes';

type HookEvent =
  | SimulationEvent
  | { readonly type: 'INTERNAL_RESET'; readonly plan: SimulationPlan };

function createInitialState(plan: SimulationPlan): SimulationState {
  return {
    status: 'idle',
    activePhase: undefined,
    activeFileId: undefined,
    files: plan.files.map((f) => ({
      fileId: f.fileId,
      displayName: f.displayName,
      status: 'pending',
      activePhase: undefined,
      completedPhases: [],
      issueCount: f.issueCount,
      hasWarning: f.hasWarning
    })),
    completedPhaseIds: [],
    result: undefined,
    errorCode: undefined
  };
}

function simulationReducer(state: SimulationState, event: HookEvent, plan: SimulationPlan): SimulationState {
  switch (event.type) {
    case 'simulation_started':
      if (state.status !== 'idle') return state;
      return { ...state, status: 'queued' };

    case 'phase_activated': {
      if (state.status !== 'queued' && state.status !== 'running') return state;

      const firstFileId = plan.files[0]?.fileId;

      return {
        ...state,
        status: 'running',
        activePhase: event.phaseId,
        activeFileId: firstFileId,
        files: state.files.map((f) =>
          f.fileId === firstFileId
            ? {
                ...f,
                status: 'active',
                activePhase: event.phaseId
              }
            : {
                ...f,
                activePhase: undefined
              }
        )
      };
    }

    case 'file_completed': {
      if (state.status !== 'running') return state;
      
      const currentPhaseId = state.activePhase;
      if (!currentPhaseId) return state;

      let newCompletedPhaseIds = state.completedPhaseIds;
      if (!event.nextFileId && !state.completedPhaseIds.includes(currentPhaseId)) {
        newCompletedPhaseIds = [...state.completedPhaseIds, currentPhaseId];
      }

      return {
        ...state,
        activeFileId: event.nextFileId,
        completedPhaseIds: newCompletedPhaseIds,
        files: state.files.map((f) => {
          if (f.fileId === event.fileId) {
            const completed = f.completedPhases.includes(currentPhaseId)
              ? f.completedPhases
              : [...f.completedPhases, currentPhaseId];
            
            const isFullyCompleted = completed.length === plan.phases.length;

            return {
              ...f,
              status: isFullyCompleted ? 'completed' : 'pending',
              activePhase: undefined,
              completedPhases: completed
            };
          }
          if (event.nextFileId && f.fileId === event.nextFileId) {
            return {
              ...f,
              status: 'active',
              activePhase: currentPhaseId
            };
          }
          return f;
        })
      };
    }

    case 'batch_completed': {
      if (state.status !== 'running') return state;
      
      return {
        ...state,
        status: 'completed',
        activePhase: undefined,
        activeFileId: undefined,
        result: event.resultSummary
      };
    }

    case 'simulation_failed':
      if (state.status !== 'queued' && state.status !== 'running') return state;
      return {
        ...state,
        status: 'failed',
        errorCode: event.errorCode
      };

    case 'simulation_cancelled':
      if (state.status !== 'queued' && state.status !== 'running') return state;
      return {
        ...state,
        status: 'cancelled',
        activePhase: undefined,
        activeFileId: undefined,
        files: state.files.map((f) =>
          f.status === 'active' || f.status === 'pending'
            ? { ...f, status: 'cancelled', activePhase: undefined }
            : f
        )
      };

    case 'INTERNAL_RESET':
      return createInitialState(event.plan);

    case 'simulation_reset':
      if (
        state.status === 'completed' ||
        state.status === 'failed' ||
        state.status === 'cancelled' ||
        state.status === 'idle'
      ) {
        return createInitialState(plan);
      }
      return state;

    default:
      return state;
  }
}

export function useSimulatedProcessingState(plan: SimulationPlan) {
  const [state, dispatch] = useReducer(
    (s: SimulationState, e: HookEvent) => simulationReducer(s, e, plan),
    plan,
    createInitialState
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef<number>(0);
  const planIdRef = useRef<string>(plan.planId);

  const cleanupTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    tokenRef.current += 1;
  }, []);

  const cancelSimulation = useCallback(() => {
    cleanupTimer();
    dispatch({ type: 'simulation_cancelled' });
  }, [cleanupTimer]);

  const reset = useCallback(() => {
    cleanupTimer();
    dispatch({ type: 'INTERNAL_RESET', plan });
  }, [cleanupTimer, plan]);

  useEffect(() => {
    if (plan.planId !== planIdRef.current) {
      planIdRef.current = plan.planId;
      cleanupTimer();
      dispatch({ type: 'INTERNAL_RESET', plan });
    }
  }, [plan, cleanupTimer]);

  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  const start = useCallback(() => {
    if (state.status !== 'idle') return;
    if (timerRef.current !== null) return;

    dispatch({ type: 'simulation_started' });

    tokenRef.current += 1;
    const currentToken = tokenRef.current;

    let phaseIndex = 0;
    let fileIndex = 0;

    const nextStep = () => {
      if (currentToken !== tokenRef.current) return;

      if (plan.files.length === 0) {
        dispatch({ type: 'batch_completed', resultSummary: plan.result });
        timerRef.current = null;
        return;
      }

      if (phaseIndex < plan.phases.length) {
        const phase = plan.phases[phaseIndex];
        const file = plan.files[fileIndex];

        if (fileIndex === 0) {
          dispatch({ type: 'phase_activated', phaseId: phase.id });
        }

        timerRef.current = setTimeout(() => {
          if (currentToken !== tokenRef.current) return;

          const isLastFile = fileIndex === plan.files.length - 1;
          
          if (isLastFile) {
            dispatch({ type: 'file_completed', fileId: file.fileId });
            fileIndex = 0;
            phaseIndex++;
            nextStep();
          } else {
            const nextFile = plan.files[fileIndex + 1];
            dispatch({ type: 'file_completed', fileId: file.fileId, nextFileId: nextFile.fileId });
            fileIndex++;
            nextStep();
          }
        }, phase.durationMs);
      } else {
        dispatch({ type: 'batch_completed', resultSummary: plan.result });
        timerRef.current = null;
      }
    };

    timerRef.current = setTimeout(() => {
      nextStep();
    }, 0);
  }, [state.status, plan]);

  return {
    state,
    start,
    cancelSimulation,
    reset
  };
}
