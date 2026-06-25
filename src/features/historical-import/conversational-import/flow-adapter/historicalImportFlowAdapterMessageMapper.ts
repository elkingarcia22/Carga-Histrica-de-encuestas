import type { ChatFoundationMessage } from "../chat-foundation";
import {
  createChatFoundationThinkingMessage,
  shouldShowThinkingBeforeAssistantReply,
  DEFAULT_CHAT_FOUNDATION_THINKING_POLICY
} from "../chat-foundation";
import type { ConversationalImportWizardState } from "../conversationalWizardTypes";
import {
  getSurveyNameSuggestion,
  getSurveyTypeSuggestion,
  getSurveyTypeLabel,
  getMainFileSuggestion,
  getAssociatedFilesList,
  inferSurveyEndDate
} from "../conversationalGeneralConfigMapper";
import { getMatchReviewSectionMessage } from "../conversationalMatchReviewMapper";
import type {
  HistoricalImportFlowAdapterStep,
  HistoricalImportFlowAdapterMetadata
} from "./historicalImportFlowAdapterTypes";

/**
 * Maps the current Historical Import Flow Adapter step and wizard state into a list of Chat Foundation messages.
 * This is a pure mapper function without side effects.
 *
 * @param step The active flow adapter step.
 * @param wizardState The current conversational wizard state.
 * @param _metadata Optional metadata configuration.
 * @returns An array of ChatFoundationMessage.
 */
