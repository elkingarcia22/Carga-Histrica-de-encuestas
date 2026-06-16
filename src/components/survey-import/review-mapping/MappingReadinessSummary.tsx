import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { HistoricalImportMappingReadiness, HistoricalConfigurationCompatibilityCheck } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  readiness: HistoricalImportMappingReadiness;
  compatibility: HistoricalConfigurationCompatibilityCheck;
}

export function MappingReadinessSummary({ readiness, compatibility }: Props) {
  if (compatibility.status !== 'current') {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertTitle className="font-semibold text-red-900">Configuración {compatibility.status}</AlertTitle>
        <AlertDescription className="text-red-800">
          {compatibility.reason || 'La configuración ha cambiado y el borrador de mapeo ya no es válido. Debes regresar y reiniciar el proceso.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (readiness.canContinueToConfirmation) {
    return (
      <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <AlertTitle className="font-semibold text-emerald-900">Listo para confirmar</AlertTitle>
        <AlertDescription className="text-emerald-800">
          Todos los campos críticos están mapeados correctamente y no hay incidencias bloqueantes. Puedes continuar a la confirmación de la importación.
        </AlertDescription>
      </Alert>
    );
  }

  let blockTitle = 'Revisión requerida';
  let blockDescription = 'Hay incidencias que debes resolver antes de continuar.';
  let isDestructive = false;

  if (!readiness.configurationValid) {
    blockTitle = 'Configuración inválida';
    blockDescription = 'Hay un problema en la configuración original que impide completar el mapeo.';
    isDestructive = true;
  } else if (readiness.simulatedErrorCount > 0) {
    blockTitle = 'Error de procesamiento';
    blockDescription = 'Se ha producido un error interno en la simulación. Intenta recargar o reiniciar el flujo.';
    isDestructive = true;
  } else if (readiness.blockingMappingsCount > 0 || readiness.blockingIssueIds.length > 0) {
    blockTitle = 'Incidencias bloqueantes';
    blockDescription = 'Existen incidencias prioritarias que bloquean el mapeo. Revísalas en la sección correspondiente.';
    isDestructive = true;
  } else if (readiness.requiredUnmappedCount > 0) {
    blockTitle = 'Campos obligatorios faltantes';
    blockDescription = 'Faltan campos críticos por mapear (ej. identificadores de usuario o preguntas requeridas).';
  } else if (readiness.unresolvedScaleCount > 0) {
    blockTitle = 'Escalas ambiguas';
    blockDescription = 'Algunas escalas de respuesta no se han podido resolver automáticamente de forma segura.';
  }

  return (
    <Alert variant={isDestructive ? 'destructive' : 'default'} className={!isDestructive ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-900'}>
      {isDestructive ? <AlertCircle className="w-4 h-4 text-red-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
      <AlertTitle className={isDestructive ? 'font-semibold text-red-900' : 'font-semibold text-amber-900'}>{blockTitle}</AlertTitle>
      <AlertDescription className={isDestructive ? 'text-red-800' : 'text-amber-800'}>
        {blockDescription}
      </AlertDescription>
    </Alert>
  );
}
