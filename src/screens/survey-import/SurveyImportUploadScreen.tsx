import { useRef, useState, useEffect, useCallback } from 'react';
import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { InitialUploadPanel } from '@/components/survey-import/InitialUploadPanel';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';
import { UploadLiveRegion } from '@/components/survey-import/UploadLiveRegion';
import { UploadBatchAlert } from '@/components/survey-import/UploadBatchAlert';


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
import { NormalizationPreviewScreen } from '@/screens/survey-import/NormalizationPreviewScreen';
import { HistoricalImportConfigurationScreen } from '@/screens/survey-import/HistoricalImportConfigurationScreen';
import { useHistoricalImportConfigurationState } from '@/hooks/survey-import/useHistoricalImportConfigurationState';
import { HistoricalImportReviewMappingScreen } from '@/screens/survey-import/HistoricalImportReviewMappingScreen';
import { useHistoricalImportReviewMappingState } from '@/hooks/survey-import/useHistoricalImportReviewMappingState';
import { buildMappingSourceFromConfiguration } from '@/lib/survey-import/review-mapping/historicalImportReviewMappingAdapter';
import { toast } from 'sonner';

import { HistoricalImportConfirmationScreen } from '@/screens/survey-import/HistoricalImportConfirmationScreen';
import { useHistoricalImportConfirmationState } from '@/hooks/survey-import/useHistoricalImportConfirmationState';
import { buildConfirmationSourceFromMapping } from '@/lib/survey-import/confirmation/historicalImportConfirmationAdapter';

type SurveyImportView = 'upload-idle' | 'files-selected' | 'simulated-processing' | 'normalization-preview' | 'historical-configuration' | 'review-mapping' | 'confirmation';

function SimulatedProcessingController({
  plan,
  onReturnToFiles,
  onCancelImportFlow,
  onCompleted
}: {
  plan: SimulationPlan;
  onReturnToFiles: () => void;
  onCancelImportFlow: () => void;
  onCompleted: () => void;
}) {
  const simulatedState = useSimulatedProcessingState(plan);
  const { start } = simulatedState;

  useEffect(() => {
    start();
  }, [start]);

  return (
    <SimulatedProcessingScreen
      key={plan.planId}
      plan={plan}
      state={simulatedState.state}
      onReturnToFiles={() => {
        simulatedState.reset?.();
        onReturnToFiles();
      }}
      onCancelImportFlow={() => {
        simulatedState.cancelSimulation();
        onCancelImportFlow();
      }}
      onCompleted={onCompleted}
    />
  );
}

