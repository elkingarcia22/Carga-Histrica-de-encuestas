import type { SurveyFileAnalysisContract } from '../survey-file-analysis/types';
import type { SurveyGroup } from './surveyGroupingPolicy';
import { formatAsBulletList } from './chatBulletPresentationMapper';

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
      const mainFile = selectedGroup.files.find(f => f.name.toLowerCase().includes("total")) || selectedGroup.files[0];
      const segmentFiles = selectedGroup.files.filter(f => f !== mainFile);
      const excludedFiles = allFiles.filter(f => !selectedGroup.files.includes(f));

      const bullets = [];
      bullets.push(`Procesaré el grupo **${selectedGroup.name}**.`);
      bullets.push("");

      bullets.push("Archivo principal sugerido:");
      bullets.push(formatAsBulletList([mainFile.name], '📄'));
      bullets.push("");

      if (segmentFiles.length > 0) {
        bullets.push("Archivos tratados como segmentos por gerencia/área:");
        bullets.push(formatAsBulletList(segmentFiles.map(f => f.name), '📊'));
        bullets.push("");
      }

      if (excludedFiles.length > 0) {
        bullets.push("Archivo(s) fuera del grupo actual:");
        bullets.push(formatAsBulletList(excludedFiles.map(f => f.name), '🚫'));
        bullets.push("");
      }

      bullets.push("Qué falta confirmar:");
      const issues = [];
      issues.push("No pude clasificar con suficiente confianza cuáles columnas son preguntas, demográficos, metadatos o resultados agregados.");
      issues.push("Se detectó un archivo total probable.");
      if (segmentFiles.length > 0) issues.push("Se detectaron archivos por gerencia/área.");
      if (excludedFiles.length > 0) issues.push("Se detectó un ciclo separado.");
      bullets.push(formatAsBulletList(issues, '⚠️'));
      bullets.push("");

      bullets.push("Sugerencia:");
      bullets.push(`Usar "${mainFile.name}" como base principal y tratar los archivos de gerencia como segmentos del mismo ciclo.`);

      return {
        type: "actionable_decision",
        title: `Decisión pendiente: confirmar estructura del grupo ${selectedGroup.name}`,
        content: bullets.join("\n"),
        nextActions: [
          { id: "accept_suggestion", label: "Aceptar sugerencia", actionType: "decision_action_accept_group_suggestion" },
          { id: "choose_main", label: "Elegir otro archivo principal", actionType: "decision_action_choose_main_file" },
          { id: "mark_separate", label: "Marcar gerencias como archivos separados", actionType: "decision_action_mark_separate" },
          { id: "write_override", label: "Escribir otra interpretación", actionType: "decision_action_custom_group" }
        ]
      };
    }

    return "No pude clasificar preguntas o demográficos con suficiente confianza.\nSe detectaron múltiples columnas, pero necesito confirmar cuáles corresponden a preguntas, metadatos, segmentos o resultados agregados.\n\nSeñales detectadas:\n🔍 Posibles columnas de resultados numéricos\n📋 Posibles metadatos de usuario\n❓ Posibles textos de preguntas no estandarizadas";
  }

  return null;
}
