import { Check, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { Button } from '@/components/ui/button';

interface ImportWizardStepsProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeStepId?: string;
}

export function ImportWizardSteps({
  className,
  isCollapsed = false,
  onToggleCollapse,
  activeStepId,
}: ImportWizardStepsProps) {
  const steps = importWizardContent.steps;
  const currentActiveId = activeStepId || steps.find(s => s.status === 'active')?.id || 'upload';
  const activeIndex = steps.findIndex(s => s.id === currentActiveId);

  return (
    <nav aria-label="Pasos del asistente de importación" className={cn('flex flex-col gap-4 w-full', className)}>
      {/* Collapse/Expand Toggle Button */}
      {onToggleCollapse && (
        <div className={cn("flex mb-2", isCollapsed ? "justify-center" : "justify-end px-2")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800"
            aria-label={isCollapsed ? "Expandir pasos" : "Colapsar pasos"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4.5 h-4.5" />
            ) : (
              <ChevronLeft className="w-4.5 h-4.5" />
            )}
          </Button>
        </div>
      )}

      <ol className={cn("relative space-y-3", isCollapsed ? "flex flex-col items-center" : "px-2")}>
        {steps.map((step, index) => {
          const isActive = step.id === currentActiveId;
          const isCompleted = index < activeIndex;
          const isLocked = index > activeIndex;

          return (
            <li
              key={step.id}
              className={cn(
                "relative transition-all duration-300 flex items-start w-full z-10",
                isCollapsed
                  ? "justify-center py-3"
                  : "px-2 py-3 gap-4"
              )}
            >
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute w-[2px] -z-10 transition-colors duration-300",
                    isCollapsed
                      ? "left-1/2 top-10 bottom-[-1rem] -translate-x-1/2"
                      : "left-[20px] top-10 bottom-[-1rem]",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Circle Indicator */}
              <span
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-all duration-300 z-10 mt-0.5',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(var(--primary),0.1)]'
                    : isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <span className="text-[10px] font-bold" aria-hidden="true">{index + 1}</span>
                )}
              </span>

              {/* Text Label */}
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm transition-colors duration-300 font-medium",
                    isActive ? "text-foreground" :
                    isCompleted ? "text-foreground" :
                    "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
