import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, EyeOff, UserCircle } from 'lucide-react';
import type { HistoricalPrivacyMode } from '@/lib/survey-import/configuration/historicalImportConfigurationTypes';
import { HISTORICAL_CONFIGURATION_PRIVACY_LABELS, HISTORICAL_CONFIGURATION_LIMITS } from '@/config/survey-import/historicalImportConfigurationConfig';
import { validateMinimumThreshold } from '@/lib/survey-import/configuration/historicalImportConfigurationAdapter';

interface Props {
  privacy: HistoricalPrivacyMode | undefined;
  identifiedModeConfirmed: boolean;
  threshold: number | undefined;
  onPrivacyChange: (val: HistoricalPrivacyMode) => void;
  onConfirmIdentified: () => void;
  onThresholdChange: (val: number | undefined) => void;
}

export function PrivacyAndThresholdSection({
  privacy,
  identifiedModeConfirmed,
  threshold,
  onPrivacyChange,
  onConfirmIdentified,
  onThresholdChange
}: Props) {
  const isThresholdValid = validateMinimumThreshold(privacy, threshold);
  const showThresholdError = privacy === 'confidential' && threshold !== undefined && !isThresholdValid;

  return (
    <section className="space-y-6 bg-white p-6 rounded-xl border border-border shadow-sm dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold mb-1">Privacidad y tratamiento de respuestas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona cómo se tratarán las respuestas de los participantes.
        </p>
      </div>

      <RadioGroup value={privacy || ''} onValueChange={(v) => onPrivacyChange(v as HistoricalPrivacyMode)} className="grid gap-4 md:grid-cols-3">
        <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${privacy === 'anonymous' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="anonymous" className="sr-only" />
          <EyeOff className={`w-8 h-8 mb-2 ${privacy === 'anonymous' ? 'text-primary' : 'text-slate-400'}`} />
          <span className="font-medium text-sm text-center">{HISTORICAL_CONFIGURATION_PRIVACY_LABELS.anonymous}</span>
          <span className="text-xs text-muted-foreground text-center mt-1">No se recopilan datos identificables.</span>
        </label>

        <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${privacy === 'confidential' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="confidential" className="sr-only" />
          <Shield className={`w-8 h-8 mb-2 ${privacy === 'confidential' ? 'text-primary' : 'text-slate-400'}`} />
          <span className="font-medium text-sm text-center">{HISTORICAL_CONFIGURATION_PRIVACY_LABELS.confidential}</span>
          <span className="text-xs text-muted-foreground text-center mt-1">Se requiere un umbral mínimo para mostrar resultados.</span>
        </label>

        <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${privacy === 'identified' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="identified" className="sr-only" />
          <UserCircle className={`w-8 h-8 mb-2 ${privacy === 'identified' ? 'text-primary' : 'text-slate-400'}`} />
          <span className="font-medium text-sm text-center">{HISTORICAL_CONFIGURATION_PRIVACY_LABELS.identified}</span>
          <span className="text-xs text-muted-foreground text-center mt-1">Las respuestas individuales son visibles.</span>
        </label>
      </RadioGroup>

      {privacy === 'confidential' && (
        <div className="pt-4 border-t border-border w-full max-w-xs space-y-2 animate-in fade-in slide-in-from-top-2">
          <label htmlFor="threshold" className="text-sm font-medium">
            Umbral mínimo de respuestas
          </label>
          <div className="flex gap-2 items-center">
            <Input
              id="threshold"
              type="number"
              value={threshold !== undefined ? threshold : ''}
              onChange={e => {
                const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                onThresholdChange(val);
              }}
              min={HISTORICAL_CONFIGURATION_LIMITS.thresholdMin}
              max={HISTORICAL_CONFIGURATION_LIMITS.thresholdMax}
              className={`w-24 ${showThresholdError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              aria-describedby={showThresholdError ? "threshold-error" : "threshold-desc"}
            />
            <span className="text-sm text-muted-foreground">personas</span>
          </div>
          <p id="threshold-desc" className="text-xs text-muted-foreground">
            Rango permitido: {HISTORICAL_CONFIGURATION_LIMITS.thresholdMin} a {HISTORICAL_CONFIGURATION_LIMITS.thresholdMax}.
          </p>
          {showThresholdError && (
            <p id="threshold-error" className="text-xs text-destructive">
              Umbral inválido.
            </p>
          )}
        </div>
      )}

      {(privacy === 'anonymous' || privacy === 'identified') && (
        <div className="pt-4 border-t border-border w-full max-w-xs space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-sm font-medium text-muted-foreground">
            Umbral mínimo de respuestas
          </label>
          <div>
            <span className="text-sm px-3 py-1 bg-slate-100 text-slate-500 rounded-md dark:bg-zinc-800">No aplica</span>
          </div>
        </div>
      )}

      {privacy === 'identified' && !identifiedModeConfirmed && (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>
              Al seleccionar el modo Identificada, las respuestas individuales de los participantes serán visibles para los administradores.
            </span>
            <Button size="sm" variant="outline" onClick={onConfirmIdentified} className="w-fit self-start">
              Confirmar modo identificado
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}
