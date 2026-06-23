import type { RequiredUserDecision } from "../survey-file-analysis/types";

export interface ActionExplanation {
  id: string;
  label: string;
  actionType: string;
  intent: "primary" | "secondary" | "danger" | "cancel";
  consequence: string;
  riskLevel?: "low" | "medium" | "high";
}

export interface DecisionExplanation {
  id: string;
  title: string;
  detectedIssue: string;
  whyItMatters: string;
  historicalLoadImpact: string;
  recommendation?: string;
  primaryQuestion: string;
  actions: ActionExplanation[];
}

export function mapDecisionToExplanation(decision: RequiredUserDecision): DecisionExplanation {
  const baseActionId = `decision_action_${decision.id}`;

  const contextInfo = decision.relatedEntityId ? `para el elemento "${decision.relatedEntityId}"` : "en los archivos cargados";
  const suggestion = decision.promptDescription || "Opción sugerida";

  switch (decision.type) {
    case "resolve_pii":
      return {
        id: decision.id,
        title: `Detección de datos sensibles (PII) ${contextInfo}`,
        detectedIssue: `Detecté columnas que podrían contener datos personales, como nombres o correos electrónicos ${contextInfo}.`,
        whyItMatters: "Es fundamental proteger la privacidad de los participantes si la encuesta debe ser anónima.",
        historicalLoadImpact: "Si incluimos estos identificadores, las respuestas de la carga histórica podrían asociarse a participantes específicos, violando el anonimato y la política de privacidad.",
        recommendation: "Te recomiendo excluir las columnas sensibles para procesar la encuesta de forma anónima y segura.",
        primaryQuestion: "¿Qué deseas hacer con estas columnas?",
        actions: [
          {
            id: `${baseActionId}_exclude`,
            label: "Excluir columnas sensibles",
            actionType: `${baseActionId}_exclude`,
            intent: "primary",
            consequence: "Los identificadores no se importarán ni se usarán para asociar respuestas.",
          },
          {
            id: `${baseActionId}_accept`,
            label: "Mantener columnas (Riesgo)",
            actionType: `${baseActionId}_accept`,
            intent: "danger",
            consequence: "Las respuestas podrían quedar asociadas a personas específicas.",
            riskLevel: "high",
          },
          {
            id: `${baseActionId}_custom`,
            label: "Escribir interpretación alternativa...",
            actionType: `${baseActionId}_custom`,
            intent: "secondary",
            consequence: "Ingresarás una justificación manual para el manejo de esta columna.",
          }
        ],
      };

    case "approve_demographics":
      return {
        id: decision.id,
        title: `Revisión de Demográficos ${contextInfo}`,
        detectedIssue: `Encontré columnas demográficas ${contextInfo} que no tienen una coincidencia exacta en el catálogo actual de la plataforma.`,
        whyItMatters: "Para que puedas segmentar los resultados de la carga histórica en el dashboard, necesitamos saber cómo clasificar estas columnas.",
        historicalLoadImpact: "Si los demográficos no se mapean correctamente, la carga histórica no permitirá filtrar por estas variables o generará datos huérfanos.",
        recommendation: `Te sugiero mapearlos como entidades exclusivas de esta encuesta (survey-only) si no planeas usarlos globalmente. Sugerencia actual: ${suggestion}`,
        primaryQuestion: "¿Cómo quieres manejar estos demográficos no reconocidos?",
        actions: [
          {
            id: `${baseActionId}_confirm`,
            label: `Confirmar sugerencia (${suggestion})`,
            actionType: `${baseActionId}_confirm`,
            intent: "primary",
            consequence: "Se utilizará el mapeo sugerido para clasificar a los participantes en la base histórica.",
          },
          {
            id: `${baseActionId}_create_survey_only`,
            label: "Crear solo para esta encuesta",
            actionType: `${baseActionId}_create_survey_only`,
            intent: "secondary",
            consequence: "Estos demográficos existirán únicamente para esta carga histórica y no afectarán el catálogo global.",
          },
          {
            id: `${baseActionId}_ignore`,
            label: "Ignorar estas columnas",
            actionType: `${baseActionId}_ignore`,
            intent: "secondary",
            consequence: "Esas columnas no se incluirán en la importación.",
          },
          {
            id: `${baseActionId}_custom`,
            label: "Escribir interpretación alternativa...",
            actionType: `${baseActionId}_custom`,
            intent: "secondary",
            consequence: "Puedes escribir una interpretación distinta si esta sugerencia no representa el archivo.",
          }
        ],
      };

    case "resolve_ambiguity":
      return {
        id: decision.id,
        title: `Ambigüedad en la estructura ${contextInfo}`,
        detectedIssue: `El formato de los datos ${contextInfo} es ambiguo y podría interpretarse de múltiples formas (ej: filas como participantes vs filas como métricas agregadas).`,
        whyItMatters: "Necesitamos asegurar que los datos crudos se lean correctamente para no mezclar métricas.",
        historicalLoadImpact: "Elegir la interpretación incorrecta agrupará mal las respuestas, corrompiendo totalmente los cálculos de favorabilidad históricos.",
        recommendation: `Revisa la opción sugerida basada en la estructura del archivo. Sugerencia: ${suggestion}`,
        primaryQuestion: "¿Cuál es la interpretación correcta para estos datos?",
        actions: [
          {
            id: `${baseActionId}_resolve`,
            label: `Resolver usando sugerencia: ${suggestion}`,
            actionType: `${baseActionId}_resolve`,
            intent: "primary",
            consequence: "La carga histórica procesará las filas utilizando esta estructura recomendada.",
          },
          {
            id: `${baseActionId}_skip`,
            label: "Ignorar validación estructural",
            actionType: `${baseActionId}_skip`,
            intent: "secondary",
            consequence: "Se omitirá la validación y podría fallar la lectura de ciertas filas.",
            riskLevel: "medium"
          },
          {
            id: `${baseActionId}_custom`,
            label: "Escribir interpretación alternativa...",
            actionType: `${baseActionId}_custom`,
            intent: "secondary",
            consequence: "Puedes escribir una interpretación distinta si esta sugerencia no representa el archivo.",
          }
        ],
      };

    case "approve_contract":
      return {
        id: decision.id,
        title: `Aprobar Estructura de Carga Histórica`,
        detectedIssue: "El borrador de la estructura de la encuesta está listo para ser guardado.",
        whyItMatters: "Este es el paso final de revisión estructural antes de permitir la importación de datos reales en una fase posterior.",
        historicalLoadImpact: "Al aprobar, se congelará esta configuración (preguntas, demográficos, privacidad) para ser usada en el motor de importación.",
        recommendation: "Revisa el resumen final en la tarjeta superior antes de aprobar.",
        primaryQuestion: "¿Apruebas la estructura configurada para este ciclo histórico?",
        actions: [
          {
            id: `${baseActionId}_approve`,
            label: "Aprobar borrador",
            actionType: `${baseActionId}_approve`,
            intent: "primary",
            consequence: "El borrador quedará aprobado y listo para la importación en una fase futura.",
          },
          {
            id: `${baseActionId}_cancel`,
            label: "Cancelar análisis",
            actionType: `${baseActionId}_cancel`,
            intent: "cancel",
            consequence: "Se descartará el análisis actual y no se guardará la estructura.",
          },
        ],
      };

    default:
      return {
        id: decision.id,
        title: `Revisión necesaria ${contextInfo}`,
        detectedIssue: `Hay un detalle estructural ${contextInfo} que requiere tu confirmación experta.`,
        whyItMatters: "Es necesario para garantizar la integridad de los resultados importados.",
        historicalLoadImpact: "Una mala configuración en este punto puede mezclar periodos o demográficos en los reportes históricos.",
        recommendation: `Opción sugerida: ${suggestion}`,
        primaryQuestion: "¿Deseas continuar con la opción sugerida?",
        actions: [
          {
            id: `${baseActionId}_confirm`,
            label: `Confirmar: ${suggestion}`,
            actionType: `${baseActionId}_confirm`,
            intent: "primary",
            consequence: "Se aplicará la configuración recomendada a la carga histórica.",
          },
          {
            id: `${baseActionId}_custom`,
            label: "Escribir interpretación alternativa...",
            actionType: `${baseActionId}_custom`,
            intent: "secondary",
            consequence: "Puedes escribir una interpretación distinta si esta sugerencia no representa el archivo.",
          }
        ],
      };
  }
}
