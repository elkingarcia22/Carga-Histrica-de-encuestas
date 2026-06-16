import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { validatePeriodYear } from '@/lib/survey-import/configuration/historicalImportConfigurationAdapter';

interface Props {
  year: number | undefined;
  yearOrigin: string;
  onYearChange: (val: number | undefined) => void;
}

export function HistoricalPeriodSection({ year, yearOrigin, onYearChange }: Props) {
  const isYearValid = validatePeriodYear(year);
  const showYearError = year !== undefined && !isYearValid;
  const yearStr = year ? year.toString() : '';

  return (
    <section className="space-y-6 bg-white p-6 rounded-xl border border-border shadow-sm dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold mb-1">Periodo histórico</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Indica el año de ejecución de la encuesta original.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <label htmlFor="period-year" className="text-sm font-medium flex justify-between items-center">
          Año
          {yearOrigin === 'simulated-suggestion' && (
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
              <Sparkles className="w-3 h-3 mr-1" /> Sugerencia IA
            </Badge>
          )}
        </label>
        <Input
          id="period-year"
          type="number"
          value={yearStr}
          onChange={e => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onYearChange(val);
          }}
          placeholder="Ej. 2026"
          className={showYearError ? 'border-destructive focus-visible:ring-destructive' : ''}
          aria-describedby={showYearError ? "year-error" : undefined}
          required
        />
        {showYearError && (
          <p id="year-error" className="text-xs text-destructive">
            Introduce un año válido (ej. 2020-2030).
          </p>
        )}
      </div>
    </section>
  );
}
