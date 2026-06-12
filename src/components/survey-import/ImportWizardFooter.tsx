import { Button } from '@/components/ui/button';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportWizardFooterProps {
  className?: string;
  onBack?: () => void;
  disableBack?: boolean;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  helperText?: string;
}

export function ImportWizardFooter({ 
  className, 
  onBack, 
  disableBack = true,
  onContinue,
  continueDisabled = true,
  continueLabel,
  helperText
}: ImportWizardFooterProps) {
  const { footer } = importWizardContent;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {helperText || footer.disabledReason}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            disabled={disableBack} 
            aria-disabled={disableBack ? "true" : "false"}
            onClick={onBack}
          >
            {footer.backAction}
          </Button>
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
