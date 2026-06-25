import type { ConversationalSurveyScope, ConversationalSurveyType, ConversationalSurveyVisibility, ConversationalGeneralConfiguration } from "./conversationalWizardTypes";

export function getGeneralConfigSummaryMessage(config: ConversationalGeneralConfiguration, scope: ConversationalSurveyScope): string {
  const associatedCount = config.associatedFileIds.length;
  const associatedText = scope === "qs_clima_multicycle_2024_2025" ? "2024 + 2025" : `${associatedCount} cortes por gerencia`;
  
  return `Configuración general confirmada

- Encuesta: ${config.surveyName}
- Tipo: ${config.surveyType.charAt(0).toUpperCase() + config.surveyType.slice(1)}
- Visibilidad: ${config.visibility === 'anonymous' ? 'Anónima' : config.visibility === 'private' ? 'Privada' : 'Pública'}
- Umbral de confidencialidad: ${config.confidentialityThreshold} respuestas por grupo
- Archivo principal: ${config.mainFileId}
- Archivos asociados: ${associatedText}

Ahora revisaré el match detectado de la estructura.`;
}

export function validateConfidentialityThreshold(input: string): { valid: boolean, value?: number, error?: string } {
  const num = parseInt(input.trim(), 10);
  if (isNaN(num)) {
    return { valid: false, error: "Para este prototipo usa un umbral entre 3 y 10 respuestas por grupo." };
  }
  if (num >= 3 && num <= 10) {
    return { valid: true, value: num };
  }
  return { valid: false, error: "Para este prototipo usa un umbral entre 3 y 10 respuestas por grupo." };
}

export function validateSurveyName(input: string): { valid: boolean, value?: string, error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "El nombre no puede estar vacío." };
  }
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: "El nombre no puede ser solo numérico." };
  }
  // Simplified validation for PII/offensive language for this prototype phase
  const offensiveWords = ["puta", "mierda", "pendejo"];
  if (offensiveWords.some(w => trimmed.toLowerCase().includes(w))) {
    return { valid: false, error: "El nombre contiene lenguaje no permitido." };
  }
  
  return { valid: true, value: trimmed };
}

export function getSurveyNameSuggestion(scope: ConversationalSurveyScope): string {
  if (scope === "qs_clima_2025") return "QS Clima 2025";
  if (scope === "qs_clima_2024") return "QS Clima 2024";
  return "QS Clima Histórico 2024/2025";
}

export function getSurveyTypeSuggestion(scope: ConversationalSurveyScope): ConversationalSurveyType {
  if (scope === "qs_clima_multicycle_2024_2025") return "mixed";
  return "climate";
}

export function getSurveyTypeLabel(type: ConversationalSurveyType): string {
  switch (type) {
    case "climate": return "Clima";
    case "engagement": return "Engagement";
    case "enps": return "eNPS";
    case "mixed": return "Mixta";
    default: return "Desconocido";
  }
}

export function getVisibilitySuggestion(): ConversationalSurveyVisibility {
  return "anonymous";
}

export function getMainFileSuggestion(scope: ConversationalSurveyScope): string {
  if (scope === "qs_clima_2024") return "Resultados Encuesta de Clima 2024.xlsx";
  return "Resultdos Clima total QS 2025.xlsx";
}

export function getAssociatedFilesList(scope: ConversationalSurveyScope): string[] {
  if (scope === "qs_clima_2024") return [];
  if (scope === "qs_clima_multicycle_2024_2025") return ["Resultados Encuesta de Clima 2024.xlsx", "Resultdos Clima total QS 2025.xlsx"];
  return [
    "Resultado Gerencia Agropecuario 2025.xlsx",
    "Resultados Administracion y finanzas 2025.xlsx",
    "Resultados Gerencia Comercial 2025.xlsx",
    "Resultados Gerencia General 2025.xlsx",
    "Resultados Gerencia Industrial 2025.xlsx",
    "Resultados Gerencia Marketing 2025.xlsx",
    "Resultados Gerencia Personas y Organizacion 2025.xlsx",
    "Resultados Gerencia Supply Chain 2025.xlsx"
  ];
}
