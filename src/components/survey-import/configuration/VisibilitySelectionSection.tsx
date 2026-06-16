import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { HistoricalVisibilityMode } from '@/lib/survey-import/configuration/historicalImportConfigurationTypes';
import { HISTORICAL_CONFIGURATION_VISIBILITY_LABELS } from '@/config/survey-import/historicalImportConfigurationConfig';

interface Props {
  visibility: HistoricalVisibilityMode | undefined;
  onVisibilityChange: (val: HistoricalVisibilityMode) => void;
}

export function VisibilitySelectionSection({ visibility, onVisibilityChange }: Props) {
  return (
    <section className="space-y-6 bg-white p-6 rounded-xl border border-border shadow-sm dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold mb-1">Visibilidad</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona quiénes podrán acceder a esta encuesta histórica.
        </p>
      </div>

      <RadioGroup value={visibility || ''} onValueChange={(v) => onVisibilityChange(v as HistoricalVisibilityMode)} className="flex flex-col gap-3">
        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${visibility === 'administrators-only' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="administrators-only" className="mt-1" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{HISTORICAL_CONFIGURATION_VISIBILITY_LABELS['administrators-only']}</span>
            <span className="text-sm text-muted-foreground">Únicamente los administradores del sistema tendrán acceso a los resultados.</span>
          </div>
        </label>

        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${visibility === 'administrators-and-authorized-consultants' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="administrators-and-authorized-consultants" className="mt-1" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{HISTORICAL_CONFIGURATION_VISIBILITY_LABELS['administrators-and-authorized-consultants']}</span>
            <span className="text-sm text-muted-foreground">Los administradores y los consultores de implementación autorizados tendrán acceso.</span>
          </div>
        </label>
      </RadioGroup>
    </section>
  );
}
