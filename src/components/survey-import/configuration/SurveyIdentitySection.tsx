import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HISTORICAL_CONFIGURATION_LIMITS, HISTORICAL_CONFIGURATION_MOCK_TYPES } from '@/config/survey-import/historicalImportConfigurationConfig';
import { validateSurveyName } from '@/lib/survey-import/configuration/historicalImportConfigurationAdapter';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  name: string;
  nameOrigin: string;
  type: string;
  typeOrigin: string;
  typeConfirmed: boolean;
  onNameChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onConfirmType: () => void;
}

export function SurveyIdentitySection({
  name,
  nameOrigin,
  type,
  typeOrigin,
  typeConfirmed,
  onNameChange,
  onTypeChange,
  onConfirmType
}: Props) {
  const isNameValid = validateSurveyName(name);
  const showNameError = name.length > 0 && !isNameValid;

  return (
    <section className="space-y-6 bg-white p-6 rounded-xl border border-border shadow-sm dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold mb-1">Información general</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Define el nombre y el tipo de la encuesta histórica.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="survey-name" className="text-sm font-medium flex justify-between items-center">
            Nombre de la encuesta
            {nameOrigin === 'simulated-suggestion' && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                <Sparkles className="w-3 h-3 mr-1" /> Sugerencia IA (Simulada)
              </Badge>
            )}
          </label>
          <Input
            id="survey-name"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Ej. Clima Organizacional 2026"
            className={showNameError ? 'border-destructive focus-visible:ring-destructive' : ''}
            aria-describedby={showNameError ? "name-error" : undefined}
          />
          {showNameError && (
            <p id="name-error" className="text-xs text-destructive">
              El nombre debe tener entre {HISTORICAL_CONFIGURATION_LIMITS.nameMinLength} y {HISTORICAL_CONFIGURATION_LIMITS.nameMaxLength} caracteres.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between items-center">
            Tipo de encuesta
            {typeOrigin === 'simulated-suggestion' && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                <Sparkles className="w-3 h-3 mr-1" /> Sugerencia IA (Simulada)
              </Badge>
            )}
          </label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className={!typeConfirmed && type !== '' ? 'border-amber-400 bg-amber-50/30' : ''}>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {HISTORICAL_CONFIGURATION_MOCK_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!typeConfirmed && type !== '' && (
            <div className="flex items-center justify-between mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirma si el tipo sugerido es correcto.</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100" onClick={onConfirmType}>
                Confirmar
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
