/**
 * Phase 11D-H46 · Ambiguity Resolution Types
 *
 * Pure type contracts for the Ambiguity Resolution Flow within the
 * Conversational Historical Import Wizard.
 *
 * Rules:
 * - No functions, no runtime logic, no side effects.
 * - No `any`, no `as any`, no `any[]`.
 * - No Date, no Math.random, no localStorage, no sessionStorage.
 * - No fetch, no API calls.
 * - No PII, no raw rows, no open text, no workbook data dumps.
 * - No JSX, no components, no hooks, no routes.
 *
 * References:
 * - docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md
 * - docs/CONTROLLED_RUNTIME_INTEGRATION_ARCHITECTURE.md
 * - docs/HISTORICAL_IMPORT_FLOW_ADAPTER_ARCHITECTURE.md
 * - docs/CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE.md
 */

// ============================================================================
// 1. Ambiguity Type Union
// ============================================================================

/**
 * Canonical taxonomy of ambiguity categories that can arise during the
 * conversational historical import preparation flow.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md §3
 */
export type AmbiguityType =
  | 'MultipleSurveyScopeAmbiguity'
  | 'SurveyNameAmbiguity'
  | 'SurveyTypeAmbiguity'
  | 'VisibilityAmbiguity'
  | 'EndDateAmbiguity'
  | 'MainFileAmbiguity'
  | 'AssociatedFilesAmbiguity'
  | 'QuestionScaleAmbiguity'
  | 'DemographicMappingAmbiguity'
  | 'DimensionMappingAmbiguity'
  | 'SegmentCutAmbiguity'
  | 'PrivacyThresholdAmbiguity'
  | 'DuplicateOrConflictAmbiguity'
  | 'OutOfScopeRequestAmbiguity';

// ============================================================================
// 2. Severity
// ============================================================================

/**
 * Severity level of an active ambiguity.
 *
 * - `low`      — Informational; flow can proceed with assumption.
 * - `medium`   — Should be resolved but does not block draft preparation.
 * - `high`     — Must be resolved before structure can be approved.
 * - `blocking` — Halts the flow entirely until the user clarifies.
 */
export type AmbiguitySeverity = 'low' | 'medium' | 'high' | 'blocking';

// ============================================================================
// 3. Ambiguity Resolution Flow State
// ============================================================================

/**
 * Finite state of the ambiguity resolution sub-flow within the conversational
 * import wizard.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md §5
 */
export type AmbiguityResolutionFlowState =
  | 'no_ambiguity'
  | 'ambiguity_detected'
  | 'asking_resolution_question'
  | 'waiting_for_user_resolution'
  | 'resolution_received'
  | 'resolution_validated'
  | 'resolution_rejected'
  | 'resolution_applied_to_draft'
  | 'needs_followup_question'
  | 'blocked_until_user_clarifies'
  | 'out_of_scope_redirected';

// ============================================================================
// 4. Resolution Option
// ============================================================================

/**
 * A single numbered option offered to the user for resolving an ambiguity
 * within the chat conversation.
 *
 * Rules:
 * - `id` must be deterministic (e.g. derived from type + position index).
 * - No callbacks, no handlers, no JSX, no component references.
 */
export interface AmbiguityResolutionOption {
  /** Deterministic identifier for this option (e.g. "survey-scope-opt-1"). */
  readonly id: string;
  /** Short visible label the assistant displays inline (e.g. "QS Clima 2025"). */
  readonly label: string;
  /** Optional extended description for complex options. */
  readonly description?: string;
  /** Whether the system recommends this option. */
  readonly isRecommended?: boolean;
  /** Optional note flagging any privacy or safety consideration for this option. */
  readonly safetyNote?: string;
}

// ============================================================================
// 5. Expected Input Type
// ============================================================================

/**
 * The kind of response expected from the user to resolve the current ambiguity.
 */
export type AmbiguityExpectedInputKind =
  | 'numeric_choice'
  | 'free_text'
  | 'confirmation'
  | 'clarification';

/**
 * Configuration for the type of user response required to resolve an ambiguity.
 */
export interface AmbiguityExpectedInput {
  /** The kind of response expected. */
  readonly kind: AmbiguityExpectedInputKind;
  /** Whether a response is mandatory before the flow can continue. */
  readonly required: boolean;
  /**
   * For `numeric_choice`, the valid option ids in display order.
   * For other kinds, this field should be omitted.
   */
  readonly validOptionIds?: readonly string[];
}

// ============================================================================
// 6. Privacy Flags
// ============================================================================

/**
 * Privacy and safety flags attached to an active ambiguity.
 *
 * Used by future phases to block flow advancement, redact content, or require
 * explicit user confirmation before proceeding.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md §11
 */
export interface AmbiguityPrivacyFlags {
  /**
   * Whether this ambiguity involves data that could expose sensitive group
   * sizes or personal identifiers.
   */
  readonly privacyRisk: boolean;
  /**
   * Whether the content derived from this ambiguity is safe to render in
   * the chat timeline without redaction.
   */
  readonly safeToRender: boolean;
  /**
   * Whether the user must explicitly confirm before the system applies the
   * resolution to the draft.
   */
  readonly requiresExplicitConfirmation: boolean;
  /**
   * Whether automated redaction was applied before surfacing this ambiguity
   * to the chat layer.
   */
  readonly redactionApplied: boolean;
}

