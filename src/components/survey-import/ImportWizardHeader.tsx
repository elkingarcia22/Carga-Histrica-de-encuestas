import { Button } from '@/components/ui/button';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { X } from 'lucide-react';

interface ImportWizardHeaderProps {
  className?: string;
}

export function ImportWizardHeader({ className }: ImportWizardHeaderProps) {
  const { header } = importWizardContent;

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight mb-1">
            {header.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {header.description}
          </p>
        </div>
        <Button variant="ghost" disabled aria-disabled="true" className="shrink-0">
          <X className="w-4 h-4 mr-2" aria-hidden="true" />
          {header.cancelAction}
        </Button>
      </div>
    </div>
  );
}
