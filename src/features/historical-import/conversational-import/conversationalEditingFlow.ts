import { qsClimaDemoFixture } from "../demo-fixture/qsClimaFixture";
import { getDimensionsList, getQuestionsListForDimension, validateNewLabel } from "./conversationalEditingMapper";
import { detectIntent } from "./conversationalIntentMapper";

export type ConversationalEditState =
  | "idle"
  | "awaiting_survey_scope_selection"
  | "asking_edit_area"
  | "asking_dimension"
  | "showing_questions"
  | "asking_question_selection"
  | "asking_new_label"
  | "asking_confirmation";

export interface ConversationalEditContext {
  area?: "dimensiones" | "preguntas" | "demográficos" | "métricas" | "segmentos" | "decisiones";
  targetDimensionId?: string;
  targetQuestionId?: string;
  proposedLabel?: string;
  previousLabel?: string;
  targetType?: "dimension" | "question";
}

export interface ChatResponse {
  message: string;
  newState: ConversationalEditState;
  newContext: ConversationalEditContext;
  applyOverlay?: { id: string; label: string };
  cancelFlow?: boolean;
}

const GUIDE_SUFFIX = `\n\n¿Qué quieres revisar primero?\n\n1. Dimensiones\n2. Preguntas\n3. Demográficos\n4. Métricas\n5. Segmentos\n6. Decisiones pendientes\n7. Preview del borrador\n8. Aprobar estructura\n9. Cancelar importación\n\nPuedes responder con el número o con el nombre de la opción.`;

