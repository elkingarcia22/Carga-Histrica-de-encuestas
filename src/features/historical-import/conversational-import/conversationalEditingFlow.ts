import { qsClimaDemoFixture } from "../demo-fixture/qsClimaFixture";
import { getDimensionsList, getQuestionsListForDimension, validateNewLabel } from "./conversationalEditingMapper";

export type ConversationalEditState =
  | "idle"
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

export function handleConversationalEdit(
  input: string,
  state: ConversationalEditState,
  context: ConversationalEditContext,
  overlayState: Record<string, string>
): ChatResponse {
  const normalizedInput = input.trim().toLowerCase();

  // Global cancel
  if (normalizedInput === "cancelar" && state !== "idle") {
    return {
      message: "Edición cancelada. ¿Qué más deseas hacer? Puedes revisar la estructura, ver el preview del borrador o ajustar por chat de nuevo.",
      newState: "idle",
      newContext: {},
      cancelFlow: true
    };
  }

  switch (state) {
    case "idle":
    case "asking_edit_area": {
      if (normalizedInput.includes("dimensione") || normalizedInput === "dimensiones" || normalizedInput === "dimension") {
        return {
          message: `Estas son las dimensiones detectadas:\n${getDimensionsList(overlayState)}\n\n¿Cuál quieres renombrar? (Responde con el número)`,
          newState: "asking_dimension",
          newContext: { area: "dimensiones" }
        };
      }
      if (normalizedInput.includes("pregunta") || normalizedInput === "preguntas" || normalizedInput === "pregunta") {
        return {
          message: `¿Sobre qué dimensión quieres trabajar?\n${getDimensionsList(overlayState)}\n\n(Responde con el número de la dimensión)`,
          newState: "asking_dimension",
          newContext: { area: "preguntas" }
        };
      }
      if (["demográficos", "demograficos", "métricas", "metricas", "segmentos"].some(w => normalizedInput.includes(w))) {
        return {
          message: "Por ahora puedo mostrar estos elementos, pero la edición habilitada en esta fase es solo para etiquetas visibles de dimensiones y preguntas.\n\n¿Quieres ajustar dimensiones o preguntas?",
          newState: "asking_edit_area",
          newContext: {}
        };
      }
      if (normalizedInput.includes("decisiones") || normalizedInput.includes("decisiones pendientes")) {
        return {
          message: "Puedo mostrarlas, pero resolver decisiones estará en una fase posterior.\n\n¿Quieres ajustar dimensiones o preguntas?",
          newState: "asking_edit_area",
          newContext: {}
        };
      }
      return {
        message: "¿Qué quieres revisar o ajustar primero?\n\nPuedes responder:\n- dimensiones\n- preguntas\n- demográficos\n- métricas\n- segmentos\n- decisiones pendientes",
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
          message: "Ese texto no es válido para una etiqueta visible. Intenta con un nombre descriptivo sin datos personales ni valores de respuesta.",
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
      if (normalizedInput === "aprobar") {
        const id = context.targetType === "dimension" ? context.targetDimensionId! : context.targetQuestionId!;
        return {
          message: "Ajuste local aplicado. ¿Quieres ajustar otra cosa, revisar dimensiones o ver preview del borrador? (Escribe dimensiones, preguntas, etc.)",
          newState: "idle",
          newContext: {},
          applyOverlay: { id, label: context.proposedLabel! }
        };
      } else {
        return {
          message: "Ajuste cancelado. ¿Qué más deseas hacer? (Escribe dimensiones, preguntas, etc.)",
          newState: "idle",
          newContext: {}
        };
      }
    }

    default:
      return {
        message: "¿En qué te puedo ayudar? Puedes revisar dimensiones o preguntas.",
        newState: "idle",
        newContext: {}
      };
  }
}
