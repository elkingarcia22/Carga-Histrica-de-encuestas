import type { SurveyFileAnalysisContract } from '../survey-file-analysis/types';

export function getConfidenceExplanation(contract: SurveyFileAnalysisContract): string | null {
  if (!contract) return null;

  const hasManyColumns = (contract.columns?.length || 0) > 20;
  const zeroQuestions = (contract.questions?.length || 0) === 0;
  const zeroDemographics = (contract.demographics?.length || 0) === 0;

  if (hasManyColumns && zeroQuestions && zeroDemographics) {
    return "No pude clasificar preguntas o demográficos con suficiente confianza.\nSe detectaron múltiples columnas, pero necesito confirmar cuáles corresponden a preguntas, metadatos, segmentos o resultados agregados.\n\nSeñales detectadas:\n🔍 Posibles columnas de resultados numéricos\n📋 Posibles metadatos de usuario\n❓ Posibles textos de preguntas no estandarizadas";
  }

  return null;
}