// ============================================================================
// 7. Active Ambiguity Entity
// ============================================================================

/**
 * The primary contract for a single active ambiguity during the conversational
 * import preparation flow.
 *
 * Rules:
 * - No raw workbook rows.
 * - No PII fields.
 * - No unsanitized open text from survey respondents.
 * - No binary or file content references.
 *
 * Defined by: docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md §4
 */
export interface ActiveAmbiguity {
  /** Deterministic unique identifier for this ambiguity instance. */
  readonly id: string;
  /** Canonical ambiguity category. */
  readonly type: AmbiguityType;
  /**
   * The wizard step id at which this ambiguity was detected.
   * Must align with HistoricalImportFlowAdapterStep values.
   */
  readonly detectedAtStep: string;
  /** Severity of this ambiguity within the import flow. */
  readonly severity: AmbiguitySeverity;
  /**
   * System confidence level (0–1) in the inference that triggered this
   * ambiguity. Higher means the system is more certain about the ambiguity.
   */
  readonly confidence: number;
  /**
   * Plain-language explanation rendered for the user in the chat, explaining
   * what was detected and why clarification is needed.
   * Must not contain PII, raw rows, or open text.
   */
  readonly userFacingExplanation: string;
  /**
   * Brief summary of the impact on the draft if this ambiguity is left
   * unresolved.
   */
  readonly impactSummary: string;
  /** Numbered options offered to the user. May be empty for free-text cases. */
  readonly options: readonly AmbiguityResolutionOption[];
  /**
   * The `id` of the option recommended by the system, if any.
   * Must correspond to an id present in `options`.
   */
  readonly recommendedOptionId?: string;
  /** The type of user response required to resolve this ambiguity. */
  readonly expectedInput: AmbiguityExpectedInput;
  /** Current state of this ambiguity within the resolution sub-flow. */
  readonly status: AmbiguityResolutionFlowState;
  /**
   * Internal note for audit trail purposes. Not rendered directly to the user.
   */
  readonly auditNote: string;
  /** Privacy and safety flags governing rendering and flow continuation. */
  readonly privacyFlags: AmbiguityPrivacyFlags;
  /**
   * Reason why the flow is blocked, if `status` is `blocked_until_user_clarifies`
   * or `severity` is `blocking`. Omitted otherwise.
   */
  readonly blockingReason?: string;
}

// ============================================================================
// 8. Resolution Received
// ============================================================================

/**
 * Contract for a user-submitted resolution to an active ambiguity.
 *
 * Rules:
 * - `rawUserInputSanitized` must have been sanitized before being stored here.
 * - No raw open text from survey data.
 * - No PII.
 */
export interface AmbiguityResolutionReceived {
  /** The id of the ambiguity this resolution targets. */
  readonly ambiguityId: string;
  /**
   * The user's raw input after client-side sanitization (trimmed, length-capped,
   * stripped of control characters). Must not contain PII or raw file content.
   */
  readonly rawUserInputSanitized: string;
  /**
   * The normalized option id if the user selected a numbered option.
   * Omitted for free-text or confirmation responses.
   */
  readonly normalizedSelectionId?: string;
  /**
   * Normalized free text derived from the user's input, after intent
   * normalization. Omitted for numeric_choice responses.
   */
  readonly normalizedText?: string;
  /** Whether this resolution passes validation. */
  readonly isValid: boolean;
  /** Human-readable validation message if the resolution is invalid. */
  readonly validationMessage?: string;
  /**
   * Whether the system needs to ask a follow-up question before applying
   * this resolution to the draft.
   */
  readonly requiresFollowup: boolean;
}

// ============================================================================
// 9. Ambiguity Snapshot
// ============================================================================

/**
 * Point-in-time snapshot of all ambiguity resolution state within the wizard.
 *
 * Designed to be consumed by future mappers (H47, H48) and the Flow Adapter
 * (H49) without coupling those layers to the internal resolution logic.
 */
export interface AmbiguityResolutionSnapshot {
  /**
   * The single ambiguity currently being resolved, if any.
   * Only one ambiguity is active at a time (one-at-a-time principle).
   */
  readonly activeAmbiguity?: ActiveAmbiguity;
  /**
   * Ordered list of ambiguities that have reached a terminal resolved state
   * (`resolution_applied_to_draft` or `out_of_scope_redirected`).
   */
  readonly resolvedAmbiguities: readonly ActiveAmbiguity[];
  /**
   * Ambiguities detected but not yet presented to the user.
   * Processed in order; only the first is surfaced at a time.
   */
  readonly pendingAmbiguities: readonly ActiveAmbiguity[];
  /** The most recent resolution submitted by the user, if any. */
  readonly lastResolution?: AmbiguityResolutionReceived;
  /**
   * True if any ambiguity in `activeAmbiguity` or `pendingAmbiguities` has
   * `severity === 'blocking'`. Used to gate draft preparation.
   */
  readonly hasBlockingAmbiguity: boolean;
}
