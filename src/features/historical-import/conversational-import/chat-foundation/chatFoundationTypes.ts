/**
 * Phase 11D-H44-H2 · Chat Foundation Types
 * This file contains ONLY types for the conversational chat foundation.
 * No functions, no runtime behavior.
 */

// ============================================================================
// 1. Roles and Message Types
// ============================================================================

export type ChatFoundationRole = 'user' | 'assistant' | 'system';

export type ChatFoundationMessageKind =
  | 'plain_text'
  | 'structured'
  | 'confirmation'
  | 'warning'
  | 'error'
  | 'safe_details'
  | 'thinking'
  | 'handoff';

export type ChatFoundationMessageStatus =
  | 'pending'
  | 'thinking'
  | 'delivered'
  | 'failed'
  | 'blocked';

export type ChatFoundationMessageTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'safety';

export interface ChatFoundationMessage {
  id: string;
  role: ChatFoundationRole;
  kind: ChatFoundationMessageKind;
  status: ChatFoundationMessageStatus;
  tone: ChatFoundationMessageTone;
  content: string;
  metadata?: ChatFoundationRenderMetadata;
}

// ============================================================================
// 2. Render Metadata
// ============================================================================

export interface ChatFoundationRenderMetadata {
  showAvatar?: boolean;
  showAssistantIcon?: boolean;
  showTimestamp?: boolean;
  preserveLineBreaks?: boolean;
  allowSafeMarkdown?: boolean;
  isCompact?: boolean;
}

// ============================================================================
// 3. Thinking Behavior
// ============================================================================

export type ChatFoundationThinkingBehavior = 'default' | 'extended' | 'hidden';

export interface ChatFoundationThinkingPolicy {
  enabled: boolean;
  showBeforeAssistantReply: boolean;
  minimumVisibleMs: number;
  appliesToStates: string[];
}

// ============================================================================
// 4. Actions and Expected Inputs
// ============================================================================

export type ChatFoundationActionKind =
  | 'confirm'
  | 'cancel'
  | 'choose_option'
  | 'request_details'
  | 'provide_text'
  | 'provide_date'
  | 'restart'
  | 'help';

export interface ChatFoundationAction {
  id: string;
  kind: ChatFoundationActionKind;
  label: string;
  payload?: unknown;
}

export type ChatFoundationExpectedInputKind =
  | 'free_text'
  | 'exact_text'
  | 'numbered_option'
  | 'date'
  | 'confirmation'
  | 'cancellation';

export interface ChatFoundationExpectedInput {
  kind: ChatFoundationExpectedInputKind;
  required: boolean;
  options?: string[];
  validationPattern?: string;
}

// ============================================================================
// 5. Intent Normalization
// ============================================================================

export type ChatFoundationIntentKind =
  | 'affirm'
  | 'deny'
  | 'confirm'
  | 'cancel'
  | 'restart'
  | 'help'
  | 'request_details'
  | 'choose_option'
  | 'provide_value'
  | 'unsafe_request'
  | 'unknown';

export interface ChatFoundationNormalizedIntent {
  kind: ChatFoundationIntentKind;
  confidence: number;
  extractedValues?: Record<string, unknown>;
}

// ============================================================================
// 6. Safety Policy
// ============================================================================

export type ChatFoundationSafetyCategory =
  | 'pii_request'
  | 'raw_rows_request'
  | 'open_text_request'
  | 'offensive_language'
  | 'racist_or_discriminatory_language'
  | 'out_of_scope_action'
  | 'real_import_without_authorization'
  | 'api_connection_without_authorization'
  | 'unknown';

export interface ChatFoundationSafetyResponse {
  category: ChatFoundationSafetyCategory;
  tone: ChatFoundationMessageTone;
  message: string;
  allowedAlternative?: string;
  blocksFlow: boolean;
}

export interface ChatFoundationSafetyPolicy {
  id: string;
  strictMode: boolean;
  responses: Record<ChatFoundationSafetyCategory, ChatFoundationSafetyResponse>;
}

// ============================================================================
// 7. Conversation Policy
// ============================================================================

export type ChatFoundationCommonResponseKind =
  | 'ambiguous_input'
  | 'invalid_option'
  | 'confirmation_required'
  | 'cancelled'
  | 'restarted'
  | 'help'
  | 'safe_details_unavailable'
  | 'safety_block'
  | 'out_of_scope';

export interface ChatFoundationCommonResponse {
  kind: ChatFoundationCommonResponseKind;
  messageTemplate: string;
  tone: ChatFoundationMessageTone;
}

export interface ChatFoundationConversationPolicy {
  id: string;
  commonResponses: Record<ChatFoundationCommonResponseKind, ChatFoundationCommonResponse>;
}

// ============================================================================
// 8. Flow Adapter Contract
// ============================================================================

export type ChatFoundationFlowStepStatus = 'idle' | 'in_progress' | 'completed' | 'error';

export interface ChatFoundationFlowStep {
  id: string;
  status: ChatFoundationFlowStepStatus;
  description: string;
}

export interface ChatFoundationFlowAdapterState {
  id: string;
  name: string;
}

export interface ChatFoundationFlowAdapterSnapshot {
  flowId: string;
  flowName: string;
  currentStateId: string;
  currentStep: ChatFoundationFlowStep | null;
  availableActions: ChatFoundationAction[];
  expectedInputs: ChatFoundationExpectedInput[];
  messages: ChatFoundationMessage[];
  blockingReason?: string;
  nextStateId?: string;
}

// ============================================================================
// 9. Domain Flow Contract
// ============================================================================

export interface ChatFoundationDomainFlowDefinition {
  flowId: string;
  flowName: string;
  description: string;
  states: ChatFoundationFlowAdapterState[];
  entryStateId: string;
  terminalStateIds: string[];
  safetyPolicyId: string;
}

// ============================================================================
// 10. Behavior Invariants
// ============================================================================

export interface ChatFoundationBehaviorInvariants {
  assistantAvatarAlwaysVisible: boolean;
  assistantIconSystemConsistent: boolean;
  thinkingIndicatorBeforeAgentReply: boolean;
  noDirectAgentReplyWithoutThinking: boolean;
  userMessageStyleConsistent: boolean;
  assistantMessageStyleConsistent: boolean;
  systemWarningStyleConsistent: boolean;
  errorMessageStyleConsistent: boolean;
  safeDetailsRendering: boolean;
  noRawMarkdownLeaks: boolean;
  noBrokenIconRendering: boolean;
}
