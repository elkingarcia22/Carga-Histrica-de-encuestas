import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HistoricalImportReviewMappingSource } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

interface Props {
  source: HistoricalImportReviewMappingSource;
}

export function SourceRelationsSummary({ source }: Props) {
  if (!source.relationsSummary || source.relationsSummary.length === 0) return null;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50">
        <CardTitle className="text-base font-semibold">Resumen de relaciones detectadas</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm text-muted-foreground mb-3">
          Relaciones clave detectadas entre archivos y hojas de la importación.
        </div>
        <ul className="space-y-1.5 text-sm list-inside list-disc text-slate-700">
          {source.relationsSummary.map((rel, idx) => (
            <li key={idx} className="truncate">{rel}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
