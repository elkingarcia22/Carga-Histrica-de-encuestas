import type { SurveyFileAnalysisContract } from '../survey-file-analysis/types';
import type { SurveyGroup } from './surveyGroupingPolicy';

export interface ConfidenceDecision {
  type: "actionable_decision";
  title: string;
  content: string;
  nextActions: { id: string; label: string; actionType: string; }[];
}

export function getConfidenceExplanation(
  contract: SurveyFileAnalysisContract,
  selectedGroup?: SurveyGroup,
  allFiles?: File[]
): ConfidenceDecision | string | null {
  if (!contract) return null;

  const hasManyColumns = (contract.columns?.length || 0) > 20;
  const zeroQuestions = (contract.questions?.length || 0) === 0;
  const zeroDemographics = (contract.demographics?.length || 0) === 0;

  if (hasManyColumns && zeroQuestions && zeroDemographics) {
    if (selectedGroup && allFiles) {
      // The user already selected the group, we shouldn't prompt them again for group structure confirmation.
      // Confirmations are integrated as bullet points in the analysis chat mapper.
      return null;
    }

    return "No pude clasificar preguntas o demográficos con suficiente confianza.\nSe detectaron múltiples columnas, pero necesito confirmar cuáles corresponden a preguntas, metadatos, segmentos o resultados agregados.\n\nSeñales detectadas:\n🔍 Posibles columnas de resultados numéricos\n📋 Posibles metadatos de usuario\n❓ Posibles textos de preguntas no estandarizadas";
  }

  return null;
}
