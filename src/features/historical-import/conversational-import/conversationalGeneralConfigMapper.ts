import type { ConversationalSurveyScope, ConversationalSurveyType, ConversationalSurveyVisibility, ConversationalGeneralConfiguration } from "./conversationalWizardTypes";

export function getGeneralConfigSummaryMessage(config: ConversationalGeneralConfiguration, scope: ConversationalSurveyScope): string {
  const associatedCount = config.associatedFileIds.length;
  const associatedText = scope === "qs_clima_multicycle_2024_2025" ? "2024 + 2025" : `${associatedCount} cortes por gerencia`;

  return `Configuración general confirmada

- Encuesta: ${config.surveyName}
- Tipo: ${getSurveyTypeLabel(config.surveyType)}
- Visibilidad: ${config.visibility === 'anonymous' ? 'Anónimo' : 'Público'}
- Fecha de finalización: ${config.surveyEndDate || 'Desconocida'}
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

export function validateSurveyEndDate(input: string): { valid: boolean, value?: string, error?: string } {
  const trimmed = input.trim().toLowerCase();

  // Try to parse common formats
  // 2025-12-31
  let match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    return { valid: true, value: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` };
  }

  match = trimmed.match(new RegExp('^(\\d{1,2})[/.-](\\d{1,2})[/.-](\\d{4})$'));
  if (match) {
    return { valid: true, value: `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` };
  }

  // 31 de diciembre de 2025 or diciembre 31 2025
  const months: Record<string, string> = {
    enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
    julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12"
  };

  for (const [month, mm] of Object.entries(months)) {
    if (trimmed.includes(month)) {
      const yearMatch = trimmed.match(/\b(20\d{2})\b/);
      const dayMatch = trimmed.match(/\b(\d{1,2})\b/);

      if (yearMatch && dayMatch) {
        return { valid: true, value: `${yearMatch[1]}-${mm}-${dayMatch[1].padStart(2, '0')}` };
      }
    }
  }

  return { valid: false, error: "No pude interpretar la fecha. Escríbela como AAAA-MM-DD o DD/MM/AAAA." };
}

export function inferSurveyEndDate(surveyName: string, scope: ConversationalSurveyScope): string {
  const nameLower = surveyName.toLowerCase();

  let year = "2025";
  const yearMatch = nameLower.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
  } else if (scope === "qs_clima_2024") {
    year = "2024";
  }

  if (nameLower.includes("q1") || nameLower.includes("t1")) {
    return `${year}-03-31`;
  }
  if (nameLower.includes("q2") || nameLower.includes("t2") || nameLower.includes("s1") || nameLower.includes("h1") || nameLower.includes("semestre 1")) {
    return `${year}-06-30`;
  }
  if (nameLower.includes("q3") || nameLower.includes("t3")) {
    return `${year}-09-30`;
  }

  return `${year}-12-31`; // default
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSurveyTypeSuggestion(_scope: ConversationalSurveyScope): ConversationalSurveyType {
  return "climate";
}

export function getSurveyTypeLabel(type: ConversationalSurveyType): string {
  switch (type) {
    case "climate": return "Clima";
    case "culture": return "Cultura";
    case "nps": return "NPS";
    case "engagement": return "Clima"; // Fallback to avoid forbidden visible values
    case "enps": return "NPS";
    case "mixed": return "Clima"; // Fallback to avoid forbidden visible values
    default: return "Desconocido";
  }
}

export function getVisibilitySuggestion(scope: ConversationalSurveyScope): ConversationalSurveyVisibility {
  if (scope === "qs_clima_2024") return "anonymous";
  return "public";
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
