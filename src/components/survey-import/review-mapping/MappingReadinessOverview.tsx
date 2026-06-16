import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HistoricalImportMappingReadiness, HistoricalImportMappingDraftStatus, HistoricalConfigurationCompatibilityCheck } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { HISTORICAL_MAPPING_DRAFT_STATUS_LABELS } from '../../../config/survey-import/historicalImportReviewMappingConfig';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  status: HistoricalImportMappingDraftStatus;
  readiness: HistoricalImportMappingReadiness;
  compatibility: HistoricalConfigurationCompatibilityCheck;
}

export function MappingReadinessOverview({ status, readiness, compatibility }: Props) {
  const isCompatible = compatibility.status === 'current';
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Estado global del mapeo</CardTitle>
          <Badge 
            variant={status === 'ready-for-confirmation' ? 'default' : status === 'blocked' || status === 'simulated-error' ? 'destructive' : 'secondary'}
            className={status === 'ready-for-confirmation' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {HISTORICAL_MAPPING_DRAFT_STATUS_LABELS[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Bloqueos
          </span>
          <span className="text-2xl font-bold text-slate-800">
            {readiness.blockingMappingsCount + readiness.requiredUnmappedCount + readiness.unresolvedScaleCount + readiness.missingIdentifierCount + readiness.simulatedErrorCount}
          </span>
        </div>
        
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            Revisiones pendientes
          </span>
          <span className="text-2xl font-bold text-slate-800">
            {readiness.pendingConfirmationCount}
          </span>
        </div>
        
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Compatibilidad config
          </span>
          <span className="text-sm font-semibold mt-1">
            {isCompatible ? <span className="text-emerald-600">Vigente</span> : <span className="text-red-600">No vigente ({compatibility.status})</span>}
          </span>
        </div>
        
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            Total de incidencias
          </span>
          <span className="text-2xl font-bold text-slate-800">
            {readiness.blockingIssueIds.length + readiness.pendingIssueIds.length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
