import type { HistoricalMappingScaleMetadata } from '@/lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { Badge } from '@/components/ui/badge';

interface Props {
  metadata: HistoricalMappingScaleMetadata;
}

export function ScaleSourceSummary({ metadata }: Props) {
  const { sourceScaleName, syntheticMinimum, syntheticMaximum, syntheticMinLabel, syntheticMaxLabel, currentPolarity } = metadata;

  let polarityLabel = 'No resuelta';
  if (currentPolarity === 'high-is-favorable') {
    polarityLabel = 'Puntuación alta = favorable';
  } else if (currentPolarity === 'low-is-favorable') {
    polarityLabel = 'Puntuación baja = favorable';
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">{sourceScaleName}</h4>
        <Badge variant={currentPolarity === 'unresolved' ? 'destructive' : 'default'}>
          {currentPolarity === 'unresolved' ? 'Requiere revisión' : 'Resuelta'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-slate-500">Rango</p>
          <p className="font-medium text-slate-900">
            {syntheticMinimum} a {syntheticMaximum}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-slate-500">Polaridad actual</p>
          <p className="font-medium text-slate-900">{polarityLabel}</p>
        </div>
      </div>

      {(syntheticMinLabel || syntheticMaxLabel) && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Etiquetas detectadas</p>
          <div className="flex gap-4">
            {syntheticMinLabel && (
              <span className="text-sm text-slate-700">Mínimo: {syntheticMinLabel}</span>
            )}
            {syntheticMaxLabel && (
              <span className="text-sm text-slate-700">Máximo: {syntheticMaxLabel}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
