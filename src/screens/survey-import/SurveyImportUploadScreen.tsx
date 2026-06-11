import { useRef, useState, useEffect } from 'react';
import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { InitialUploadPanel } from '@/components/survey-import/InitialUploadPanel';
import { SelectedFilesPanel } from '@/components/survey-import/SelectedFilesPanel';
import { ImportSummaryCard } from '@/components/survey-import/ImportSummaryCard';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';
import { UploadLiveRegion } from '@/components/survey-import/UploadLiveRegion';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { formatFileSize } from '@/components/upload/uploadUtils';
import { uploadLimits } from '@/config/survey-import/uploadLimits';
import {
  useLocalUploadState,
  type LocalFileMetadata,
  normalizeExtension,
  getNormalizedNameKey,
  validateSingleFile
} from '@/hooks/survey-import/useLocalUploadState';
import { SimulatedProcessingScreen } from '@/screens/survey-import/SimulatedProcessingScreen';
import { useSimulatedProcessingState } from '@/hooks/survey-import/useSimulatedProcessingState';
import { createSimulatedImportPlan, type NonEmptySimulationInputFiles } from '@/lib/survey-import/simulation/simulatedImportAdapter';
import type { SimulationPlan } from '@/lib/survey-import/simulation/simulationTypes';

type SurveyImportView = 'upload-idle' | 'files-selected' | 'simulated-processing';

function SimulatedProcessingController({ 
  plan, 
  onReturnToFiles, 
  onCancelImportFlow 
}: { 
  plan: SimulationPlan; 
  onReturnToFiles: () => void;
  onCancelImportFlow: () => void;
}) {
  const simulatedState = useSimulatedProcessingState(plan);
  const { start } = simulatedState;

  useEffect(() => {
    start();
  }, [start]);

  return (
    <SimulatedProcessingScreen
      plan={plan}
      state={simulatedState.state}
      onCancelSimulation={() => simulatedState.cancelSimulation()}
      onReturnToFiles={() => {
        simulatedState.reset?.();
        onReturnToFiles();
      }}
      onCancelImportFlow={() => {
        simulatedState.cancelSimulation();
        onCancelImportFlow();
      }}
    />
  );
}

