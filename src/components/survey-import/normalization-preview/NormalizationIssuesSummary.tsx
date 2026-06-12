import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { NormalizationPreviewModel } from '@/lib/survey-import/normalization-preview/normalizationPreviewTypes';
import { NORMALIZATION_PREVIEW_CONFIG } from '@/config/survey-import/normalizationPreviewConfig';
import { iconRegistry, IconFallback } from '@/icons/iconRegistry';

interface NormalizationIssuesSummaryProps {
  model: NormalizationPreviewModel;
}

export function NormalizationIssuesSummary({ model }: NormalizationIssuesSummaryProps) {
  const { visibleIssues, visibleFiles } = model;
  
  if (visibleIssues.length === 0) {
    return null;
  }

  const WarningIcon = iconRegistry.warning || IconFallback;
  const ErrorIcon = iconRegistry.error || IconFallback;
  const InfoIcon = iconRegistry.info || IconFallback;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'blocking':
        return <ErrorIcon className="h-5 w-5 text-destructive" />;
      case 'confirmation-required':
        return <WarningIcon className="h-5 w-5 text-amber-500" />;
      case 'warning':
        return <WarningIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InfoIcon className="h-5 w-5" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'blocking': return 'destructive';
      case 'confirmation-required': return 'warning';
      case 'warning': return 'warning';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getFileName = (id: string) => {
    return visibleFiles.find(f => f.id === id)?.sanitizedFilename || id;
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <WarningIcon className="h-5 w-5 text-muted-foreground" />
        Incidencias detectadas en la simulación
      </h3>
      <div className="flex flex-col gap-3">
        {visibleIssues.map((issue) => (
          <Alert key={issue.id} variant={getSeverityVariant(issue.severity) } className="bg-card shadow-sm">
            {getSeverityIcon(issue.severity)}
            <AlertTitle className="flex items-center gap-2">
              {issue.title}
              <Badge variant={getSeverityVariant(issue.severity) as 'default'|'destructive'|'outline'|'secondary'} className="h-5 px-1.5 py-0 text-[10px] uppercase font-semibold">
                {NORMALIZATION_PREVIEW_CONFIG.severityLabels[issue.severity]}
              </Badge>
              {issue.blocking && (
                <Badge variant="destructive" className="h-5 px-1.5 py-0 text-[10px] uppercase font-bold">
                  Bloqueante
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                {issue.description}
              </p>
              
              {issue.relatedFileIds.length > 0 && (
                <div className="text-xs">
                  <span className="font-semibold text-foreground mr-1">Archivos involucrados:</span>
                  <span className="text-muted-foreground">
                    {issue.relatedFileIds.map(getFileName).join(', ')}
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}
