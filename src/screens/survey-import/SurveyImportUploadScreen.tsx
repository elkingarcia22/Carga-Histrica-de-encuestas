import { ImportWizardShell } from '@/components/survey-import/ImportWizardShell';
import { ImportWizardHeader } from '@/components/survey-import/ImportWizardHeader';
import { ImportWizardSteps } from '@/components/survey-import/ImportWizardSteps';
import { InitialUploadPanel } from '@/components/survey-import/InitialUploadPanel';
import { ImportSummaryCard } from '@/components/survey-import/ImportSummaryCard';
import { ImportWizardFooter } from '@/components/survey-import/ImportWizardFooter';
import { uploadInitialScenario } from '@/mocks/survey-import';
import { importWizardContent } from '@/config/survey-import/importWizardContent';

export function SurveyImportUploadScreen() {
  const fixture = uploadInitialScenario;
  const { summary } = importWizardContent;

  const filesCount = fixture.files.length;
  const modeLabel = fixture.data?.mode || summary.defaultValues.mode;
  const surveyTypeLabel = summary.defaultValues.surveyType;
  const privacyLabel = summary.defaultValues.privacy;
  const pendingReviewsCount = fixture.reviewProgress?.overall?.pending || 0;
  const isEmpty = filesCount === 0;

  return (
    <ImportWizardShell
      header={<ImportWizardHeader />}
      steps={<ImportWizardSteps />}
      mainContent={<InitialUploadPanel />}
      summary={
        <ImportSummaryCard
          filesCount={filesCount}
          modeLabel={modeLabel}
          surveyTypeLabel={surveyTypeLabel}
          privacyLabel={privacyLabel}
          pendingReviewsCount={pendingReviewsCount}
          isEmpty={isEmpty}
        />
      }
      footer={<ImportWizardFooter />}
    />
  );
}
