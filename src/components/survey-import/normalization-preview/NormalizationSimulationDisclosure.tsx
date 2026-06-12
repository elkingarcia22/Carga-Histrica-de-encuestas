import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

export function NormalizationSimulationDisclosure() {
  return (
    <Alert variant="info" aria-label="Información sobre datos simulados">
      <InfoIcon className="h-4 w-4" aria-hidden="true" />
      <AlertTitle className="flex items-center gap-2">
        Vista histórica simulada
        <Badge variant="info" className="h-5 px-1.5 py-0 text-[10px] uppercase">
          Simulado
        </Badge>
      </AlertTitle>
      <AlertDescription>
        Esta vista utiliza datos simulados para representar cómo podría interpretarse y normalizarse el lote. No se ha leído ni procesado el contenido real de los archivos y los mapeos mostrados son preliminares.
      </AlertDescription>
    </Alert>
  );
}
