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

import type {
  HistoricalImportMappingDraft,
  HistoricalImportReviewMappingSource,
  HistoricalConfigurationCompatibilityCheck,
  HistoricalImportMappingIssue
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
  onContinue
}: Props) {
  const isCompatible = compatibility.status === 'current';

  const mainContent = (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <MappingSimulationDisclosure />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Configuración origen</h3>
        <InheritedConfigurationSummary source={source} />
      </div>

      <MappingReadinessOverview
        status={draft.globalStatus}
        readiness={draft.readiness}
        compatibility={compatibility}
      />

      {isCompatible && (
        <>
          <div className="space-y-3">
            <PriorityMappingIssues issues={priorityIssues} />
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