export function SurveyImportUploadScreen() {
  const { summary } = importWizardContent;
  const binaryMap = useRef<Map<string, File>>(new Map());
  const { state, addFiles, removeFile, setGlobalMessage, reset } = useLocalUploadState();
  const [activePlan, setActivePlan] = useState<SimulationPlan | null>(null);

  const currentView: SurveyImportView = activePlan ? 'simulated-processing' : (state.view === 'idle' ? 'upload-idle' : state.view);

  const handleAddFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Capacity check
    const currentCount = state.files.length;
    const capacity = uploadLimits.maxFiles - currentCount;
    if (capacity <= 0) {
      setGlobalMessage(`Has alcanzado el límite máximo de ${uploadLimits.maxFiles} archivos.`);
      return;
    }

    const filesToProcess = selectedFiles.slice(0, capacity);
    const overflowCount = selectedFiles.length - filesToProcess.length;
    
    if (overflowCount > 0) {
      setGlobalMessage(`Se omitieron ${overflowCount} archivo(s) por exceder el límite de ${uploadLimits.maxFiles}.`);
    } else {
      setGlobalMessage(null);
    }

    const metadataArray: LocalFileMetadata[] = [];

    filesToProcess.forEach((file, index) => {
      // Create ephemeral ID locally
      const id = crypto.randomUUID();
      const displayName = file.name;
      const extension = normalizeExtension(displayName);
      const reportedMimeType = file.type;
      const sizeBytes = file.size;
      const lastModified = file.lastModified;
      const normalizedNameKey = getNormalizedNameKey(displayName);

      const validation = validateSingleFile(displayName, extension, reportedMimeType, sizeBytes);

      if (validation.retainBinary) {
        binaryMap.current.set(id, file);
      }

      metadataArray.push({
        id,
        displayName,
        normalizedNameKey,
        extension,
        reportedMimeType,
        sizeBytes,
        lastModified,
        status: validation.status,
        issues: validation.issues,
        order: state.addedCountTracker + index,
      });
    });

    const msg = overflowCount > 0 
      ? `Se agregaron ${metadataArray.length} archivos. Se omitieron ${overflowCount} por límite.` 
      : `Se agregaron ${metadataArray.length} archivos.`;

    addFiles(metadataArray, msg);
  };

  const handleRemoveFile = (id: string) => {
    binaryMap.current.delete(id);
    const fileToRemove = state.files.find(f => f.id === id);
    const msg = fileToRemove ? `Archivo ${fileToRemove.displayName} removido.` : 'Archivo removido.';
    removeFile(id, msg);
  };

  const handleBack = () => {
    binaryMap.current.clear();
    reset('Se han descartado todos los archivos. Regreso a la pantalla inicial.');
  };

  const hasBlockingFiles = state.files.some(f => 
    f.status === 'invalid' || 
    f.status === 'too-large' || 
    f.status === 'unsupported' || 
    f.status === 'duplicate'
  );
  
  const acceptedFiles = state.files.filter(f => f.status === 'valid' || f.status === 'warning');

  const canStartSimulation = 
    currentView === 'files-selected' &&
    state.files.length > 0 &&
    !hasBlockingFiles &&
    !state.hasBatchSizeError &&
    !activePlan;

  const handleContinue = () => {
    if (!canStartSimulation) return;

    const hasCompleteBinaryBoundary = () => {
      return acceptedFiles.every(f => binaryMap.current.has(f.id));
    };

    if (!hasCompleteBinaryBoundary()) return;

    const firstFile = acceptedFiles[0];
    if (!firstFile) return;

    const inputTuple: NonEmptySimulationInputFiles = [
      { fileId: firstFile.id, displayName: firstFile.displayName },
      ...acceptedFiles.slice(1).map(f => ({ fileId: f.id, displayName: f.displayName }))
    ];

    const plan = createSimulatedImportPlan(inputTuple);
    setActivePlan(plan);
  };

  const handleReturnToFiles = () => {
    setActivePlan(null);
  };

  const handleCancelImportFlow = () => {
    setActivePlan(null);
    binaryMap.current.clear();
    reset('Importación cancelada. Regreso a la pantalla inicial.');
  };

  if (currentView === 'simulated-processing' && activePlan) {
    return (
      <SimulatedProcessingController
        plan={activePlan}
        onReturnToFiles={handleReturnToFiles}
        onCancelImportFlow={handleCancelImportFlow}
      />
    );
  }

  // Selectors for UI
  const filesCount = state.files.length;
  const validCount = state.files.filter(f => f.status === 'valid' || f.status === 'warning').length;
  const blockedCount = state.files.filter(f => ['invalid', 'too-large', 'unsupported', 'duplicate'].includes(f.status)).length;
  const isEmpty = filesCount === 0;

  const modeLabel = summary.defaultValues.mode;
  const surveyTypeLabel = summary.defaultValues.surveyType;
  const privacyLabel = summary.defaultValues.privacy;

  return (
    <>
      <UploadLiveRegion message={state.accessibleMessage} />
      <ImportWizardShell
        header={<ImportWizardHeader />}
        steps={<ImportWizardSteps />}
        mainContent={
          currentView === 'upload-idle' ? (
            <InitialUploadPanel onAddFiles={handleAddFiles} />
          ) : (
            <SelectedFilesPanel
              files={state.files}
              hasBatchSizeError={state.hasBatchSizeError}
              globalMessage={state.globalMessage}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
            />
          )
        }
        summary={
          <ImportSummaryCard
            filesCount={filesCount}
            totalSizeLabel={formatFileSize(state.totalSizeBytes)}
            validCount={isEmpty ? undefined : validCount}
            blockedCount={isEmpty ? undefined : blockedCount}
            modeLabel={modeLabel}
            surveyTypeLabel={surveyTypeLabel}
            privacyLabel={privacyLabel}
            isEmpty={isEmpty}
          />
        }
        footer={
          <ImportWizardFooter 
            disableBack={isEmpty} 
            onBack={handleBack}
            continueDisabled={!canStartSimulation}
            onContinue={handleContinue}
            continueLabel="Continuar"
          />
        }
      />
    </>
  );
}