export function mapHistoricalImportFlowAdapterMessages(
  step: HistoricalImportFlowAdapterStep,
  wizardState: ConversationalImportWizardState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _metadata?: HistoricalImportFlowAdapterMetadata
): ChatFoundationMessage[] {
  const messages: ChatFoundationMessage[] = [];

  // 1. Thinking message prepended if applicable
  const shouldShowThinking = shouldShowThinkingBeforeAssistantReply(
    DEFAULT_CHAT_FOUNDATION_THINKING_POLICY,
    step,
    "assistant"
  );

  if (shouldShowThinking && step !== "idle" && step !== "import_cancelled") {
    let thinkingContent = "Pensando...";
    switch (step) {
      case "detecting_survey_scope":
        thinkingContent = "Analizando estructura del archivo para identificar ciclos de encuesta...";
        break;
      case "asking_general_configuration":
      case "confirming_survey_name":
      case "confirming_survey_type":
      case "confirming_visibility":
      case "confirming_survey_end_date":
      case "confirming_confidentiality_threshold":
      case "confirming_main_file":
      case "confirming_associated_files":
        thinkingContent = "Validando parámetros de configuración general...";
        break;
      case "reviewing_structure_match":
      case "reviewing_questions_and_scales":
      case "reviewing_demographics":
      case "reviewing_participants_or_responses":
      case "reviewing_dimensions":
      case "reviewing_question_dimension_mapping":
      case "reviewing_segments":
      case "reviewing_privacy":
        thinkingContent = "Calculando correspondencias y mapeo de columnas...";
        break;
      case "resolving_ambiguity":
        thinkingContent = "Evaluando opciones para resolver el conflicto estructural...";
        break;
      case "structure_approved":
        thinkingContent = "Consolidando estructura aprobada...";
        break;
      case "reviewing_detected_results":
        thinkingContent = "Procesando agregados y resúmenes de resultados...";
        break;
      case "draft_preview_ready":
        thinkingContent = "Generando vista previa del borrador...";
        break;
      case "awaiting_import_confirmation":
        thinkingContent = "Preparando simulación en entorno sandbox...";
        break;
      case "sandbox_import_completed":
        thinkingContent = "Ejecutando simulación de carga en sandbox...";
        break;
    }

    messages.push(
      createChatFoundationThinkingMessage({
        id: `thinking-${step}`,
        content: thinkingContent,
      })
    );
  }

  const scope = wizardState.selectedScope === "unknown" ? "qs_clima_multicycle_2024_2025" : wizardState.selectedScope;

  // 2. Add the main assistant response
  switch (step) {
    case "idle":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "plain_text",
        status: "delivered",
        tone: "neutral",
        content: "¡Hola! Soy el asistente de importación de encuestas históricas. Para comenzar, por favor sube tus archivos de datos (XLSX/CSV) en el panel inferior."
      });
      break;

    case "files_uploaded":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "confirmation",
        status: "delivered",
        tone: "success",
        content: "He recibido tus archivos en el sandbox local de forma segura.\n\nRegla de privacidad activa: los archivos se procesarán en tu navegador de forma 100% confidencial, sin enviar datos individuales al servidor ni a APIs externas."
      });
      break;

    case "detecting_survey_scope":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "plain_text",
        status: "delivered",
        tone: "info",
        content: "Analizando la estructura del archivo y el contenido de las columnas para identificar el alcance de la encuesta, los ciclos de clima y las gerencias asociadas..."
      });
      break;

    case "awaiting_survey_scope_selection":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: "He detectado más de un ciclo o encuesta en los archivos cargados.\n\n1. QS Clima 2025 (Archivo principal)\n2. QS Clima 2024 (Ciclo anterior)\n3. Carga histórica multicíclo QS Clima 2024/2025\n\n¿Cuál encuesta o ciclo quieres procesar primero? Por favor responde 1, 2 o 3."
      });
      break;

    case "asking_general_configuration":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "plain_text",
        status: "delivered",
        tone: "neutral",
        content: "Comenzaremos configurando los datos generales de la encuesta para asegurar que el comparativo histórico sea coherente."
      });
      break;

    case "confirming_survey_name": {
      const nameSuggestion = getSurveyNameSuggestion(scope);
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: `1/7 · Nombre de la encuesta\n\nNombre sugerido: "${nameSuggestion}".\n\n¿Quieres usar este nombre o escribir otro?`
      });
      break;
    }

    case "confirming_survey_type": {
      const typeSuggestion = getSurveyTypeLabel(getSurveyTypeSuggestion(scope));
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: `2/7 · Tipo de encuesta\n\nTipo sugerido: "${typeSuggestion}".\n\n¿Confirmas este tipo o quieres elegir otro?\n\nOpciones:\n1. Clima\n2. Cultura\n3. NPS`
      });
      break;
    }

    case "confirming_visibility":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: "3/7 · Tipo de visibilidad\n\nDetecté datos personales en los archivos (nombres, correos). ¿Quieres que la visibilidad sea Anónima (para proteger identidades en los resultados) o Pública?\n\nOpciones:\n1. Anónimo\n2. Público"
      });
      break;

    case "confirming_survey_end_date": {
      const dateSuggestion = inferSurveyEndDate(
        wizardState.generalConfiguration.surveyName || getSurveyNameSuggestion(scope),
        scope
      );
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: `4/7 · Fecha de finalización\n\nFecha sugerida: ${dateSuggestion}.\n\n¿Confirmas esta fecha o quieres escribir otra (AAAA-MM-DD)?`
      });
      break;
    }

    case "confirming_confidentiality_threshold":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: "5/7 · Umbral de confidencialidad\n\nUmbral sugerido: 5 respuestas por grupo.\nEsto evita mostrar cortes con muy pocas respuestas para proteger la privacidad.\n\n¿Confirmas este umbral o quieres escribir otro número?"
      });
      break;

    case "confirming_main_file": {
      const mainFileSuggestion = getMainFileSuggestion(scope);
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: `6/7 · Archivo principal\n\nArchivo principal detectado:\n- ${mainFileSuggestion}\n\nLo usaré como referencia para la estructura y los resultados de participación. ¿Confirmas este archivo?`
      });
      break;
    }

    case "confirming_associated_files": {
      const associatedList = getAssociatedFilesList(scope);
      const listContent = associatedList.length > 0
        ? associatedList.map((f, i) => `${i + 1}. ${f}`).join("\n")
        : "No se detectaron archivos adicionales.";
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: `7/7 · Archivos asociados\n\nDetecté los siguientes archivos adicionales para los cortes agregados:\n${listContent}\n\n¿Confirmas el uso de estos archivos asociados?`
      });
      break;
    }

    case "reviewing_structure_match":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: "Ahora revisaré el match detectado de la estructura.\n\nVoy a validar las secciones una por una:\n1. Preguntas y escalas\n2. Demográficos\n3. Participantes / respuestas\n4. Dimensiones\n5. Mapeo pregunta-dimensión\n6. Segmentos / cortes\n7. Privacidad\n\nEmpezaré por Preguntas y escalas."
      });
      break;

    case "reviewing_questions_and_scales":
    case "reviewing_demographics":
    case "reviewing_participants_or_responses":
    case "reviewing_dimensions":
    case "reviewing_question_dimension_mapping":
    case "reviewing_segments":
    case "reviewing_privacy": {
      const sectionMap: Record<string, import("../conversationalWizardTypes").ConversationalMatchReviewSection> = {
        reviewing_questions_and_scales: "questions_and_scales",
        reviewing_demographics: "demographics",
        reviewing_participants_or_responses: "participants_or_responses",
        reviewing_dimensions: "dimensions",
        reviewing_question_dimension_mapping: "question_dimension_mapping",
        reviewing_segments: "segments",
        reviewing_privacy: "privacy"
      };
      const section = sectionMap[step];
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: getMatchReviewSectionMessage(section, scope, false)
      });
      if (wizardState.activeSection === section) {
        messages.push({
          id: `msg-${step}-details`,
          role: "assistant",
          kind: "safe_details",
          status: "delivered",
          tone: "info",
          content: getMatchReviewSectionMessage(section, scope, true)
        });
      }
      break;
    }

    case "resolving_ambiguity": {
      const activeAmbiguity = wizardState.ambiguities.find(a => a.id === wizardState.activeAmbiguityId);
      const desc = activeAmbiguity?.description || "Se requiere resolver un mapeo conflictivo.";
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "warning",
        status: "delivered",
        tone: "warning",
        content: `He detectado una ambigüedad o conflicto en los datos cargados.\n\nDescripción: ${desc}\n\nPor favor, selecciona una de las opciones sugeridas para continuar.`
      });
      break;
    }

    case "structure_approved":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "handoff",
        status: "delivered",
        tone: "success",
        content: "La estructura de la encuesta ha sido aprobada de manera exitosa.\n\nNota: Los datos y clasificaciones de las columnas están validados localmente. Ningún cambio ha sido guardado de manera permanente en el servidor."
      });
      break;

    case "reviewing_detected_results":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "structured",
        status: "delivered",
        tone: "neutral",
        content: "Estructura aprobada localmente.\nNo se ejecutó importación ni se guardaron datos.\n\nAhora revisemos los resultados detectados:\n\n- Métricas agregadas disponibles: Percepción Negativa, Percepción Neutra, Percepción Positiva, Total de respuestas, Favorabilidad, Participación, eNPS Score.\n- Participación / respuestas agregadas: disponible por pregunta y segmento.\n- Segmentos disponibles: Total compañía + cortes por gerencia.\n- Privacidad: no se muestran respuestas individuales, personas, IDs, correos ni comentarios abiertos.\n\n¿Qué quieres revisar de los resultados?\n\n1. Métricas detectadas\n2. Participación / respuestas\n3. Segmentos por gerencia\n4. Preview del borrador\n5. Cancelar importación"
      });
      break;

    case "draft_preview_ready":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "handoff",
        status: "delivered",
        tone: "info",
        content: "El borrador de la carga histórica está listo para su previsualización.\n\nPuedes ver el desglose completo del borrador antes de confirmar la simulación en el sandbox."
      });
      break;

    case "awaiting_import_confirmation":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "plain_text",
        status: "delivered",
        tone: "neutral",
        content: "¿Confirmas la simulación de importación en el entorno sandbox? Esto validará la carga sin alterar la base de datos de producción."
      });
      break;

    case "sandbox_import_completed":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "handoff",
        status: "delivered",
        tone: "success",
        content: "¡Simulación de importación en sandbox completada con éxito!\n\nNota: La importación real en base de datos productiva está prohibida para este prototipo. No se ha generado ningún link de comparación productivo."
      });
      break;

    case "import_cancelled":
      messages.push({
        id: `msg-${step}-reply`,
        role: "assistant",
        kind: "plain_text",
        status: "delivered",
        tone: "neutral",
        content: "Importación cancelada. Puedes volver a subir los archivos para iniciar una nueva carga histórica."
      });
      break;

    default: {
      const exhaustiveCheck: never = step;
      messages.push({
        id: `error-unrecognized-${exhaustiveCheck}`,
        role: "assistant",
        kind: "error",
        status: "failed",
        tone: "error",
        content: "Error: Estado de flujo no reconocido por el adaptador."
      });
      break;
    }
  }

  // 3. Conditional validation warnings & errors from wizardState
  if (wizardState.readiness) {
    if (wizardState.readiness.warnings && wizardState.readiness.warnings.length > 0) {
      messages.push({
        id: `warning-readiness-${step}`,
        role: "assistant",
        kind: "warning",
        status: "delivered",
        tone: "warning",
        content: `Advertencias del sistema:\n${wizardState.readiness.warnings.map(w => `- ${w}`).join("\n")}`
      });
    }

    if (wizardState.readiness.blockers && wizardState.readiness.blockers.length > 0) {
      messages.push({
        id: `warning-blockers-${step}`,
        role: "assistant",
        kind: "warning",
        status: "delivered",
        tone: "warning",
        content: `Revisiones pendientes antes de proceder:\n${wizardState.readiness.blockers.map(b => `- ${b}`).join("\n")}`
      });
    }
  }

  if (step === "awaiting_import_confirmation" && !wizardState.sandboxImport.enabled) {
    messages.push({
      id: `error-unauthorized-import-${step}`,
      role: "assistant",
      kind: "error",
      status: "blocked",
      tone: "error",
      content: "Error: Intento de importación no autorizado. La configuración de sandbox no está habilitada."
    });
  }

  if (step === "draft_preview_ready" && !wizardState.readiness.draftPreviewReady) {
    messages.push({
      id: `error-flow-unavailable-${step}`,
      role: "assistant",
      kind: "error",
      status: "failed",
      tone: "error",
      content: "Error: El flujo de vista previa del borrador no está disponible en este momento porque faltan aprobaciones estructurales."
    });
  }

  if (wizardState.cancelled && step !== "import_cancelled") {
    messages.push({
      id: `error-invalid-state-${step}`,
      role: "assistant",
      kind: "error",
      status: "failed",
      tone: "error",
      content: "Error de estado: El flujo ha sido cancelado pero el paso actual sigue activo. Por favor reinicie el asistente."
    });
  }

  return messages;
}
