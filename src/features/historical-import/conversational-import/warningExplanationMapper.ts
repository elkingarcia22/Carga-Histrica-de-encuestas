export interface WarningExplanation {
  detectedIssue: string;
  whyItMatters: string;
  impactIfIgnored: string;
  recommendedNextStep: string;
  severity: "low" | "medium" | "high" | "critical";
}

export function mapWarningToExplanation(warningId: string): WarningExplanation {
  switch (warningId) {
    case "multiple_sheets":
    case "multiple_sheets_detected":
      return {
        detectedIssue: "Encontré varias hojas que podrían contener datos de encuesta.",
        whyItMatters: "El sistema necesita saber de cuál hoja extraer las respuestas y demográficos principales.",
        impactIfIgnored: "Podrían omitirse datos importantes o procesarse una hoja incorrecta.",
        recommendedNextStep: "Verifica que la hoja seleccionada sea la correcta.",
        severity: "medium",
      };
    case "unsupported_columns":
    case "unmapped_columns":
      return {
        detectedIssue: "Hay columnas que no pude clasificar automáticamente.",
        whyItMatters: "Estas columnas no se asociarán a demográficos ni preguntas del catálogo.",
        impactIfIgnored: "Esa información no estará disponible en los filtros ni análisis de la carga histórica.",
        recommendedNextStep: "Revisa las columnas ignoradas y decide si quieres mapearlas manualmente.",
        severity: "low",
      };
    case "pii_risk":
    case "possible_pii_detected":
      return {
        detectedIssue: "Detecté posibles datos personales (ej. correos, nombres o identificaciones).",
        whyItMatters: "La carga histórica no debe exponer la identidad de los participantes si la encuesta es anónima.",
        impactIfIgnored: "Se podrían almacenar datos sensibles que comprometen la privacidad.",
        recommendedNextStep: "Te recomiendo excluir estas columnas para proteger la confidencialidad.",
        severity: "high",
      };
    case "unknown_demographic":
    case "unmapped_demographic":
      return {
        detectedIssue: "Encontré datos demográficos que no coinciden completamente con la plataforma.",
        whyItMatters: "Los demográficos deben coincidir con la estructura organizativa para permitir segmentación.",
        impactIfIgnored: "Los participantes quedarán sin esta segmentación en la plataforma.",
        recommendedNextStep: "Configura estos demográficos como específicos de esta encuesta o mapealos al catálogo.",
        severity: "medium",
      };
    case "unmatched_question":
    case "question_not_homologated":
      return {
        detectedIssue: "No encontré suficientes preguntas homologables automáticamente.",
        whyItMatters: "Las preguntas deben estar homologadas para mantener coherencia en el modelo de evaluación.",
        impactIfIgnored: "Las preguntas no mapeadas se cargarán como preguntas específicas de esta edición y no podrán analizarse históricamente con otras encuestas.",
        recommendedNextStep: "Mapea las preguntas manualmente si corresponden al catálogo.",
        severity: "medium",
      };
    case "low_header_confidence":
      return {
        detectedIssue: "La fila de encabezados no tiene una estructura típica.",
        whyItMatters: "Necesitamos identificar correctamente los nombres de las columnas para entender los datos.",
        impactIfIgnored: "Los datos podrían leerse incorrectamente, mezclando preguntas con respuestas.",
        recommendedNextStep: "Confirma la fila correcta donde están los encabezados.",
        severity: "high",
      };
    default:
      return {
        detectedIssue: "Detecté una inconsistencia en la estructura del archivo.",
        whyItMatters: "Puede afectar la calidad de la carga histórica.",
        impactIfIgnored: "Podría generar errores durante el procesamiento de respuestas.",
        recommendedNextStep: "Revisa el archivo original.",
        severity: "medium",
      };
  }
}
