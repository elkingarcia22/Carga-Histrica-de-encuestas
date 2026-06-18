import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import type { ComparisonDashboardViewModel } from '../parser/view-model/viewModelTypes';
import type { DrilldownSelectionState } from './questionDrilldownTypes';

interface QuestionDrilldownPanelProps {
  dashboard: ComparisonDashboardViewModel;
  selectionState: DrilldownSelectionState;
}

export function QuestionDrilldownPanel({ dashboard, selectionState }: QuestionDrilldownPanelProps) {
  if (selectionState.type === 'NO_QUESTION_SELECTED') {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          Selecciona una pregunta de la tabla superior para ver su detalle.
        </CardContent>
      </Card>
    );
  }

  if (selectionState.type === 'LOADING_MOCK') {
    return (
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (selectionState.type === 'ERROR') {
    return (
      <Card className="mt-8 border-destructive/50">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTitle>Error en el Drilldown</AlertTitle>
            <AlertDescription>{selectionState.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (selectionState.type === 'BASE_ONLY_SELECTED' || selectionState.type === 'COMPARISON_ONLY_SELECTED') {
    const isBase = selectionState.type === 'BASE_ONLY_SELECTED';
    return (
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{selectionState.questionId}</CardTitle>
              <CardDescription>Pregunta no comparable</CardDescription>
            </div>
            <Badge variant="secondary">{isBase ? 'Solo en Base' : 'Solo en Comparativa'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Sin contraparte</AlertTitle>
            <AlertDescription>
              Esta pregunta no tiene contraparte comparable en el otro periodo.
            </AlertDescription>
          </Alert>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm font-mono text-muted-foreground">
            DEBUG: metadata.questionId = {selectionState.questionId}
          </div>
        </CardContent>
      </Card>
    );
  }

  // COMPARABLE_SELECTED
  const { questionId } = selectionState;
  const question = dashboard.questionRows.find(q => q.questionId === questionId);
  const distributions = dashboard.distributionRows.filter(d => d.questionId === questionId);

  if (!question) {
    return (
      <Card className="mt-8">
        <CardContent className="p-8 text-center text-muted-foreground">
          No se encontró la pregunta seleccionada ({questionId}) en el mock de comparables.
        </CardContent>
      </Card>
    );
  }

  const getDeltaDescription = () => {
    if (question.tone === 'POSITIVE') return 'Mejora frente al periodo base';
    if (question.tone === 'NEGATIVE') return 'Disminución frente al periodo base';
    return 'Sin cambio relevante';
  };

  const toneColorClass = question.tone === 'POSITIVE' ? 'text-success'
    : question.tone === 'NEGATIVE' ? 'text-destructive'
    : 'text-muted-foreground';

  return (
    <div className="mt-8 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-muted-foreground">{question.questionId}</span>
                <Badge variant="outline">{question.questionType}</Badge>
                <Badge variant="secondary" className={
                      question.tone === 'POSITIVE' ? 'bg-success/10 text-success' :
                      question.tone === 'NEGATIVE' ? 'bg-destructive/10 text-destructive' : ''
                    }>{getDeltaDescription()}</Badge>
              </div>
              <CardTitle className="text-xl">{question.questionLabel}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Periodo Base</p>
              <p className="text-2xl font-semibold text-foreground">{question.baseValue?.displayValue ?? '-'}</p>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-auto" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Periodo Comparativo</p>
              <p className="text-2xl font-semibold text-foreground">{question.comparisonValue?.displayValue ?? '-'}</p>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-auto" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Delta</p>
              <p className={`text-2xl font-bold ${toneColorClass}`}>
                {question.deltaValue?.displayValue ?? '-'}
                <span className="text-sm ml-2 font-normal text-muted-foreground">({question.direction})</span>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Contexto de participación (Delta Blancos):</span>
              <span className="font-medium">{question.blankRateDelta?.displayValue ?? '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Métricas soportadas:</span>
              <div className="flex gap-2 mt-1">
                {question.hasLikertMetrics && <Badge variant="outline" className="text-xs">Likert</Badge>}
                {question.hasEnpsMetrics && <Badge variant="outline" className="text-xs">eNPS</Badge>}
                {question.hasOpenTextMetrics && <Badge variant="outline" className="text-xs">Open Text</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de respuestas</CardTitle>
          <CardDescription>Comparativa detallada por opción de respuesta</CardDescription>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <div className="p-8 text-center bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground font-medium">EMPTY_DISTRIBUTION</p>
              <p className="text-sm text-muted-foreground mt-1">No hay distribución disponible para esta pregunta en el mock sintético.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opción de respuesta</TableHead>
                  <TableHead className="text-right">Conteo Base</TableHead>
                  <TableHead className="text-right">Conteo Comp.</TableHead>
                  <TableHead className="text-right">Delta N</TableHead>
                  <TableHead className="text-right">Tasa Base</TableHead>
                  <TableHead className="text-right">Tasa Comp.</TableHead>
                  <TableHead className="text-right">Delta %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((d) => (
                  <TableRow key={`${d.questionId}-${d.bucketLabel}`}>
                    <TableCell className="text-foreground">{d.bucketLabel}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{d.baseCount}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{d.comparisonCount}</TableCell>
                    <TableCell className="text-right font-medium">{d.countDelta.displayValue}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{d.baseRate.displayValue}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{d.comparisonRate.displayValue}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={d.tone === 'POSITIVE' ? 'text-success' : d.tone === 'NEGATIVE' ? 'text-destructive' : 'text-muted-foreground'}>
                        {d.rateDelta.displayValue}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Debug Metadata */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-mono">
            QA/DEBUG METADATA | ID: {question.questionId} | TYPE: {question.questionType} | TONE: {question.tone}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
