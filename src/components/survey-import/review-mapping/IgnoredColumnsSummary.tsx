import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HistoricalImportIgnoredColumn } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { HISTORICAL_MAPPING_IGNORED_REASON_LABELS } from '../../../config/survey-import/historicalImportReviewMappingConfig';
import { AlertCircle } from 'lucide-react';

interface Props {
  columns: HistoricalImportIgnoredColumn[];
}

export function IgnoredColumnsSummary({ columns }: Props) {
  if (columns.length === 0) return null;
  
  const requiredIgnored = columns.filter(c => c.required).length;
  const sample = columns.slice(0, 3);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>Columnas ignoradas ({columns.length})</span>
          {requiredIgnored > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 font-normal">
              <AlertCircle className="w-3.5 h-3.5" />
              {requiredIgnored} requeridas
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm text-muted-foreground mb-4">
          Estas columnas fueron descartadas automáticamente o por el usuario. No se importarán.
        </div>
        <div className="flex flex-col gap-2">
          {sample.map(col => (
            <div key={col.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100 text-sm">
              <div className="font-medium text-slate-700 truncate mr-2" title={col.label}>{col.label}</div>
              <Badge variant="secondary" className="shrink-0 font-normal text-xs bg-slate-200">
                {HISTORICAL_MAPPING_IGNORED_REASON_LABELS[col.reason] || col.reason}
              </Badge>
            </div>
          ))}
          {columns.length > sample.length && (
            <div className="text-xs text-center text-muted-foreground py-2 bg-slate-50/50 rounded-md border border-slate-100/50 border-dashed mt-1">
              + {columns.length - sample.length} columnas más
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
