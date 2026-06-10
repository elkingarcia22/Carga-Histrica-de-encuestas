import { Button } from '@/components/ui/button';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportWizardFooterProps {
  className?: string;
}

export function ImportWizardFooter({ className }: ImportWizardFooterProps) {
  const { footer } = importWizardContent;

  return (
    <div className={className}>
      <div className="flex items-center justify-between py-4 border-t">
        <Button variant="outline" disabled aria-disabled="true">
          {footer.backAction}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {footer.disabledReason}
          </span>
          <Button variant="default" disabled aria-disabled="true">
            {footer.nextAction}
          </Button>
        </div>
      </div>
    </div>
  );
}
