import type { RequiredUserDecision } from "../survey-file-analysis/types";
import type { SyntheticMountNextAction } from "./conversationalImportTypes";

export interface MappedDecision {
  id: string;
  title: string;
  description: string;
  riskLevel?: "low" | "medium" | "high";
  primaryAction: SyntheticMountNextAction;
  secondaryActions: SyntheticMountNextAction[];
  helperText?: string;
}

export function mapDecisionToChatActions(decision: RequiredUserDecision): MappedDecision {
  const baseActionId = `decision_action_${decision.id}`;

  switch (decision.type) {
    case "resolve_pii":
      return {
        id: decision.id,
        title: "Detección de datos sensibles (PII)",
        description: decision.promptDescription,
        riskLevel: "high",
        primaryAction: {
          id: `${baseActionId}_exclude`,
          label: "Omitir columna",
          actionType: `${baseActionId}_exclude`,
        },
        secondaryActions: [
          {
            id: `${baseActionId}_accept`,
            label: "Aceptar riesgo",
            actionType: `${baseActionId}_accept`,
          },
        ],
        helperText: "Te sugerimos omitir columnas con datos sensibles para proteger la privacidad.",
      };

    case "approve_demographics":
      return {
        id: decision.id,
        title: "Revisión de Demográficos",
        description: decision.promptDescription,
        primaryAction: {
          id: `${baseActionId}_confirm`,
          label: "Confirmar mapeo",
          actionType: `${baseActionId}_confirm`,
        },
        secondaryActions: [
          {
            id: `${baseActionId}_create_survey_only`,
            label: "Crear solo para esta encuesta",
            actionType: `${baseActionId}_create_survey_only`,
          },
          {
            id: `${baseActionId}_ignore`,
            label: "No crear",
            actionType: `${baseActionId}_ignore`,
          },
        ],
      };

    case "approve_dimensions":
      return {
        id: decision.id,
        title: "Revisión de Dimensiones",
        description: decision.promptDescription,
        primaryAction: {
          id: `${baseActionId}_confirm`,
          label: "Confirmar",
          actionType: `${baseActionId}_confirm`,
        },
        secondaryActions: [
          {
            id: `${baseActionId}_adjust`,
            label: "Solicitar ajuste",
            actionType: `${baseActionId}_adjust`,
          },
        ],
      };

    case "map_question":
      return {
        id: decision.id,
        title: "Mapeo de Pregunta",
        description: decision.promptDescription,
        primaryAction: {
          id: `${baseActionId}_confirm`,
          label: "Confirmar nueva pregunta",
          actionType: `${baseActionId}_confirm_new`,
        },
        secondaryActions: [
          {
            id: `${baseActionId}_non_comparable`,
            label: "Marcar como no comparable",
            actionType: `${baseActionId}_non_comparable`,
          },
        ],
      };

    case "resolve_ambiguity":
      return {
        id: decision.id,
        title: "Resolver Ambigüedad",
        description: decision.promptDescription,
        primaryAction: {
          id: `${baseActionId}_resolve`,
          label: "Resolver ahora",
          actionType: `${baseActionId}_resolve`,
        },
        secondaryActions: [
          {
            id: `${baseActionId}_skip`,
            label: "Revisar siguiente",
            actionType: `${baseActionId}_skip`,
          },
        ],
      };

    case "approve_contract":
      return {
        id: decision.id,
        title: "Aprobar Estructura",
        description: decision.promptDescription,
        primaryAction: {
          id: `${baseActionId}_approve`,
          label: "Aprobar",
          actionType: `${baseActionId}_approve`,
        },
        secondaryActions: [
          {
            id: `${baseActionId}_cancel`,
            label: "Cancelar revisión",
            actionType: `${baseActionId}_cancel`,
          },
        ],
      };

    default:
      return {
        id: decision.id,
        title: "Decisión Requerida",
        description: decision.promptDescription,
        primaryAction: {
          id: `${baseActionId}_confirm`,
          label: "Confirmar",
          actionType: `${baseActionId}_confirm`,
        },
        secondaryActions: [],
      };
  }
}
