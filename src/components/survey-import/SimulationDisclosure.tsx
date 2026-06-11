import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SIMULATION_DISCLOSURE } from '@/config/survey-import/simulationConfig';
import { InfoIcon } from 'lucide-react';

export function SimulationDisclosure() {
  return (
    <Alert variant="info" aria-label={SIMULATION_DISCLOSURE.accessibleLabel}>
      <InfoIcon className="h-4 w-4" aria-hidden="true" />
      <AlertTitle className="flex items-center gap-2">
        {SIMULATION_DISCLOSURE.title}
        <Badge variant="info" className="h-5 px-1.5 py-0 text-[10px] uppercase">
          Simulado
        </Badge>
      </AlertTitle>
      <AlertDescription>
        {SIMULATION_DISCLOSURE.description}
      </AlertDescription>
    </Alert>
  );
}
