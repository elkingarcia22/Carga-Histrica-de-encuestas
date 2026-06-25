import type { ChatFoundationMessage } from "../chat-foundation";
import type { ConversationalImportWizardState } from "../conversationalWizardTypes";

/**
 * Historical Import Flow Adapter Step representing the active phase of the conversational wizard.
 */
export type HistoricalImportFlowAdapterStep =
  | "idle"
  | "files_uploaded"
  | "detecting_survey_scope"
  | "awaiting_survey_scope_selection"
  | "asking_general_configuration"
  | "confirming_survey_name"
  | "confirming_survey_type"
  | "confirming_visibility"
  | "confirming_survey_end_date"
  | "confirming_confidentiality_threshold"
  | "confirming_main_file"
  | "confirming_associated_files"
  | "reviewing_structure_match"
  | "reviewing_questions_and_scales"
  | "reviewing_demographics"
  | "reviewing_participants_or_responses"
  | "reviewing_dimensions"
  | "reviewing_question_dimension_mapping"
  | "reviewing_segments"
  | "reviewing_privacy"
  | "resolving_ambiguity"
  | "structure_approved"
  | "reviewing_detected_results"
  | "draft_preview_ready"
  | "awaiting_import_confirmation"
  | "sandbox_import_completed"
  | "import_cancelled";

/**
 * Historical Import Flow Adapter Action Type represents the specific commands recognized by the business flow.
 */
export type HistoricalImportFlowAdapterActionType =
  | "confirm_current_step"
  | "choose_scope"
  | "choose_survey_type"
  | "choose_visibility"
  | "provide_survey_name"
  | "provide_survey_end_date"
  | "provide_confidentiality_threshold"
  | "confirm_main_file"
  | "confirm_associated_files"
  | "request_details"
  | "rename_dimension"
  | "rename_question"
  | "approve_structure"
  | "cancel_import"
  | "restart_flow";

/**
 * Specific typed action details for the flow adapter, preventing any "any" usage.
 */
export interface HistoricalImportFlowAdapterAction {
  type: HistoricalImportFlowAdapterActionType;
  payload?: {
    scopeId?: string;
    surveyType?: string;
    visibility?: string;
    surveyName?: string;
    endDate?: string;
    confidentialityThreshold?: number;
    fileId?: string;
    dimensionId?: string;
    questionId?: string;
    newName?: string;
    detailsRequestKind?: string;
  };
}

/**
 * Input kinds that the conversational interface expects from the user in a given state.
 */
export type HistoricalImportFlowAdapterExpectedInputType =
  | "numbered_option"
  | "exact_text"
  | "free_text"
  | "confirmation"
  | "cancellation"
  | "date"
  | "number"
  | "request_details";

/**
 * Input expectations configuration with explicit constraint typing.
 */
export interface HistoricalImportFlowAdapterExpectedInput {
  type: HistoricalImportFlowAdapterExpectedInputType;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  format?: string;
}

/**
 * Safety validation categories specific to the historical import flow boundaries.
 */
export type HistoricalImportFlowAdapterSafetySignal =
  | "pii_request"
  | "raw_rows_request"
  | "open_text_request"
  | "offensive_language"
  | "discriminatory_language"
  | "real_import_without_authorization"
  | "api_connection_without_authorization"
  | "out_of_scope";

/**
 * Current safety status evaluated by the flow adapter.
 */
export interface HistoricalImportFlowAdapterSafetyState {
  hasViolation: boolean;
  blockedSignal?: HistoricalImportFlowAdapterSafetySignal;
  reason?: string;
}

/**
 * Thinking indicator configuration to instruct Chat Foundation visual cues.
 */
export interface HistoricalImportFlowAdapterThinkingState {
  shouldShow: boolean;
  reason?: string;
  source?: string;
}

/**
 * Metadata configuration containing structural settings and IDs.
 * Strictly free of PII or raw rows.
 */
export interface HistoricalImportFlowAdapterMetadata {
  selectedScopeId?: string;
  selectedCycleId?: string;
  currentSectionId?: string;
  currentQuestionId?: string;
  currentDimensionId?: string;
  currentSegmentId?: string;
  mainFileId?: string;
  associatedFileIds?: string[];
  privacyMode?: string;
  confidentialityThreshold?: number;
}

/**
 * Complete state snapshot of the adapter translated for Chat Foundation consumption.
 */
export interface HistoricalImportFlowAdapterSnapshot {
  step: HistoricalImportFlowAdapterStep;
  wizardState: ConversationalImportWizardState;
  messages: ChatFoundationMessage[];
  availableActions: HistoricalImportFlowAdapterAction[];
  expectedInputs: HistoricalImportFlowAdapterExpectedInput[];
  safety: HistoricalImportFlowAdapterSafetyState;
  thinking: HistoricalImportFlowAdapterThinkingState;
  metadata: HistoricalImportFlowAdapterMetadata;
}
