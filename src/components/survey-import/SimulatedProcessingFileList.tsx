import type {
  SimulationFileProgress,
  SimulationPhaseDefinition,
} from '@/lib/survey-import/simulation/simulationTypes';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  SIMULATION_ACCESSIBILITY_LABELS,
  SIMULATION_FULL_VIEW_VISIBLE_FILE_LIMIT
} from '@/config/survey-import/simulationConfig';
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
  const totalFiles = files.length;

  const indexedFiles = files.map((file, index) => ({ file, index }));

  const getPriority = (file: SimulationFileProgress) => {
    if (file.status === 'active') return 0;
    if (file.status === 'warning' || file.status === 'failed' || file.hasWarning || file.issueCount > 0) return 1;
    if (file.status === 'completed') return 2;
    if (file.status === 'pending') return 3;
    return 4;
  };

  const selectedIndexedFiles = [...indexedFiles]
    .sort((a, b) => {
      const pA = getPriority(a.file);
      const pB = getPriority(b.file);
      if (pA !== pB) return pA - pB;

      if (pA === 2) {
        return b.index - a.index;
      }
      return a.index - b.index;
    })
    .slice(0, SIMULATION_FULL_VIEW_VISIBLE_FILE_LIMIT)
    .sort((a, b) => a.index - b.index);

  const displayFiles = selectedIndexedFiles.map(item => item.file);
  const hiddenCount = totalFiles - displayFiles.length;

  return (
    <div className="flex flex-col gap-4">
      <ul className="space-y-3">
        {displayFiles.map((file) => {
        const progressValue =
          totalPhases > 0
            ? (file.completedPhases.length / totalPhases) * 100
            : 0;

        let Icon = ClockIcon;
        let iconClass = 'text-muted-foreground';
        let statusLabel = 'En espera';

        if (file.status === 'completed') {
          Icon = CheckCircle2Icon;
          iconClass = 'text-[hsl(var(--success))]';
          statusLabel = 'Revisado';
        } else if (file.status === 'active') {
          Icon = Loader2Icon;
          iconClass = 'text-primary animate-spin';
          statusLabel = 'Analizando';
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

      {hiddenCount > 0 && (
        <div className="mt-2 text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border border-dashed" aria-live="polite">
          <p className="font-medium text-foreground mb-1">
            Se muestran {displayFiles.length} de {totalFiles} archivos.
          </p>
          <p>
            {hiddenCount} archivo{hiddenCount !== 1 ? 's' : ''} adicional{hiddenCount !== 1 ? 'es' : ''} continúan en el análisis simulado.
          </p>
        </div>
      )}
    </div>
  );
}
