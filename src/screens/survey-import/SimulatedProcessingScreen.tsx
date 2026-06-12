import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  SimulationPlan,
  SimulationState,
} from '@/lib/survey-import/simulation/simulationTypes';
import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { SimulationDisclosure } from '@/components/survey-import/SimulationDisclosure';
import { SimulatedProcessingPanel } from '@/components/survey-import/SimulatedProcessingPanel';
import { SimulatedProcessingFileList } from '@/components/survey-import/SimulatedProcessingFileList';
import { SimulatedProcessingTray } from '@/components/survey-import/SimulatedProcessingTray';
import { Button } from '@/components/ui/button';
import { AILoader } from '@/components/ai-interaction/AILoader';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';
import { Minimize2 } from 'lucide-react';

export interface SimulatedProcessingScreenProps {
  plan: SimulationPlan;
  state: SimulationState;
  onCancelImportFlow: () => void;
  onReturnToFiles: () => void;
  onCompleted?: () => void;
}

export function SimulatedProcessingScreen({
  plan,
  state,
  onCancelImportFlow,
  onReturnToFiles,
  onCompleted,
}: SimulatedProcessingScreenProps) {
  const [viewMode, setViewMode] = useState<'full' | 'tray-collapsed' | 'tray-expanded'>('full');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasNavigated = useRef(false);

  // Auto-collapse stepper after 5 seconds
  useEffect(() => {
    collapseTimerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 5000);
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const handleToggleCollapse = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsCollapsed(prev => !prev);
  }, []);

  const handleMouseEnterSidebar = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);


  const viewModeRef = useRef(viewMode);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    // Only auto-transition if we are in full view at the exact moment of completion.
    // We intentionally omit `viewMode` from dependencies so that restoring to full view
    // later does not trigger an unexpected automatic navigation.
    if (state.status === 'completed' && !hasNavigated.current) {
      if (viewModeRef.current === 'full') {
        hasNavigated.current = true;
        onCompleted?.();
      }
    }
  }, [state.status, onCompleted]);
  // Función pura para derivar el texto de la live region
  const getLiveRegionText = () => {
    switch (state.status) {
      case 'queued':
        return 'Simulación en cola.';
      case 'running': {
        const activePhaseDef = plan.phases.find(
          (p) => p.id === state.activePhase
        );
        return activePhaseDef
          ? `Fase activa: ${activePhaseDef.label}`
          : 'Simulación en curso.';
      }
      case 'completed':
        return 'Simulación completada.';
      case 'cancelled':
        return 'Simulación cancelada.';
      case 'failed':
        return 'Fallo simulado.';
      default:
        return '';
    }
  };

  const isTerminal =
    state.status === 'completed' ||
    state.status === 'cancelled' ||
    state.status === 'failed';

  return (
    <>
      <ImportWizardShell
        header={<ImportWizardHeader />}
        steps={
          <ImportWizardSteps 
            isCollapsed={isCollapsed} 
            onToggleCollapse={handleToggleCollapse}
            activeStepId="processing"
          />
        }
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onMouseEnterSidebar={handleMouseEnterSidebar}
        mainContent={
          <div className="flex flex-col gap-6">
            <SimulationDisclosure />

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {getLiveRegionText()}
            </div>

            <AILoader
              variant="card"
              status={isTerminal ? (state.status === 'failed' ? 'error' : 'complete') : 'thinking'}
              label="Analizando el lote…"
              description="Estamos simulando la revisión de la estructura de los archivos para preparar la vista previa de normalización."
              progress={plan.phases.length > 0 ? (state.completedPhaseIds.length / plan.phases.length) * 100 : 0}
            />

            <div className="flex flex-col gap-6">
              <SimulatedProcessingPanel
                status={state.status}
                phases={plan.phases}
                activePhase={state.activePhase}
                completedPhaseIds={state.completedPhaseIds}
                files={state.files}
              />
              <SimulatedProcessingFileList
                files={state.files}
                phases={plan.phases}
              />
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row justify-between items-center">
              {!isTerminal && (
                <Button variant="outline" onClick={onCancelImportFlow}>
                  Cancelar importación
                </Button>
              )}
              {!isTerminal && (
                <Button variant="secondary" onClick={() => setViewMode('tray-collapsed')} className="gap-2">
                  <Minimize2 className="h-4 w-4" />
                  Minimizar análisis
                </Button>
              )}
            </div>
          </div>
        }
        summary={null}
        footer={
          <ImportWizardFooter
            disableBack={false}
            onBack={onReturnToFiles}
            continueDisabled={!isTerminal}
            onContinue={onCompleted}
            continueLabel="Ver vista previa"
            helperText={isTerminal ? "Vista previa preparada" : "Análisis simulado en curso"}
          />
        }
      />
      <SimulatedProcessingTray
        state={state}
        plan={plan}
        viewMode={viewMode}
        onExpand={() => setViewMode('tray-expanded')}
        onCollapse={() => setViewMode('tray-collapsed')}
        onRestoreFullView={() => setViewMode('full')}
        onPreviewReady={() => onCompleted?.()}
      />
    </>
  );
}
