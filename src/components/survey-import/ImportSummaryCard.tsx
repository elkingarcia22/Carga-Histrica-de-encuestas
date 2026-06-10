import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportSummaryCardProps {
  className?: string;
  filesCount: number;
  modeLabel: string;
  surveyTypeLabel: string;
  privacyLabel: string;
  pendingReviewsCount: number;
  isEmpty: boolean;
}

export function ImportSummaryCard({
  className,
  filesCount,
  modeLabel,
  surveyTypeLabel,
  privacyLabel,
  pendingReviewsCount,
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
            <div className="flex justify-between">
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
            <div className="flex justify-between pt-4 border-t">
              <dt className="text-muted-foreground">{summary.labels.pendingReviews}</dt>
              <dd className="font-medium text-foreground">{pendingReviewsCount}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
