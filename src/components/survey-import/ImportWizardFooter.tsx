import { Button } from '@/components/ui/button';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportWizardFooterProps {
  className?: string;
  onBack?: () => void;
  disableBack?: boolean;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export function ImportWizardFooter({ 
  className, 
  onBack, 
  disableBack = true,
  onContinue,
  continueDisabled = true,
  continueLabel
}: ImportWizardFooterProps) {
  const { footer } = importWizardContent;

  return (
    <div className={className}>
      <div className="flex items-center justify-between py-4 border-t">
        <Button 
          variant="outline" 
          disabled={disableBack} 
          aria-disabled={disableBack ? "true" : "false"}
          onClick={onBack}
        >
          {footer.backAction}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {footer.disabledReason}
          </span>
          <Button 
            variant="default" 
            disabled={continueDisabled} 
            aria-disabled={continueDisabled ? "true" : "false"}
            onClick={(e) => {
              if (continueDisabled) {
                e.preventDefault();
                return;
              }
              onContinue?.();
            }}
          >
            {continueLabel || footer.nextAction}
          </Button>
        </div>
      </div>
    </div>
  );
}
