import type { ChatFoundationMessage } from "../chat-foundation";
import type {
  ConversationalImportWizardState,
  ConversationalImportWizardStateId
} from "../conversationalWizardTypes";
import type { HistoricalImportFlowAdapterStep } from "./historicalImportFlowAdapterTypes";
import { mapHistoricalImportFlowAdapterMessages } from "./historicalImportFlowAdapterMessageMapper";

export interface HistoricalImportFlowAdapterPlaygroundScenario {
  id: string;
  title: string;
  description: string;
  step: HistoricalImportFlowAdapterStep;
  messages: ChatFoundationMessage[];
}

function createBaseWizardState(
  stateId: ConversationalImportWizardStateId
): ConversationalImportWizardState {
  return {
    stateId,
    selectedScope: "qs_clima_2025",
    generalConfiguration: {
      surveyName: "QS Clima 2025",
      surveyType: "climate",
      visibility: "anonymous",
      surveyEndDate: "2025-12-31",
      confidentialityThreshold: 5,
      mainFileId: "file-main-101",
      associatedFileIds: ["file-assoc-102"],
      reviewState: "pending",
    },
    matchReviewSummaries: [],
    ambiguities: [],
    decisions: [],
    readiness: {
      structureReady: false,
      resultsReady: false,
      draftPreviewReady: false,
      sandboxImportReady: false,
      blockers: [],
      warnings: [],
    },
    sandboxImport: {
      enabled: true,
      confirmedByUser: false,
      completed: false,
      mockResultLink: "",
      mockResultLinkLabel: "",
    },
    activeSection: null,
    activeAmbiguityId: null,
    cancelled: false,
  };
}

