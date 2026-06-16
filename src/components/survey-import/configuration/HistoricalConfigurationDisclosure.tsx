import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { HISTORICAL_CONFIGURATION_DISCLOSURE } from '@/config/survey-import/historicalImportConfigurationConfig';

export function HistoricalConfigurationDisclosure() {
  return (
    <Alert className="bg-blue-50/50 text-blue-900 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">{HISTORICAL_CONFIGURATION_DISCLOSURE.title}</AlertTitle>
      <AlertDescription className="text-blue-700/90">
        {HISTORICAL_CONFIGURATION_DISCLOSURE.description}
      </AlertDescription>
    </Alert>
  );
}
