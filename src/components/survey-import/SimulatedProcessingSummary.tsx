import type {
  SimulationResultSummary,
  SimulationStatus,
  SimulationFileProgress,
} from '@/lib/survey-import/simulation/simulationTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SIMULATION_STATE_COPY } from '@/config/survey-import/simulationConfig';

export interface SimulatedProcessingSummaryProps {
  status: SimulationStatus;
  files: readonly SimulationFileProgress[];
  result?: SimulationResultSummary;
}

export function SimulatedProcessingSummary({
  status,
  files,
  result,
}: SimulatedProcessingSummaryProps) {
  const totalFiles = files.length;
  const completedFiles = files.filter((f) => f.status === 'completed').length;
  const activeFiles = files.filter((f) => f.status === 'active').length;
  const warningFiles = files.filter((f) => f.hasWarning).length;
  const failedFiles = files.filter((f) => f.status === 'failed').length;

  if (status === 'failed' || status === 'cancelled') {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            {SIMULATION_STATE_COPY[status]}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'completed' && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultado sintético del prototipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              {SIMULATION_STATE_COPY.completed}
            </p>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
              <div>
                <span className="font-medium">Modo:</span> {result.mode}
              </div>
              <div>
                <span className="font-medium">Encuestas:</span>{' '}
                {result.surveyCount}
              </div>
              <div>
                <span className="font-medium">Periodos:</span>{' '}
                {result.periodCount}
              </div>
              <div>
                <span className="font-medium">Revisión requerida:</span>{' '}
                {result.requiresReview ? 'Sí' : 'No'}
              </div>
              <div>
                <span className="font-medium">Issues:</span> {result.issueCount}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Capacidades:</span>{' '}
                {result.capabilitySummary}
              </div>
            </div>
            {result.requiresReview && (
              <div className="mt-4">
                <Badge variant="warning">Requiere revisión manual</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de procesamiento (simulado)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Badge variant="neutral">Total: {totalFiles}</Badge>
          {completedFiles > 0 && (
            <Badge variant="positive">Completados: {completedFiles}</Badge>
          )}
          {activeFiles > 0 && (
            <Badge variant="info">Activos: {activeFiles}</Badge>
          )}
          {warningFiles > 0 && (
            <Badge variant="warning">Con advertencias: {warningFiles}</Badge>
          )}
          {failedFiles > 0 && (
            <Badge variant="destructive">Fallidos: {failedFiles}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
