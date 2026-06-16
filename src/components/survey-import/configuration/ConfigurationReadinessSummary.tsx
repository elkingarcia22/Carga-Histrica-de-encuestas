import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { HistoricalConfigurationDraftStatus } from '@/lib/survey-import/configuration/historicalImportConfigurationTypes';
import { HISTORICAL_CONFIGURATION_STATUS_LABELS } from '@/config/survey-import/historicalImportConfigurationConfig';

interface Props {
  status: HistoricalConfigurationDraftStatus;
  canContinue: boolean;
}

export function ConfigurationReadinessSummary({ status, canContinue }: Props) {
  return (
    <Card className="shadow-sm border-l-4 border-l-primary/60">
      <CardContent className="pt-6 pb-6 flex items-start gap-4">
        <div className="mt-1 shrink-0">
          {canContinue ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-500" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-base">Estado de la configuración: {HISTORICAL_CONFIGURATION_STATUS_LABELS[status]}</h4>
          <p className="text-sm text-muted-foreground">
            {canContinue
              ? 'Todos los campos obligatorios están completos y las confirmaciones requeridas han sido resueltas. Puedes continuar a la revisión y mapeo.'
              : 'Faltan campos por completar o hay confirmaciones pendientes. Revisa las secciones anteriores.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
