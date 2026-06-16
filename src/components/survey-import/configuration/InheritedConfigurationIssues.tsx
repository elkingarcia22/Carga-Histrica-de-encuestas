import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { HistoricalConfigurationIssue } from '@/lib/survey-import/configuration/historicalImportConfigurationTypes';

interface Props {
  issues: HistoricalConfigurationIssue[];
  onReturnToPreview: () => void;
}

export function InheritedConfigurationIssues({ issues, onReturnToPreview }: Props) {
  if (!issues || issues.length === 0) return null;

  const blockingIssues = issues.filter(i => i.severity === 'blocking');

  return (
    <section className="space-y-4">
      {blockingIssues.map(issue => (
        <Alert key={issue.id} variant="destructive" className="bg-red-50/50 border-red-200 text-red-900">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Bloqueo de importación heredado</AlertTitle>
          <AlertDescription className="mt-2 space-y-4 text-red-700/90">
            <p>{issue.title}: {issue.description}</p>
            <Button size="sm" variant="outline" className="border-red-300 text-red-800 hover:bg-red-100" onClick={onReturnToPreview}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a vista previa para corregir
            </Button>
          </AlertDescription>
        </Alert>
      ))}

      {issues.filter(i => i.severity === 'simulated-error').map(issue => (
        <Alert key={issue.id} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error sintético</AlertTitle>
          <AlertDescription>{issue.description}</AlertDescription>
        </Alert>
      ))}
    </section>
  );
}
