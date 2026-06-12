import type {
  SimulationPhaseDefinition,
  SimulationPhaseId,
  SimulationStatus,
  SimulationFileProgress,
} from '@/lib/survey-import/simulation/simulationTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SIMULATION_STATE_COPY,
  SIMULATION_ACCESSIBILITY_LABELS,
} from '@/config/survey-import/simulationConfig';
import { CheckCircle2Icon, CircleIcon, Loader2Icon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SimulatedProcessingPanelProps {
  status: SimulationStatus;
  phases: readonly SimulationPhaseDefinition[];
  activePhase?: SimulationPhaseId;
  completedPhaseIds: readonly SimulationPhaseId[];
  files?: readonly SimulationFileProgress[];
}

export function SimulatedProcessingPanel({
  status,
  phases,
  activePhase,
  completedPhaseIds,
  files,
}: SimulatedProcessingPanelProps) {
  const progressValue =
    phases.length > 0 ? (completedPhaseIds.length / phases.length) * 100 : 0;

  const totalFiles = files?.length ?? 0;
  const completedFiles = files?.filter((f) => f.status === 'completed').length ?? 0;
  const activeFile = files?.find((f) => f.status === 'active');
  const warningFiles = files?.filter((f) => f.hasWarning).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Estado de la simulación</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {SIMULATION_STATE_COPY[status]}
            </p>
          </div>
          {files && (
            <div className="flex flex-col gap-1 text-sm bg-muted/30 p-3 rounded-md min-w-[240px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Archivos:</span>
                <span className="font-medium">{completedFiles} / {totalFiles}</span>
              </div>
              {activeFile && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Activo:</span>
                  <span className="font-medium truncate text-right" title={activeFile.displayName}>
                    {activeFile.displayName}
                  </span>
                </div>
              )}
              {warningFiles > 0 && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 mt-1">
                  <AlertCircleIcon className="h-4 w-4" />
                  <span>{warningFiles} con incidencias</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>Progreso de fases</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} />
        </div>
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

                  {/* Progressive Findings */}
                  {phase.finding && (
                    <div className="mt-2 text-sm">
                      {isPhaseCompleted ? (
                        <span className="font-medium text-foreground">{phase.finding}</span>
                      ) : isPhaseActive ? (
                        <div className="flex flex-col gap-1.5 mt-2" aria-hidden="true">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ) : null}
                    </div>
                  )}

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
