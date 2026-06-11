import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportSummaryCardProps {
  className?: string;
  filesCount: number;
  totalSizeLabel?: string;
  validCount?: number;
  blockedCount?: number;
  modeLabel: string;
  surveyTypeLabel: string;
  privacyLabel: string;
  isEmpty: boolean;
}

export function ImportSummaryCard({
  className,
  filesCount,
  totalSizeLabel,
  validCount,
  blockedCount,
  modeLabel,
  surveyTypeLabel,
  privacyLabel,
  isEmpty,
}: ImportSummaryCardProps) {
  const { summary } = importWizardContent;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{summary.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-md border border-dashed">
            {summary.emptyState}
          </div>
        ) : (
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{summary.labels.files}</dt>
              <dd className="font-medium text-foreground">{filesCount}</dd>
            </div>
            {totalSizeLabel && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tamaño total</dt>
                <dd className="font-medium text-foreground">{totalSizeLabel}</dd>
              </div>
            )}
            {validCount !== undefined && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <dt>Válidos</dt>
                <dd className="font-medium">{validCount}</dd>
              </div>
            )}
            {blockedCount !== undefined && blockedCount > 0 && (
              <div className="flex justify-between text-destructive">
                <dt>Con bloqueo</dt>
                <dd className="font-medium">{blockedCount}</dd>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t">
              <dt className="text-muted-foreground">{summary.labels.mode}</dt>
              <dd className="font-medium text-foreground">{modeLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{summary.labels.surveyType}</dt>
              <dd className="font-medium text-foreground">{surveyTypeLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{summary.labels.privacy}</dt>
              <dd className="font-medium text-foreground">{privacyLabel}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
