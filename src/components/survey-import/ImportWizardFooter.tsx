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
  leftActions?: React.ReactNode;
}

export function ImportWizardFooter({ 

  onBack, 
  disableBack = true,
  onContinue,
  continueDisabled = true,
  continueLabel,
  helperText,
  leftActions
}: ImportWizardFooterProps) {
  const { footer } = importWizardContent;

  return (
    <>
      <div className="flex items-center gap-3">
        {leftActions}
        <span className="text-sm text-muted-foreground font-medium">
          {helperText || footer.disabledReason}
        </span>
      </div>
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
    </>
  );
}
