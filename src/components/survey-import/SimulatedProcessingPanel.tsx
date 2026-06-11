import type {
  SimulationPhaseDefinition,
  SimulationPhaseId,
  SimulationStatus,
} from '@/lib/survey-import/simulation/simulationTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  SIMULATION_STATE_COPY,
  SIMULATION_ACCESSIBILITY_LABELS,
} from '@/config/survey-import/simulationConfig';
import { CheckCircle2Icon, CircleIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SimulatedProcessingPanelProps {
  status: SimulationStatus;
  phases: readonly SimulationPhaseDefinition[];
  activePhase?: SimulationPhaseId;
  completedPhaseIds: readonly SimulationPhaseId[];
}

export function SimulatedProcessingPanel({
  status,
  phases,
  activePhase,
  completedPhaseIds,
}: SimulatedProcessingPanelProps) {
  const progressValue =
    phases.length > 0 ? (completedPhaseIds.length / phases.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la simulación</CardTitle>
        <p className="text-sm text-muted-foreground">
          {SIMULATION_STATE_COPY[status]}
        </p>
        <Progress value={progressValue} className="mt-4" />
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {phases.map((phase) => {
            const isPhaseCompleted = completedPhaseIds.includes(phase.id);
            const isPhaseActive = activePhase === phase.id;

            return (
              <li
                key={phase.id}
                className={cn('flex items-start gap-3', {
                  'text-muted-foreground': !isPhaseCompleted && !isPhaseActive,
                  'text-foreground': isPhaseActive,
                })}
                aria-current={isPhaseActive ? 'step' : undefined}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isPhaseCompleted ? (
                    <CheckCircle2Icon
                      className="h-5 w-5 text-[hsl(var(--success))]"
                      aria-hidden="true"
                    />
                  ) : isPhaseActive ? (
                    <Loader2Icon
                      className="h-5 w-5 animate-spin text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleIcon
                      className="h-5 w-5 opacity-50"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {phase.label}
                    <span className="sr-only">
                      {isPhaseCompleted
                        ? SIMULATION_ACCESSIBILITY_LABELS.phaseCompleted
                        : isPhaseActive
                        ? SIMULATION_ACCESSIBILITY_LABELS.phaseActive
                        : 'Pendiente'}
                    </span>
                  </div>
                  <div className="text-sm opacity-80">{phase.description}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground sm:hidden">
                    {isPhaseCompleted
                      ? 'Completada'
                      : isPhaseActive
                      ? 'En curso'
                      : 'Pendiente'}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
