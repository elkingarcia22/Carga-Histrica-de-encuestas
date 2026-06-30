/**
 * Phase 11D-H54 · Resolution Application Types
 *
 * Pure type contracts for the Ambiguity Resolution Application Layer,
 * designed in docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md.
 *
 * Rules:
 * - No functions, no runtime logic, no side effects.
 * - No `any`, no `as any`, no `any[]`.
 * - No Date, no Math.random, no localStorage, no sessionStorage.
 * - No fetch, no API calls.
 * - No PII, no raw rows, no open text, no workbook data dumps.
 * - No JSX, no components, no hooks, no routes.
 * - No React imports.
 *
 * References:
 * - docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md
 * - src/.../ambiguity-resolution/ambiguityResolutionTypes.ts
 */

import type {
  ActiveAmbiguity,
  AmbiguityType,
  AmbiguityPrivacyFlags,
} from './ambiguityResolutionTypes';

// ============================================================================
// 1. Application Status Union
// ============================================================================

/**
 * Finite set of possible outcomes when the application layer processes a
 * user's text response against an active ambiguity.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md §4
 */
export type AmbiguityResolutionApplicationStatus =
  | 'applied'
  | 'invalid_input'
  | 'needs_clarification'
  | 'blocked_privacy'
  | 'out_of_scope_redirect'
  | 'no_active_ambiguity';

// ============================================================================
// 2. Sanitized Workspace State Snapshot
// ============================================================================

/**
 * Minimal, sanitized snapshot of the ConversationalImportWorkspace state
 * needed by the resolution application layer.
 *
 * Rules:
 * - No raw rows, no workbook data, no response-level open text.
 * - No PII, no real client data.
 * - Only structural metadata derived from safe analysis.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md §3
 */
export interface WorkspaceResolutionSnapshot {
  /**
   * The currently selected survey scope identifier, or null if none selected.
   * Examples: "qs_clima_2025", "qs_clima_2024", "qs_clima_multicycle_2024_2025"
   */
  readonly selectedSurveyScopeId: string | null;

  /** The current wizard step id (e.g. "awaiting_survey_scope_selection"). */
  readonly currentStep: string;

  /** True if a survey scope has been selected. */
  readonly hasSelectedScope: boolean;

  /** True if general configuration has been at least partially configured. */
  readonly hasConfiguredGeneralSettings: boolean;

  /** Sanitized labels for staged files (no paths, no contents). */
  readonly safeFileLabels: readonly string[];

  /** Sanitized labels for detected survey cycles (no raw metadata). */
  readonly safeCycleLabels: readonly string[];
}

// ============================================================================
// 3. Resolution Application Input
// ============================================================================

/**
 * Sanitized input contract for the ambiguity resolution application layer.
 *
 * All fields are pre-sanitized — no PII, no raw rows, no open text, no
 * workbook data dumps, no real client data.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md §3
 */
export interface AmbiguityResolutionApplicationInput {
  /**
   * The currently active ambiguity to resolve.
   * Undefined if no ambiguity is active.
   */
  readonly activeAmbiguity: ActiveAmbiguity | undefined;

  /**
   * The user's text response, already sanitized (trimmed, length-capped,
   * stripped of control characters).
   */
  readonly userTextSanitized: string;

  /**
   * Minimal snapshot of the current workspace state.
   * Provides context for state patch generation.
   */
  readonly workspaceSnapshot: WorkspaceResolutionSnapshot;

  /**
   * Available resolution options derived from the active ambiguity.
   * Empty for free_text, confirmation, or clarification kinds.
   */
  readonly availableOptions: ActiveAmbiguity['options'];

  /** The current wizard step where this ambiguity was detected. */
  readonly currentWizardStep: string;

  /**
   * Privacy flags governing how this ambiguity must be handled.
   * When `privacyRisk` is true, the resolution must be blocked.
   */
  readonly privacyFlags: AmbiguityPrivacyFlags;
}

// ============================================================================
// 4. Survey Scope Selection State Patch
// ============================================================================

/**
 * State patch produced when a MultipleSurveyScopeAmbiguity is resolved.
 *
 * Maps a user's numeric selection (1, 2, 3) to a concrete survey scope
 * identifier and advances the flow to general configuration.
 */
export interface SurveyScopeSelectionPatch {
  /** The selected survey scope identifier. */
  readonly selectedSurveyScopeId: string;

  /** The scope label safe for display (e.g. "QS Clima 2025"). */
  readonly safeScopeLabel: string;

  /** The next wizard step after applying this patch. */
  readonly nextWizardStep: string;
}

// ============================================================================
// 5. State Patch Discriminated Union
// ============================================================================

/**
 * Discriminated union of state patches by ambiguity type.
 *
 * Each ambiguity type produces a specific patch shape. This union ensures
 * the workspace receives only valid patches for the resolved type.
 *
 * Currently supported:
 * - MultipleSurveyScopeAmbiguity → SurveyScopeSelectionPatch
 *
 * Future types will be added as discriminated members.
 */