export function SurveyImportUploadScreen() {

  const binaryMap = useRef<Map<string, File>>(new Map());
  const { state, addFiles, removeFile, setGlobalMessage, reset } = useLocalUploadState();
  const [activePlan, setActivePlan] = useState<SimulationPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showReviewMapping, setShowReviewMapping] = useState(false);

  const configurationState = useHistoricalImportConfigurationState('ready-for-mapping');
  const mappingState = useHistoricalImportReviewMappingState();
  const confirmationState = useHistoricalImportConfirmationState();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  let currentView: SurveyImportView = state.view === 'idle' ? 'upload-idle' : state.view;
  if (showConfirmation) {
    currentView = 'confirmation';
  } else if (showReviewMapping) {
    currentView = 'review-mapping';
  } else if (showConfiguration) {
    currentView = 'historical-configuration';
  } else if (showPreview) {
    currentView = 'normalization-preview';
  } else if (activePlan) {
    currentView = 'simulated-processing';
  }

  const handleAddFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Capacity check (Atomic rejection)
    const currentCount = state.files.length;
    if (currentCount + selectedFiles.length > uploadLimits.maxFilesAbsolute) {
      setGlobalMessage(`Puedes agregar hasta ${uploadLimits.maxFilesAbsolute} archivos por lote.`);
      // Update accessible message for atomic rejection
      const msg = `Se intentaron agregar ${selectedFiles.length} archivos, pero se superaría el límite de ${uploadLimits.maxFilesAbsolute}. La operación fue rechazada.`;
      addFiles([], msg); // Send empty array just to trigger accessible message, or just use a hook if available
      return;
    }

    setGlobalMessage(null);

    const metadataArray: LocalFileMetadata[] = [];

    selectedFiles.forEach((file, index) => {
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

    const msg = `Se agregaron ${metadataArray.length} archivos. El lote contiene ${currentCount + metadataArray.length} archivos en total.`;

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
    setShowPreview(false);
  };

  const handleCancelImportFlow = () => {
    setActivePlan(null);
    setShowPreview(false);
    setShowConfiguration(false);
    setShowReviewMapping(false);
    setShowConfirmation(false);
    binaryMap.current.clear();
    configurationState.reset();
    mappingState.reset();
    confirmationState.reset();
    reset('Importación cancelada. Regreso a la pantalla inicial.');
  };

  const handleSimulationCompleted = () => {
    setShowPreview(true);
  };

  if (currentView === 'historical-configuration') {
    return (
      <HistoricalImportConfigurationScreen
        source={configurationState.source}
        draft={configurationState.draft}
        issues={configurationState.source.inheritedIssues}
        status={configurationState.draft.draftStatus}
        canContinue={configurationState.draft.canContinueToMapping}

        onUpdateName={configurationState.updateName}
        onUpdateType={configurationState.updateType}
        onConfirmType={configurationState.confirmType}
        onUpdateYear={configurationState.updateYear}
        onUpdatePrivacy={configurationState.updatePrivacy}
        onConfirmIdentifiedMode={configurationState.confirmIdentifiedMode}
        onUpdateThreshold={configurationState.updateThreshold}
        onUpdateVisibility={configurationState.updateVisibility}

        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onMouseEnterSidebar={handleMouseEnterSidebar}
        onCancel={handleCancelImportFlow}
        onBack={() => setShowConfiguration(false)}
        onContinue={() => {
          if (!configurationState.draft.canContinueToMapping) return;
          const boundary = configurationState.buildBoundary();
          if (boundary) {
            const mappingSource = buildMappingSourceFromConfiguration(boundary, configurationState.source);
            mappingState.initialize(mappingSource);
            setShowReviewMapping(true);
            setShowConfiguration(false);
          }
        }}
      />
    );
  }

  if (currentView === 'review-mapping') {
    return (
      <HistoricalImportReviewMappingScreen
        source={mappingState.source!}
        draft={mappingState.draft!}
        compatibility={mappingState.compatibility!}
        priorityIssues={mappingState.priorityIssues}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onMouseEnterSidebar={handleMouseEnterSidebar}
        onBack={() => {
          setShowReviewMapping(false);
          setShowConfiguration(true);
        }}
        onCancel={handleCancelImportFlow}
        onContinue={() => {
          if (!mappingState.draft?.canContinueToConfirmation) return;
          const finalBoundary = mappingState.buildBoundary();
          if (finalBoundary) {
            const confirmationSource = buildConfirmationSourceFromMapping(finalBoundary);
            confirmationState.initialize(confirmationSource);
            setShowConfirmation(true);
            setShowReviewMapping(false);
          }
        }}
      />
    );
  }

  if (currentView === 'confirmation') {
    return (
      <HistoricalImportConfirmationScreen
        source={confirmationState.source!}
        draft={confirmationState.draft!}
        compatibility={confirmationState.compatibility!}
        readiness={confirmationState.readiness!}
        status={confirmationState.status!}
        explicitConfirmationAccepted={confirmationState.explicitConfirmationAccepted}
        canPrepareSimulatedExecution={confirmationState.canPrepareSimulatedExecution}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onMouseEnterSidebar={handleMouseEnterSidebar}
        onBack={() => {
          setShowConfirmation(false);
          setShowReviewMapping(true);
        }}
        onCancel={handleCancelImportFlow}
        onConfirm={() => {
          if (confirmationState.canPrepareSimulatedExecution) {
            confirmationState.prepare();
            toast.success('La confirmación quedó preparada.', {
              description: 'La ejecución de la importación todavía no está conectada en este prototipo.',
            });
          }
        }}
        onExplicitConfirmationChange={confirmationState.setExplicitConfirmationAccepted}
      />
    );
  }

  if (currentView === 'normalization-preview') {
    return (
      <NormalizationPreviewScreen
        onCancelImportFlow={handleCancelImportFlow}
        onContinueToConfiguration={() => setShowConfiguration(true)}
      />
    );
  }

  if (currentView === 'simulated-processing' && activePlan) {
    return (
      <SimulatedProcessingController
        plan={activePlan}
        onReturnToFiles={handleReturnToFiles}
        onCancelImportFlow={handleCancelImportFlow}
        onCompleted={handleSimulationCompleted}
      />
    );
  }

  // Selectors for UI
  const filesCount = state.files.length;

  const isEmpty = filesCount === 0;


  let helperText: string | undefined = undefined;
  if (currentView === 'files-selected') {
    if (canStartSimulation) {
      helperText = 'El lote está listo para iniciar el análisis simulado.';
    } else if (state.hasBatchSizeError) {
      helperText = `El lote excede el límite de ${uploadLimits.labels.maxSizePerBatch}.`;
    } else if (hasBlockingFiles) {
      helperText = 'Resuelve las advertencias o errores en los archivos para continuar.';
    }
  }

  return (
    <>
      <UploadLiveRegion message={state.accessibleMessage} />
      <ImportWizardShell
        header={<ImportWizardHeader onCancel={handleCancelImportFlow} />}
        steps={
          <ImportWizardSteps
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            activeStepId="upload"
          />
        }
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onMouseEnterSidebar={handleMouseEnterSidebar}
        mainContent={
          <div className="space-y-4">
            {state.hasLargeBatchWarning && <UploadBatchAlert isVisible={true} variant="warning" />}
            <InitialUploadPanel
              onAddFiles={handleAddFiles}
              files={state.files}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        }
        summary={null}
        footer={
          <ImportWizardFooter
            disableBack={isEmpty}
            onBack={handleBack}
            continueDisabled={!canStartSimulation}
            onContinue={handleContinue}
            continueLabel="Continuar"
            helperText={helperText}
          />
        }
      />
    </>
  );
}
