import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { HISTORICAL_MAPPING_SIMULATED_DISCLOSURE_COPY } from '../../../config/survey-import/historicalImportReviewMappingConfig';

export function MappingSimulationDisclosure() {
  return (
    <Alert className="bg-slate-50 border-slate-200">
      <Info className="h-4 w-4 text-slate-600" />
      <AlertTitle className="flex items-center gap-2 text-slate-800">
        {HISTORICAL_MAPPING_SIMULATED_DISCLOSURE_COPY.title}
        <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200 font-normal">
          Simulado
        </Badge>
      </AlertTitle>
      <AlertDescription className="text-slate-600 mt-1">
        {HISTORICAL_MAPPING_SIMULATED_DISCLOSURE_COPY.description}
      </AlertDescription>
    </Alert>
  );
}
