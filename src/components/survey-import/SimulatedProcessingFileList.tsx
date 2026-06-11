import type {
  SimulationFileProgress,
  SimulationPhaseDefinition,
} from '@/lib/survey-import/simulation/simulationTypes';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SIMULATION_ACCESSIBILITY_LABELS } from '@/config/survey-import/simulationConfig';
import {
  FileIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  Loader2Icon,
  ClockIcon,
} from 'lucide-react';

export interface SimulatedProcessingFileListProps {
  files: readonly SimulationFileProgress[];
  phases: readonly SimulationPhaseDefinition[];
}

export function SimulatedProcessingFileList({
  files,
  phases,
}: SimulatedProcessingFileListProps) {
  const totalPhases = phases.length;

  return (
    <ul className="space-y-3">
      {files.map((file) => {
        const progressValue =
          totalPhases > 0
            ? (file.completedPhases.length / totalPhases) * 100
            : 0;

        let Icon = ClockIcon;
        let iconClass = 'text-muted-foreground';
        let statusLabel = SIMULATION_ACCESSIBILITY_LABELS.filePending;

        if (file.status === 'completed') {
          Icon = CheckCircle2Icon;
          iconClass = 'text-[hsl(var(--success))]';
          statusLabel = SIMULATION_ACCESSIBILITY_LABELS.fileCompleted;
        } else if (file.status === 'active') {
          Icon = Loader2Icon;
          iconClass = 'text-primary animate-spin';
          statusLabel = SIMULATION_ACCESSIBILITY_LABELS.fileActive;
        } else if (file.status === 'warning') {
          Icon = AlertTriangleIcon;
          iconClass = 'text-[hsl(var(--warning))]';
          statusLabel = SIMULATION_ACCESSIBILITY_LABELS.fileWarning;
        } else if (file.status === 'failed') {
          Icon = XCircleIcon;
          iconClass = 'text-destructive';
          statusLabel = 'Archivo fallido';
        } else if (file.status === 'cancelled') {
          Icon = XCircleIcon;
          iconClass = 'text-muted-foreground';
          statusLabel = 'Cancelado';
        }

        const activePhaseDef = phases.find((p) => p.id === file.activePhase);
        const textualStatus =
          file.status === 'active' && activePhaseDef
            ? activePhaseDef.label
            : statusLabel;

        return (
          <li key={file.fileId}>
            <Card className="flex items-center gap-4 p-4">
              <div className="flex-shrink-0">
                <FileIcon
                  className="h-8 w-8 text-muted-foreground opacity-50"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <div
                    className="truncate font-medium"
                    title={file.displayName}
                  >
                    {file.displayName}
                  </div>
                  <div className="ml-4 flex flex-shrink-0 items-center gap-1.5">
                    <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden="true" />
                    <span className="sr-only text-sm font-medium">
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                  <div className="truncate">{textualStatus}</div>
                  <div className="flex-shrink-0">
                    {file.completedPhases.length} / {totalPhases} fases
                  </div>
                </div>

                <Progress
                  value={progressValue}
                  color={
                    file.status === 'warning'
                      ? 'warning'
                      : file.status === 'failed'
                      ? 'destructive'
                      : file.status === 'completed'
                      ? 'success'
                      : 'primary'
                  }
                />
                
                {file.issueCount > 0 && (
                  <div className="mt-2 text-xs text-destructive">
                    Se encontraron {file.issueCount} problemas
                  </div>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
