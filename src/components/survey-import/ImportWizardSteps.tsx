import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

interface ImportWizardStepsProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeStepId?: string;
}

export function ImportWizardSteps({
  className,
  activeStepId,
}: ImportWizardStepsProps) {
  const steps = importWizardContent.steps;
  const currentActiveId = activeStepId || steps.find(s => s.status === 'active')?.id || 'upload';
  const activeIndex = steps.findIndex(s => s.id === currentActiveId);

  return (
    <nav aria-label="Pasos del asistente de importación" className={cn('flex flex-col gap-6 w-full', className)}>
      <ol className="relative border-l border-border ml-3 space-y-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentActiveId;
          const isCompleted = index < activeIndex;
          const isLocked = index > activeIndex;

          return (
            <li key={step.id} className="ml-6">
              <span
                className={cn(
                  'absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-background transition-all duration-300',
                  isActive ? 'bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(var(--primary),0.1)]' :
                  isCompleted ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <span className="text-[10px] font-bold" aria-hidden="true">{index + 1}</span>
                )}
              </span>
              <h3
                className={cn(
                  'font-medium leading-tight pt-1 transition-colors duration-300 text-sm',
                  isActive ? 'text-foreground font-bold' :
                  isCompleted ? 'text-foreground font-medium' :
                  'text-muted-foreground'
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
