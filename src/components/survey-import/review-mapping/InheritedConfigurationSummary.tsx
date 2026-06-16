import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HistoricalImportReviewMappingSource } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

interface Props {
  source: HistoricalImportReviewMappingSource;
}

export function InheritedConfigurationSummary({ source }: Props) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground block mb-1 text-xs uppercase tracking-wider font-semibold">Nombre confirmado</span>
          <span className="font-medium text-foreground">{source.confirmedSurveyName}</span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1 text-xs uppercase tracking-wider font-semibold">Tipo y Año</span>
          <div className="flex gap-2 items-center">
            <span className="font-medium text-foreground capitalize">{source.confirmedSurveyType}</span>
            <span className="text-foreground">{source.confirmedPeriodYear}</span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1 text-xs uppercase tracking-wider font-semibold">Privacidad</span>
          <div className="flex gap-2 items-center flex-wrap">
            <Badge variant="outline" className="capitalize font-normal text-xs">{source.confirmedPrivacyMode}</Badge>
            {source.confirmedMinimumThreshold !== undefined && (
              <span className="text-muted-foreground text-xs">Umbral: {source.confirmedMinimumThreshold}</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1 text-xs uppercase tracking-wider font-semibold">Archivos y Visibilidad</span>
          <span className="font-medium text-foreground block">{source.fileCount} archivo{source.fileCount !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground text-xs capitalize">{source.confirmedVisibilityMode}</span>
        </div>
      </CardContent>
    </Card>
  );
}
