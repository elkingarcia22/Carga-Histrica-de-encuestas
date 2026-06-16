import { useRef, useEffect } from 'react';
import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';

import {
  ConfirmationSimulationDisclosure,
  ConfirmationSurveyIdentitySummary,
  ConfirmationBatchSummary,
  ConfirmedConfigurationSummary,
  ConfirmedMappingSummary,
  IgnoredColumnsConfirmationSummary,
  DeferredIssuesConfirmationSummary,
  ExplicitConfirmationControl,
  ConfirmationReadinessSummary,
} from '@/components/survey-import/confirmation/ConfirmationComponents';

import type {
  HistoricalImportConfirmationSource,
  HistoricalImportConfirmationDraft,
  HistoricalConfirmationCompatibility,
  HistoricalImportConfirmationReadiness,
  HistoricalConfirmationStatus,
} from '@/lib/survey-import/confirmation/historicalImportConfirmationTypes';

interface Props {
  source: HistoricalImportConfirmationSource;
  draft: HistoricalImportConfirmationDraft;
  compatibility: HistoricalConfirmationCompatibility;
  readiness: HistoricalImportConfirmationReadiness;
  status: HistoricalConfirmationStatus;
  explicitConfirmationAccepted: boolean;
  canPrepareSimulatedExecution: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMouseEnterSidebar: () => void;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onExplicitConfirmationChange: (accepted: boolean) => void;
}

export function HistoricalImportConfirmationScreen({
  source,
  compatibility,
  readiness,
  status,
  explicitConfirmationAccepted,
  canPrepareSimulatedExecution,
  isCollapsed,
  onToggleCollapse,
  onMouseEnterSidebar,
  onBack,
  onCancel,
  onConfirm,
  onExplicitConfirmationChange,
}: Props) {
  const prepareIntentRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prepareIntentRef.current && status === 'confirmation-prepared') {
      feedbackRef.current?.focus();
      prepareIntentRef.current = false;
    }
  }, [status]);
  const isPrepared = status === 'confirmation-prepared';

  const mainContent = (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <ConfirmationSimulationDisclosure />

      <ConfirmationSurveyIdentitySummary source={source} />
      <ConfirmationBatchSummary source={source} />
      <ConfirmedConfigurationSummary source={source} />
      <ConfirmedMappingSummary source={source} />

      <IgnoredColumnsConfirmationSummary source={source} />
      <DeferredIssuesConfirmationSummary source={source} />

      <div className="space-y-6 pt-4 border-t border-slate-200">
        <ExplicitConfirmationControl
          value={explicitConfirmationAccepted}
          onChange={onExplicitConfirmationChange}
          disabled={isPrepared}
        />

        <ConfirmationReadinessSummary
          readiness={readiness}
          compatibility={compatibility}
          status={status}
          feedbackRef={feedbackRef}
        />
      </div>
    </div>
  );

  return (
    <ImportWizardShell
      header={<ImportWizardHeader onCancel={onCancel} />}
      steps={
        <ImportWizardSteps
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          activeStepId="confirmation"
        />
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onMouseEnterSidebar={onMouseEnterSidebar}
      mainContent={mainContent}
      summary={null}
      footer={
        <ImportWizardFooter
          disableBack={isPrepared}
          onBack={onBack}
          continueDisabled={!canPrepareSimulatedExecution}
          onContinue={() => {
            prepareIntentRef.current = true;
            onConfirm();
          }}
          continueLabel="Confirmar importación"
          helperText={
            status === 'confirmation-required'
              ? 'Acepta la confirmación explícita para continuar.'
              : isPrepared
                ? 'Confirmación lista.'
                : compatibility !== 'current'
                  ? 'Resuelve los problemas de compatibilidad para continuar.'
                  : status === 'blocked'
                    ? 'Hay problemas bloqueantes en el mapeo.'
                    : undefined
          }
        />
      }
    />
  );
}
