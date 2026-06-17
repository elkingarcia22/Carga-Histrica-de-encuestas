import type {
  HistoricalMappingScalePolarity,
  HistoricalMappingResolutionOrigin
} from '@/lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { UbitsIcon } from '@/icons';

interface Props {
  suggestedPolarity: HistoricalMappingScalePolarity;
  selectedPolarity: HistoricalMappingScalePolarity | undefined;
  onSelectionChange: (polarity: HistoricalMappingScalePolarity, origin: HistoricalMappingResolutionOrigin) => void;
  disabled?: boolean;
}

export function AmbiguousPolarityResolution({
  suggestedPolarity,
  selectedPolarity,
  onSelectionChange,
  disabled = false
}: Props) {
  const handleValueChange = (value: string) => {
    onSelectionChange(value as HistoricalMappingScalePolarity, 'user-selected');
  };

  const handleUseSuggestion = () => {
    if (suggestedPolarity === 'unresolved') return;
    onSelectionChange(suggestedPolarity, 'user-confirmed-suggestion');
  };

  const hasValidSuggestion = suggestedPolarity === 'high-is-favorable' || suggestedPolarity === 'low-is-favorable';

  return (
    <div className="space-y-4">
      {hasValidSuggestion && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <UbitsIcon name="sparkles" className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-semibold text-slate-800">Sugerencia simulada</h4>
            <p className="text-sm text-slate-600">
              Basado en encuestas similares, sugerimos usar: <br/>
              <strong>
                {suggestedPolarity === 'high-is-favorable'
                  ? 'Puntuación alta = favorable'
                  : 'Puntuación baja = favorable'}
              </strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseSuggestion}
              disabled={disabled || selectedPolarity === suggestedPolarity}
            >
              Usar sugerencia
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Selecciona la polaridad correcta</label>
          <p className="text-sm text-slate-500">¿Qué significa una puntuación alta en esta escala?</p>
        </div>

        <RadioGroup
          value={selectedPolarity === 'unresolved' ? undefined : selectedPolarity}
          onValueChange={handleValueChange}
          disabled={disabled}
          className="gap-3"
          aria-label="Selección de polaridad"
        >
          <div className="flex items-start space-x-3 space-y-0 p-3 border border-slate-200 rounded-md data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50">
            <RadioGroupItem value="high-is-favorable" id="high-is-favorable" className="mt-1" />
            <div className="space-y-1">
              <label htmlFor="high-is-favorable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                Puntuación alta = favorable
              </label>
              <p className="text-sm text-slate-500">Ejemplo: 5 es Excelente, 1 es Deficiente</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0 p-3 border border-slate-200 rounded-md data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50">
            <RadioGroupItem value="low-is-favorable" id="low-is-favorable" className="mt-1" />
            <div className="space-y-1">
              <label htmlFor="low-is-favorable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                Puntuación baja = favorable
              </label>
              <p className="text-sm text-slate-500">Ejemplo: 1 es Excelente, 5 es Deficiente</p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
