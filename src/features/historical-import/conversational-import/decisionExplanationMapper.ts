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

  switch (decision.type) {
    case "resolve_pii":
      return {
        id: decision.id,
        title: "Detección de datos sensibles (PII)",
        detectedIssue: "Detecté columnas que podrían contener datos personales, como nombres o correos electrónicos.",
        whyItMatters: "Es fundamental proteger la privacidad de los participantes si la encuesta debe ser anónima.",
        historicalLoadImpact: "Si incluimos estos identificadores, las respuestas podrían asociarse a participantes específicos, violando el anonimato.",
        recommendation: "Te recomiendo excluir las columnas sensibles para procesar la encuesta como anónima.",
        primaryQuestion: "¿Qué deseas hacer con estas columnas?",
        actions: [
          {
            id: `${baseActionId}_exclude`,
            label: "Excluir columnas sensibles",
            actionType: `${baseActionId}_exclude`,
            intent: "primary",
            consequence: "Los identificadores no se usarán para asociar respuestas con participantes.",
          },
          {
            id: `${baseActionId}_accept`,
            label: "Mantener columnas",
            actionType: `${baseActionId}_accept`,
            intent: "danger",
            consequence: "Las respuestas podrían quedar asociadas a personas específicas.",
            riskLevel: "high",
          },
        ],
      };

    case "approve_demographics":
      return {
        id: decision.id,
        title: "Revisión de Demográficos",
        detectedIssue: "Encontré demográficos en tu archivo que no tienen una coincidencia exacta en el catálogo.",
        whyItMatters: "Para que puedas segmentar los resultados después de la carga, necesitamos saber cómo clasificar estas columnas.",
        historicalLoadImpact: "Si los demográficos no se mapean bien, la carga histórica quedará aislada y no podrás filtrar por estas variables.",
        primaryQuestion: "¿Cómo quieres manejar estos demográficos?",
        actions: [
          {
            id: `${baseActionId}_confirm`,
            label: "Confirmar mapeo automático",
            actionType: `${baseActionId}_confirm`,
            intent: "primary",
            consequence: "Se utilizará el mapeo sugerido para clasificar a los participantes.",
          },
          {
            id: `${baseActionId}_create_survey_only`,
            label: "Crear solo para esta encuesta",
            actionType: `${baseActionId}_create_survey_only`,
            intent: "secondary",
            consequence: "Estos demográficos existirán únicamente para esta carga histórica.",
          },
          {
            id: `${baseActionId}_ignore`,
            label: "Ignorar demográficos no reconocidos",
            actionType: `${baseActionId}_ignore`,
            intent: "secondary",
            consequence: "Esas columnas no se incluirán en la carga histórica inicial.",
          },
        ],
      };

    case "resolve_ambiguity":
      return {
        id: decision.id,
        title: "Múltiples opciones posibles",
        detectedIssue: "El archivo tiene información que podría interpretarse de más de una forma.",
        whyItMatters: "Necesitamos asegurar que los datos se lean del lugar correcto.",
        historicalLoadImpact: "Elegir la opción incorrecta podría corromper la asociación entre preguntas y respuestas en la carga histórica.",
        recommendation: "Revisa la opción con mayor nivel de confianza detectado.",
        primaryQuestion: "¿Cuál es la interpretación correcta?",
        actions: [
          {
            id: `${baseActionId}_resolve`,
            label: "Resolver según sugerencia",
            actionType: `${baseActionId}_resolve`,
            intent: "primary",
            consequence: "La carga histórica utilizará esta configuración.",
          },
          {
            id: `${baseActionId}_skip`,
            label: "Ignorar",
            actionType: `${baseActionId}_skip`,
            intent: "secondary",
            consequence: "Se omitirá la validación para este caso específico.",
          },
        ],
      };

    case "approve_contract":
      return {
        id: decision.id,
        title: "Aprobar Estructura Final",
        detectedIssue: "La estructura de la encuesta está lista para procesarse.",
        whyItMatters: "Este es el paso final antes de iniciar la extracción de datos.",
        historicalLoadImpact: "Al aprobar, la plataforma procesará la carga histórica utilizando esta configuración.",
        primaryQuestion: "¿Apruebas la estructura configurada?",
        actions: [
          {
            id: `${baseActionId}_approve`,
            label: "Aprobar y procesar",
            actionType: `${baseActionId}_approve`,
            intent: "primary",
            consequence: "Se iniciará la carga histórica de los datos.",
          },
          {
            id: `${baseActionId}_cancel`,
            label: "Cancelar importación",
            actionType: `${baseActionId}_cancel`,
            intent: "cancel",
            consequence: "Se descartará la configuración actual.",
          },
        ],
      };

    default:
      return {
        id: decision.id,
        title: "Revisión necesaria",
        detectedIssue: "Hay un detalle en la estructura que requiere tu confirmación.",
        whyItMatters: "Para garantizar la integridad de los datos.",
        historicalLoadImpact: "Impacta cómo se estructuran las preguntas y respuestas.",
        primaryQuestion: "¿Deseas continuar con la opción sugerida?",
        actions: [
          {
            id: `${baseActionId}_confirm`,
            label: "Confirmar",
            actionType: `${baseActionId}_confirm`,
            intent: "primary",
            consequence: "Se aplicará la configuración para continuar.",
          },
        ],
      };
  }
}
