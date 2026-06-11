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
import { SimulatedProcessingSummary } from '@/components/survey-import/SimulatedProcessingSummary';
import { Button } from '@/components/ui/button';

export interface SimulatedProcessingScreenProps {
  plan: SimulationPlan;
  state: SimulationState;
  onCancelSimulation: () => void;
  onCancelImportFlow: () => void;
  onReturnToFiles: () => void;
}

export function SimulatedProcessingScreen({
  plan,
  state,
  onCancelSimulation,
  onCancelImportFlow,
  onReturnToFiles,
}: SimulatedProcessingScreenProps) {
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
    <ImportWizardShell
      header={<ImportWizardHeader />}
      steps={<ImportWizardSteps />}
      mainContent={
        <div className="flex flex-col gap-6">
          <SimulationDisclosure />

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {getLiveRegionText()}
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-black tracking-tight text-foreground">
              Procesando archivos seleccionados
            </h2>
            <p className="text-sm text-muted-foreground">
              Revisa el progreso de esta simulación antes de continuar con la configuración.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <SimulatedProcessingPanel
              status={state.status}
              phases={plan.phases}
              activePhase={state.activePhase}
              completedPhaseIds={state.completedPhaseIds}
            />
            <SimulatedProcessingFileList
              files={state.files}
              phases={plan.phases}
            />
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            {isTerminal ? (
              <>
                <Button variant="default" onClick={onReturnToFiles}>
                  Volver a archivos
                </Button>
                <Button variant="outline" onClick={onCancelImportFlow}>
                  Cancelar importación
                </Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={onCancelSimulation}>
                  Detener simulación
                </Button>
                <Button variant="outline" onClick={onCancelImportFlow}>
                  Cancelar importación
                </Button>
              </>
            )}
          </div>
        </div>
      }
      summary={
        <SimulatedProcessingSummary
          status={state.status}
          files={state.files}
          result={state.result}
        />
      }
      footer={null}
    />
  );
}
