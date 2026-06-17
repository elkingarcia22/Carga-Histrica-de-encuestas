import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UbitsIcon } from '@/icons';

export function ResolutionImpactSummary() {
  return (
    <Alert variant="info" className="bg-blue-50 border-blue-200">
      <UbitsIcon name="info" className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Impacto de la resolución</AlertTitle>
      <AlertDescription className="text-blue-700">
        Confirmar esta polaridad actualizará el mapeo y puede resolver esta incidencia. Esto no elimina otros bloqueos, no transforma las respuestas originales del archivo y no persiste fuera de esta sesión.
      </AlertDescription>
    </Alert>
  );
}
