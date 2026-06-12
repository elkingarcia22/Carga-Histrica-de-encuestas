import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NormalizationPreviewModel } from '@/lib/survey-import/normalization-preview/normalizationPreviewTypes';
import { iconRegistry, IconFallback } from '@/icons/iconRegistry';

interface NormalizationStatusSummaryProps {
  model: NormalizationPreviewModel;
}

export function NormalizationStatusSummary({ model }: NormalizationStatusSummaryProps) {
  const { batch, totals, statusSummary, canContinueToConfiguration } = model;
  
  const FileIcon = iconRegistry.file || IconFallback;
  const CheckIcon = iconRegistry.success || IconFallback;
  const SurveyIcon = iconRegistry.survey || IconFallback;
  const CalendarIcon = iconRegistry.calendar || IconFallback;

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{batch.surveyIdentity}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><SurveyIcon className="h-4 w-4" /> {batch.surveyType}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {batch.surveyPeriod}</span>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <Badge variant={canContinueToConfiguration ? "default" : "warning"} className="text-sm px-2 py-0.5">
              {statusSummary}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          <div className="flex flex-col p-4 bg-card">
            <span className="text-sm font-medium text-muted-foreground">Archivos detectados</span>
            <div className="flex items-center gap-2 mt-1.5">
              <FileIcon className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold leading-none">{totals.files}</span>
            </div>
          </div>
          
          <div className="flex flex-col p-4 bg-card">
            <span className="text-sm font-medium text-muted-foreground">Fuente principal</span>
            <span className="text-base font-semibold mt-1.5 break-words line-clamp-2" title={batch.primarySourceFileId || 'No definida'}>
              {batch.fileSummaries.find(f => f.id === batch.primarySourceFileId)?.sanitizedFilename || 'No definida'}
            </span>
          </div>

          <div className="flex flex-col p-4 bg-card">
            <span className="text-sm font-medium text-muted-foreground">Archivos auxiliares</span>
            <span className="text-2xl font-bold mt-1.5 leading-none">
              {Math.max(0, totals.files - 1)}
            </span>
          </div>

          <div className="flex flex-col p-4 bg-card">
            <span className="text-sm font-medium text-muted-foreground">Estado de bloqueos</span>
            <div className="flex items-center gap-2 mt-1.5">
              <CheckIcon className="h-5 w-5 text-green-600" />
              <span className="text-base font-semibold text-green-700">Sin bloqueos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