export function handleConversationalEdit(
  input: string,
  state: ConversationalEditState,
  context: ConversationalEditContext,
  overlayState: Record<string, string>
): ChatResponse {
  const intent = detectIntent(input);
  const normalizedInput = input.trim().toLowerCase();

  // Global cancel for adjustments
  if (intent === "cancel_adjustment" && state !== "idle" && state !== "asking_confirmation") {
    return {
      message: `Edición cancelada. ¿Qué más deseas hacer?${GUIDE_SUFFIX}`,
      newState: "idle",
      newContext: {},
      cancelFlow: true
    };
  }

  // Handle skip/ninguna for ongoing flows
  if (intent === "skip_current_section" && state !== "idle" && state !== "asking_edit_area" && state !== "asking_confirmation") {
    return {
      message: `Perfecto. No haré cambios en esta sección.\n¿Quieres revisar otra sección o aprobar la estructura como está?${GUIDE_SUFFIX}`,
      newState: "idle",
      newContext: {}
    };
  }

  if (intent === "show_review_menu") {
    return {
      message: `¿Qué quieres revisar o ajustar primero?${GUIDE_SUFFIX}`,
      newState: "asking_edit_area",
      newContext: {}
    };
  }

  switch (state) {
    case "idle":
    case "asking_edit_area": {
      if (normalizedInput.includes("dimensione") || normalizedInput === "dimensiones" || normalizedInput === "dimension" || normalizedInput === "1") {
        return {
          message: `Estas son las dimensiones detectadas:\n${getDimensionsList(overlayState)}\n\n¿Cuál quieres renombrar? (Responde con el número)`,
          newState: "asking_dimension",
          newContext: { area: "dimensiones" }
        };
      }
      if (normalizedInput.includes("pregunta") || normalizedInput === "preguntas" || normalizedInput === "pregunta" || normalizedInput === "2") {
        return {
          message: `¿Sobre qué dimensión quieres trabajar?\n${getDimensionsList(overlayState)}\n\n(Responde con el número de la dimensión)`,
          newState: "asking_dimension",
          newContext: { area: "preguntas" }
        };
      }
      if (["demográficos", "demograficos", "métricas", "metricas", "segmentos", "decisiones", "decisiones pendientes", "3", "4", "5", "6"].some(w => normalizedInput.includes(w))) {
        return {
          message: `En esta fase puedo mostrar esta información, pero la edición habilitada por chat es solo para etiquetas visibles de dimensiones y preguntas.\n¿Quieres revisar otra sección o aprobar la estructura como está?${GUIDE_SUFFIX}`,
          newState: "asking_edit_area",
          newContext: {}
        };
      }
      return {
        message: `¿Qué quieres revisar o ajustar primero?${GUIDE_SUFFIX}`,
        newState: "asking_edit_area",
        newContext: {}
      };
    }

    case "asking_dimension": {
      const match = input.match(/\d+/);
      if (!match) {
        return {
          message: "Por favor, responde con el número de la dimensión.",
          newState: state,
          newContext: context
        };
      }
      const index = parseInt(match[0], 10) - 1;
      const dimension = qsClimaDemoFixture.sourceLayer.dimensions[index];
      if (!dimension) {
        return {
          message: "Número de dimensión no válido. Intenta de nuevo.",
          newState: state,
          newContext: context
        };
      }

      if (context.area === "preguntas") {
        return {
          message: `Estas son las preguntas de ${overlayState[dimension.id] || dimension.displayLabel}:\n${getQuestionsListForDimension(dimension.id, overlayState)}\n\n¿Cuál quieres ajustar? (Responde con el número)`,
          newState: "asking_question_selection",
          newContext: { ...context, targetDimensionId: dimension.id }
        };
      } else {
        return {
          message: `¿Cuál debería ser el nuevo nombre visible para la dimensión "${overlayState[dimension.id] || dimension.displayLabel}"?`,
          newState: "asking_new_label",
          newContext: { ...context, targetDimensionId: dimension.id, targetType: "dimension", previousLabel: overlayState[dimension.id] || dimension.displayLabel }
        };
      }
    }

    case "asking_question_selection": {
      const match = input.match(/\d+/);
      if (!match || !context.targetDimensionId) {
        return {
          message: "Por favor, responde con el número de la pregunta.",
          newState: state,
          newContext: context
        };
      }
      const index = parseInt(match[0], 10) - 1;
      const mappings = qsClimaDemoFixture.sourceLayer.mappings.filter(m => m.detectedDimensionId === context.targetDimensionId);
      const qIds = mappings.map(m => m.questionId);
      const questions = qsClimaDemoFixture.sourceLayer.questions.filter(q => qIds.includes(q.id));
      const question = questions[index];

      if (!question) {
        return {
          message: "Número de pregunta no válido. Intenta de nuevo.",
          newState: state,
          newContext: context
        };
      }

      return {
        message: `¿Cuál debería ser el nuevo texto visible para la pregunta "${overlayState[question.id] || question.displayLabel}"?`,
        newState: "asking_new_label",
        newContext: { ...context, targetQuestionId: question.id, targetType: "question", previousLabel: overlayState[question.id] || question.displayLabel }
      };
    }

    case "asking_new_label": {
      const error = validateNewLabel(input);
      if (error) {
        return {
          message: error,
          newState: state,
          newContext: context
        };
      }
      return {
        message: `Voy a aplicar este ajuste local:\nAntes: ${context.previousLabel}\nDespués: ${input}\n\n¿Confirmas el ajuste? Responde aprobar o cancelar.`,
        newState: "asking_confirmation",
        newContext: { ...context, proposedLabel: input }
      };
    }

    case "asking_confirmation": {
      if (intent === "strict_confirmation_approve") {
        const id = context.targetType === "dimension" ? context.targetDimensionId! : context.targetQuestionId!;
        return {
          message: `Ajuste local aplicado. ¿Qué más deseas hacer?${GUIDE_SUFFIX}`,
          newState: "idle",
          newContext: {},
          applyOverlay: { id, label: context.proposedLabel! }
        };
      } else if (intent === "strict_confirmation_cancel" || intent === "cancel_adjustment") {
        return {
          message: `Ajuste cancelado. ¿Qué más deseas hacer?${GUIDE_SUFFIX}`,
          newState: "idle",
          newContext: {}
        };
      } else if (intent === "ambiguous_confirmation" || input.trim()) {
        return {
          message: "Para confirmar este ajuste, responde exactamente “aprobar” o “cancelar”.",
          newState: state,
          newContext: context
        };
      }
      return {
        message: "Para confirmar este ajuste, responde exactamente “aprobar” o “cancelar”.",
        newState: state,
        newContext: context
      };
    }

    default:
      return {
        message: `¿En qué te puedo ayudar?${GUIDE_SUFFIX}`,
        newState: "idle",
        newContext: {}
      };
  }
}
