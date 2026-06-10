import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportWizardStepsProps {
  className?: string;
}

export function ImportWizardSteps({ className }: ImportWizardStepsProps) {
  const steps = importWizardContent.steps;

  return (
    <nav aria-label="Pasos del asistente de importación" className={cn('flex flex-col gap-6', className)}>
      <ol className="relative border-l border-border ml-3 space-y-8">
        {steps.map((step, index) => {
          const isActive = step.status === 'active';
          const isCompleted = false; // For future states

          return (
            <li key={step.id} className="ml-6">
              <span
                className={cn(
                  'absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-background',
                  isActive ? 'bg-primary text-primary-foreground' : 
                  isCompleted ? 'bg-positive text-positive-foreground' : 
                  'bg-muted text-muted-foreground border border-border'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <span className="text-[10px] font-bold" aria-hidden="true">{index + 1}</span>
                )}
              </span>
              <h3
                className={cn(
                  'font-medium leading-tight pt-1',
                  isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </h3>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
