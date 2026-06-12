import { useMemo, useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetClose, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { NormalizationSimulationDisclosure } from '@/components/survey-import/normalization-preview/NormalizationSimulationDisclosure';
import { NormalizationStatusSummary } from '@/components/survey-import/normalization-preview/NormalizationStatusSummary';
import { NormalizationFileList } from '@/components/survey-import/normalization-preview/NormalizationFileList';
import { NormalizationRelationsSummary } from '@/components/survey-import/normalization-preview/NormalizationRelationsSummary';
import { NormalizationMappingPreview } from '@/components/survey-import/normalization-preview/NormalizationMappingPreview';
import { NormalizationIssuesSummary } from '@/components/survey-import/normalization-preview/NormalizationIssuesSummary';
import { getNormalizationPreviewModel } from '@/lib/survey-import/normalization-preview/normalizationPreviewAdapter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NormalizationPreviewScreenProps {
  onCancelImportFlow?: () => void;
  onContinueToConfiguration?: () => void;
}

export function NormalizationPreviewScreen({
  onCancelImportFlow,
  onContinueToConfiguration,
}: NormalizationPreviewScreenProps) {
  const model = useMemo(() => getNormalizationPreviewModel('multi-file-single-survey-ready'), []);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggleCollapse = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsCollapsed(prev => !prev);
  };

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <Sheet open={true} onOpenChange={(isOpen) => { if (!isOpen && onCancelImportFlow) onCancelImportFlow() }}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col gap-0 border-none bg-[#f8f9fa] dark:bg-zinc-950 h-screen overflow-hidden" 
        style={{ width: '100vw', maxWidth: '100vw' }} 
        showCloseButton={false}
      >
        {/* Custom close button using secondary variant */}
        <SheetClose asChild>
          <Button
            variant="secondary"
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl"
            onClick={onCancelImportFlow}
          >
            <X className="w-5 h-5" />
          </Button>
        </SheetClose>
        {/* Main Area (Sidebar + Scroll Content) taking up all remaining height */}
        <div className="flex-1 min-h-0 flex flex-row gap-0">
          {/* Left Sidebar - Stepper */}
          <aside 
            className={cn(
              "shrink-0 h-full bg-transparent pt-8 flex flex-col transition-all duration-300 hidden md:flex", 
              isCollapsed ? "w-16" : "w-64"
            )}
            onMouseEnter={handleMouseEnter}
          >
            <ImportWizardSteps 
              isCollapsed={isCollapsed} 
              onToggleCollapse={handleToggleCollapse} 
              activeStepId="upload" 
            />
          </aside>

          {/* Right Content Area - Scrollable Content */}
          <ScrollArea className="flex-1 min-h-0 w-full pt-8">
            <div className="flex flex-col gap-8 w-full px-8 pb-12">
              {/* Header embedded inside scroll area */}
              <div className="pt-2">
                <ImportWizardHeader className="pb-0" />
              </div>
              
              <NormalizationSimulationDisclosure />
              
              <div className="flex flex-col gap-1">
                <SheetTitle className="text-2xl font-black tracking-tight text-foreground">
                  Resultados de la validación del lote
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Revisa la estructura detectada, la función de cada archivo y los mapeos preliminares antes de continuar con la configuración.
                </SheetDescription>
              </div>

              <NormalizationStatusSummary model={model} />
              
              <div className="mt-2">
                <NormalizationFileList model={model} />
              </div>

              <NormalizationRelationsSummary model={model} />
              
              <NormalizationMappingPreview model={model} />
              
              <NormalizationIssuesSummary model={model} />
            </div>
          </ScrollArea>
        </div>

        {/* Footer spanning 100% of the drawer width, running side-to-side */}
        <SheetFooter className="px-6 py-4 border-t bg-background shrink-0 flex flex-row items-center justify-between sm:justify-between m-0 rounded-none z-20 w-full">
          <div className="text-sm text-muted-foreground font-medium">
            {model.canContinueToConfiguration 
              ? 'El lote no presenta bloqueos y está listo para continuar.' 
              : 'Corrige los bloqueos indicados para poder continuar.'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancelImportFlow}>Volver</Button>
            <Button 
              variant="default" 
              onClick={onContinueToConfiguration} 
              disabled={!model.canContinueToConfiguration}
            >
              Continuar a configuración
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