export const historicalImportFlowAdapterPlaygroundScenarios: HistoricalImportFlowAdapterPlaygroundScenario[] = [
  {
    id: "scen-files-uploaded",
    title: "1. Archivos Subidos",
    description: "Confirmación de la carga segura de archivos en el sandbox local.",
    step: "files_uploaded",
    messages: mapHistoricalImportFlowAdapterMessages("files_uploaded", createBaseWizardState("files_uploaded")),
  },
  {
    id: "scen-scope-selection",
    title: "2. Selección de Alcance",
    description: "Pregunta al usuario qué ciclo o encuesta desea procesar.",
    step: "awaiting_survey_scope_selection",
    messages: mapHistoricalImportFlowAdapterMessages(
      "awaiting_survey_scope_selection",
      {
        ...createBaseWizardState("awaiting_survey_scope_selection"),
        selectedScope: "unknown",
      }
    ),
  },
  {
    id: "scen-asking-config",
    title: "3. Configuración General",
    description: "Mensaje introductorio a la configuración de datos generales.",
    step: "asking_general_configuration",
    messages: mapHistoricalImportFlowAdapterMessages(
      "asking_general_configuration",
      createBaseWizardState("asking_general_configuration")
    ),
  },
  {
    id: "scen-survey-type",
    title: "4. Tipo de Encuesta",
    description: "Validación y sugerencia sobre el tipo de encuesta detectado.",
    step: "confirming_survey_type",
    messages: mapHistoricalImportFlowAdapterMessages(
      "confirming_survey_type",
      createBaseWizardState("confirming_survey_type")
    ),
  },
  {
    id: "scen-visibility",
    title: "5. Visibilidad",
    description: "Pregunta sobre la visibilidad de los datos (Anónimo o Público).",
    step: "confirming_visibility",
    messages: mapHistoricalImportFlowAdapterMessages(
      "confirming_visibility",
      createBaseWizardState("confirming_visibility")
    ),
  },
  {
    id: "scen-end-date",
    title: "6. Fecha de Finalización",
    description: "Confirmación de la fecha de finalización inferida.",
    step: "confirming_survey_end_date",
    messages: mapHistoricalImportFlowAdapterMessages(
      "confirming_survey_end_date",
      createBaseWizardState("confirming_survey_end_date")
    ),
  },
  {
    id: "scen-structure-match",
    title: "7. Match de Estructura",
    description: "Revisión inicial del mapeo de estructura detectado.",
    step: "reviewing_structure_match",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_structure_match",
      createBaseWizardState("reviewing_structure_match")
    ),
  },
  {
    id: "scen-questions-scales",
    title: "8. Preguntas y Escalas",
    description: "Detalle de preguntas y escalas identificadas.",
    step: "reviewing_questions_and_scales",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_questions_and_scales",
      {
        ...createBaseWizardState("reviewing_questions_and_scales"),
        activeSection: "questions_and_scales",
      }
    ),
  },
  {
    id: "scen-demographics",
    title: "9. Demográficos",
    description: "Campos segmentadores agregados detectados.",
    step: "reviewing_demographics",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_demographics",
      {
        ...createBaseWizardState("reviewing_demographics"),
        activeSection: "demographics",
      }
    ),
  },
  {
    id: "scen-dimensions",
    title: "10. Dimensiones",
    description: "Lista de dimensiones detectadas para las preguntas.",
    step: "reviewing_dimensions",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_dimensions",
      {
        ...createBaseWizardState("reviewing_dimensions"),
        activeSection: "dimensions",
      }
    ),
  },
  {
    id: "scen-question-dimension",
    title: "11. Mapeo Pregunta-Dimensión",
    description: "Asociación detallada de preguntas con dimensiones.",
    step: "reviewing_question_dimension_mapping",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_question_dimension_mapping",
      {
        ...createBaseWizardState("reviewing_question_dimension_mapping"),
        activeSection: "question_dimension_mapping",
      }
    ),
  },
  {
    id: "scen-segments",
    title: "12. Segmentos y Cortes",
    description: "Revisión de los cortes organizacionales detectados.",
    step: "reviewing_segments",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_segments",
      {
        ...createBaseWizardState("reviewing_segments"),
        activeSection: "segments",
      }
    ),
  },
  {
    id: "scen-privacy",
    title: "13. Privacidad y Seguridad",
    description: "Revisión de riesgos de privacidad de datos.",
    step: "reviewing_privacy",
    messages: mapHistoricalImportFlowAdapterMessages(
      "reviewing_privacy",
      {
        ...createBaseWizardState("reviewing_privacy"),
        activeSection: "privacy",
      }
    ),
  },
  {
    id: "scen-ambiguity",
    title: "14. Resolución de Ambigüedad",
    description: "Advertencia sobre conflicto de mapeo de dimensiones.",
    step: "resolving_ambiguity",
    messages: mapHistoricalImportFlowAdapterMessages(
      "resolving_ambiguity",
      {
        ...createBaseWizardState("resolving_ambiguity"),
        activeAmbiguityId: "amb-101",
        ambiguities: [
          {
            id: "amb-101",
            type: "missing_dimension_mapping",
            status: "pending",
            description: "La pregunta '¿Recomendarías trabajar aquí?' no tiene dimensión asignada.",
            options: [
              {
                id: "opt-1",
                label: "Asignar a eNPS",
                description: "Asociar esta pregunta a la dimensión eNPS",
                resultingAction: "rename_dimension"
              },
              {
                id: "opt-2",
                label: "Crear nueva dimensión",
                description: "Crear una dimensión personalizada",
                resultingAction: "rename_dimension"
              }
            ]
          }
        ]
      }
    ),
  },
  {
    id: "scen-structure-approved",
    title: "15. Estructura Aprobada",
    description: "Confirmación de la aprobación local exitosa.",
    step: "structure_approved",
    messages: mapHistoricalImportFlowAdapterMessages(
      "structure_approved",
      createBaseWizardState("structure_approved")
    ),
  },
  {
    id: "scen-draft-ready",
    title: "16. Vista Previa del Borrador",
    description: "Borrador de carga histórica listo para previsualizar.",
    step: "draft_preview_ready",
    messages: mapHistoricalImportFlowAdapterMessages(
      "draft_preview_ready",
      {
        ...createBaseWizardState("draft_preview_ready"),
        readiness: {
          structureReady: true,
          resultsReady: true,
          draftPreviewReady: true,
          sandboxImportReady: true,
          blockers: [],
          warnings: [],
        }
      }
    ),
  },
  {
    id: "scen-awaiting-confirmation",
    title: "17. Confirmación de Importación",
    description: "Simulación de importación en el sandbox.",
    step: "awaiting_import_confirmation",
    messages: mapHistoricalImportFlowAdapterMessages(
      "awaiting_import_confirmation",
      {
        ...createBaseWizardState("awaiting_import_confirmation"),
        sandboxImport: {
          enabled: true,
          confirmedByUser: false,
          completed: false,
          mockResultLink: "",
          mockResultLinkLabel: "",
        }
      }
    ),
  },
  {
    id: "scen-import-cancelled",
    title: "18. Importación Cancelada",
    description: "Cancelación voluntaria del asistente.",
    step: "import_cancelled",
    messages: mapHistoricalImportFlowAdapterMessages(
      "import_cancelled",
      createBaseWizardState("import_cancelled")
    ),
  }
];
