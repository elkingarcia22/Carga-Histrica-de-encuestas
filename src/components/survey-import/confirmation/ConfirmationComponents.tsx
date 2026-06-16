
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type {
  HistoricalImportConfirmationSource,
  HistoricalImportConfirmationReadiness,
  HistoricalConfirmationStatus,
  HistoricalConfirmationCompatibility
} from '@/lib/survey-import/confirmation/historicalImportConfirmationTypes';

export function ConfirmationSimulationDisclosure() {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Paso 4 de 4: Confirmar importación</AlertTitle>
      <AlertDescription className="text-blue-700">
        Revisa el consolidado final antes de preparar la importación.
        La ejecución real de la importación todavía no está conectada en este prototipo,
        pero la preparación dejará el lote listo.
      </AlertDescription>
    </Alert>
  );
}

export function ConfirmationSurveyIdentitySummary({ source }: { source: HistoricalImportConfirmationSource }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Identidad de la encuesta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Nombre</p>
            <p className="font-medium text-slate-900">{source.confirmedSurveyName}</p>
          </div>
          <div>
            <p className="text-slate-500">Tipo</p>
            <p className="font-medium text-slate-900">{source.confirmedSurveyType}</p>
          </div>
          <div>
            <p className="text-slate-500">Año del periodo</p>
            <p className="font-medium text-slate-900">{source.confirmedPeriodYear}</p>
          </div>
          <div>
            <p className="text-slate-500">Modo de periodo</p>
            <p className="font-medium text-slate-900">{source.confirmedPeriodMode}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfirmationBatchSummary({ source }: { source: HistoricalImportConfirmationSource }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Resumen del lote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-slate-500">Archivos detectados</p>
            <p className="font-medium text-slate-900">{source.fileCount}</p>
          </div>
          <div>
            <p className="text-slate-500">ID del lote</p>
            <p className="font-mono text-xs text-slate-600 mt-1">{source.sourceBatchId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfirmedConfigurationSummary({ source }: { source: HistoricalImportConfirmationSource }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Configuración confirmada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Privacidad</p>
            <p className="font-medium text-slate-900 capitalize">{source.confirmedPrivacyMode}</p>
          </div>
          <div>
            <p className="text-slate-500">Umbral mínimo</p>
            <p className="font-medium text-slate-900">{source.confirmedMinimumThreshold ?? 'No aplica'}</p>
          </div>
          <div>
            <p className="text-slate-500">Visibilidad</p>
            <p className="font-medium text-slate-900 capitalize">{source.confirmedVisibilityMode}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfirmedMappingSummary({ source }: { source: HistoricalImportConfirmationSource }) {
  const domains = Object.values(source.domainSummaries);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Resumen de mapeos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {domains.map(d => (
            <div key={d.domain} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <span className="capitalize font-medium text-slate-700">{d.domain}</span>
              <div className="flex gap-3">
                <Badge variant={d.confirmed === d.total ? 'default' : 'secondary'} className="bg-slate-100 text-slate-700">
                  {d.confirmed} / {d.total} mapeados
                </Badge>
                {d.issueCount > 0 && (
                  <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                    {d.issueCount} incidencias
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function IgnoredColumnsConfirmationSummary({ source }: { source: HistoricalImportConfirmationSource }) {
  if (source.ignoredColumnIds.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Columnas ignoradas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-2">
          Has seleccionado ignorar {source.ignoredColumnIds.length} columnas durante la importación.
        </p>
        <div className="flex flex-wrap gap-2">
          {source.ignoredColumnIds.map(id => (
            <Badge key={id} variant="outline" className="bg-amber-50 border-amber-200 text-amber-800">
              {id}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DeferredIssuesConfirmationSummary({ source }: { source: HistoricalImportConfirmationSource }) {
  if (source.deferredIssueIds.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Incidencias diferidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-amber-800 mb-2">
          Hay {source.deferredIssueIds.length} incidencias que decidiste no resolver ahora.
          Estas pueden afectar la calidad de los datos importados.
        </p>
      </CardContent>
    </Card>
  );
}

export function ExplicitConfirmationControl({
  value,
  onChange,
  disabled
}: {
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Card className={value ? 'border-blue-200 bg-blue-50/30' : ''}>
      <CardContent className="p-4 flex items-start gap-3">
        <Checkbox
          id="explicit-confirmation"
          checked={value}
          onCheckedChange={(checked) => onChange(checked === true)}
          disabled={disabled}
          className="mt-1"
          aria-describedby="explicit-confirmation-desc"
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="explicit-confirmation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900"
          >
            Confirmo que revisé la configuración, los mapeos y las columnas ignoradas de esta importación histórica.
          </label>
          <p id="explicit-confirmation-desc" className="text-sm text-slate-500">
            Al confirmar, asumes la responsabilidad sobre las decisiones tomadas en pasos anteriores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfirmationReadinessSummary({
  compatibility,
  status,
  feedbackRef
}: {
  readiness: HistoricalImportConfirmationReadiness;
  compatibility: HistoricalConfirmationCompatibility;
  status: HistoricalConfirmationStatus;
  feedbackRef?: React.Ref<HTMLDivElement>;
}) {
  const isStale = compatibility === 'stale';
  const isIncompatible = compatibility === 'incompatible';
  const isPrepared = status === 'confirmation-prepared';

  if (isPrepared) {
    return (
      <Alert
        ref={feedbackRef}
        tabIndex={-1}
        className="bg-emerald-50 border-emerald-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-800">La confirmación quedó preparada.</AlertTitle>
        <AlertDescription className="text-emerald-700">
          La ejecución de la importación todavía no está conectada en este prototipo.
        </AlertDescription>
      </Alert>
    );
  }

  if (isIncompatible) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Borrador incompatible</AlertTitle>
        <AlertDescription>
          El borrador de mapeo ha cambiado significativamente. Debes volver y resolver el mapeo.
        </AlertDescription>
      </Alert>
    );
  }

  if (isStale) {
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Borrador desactualizado</AlertTitle>
        <AlertDescription>
          Hay cambios pendientes en los pasos anteriores. Debes volver a revisarlos antes de confirmar.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'blocked') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Importación bloqueada</AlertTitle>
        <AlertDescription>
          Existen problemas bloqueantes que impiden preparar la importación. Revisa los pasos anteriores.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
