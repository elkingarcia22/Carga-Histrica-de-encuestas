import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';

import { HistoricalConfigurationDisclosure } from '@/components/survey-import/configuration/HistoricalConfigurationDisclosure';
import { InheritedNormalizationSummary } from '@/components/survey-import/configuration/InheritedNormalizationSummary';
import { SurveyIdentitySection } from '@/components/survey-import/configuration/SurveyIdentitySection';
import { HistoricalPeriodSection } from '@/components/survey-import/configuration/HistoricalPeriodSection';
import { PrivacyAndThresholdSection } from '@/components/survey-import/configuration/PrivacyAndThresholdSection';
import { VisibilitySelectionSection } from '@/components/survey-import/configuration/VisibilitySelectionSection';
import { InheritedConfigurationIssues } from '@/components/survey-import/configuration/InheritedConfigurationIssues';
import { ConfigurationReadinessSummary } from '@/components/survey-import/configuration/ConfigurationReadinessSummary';
import type {
  HistoricalImportConfigurationDraft,
  HistoricalImportConfigurationSource,
  HistoricalPrivacyMode,
  HistoricalVisibilityMode,
  HistoricalConfigurationIssue,
  HistoricalConfigurationDraftStatus
} from '@/lib/survey-import/configuration/historicalImportConfigurationTypes';

interface Props {
  source: HistoricalImportConfigurationSource;
  draft: HistoricalImportConfigurationDraft;
  issues: HistoricalConfigurationIssue[];
  status: HistoricalConfigurationDraftStatus;
  canContinue: boolean;

  onUpdateName: (name: string) => void;
  onUpdateType: (type: string) => void;
  onConfirmType: () => void;
  onUpdateYear: (year: number | undefined) => void;
  onUpdatePrivacy: (privacy: HistoricalPrivacyMode) => void;
  onConfirmIdentifiedMode: () => void;
  onUpdateThreshold: (threshold: number | undefined) => void;
  onUpdateVisibility: (visibility: HistoricalVisibilityMode) => void;

  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMouseEnterSidebar: () => void;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function HistoricalImportConfigurationScreen({
  source,
  draft,
  issues,
  status,
  canContinue,
  onUpdateName,
  onUpdateType,
  onConfirmType,
  onUpdateYear,
  onUpdatePrivacy,
  onConfirmIdentifiedMode,
  onUpdateThreshold,
  onUpdateVisibility,
  isCollapsed,
  onToggleCollapse,
  onMouseEnterSidebar,
  onBack,
  onCancel,
  onContinue
}: Props) {
  const mainContent = (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <HistoricalConfigurationDisclosure />

      <InheritedConfigurationIssues
        issues={issues}
        onReturnToPreview={onBack}
      />

      <InheritedNormalizationSummary
        fileCount={source.fileCount}
        familySummary={source.familySummary}
        roleSummary={source.roleSummary}
      />

      <SurveyIdentitySection
        name={draft.surveyName}
        nameOrigin={draft.surveyNameOrigin}
        type={draft.surveyType}
        typeOrigin={draft.surveyTypeOrigin}
        typeConfirmed={draft.surveyTypeConfirmed}
        onNameChange={onUpdateName}
        onTypeChange={onUpdateType}
        onConfirmType={onConfirmType}
      />

      <HistoricalPeriodSection
        year={draft.periodYear}
        yearOrigin={draft.periodYearOrigin}
        onYearChange={onUpdateYear}
      />

      <PrivacyAndThresholdSection
        privacy={draft.privacyMode}
        identifiedModeConfirmed={draft.identifiedModeConfirmed}
        threshold={draft.minimumThreshold}
        onPrivacyChange={onUpdatePrivacy}
        onConfirmIdentified={onConfirmIdentifiedMode}
        onThresholdChange={onUpdateThreshold}
      />

      <VisibilitySelectionSection
        visibility={draft.visibilityMode}
        onVisibilityChange={onUpdateVisibility}
      />

      <ConfigurationReadinessSummary
        status={status}
        canContinue={canContinue}
      />
    </div>
  );

  return (
    <ImportWizardShell
      header={<ImportWizardHeader onCancel={onCancel} />}
      steps={
        <ImportWizardSteps
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          activeStepId="config"
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
          continueDisabled={!canContinue}
          onContinue={onContinue}
          continueLabel="Continuar a revisión y mapeo"
          helperText={canContinue ? 'Listo para continuar.' : 'Completa la configuración para continuar.'}
        />
      }
    />
  );
}