export type AmbiguityResolutionStatePatch =
  | {
      readonly ambiguityType: 'MultipleSurveyScopeAmbiguity';
      readonly patch: SurveyScopeSelectionPatch;
    };

// ============================================================================
// 6. Next Workspace Step
// ============================================================================

/**
 * The next wizard step to transition to after applying a resolution.
 *
 * Aligned with wizard state ids used in ConversationalImportWorkspace.
 * Only includes steps reachable after resolving an ambiguity.
 */
export type NextWorkspaceStep =
  | 'confirming_survey_name'
  | 'confirming_survey_type'
  | 'confirming_visibility'
  | 'confirming_survey_end_date'
  | 'confirming_confidentiality_threshold'
  | 'confirming_main_file'
  | 'confirming_associated_files'
  | 'reviewing_structure_match';

// ============================================================================
// 7. Agent Follow-up Message Intent
// ============================================================================

/**
 * Semantic intent for the assistant's follow-up message after a resolution
 * is applied. Used by the workspace to construct the next chat message
 * without coupling the application layer to Chat Foundation message types.
 *
 * Each intent corresponds to a specific conversational pattern defined
 * in the flow adapter or workspace message builder.
 */
export type AgentFollowUpMessageIntent =
  | 'scope_selected_proceed_to_general_config'
  | 'scope_invalid_retry_options'
  | 'privacy_blocked_explain_and_retry'
  | 'out_of_scope_redirect_to_flow'
  | 'no_active_ambiguity_proceed_normal';

// ============================================================================
// 8. Resolution Application Result
// ============================================================================

/**
 * Typed result produced by the ambiguity resolution application layer.
 *
 * The workspace consumes this result to:
 * - Apply the state patch (if status is `applied`).
 * - Display a validation message (if status is `invalid_input`).
 * - Block flow advancement (if status is `blocked_privacy`).
 * - Redirect the user (if status is `out_of_scope_redirect`).
 * - Continue normal flow (if status is `no_active_ambiguity`).
 *
 * Rules:
 * - No PII, no raw rows, no open text, no workbook dump.
 * - All string fields are safe to render in chat.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md §4
 */
export interface AmbiguityResolutionApplicationResult {
  /**
   * The outcome of processing the user input against the active ambiguity.
   */
  readonly status: AmbiguityResolutionApplicationStatus;

  /**
   * Deterministic identifier for this resolution attempt.
   * Format: `resolution-{ambiguityId}-{turn}`.
   */
  readonly resolutionId: string;

  /** The type of ambiguity that was targeted. */
  readonly ambiguityType: AmbiguityType | undefined;

  /**
   * The id of the option selected by the user, if applicable.
   * Present when status is `applied` and expectedInput.kind was `numeric_choice`.
   */
  readonly selectedOptionId: string | undefined;

  /**
   * The state patch to apply, if the resolution was successfully applied.
   * Present only when status is `applied`.
   */
  readonly statePatch: AmbiguityResolutionStatePatch | undefined;

  /**
   * The next wizard step to transition to, if applicable.
   * Present when status is `applied`.
   */
  readonly nextWorkspaceStep: NextWorkspaceStep | undefined;

  /**
   * Semantic intent for the assistant's follow-up message.
   * Present when status is `applied` or `invalid_input`.
   */
  readonly agentFollowUpMessageIntent: AgentFollowUpMessageIntent | undefined;

  /**
   * Human-readable message for the user when input is invalid, privacy is
   * blocked, or clarification is needed. Safe to render in chat.
   */
  readonly validationMessage: string | undefined;

  /**
   * Privacy-safe details about the resolution, for audit or safe display.
   * Present only when privacyFlags require explanation.
   * No PII, no raw rows, no open text.
   */
  readonly privacySafeDetails: string | undefined;

  /**
   * Internal audit note. Not rendered to the user.
   */
  readonly auditNote: string;
}

// ============================================================================
// 9. MultipleSurveyScope Resolution Mapping
// ============================================================================

/**
 * Mapping from user text input to a resolved survey scope.
 *
 * This is a data-only contract describing how "1", "2", "3" map to
 * concrete scope identifiers. No parsing logic here — the mapper
 * (H55) will consume this contract.
 */
export interface MultipleSurveyScopeOptionMapping {
  /** The option id from the ambiguity (e.g. "multiple-survey-scope-ambiguity-opt-1"). */
  readonly optionId: string;

  /** The user-facing label (e.g. "QS Clima 2025"). */
  readonly label: string;

  /** The resolved scope identifier (e.g. "qs_clima_2025"). */
  readonly scopeId: string;

  /** The next wizard step after selecting this scope. */
  readonly nextStep: NextWorkspaceStep;

  /** The follow-up message intent after selecting this scope. */
  readonly followUpIntent: AgentFollowUpMessageIntent;
}
