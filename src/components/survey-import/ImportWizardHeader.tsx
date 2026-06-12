import { Button } from '@/components/ui/button';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { X } from 'lucide-react';

interface ImportWizardHeaderProps {
  className?: string;
  onCancel?: () => void;
}

export function ImportWizardHeader({ className, onCancel }: ImportWizardHeaderProps) {
  const { header } = importWizardContent;

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight mb-1">
            {header.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {header.description}
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="icon"
          className="w-10 h-10 rounded-xl shrink-0"
          onClick={onCancel}
          aria-label="Cancelar importación"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
