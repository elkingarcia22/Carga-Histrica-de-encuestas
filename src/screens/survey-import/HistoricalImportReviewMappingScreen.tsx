import { useState, useRef } from 'react';
import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';

import { MappingSimulationDisclosure } from '@/components/survey-import/review-mapping/MappingSimulationDisclosure';
import { InheritedConfigurationSummary } from '@/components/survey-import/review-mapping/InheritedConfigurationSummary';
import { MappingReadinessOverview } from '@/components/survey-import/review-mapping/MappingReadinessOverview';
import { PriorityMappingIssues } from '@/components/survey-import/review-mapping/PriorityMappingIssues';
import { MappingDomainStatusGrid } from '@/components/survey-import/review-mapping/MappingDomainStatusGrid';
import { IgnoredColumnsSummary } from '@/components/survey-import/review-mapping/IgnoredColumnsSummary';
import { SourceRelationsSummary } from '@/components/survey-import/review-mapping/SourceRelationsSummary';
import { MappingReadinessSummary } from '@/components/survey-import/review-mapping/MappingReadinessSummary';
import { MappingIssueResolutionSheet } from '@/components/survey-import/review-mapping/resolution/MappingIssueResolutionSheet';

import type {
  HistoricalImportMappingDraft,
  HistoricalImportReviewMappingSource,
  HistoricalConfigurationCompatibilityCheck,
  HistoricalImportMappingIssue,
  HistoricalMappingIssueResolutionInput,
  HistoricalMappingIssueResolutionResult,
  HistoricalMappingScalePolarity,
  HistoricalMappingResolutionOrigin
} from '@/lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

interface Props {
  source: HistoricalImportReviewMappingSource;
  draft: HistoricalImportMappingDraft;
  compatibility: HistoricalConfigurationCompatibilityCheck;
  priorityIssues: HistoricalImportMappingIssue[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMouseEnterSidebar: () => void;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
  onResolveIssue: (input: HistoricalMappingIssueResolutionInput) => HistoricalMappingIssueResolutionResult;
}

export function HistoricalImportReviewMappingScreen({
  source,
  draft,
  compatibility,
  priorityIssues,
  isCollapsed,
  onToggleCollapse,
  onMouseEnterSidebar,
  onBack,
  onCancel,
  onContinue,
  onResolveIssue
}: Props) {
  const isCompatible = compatibility.status === 'current';

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedPolarity, setSelectedPolarity] = useState<HistoricalMappingScalePolarity | undefined>();
  const [resolutionOrigin, setResolutionOrigin] = useState<HistoricalMappingResolutionOrigin | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);

  const [accessibleMessage, setAccessibleMessage] = useState<string>('');
  const overviewSummaryRef = useRef<HTMLDivElement>(null);

  const selectedIssue = selectedIssueId ? draft.issues.find(i => i.id === selectedIssueId) : undefined;
  const selectedEntity = selectedIssue?.entityId ? draft.entities.find(e => e.id === selectedIssue.entityId) : undefined;

  const handleReviewIssue = (issueId: string) => {
    setSelectedIssueId(issueId);

    // Explicit editor initialization
    const issue = draft.issues.find(i => i.id === issueId);
    const entity = draft.entities.find(e => e.id === issue?.entityId);
    const metadata = entity?.scaleMetadata;
    setSelectedPolarity(metadata?.currentPolarity === 'unresolved' ? undefined : metadata?.currentPolarity);
    setResolutionOrigin(metadata?.resolutionOrigin);
    setLocalError(null);
  };

  const handleResolutionCancel = () => {
    setSelectedIssueId(null);
    setSelectedPolarity(undefined);
    setResolutionOrigin(undefined);
    setLocalError(null);
  };

  const handleResolutionConfirm = (input: HistoricalMappingIssueResolutionInput) => {
    const result = onResolveIssue(input);
    if (result.ok) {
      setSelectedIssueId(null);
      setSelectedPolarity(undefined);
      setResolutionOrigin(undefined);
      setLocalError(null);
      setAccessibleMessage('Incidencia resuelta. El mapeo ha sido actualizado.');

      // Return focus to stable summary element
      if (overviewSummaryRef.current) {
        overviewSummaryRef.current.focus();
      }
    } else {
      setLocalError(result.messageKey || 'Ocurrió un error al intentar resolver la incidencia.');
      const issue = draft.issues.find(i => i.id === selectedIssueId);
      const entity = draft.entities.find(e => e.id === issue?.entityId);
      const metadata = entity?.scaleMetadata;
      setSelectedPolarity(metadata?.currentPolarity === 'unresolved' ? undefined : metadata?.currentPolarity);
      setResolutionOrigin(metadata?.resolutionOrigin);
    }
    return { ok: result.ok, messageKey: !result.ok ? result.messageKey : undefined };
  };

  const handleSelectionChange = (polarity: HistoricalMappingScalePolarity, origin: HistoricalMappingResolutionOrigin) => {
    setSelectedPolarity(polarity);
    setResolutionOrigin(origin);
  };

  const mainContent = (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {accessibleMessage}
      </div>

      <MappingSimulationDisclosure />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Configuración origen</h3>
        <InheritedConfigurationSummary source={source} />
      </div>

      <div
        ref={overviewSummaryRef}
        tabIndex={-1}
        className="outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
      >
        <MappingReadinessOverview
          status={draft.globalStatus}
          readiness={draft.readiness}
          compatibility={compatibility}
        />
      </div>

      {isCompatible && (
        <>
          <div className="space-y-3">
            <PriorityMappingIssues issues={priorityIssues} onReviewIssue={handleReviewIssue} />
          </div>

          <MappingDomainStatusGrid summaries={draft.domainSummaries} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <IgnoredColumnsSummary columns={draft.ignoredColumns} />
            </div>
            <div className="space-y-3">
              <SourceRelationsSummary source={source} />
            </div>
          </div>
        </>
      )}

      <div className="space-y-3 pt-4 border-t border-slate-200">
        <MappingReadinessSummary
          readiness={draft.readiness}
          compatibility={compatibility}
        />
      </div>

      {selectedIssue && selectedEntity && (
        <MappingIssueResolutionSheet
          open={true}
          issue={selectedIssue}
          entity={selectedEntity}
          compatibility={compatibility}
          selectedPolarity={selectedPolarity}
          resolutionOrigin={resolutionOrigin}
          localError={localError}
          onSelectionChange={handleSelectionChange}
          onOpenChange={(open) => {
            if (!open) handleResolutionCancel();
          }}
          onCancel={handleResolutionCancel}
          onConfirm={handleResolutionConfirm}
        />
      )}
    </div>
  );

  return (
    <ImportWizardShell
      header={<ImportWizardHeader onCancel={onCancel} />}
      steps={
        <ImportWizardSteps
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          activeStepId="review"
        />
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onMouseEnterSidebar={onMouseEnterSidebar}
      mainContent={mainContent}
      summary={null}
      footer={
        <ImportWizardFooter
          disableBack={false}
          onBack={onBack}
          continueDisabled={!isCompatible || !draft.canContinueToConfirmation}
          onContinue={() => {
            if (!draft.canContinueToConfirmation) return;
            onContinue();
          }}
          continueLabel="Continuar a confirmar importación"
          helperText={
            !isCompatible
              ? 'Configuración modificada. Regresa a Configuración para reiniciar el mapeo.'
              : draft.canContinueToConfirmation
                ? 'El borrador de mapeo está listo.'
                : 'Resuelve las incidencias antes de continuar.'
          }
        />
      }
    />
  );
}
