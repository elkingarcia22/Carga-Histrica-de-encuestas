/**
 * Phase 11D-H48 · Ambiguity Conversation Mapper
 *
 * Pure, deterministic mapper that translates an AmbiguityResolutionSnapshot
 * into an ordered array of ChatFoundationMessage instances.
 *
 * Rules (strict):
 * - No `any`, no `as any`, no `any[]`.
 * - No Date, no Math.random.
 * - No localStorage, sessionStorage, IndexedDB.
 * - No fetch, no API calls.
 * - No side effects, no mutation of input.
 * - No JSX, no components, no hooks, no routes.
 * - No PII, no raw rows, no open text, no workbook data dumps.
 * - IDs are deterministic (ambiguityId-based, role/kind-derived).
 * - Does not apply resolutions (H49 responsibility).
 * - Does not integrate into any runtime.
 *
 * References:
 * - docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md
 * - docs/CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE.md
 * - src/features/historical-import/conversational-import/ambiguity-resolution/ambiguityResolutionTypes.ts
 * - src/features/historical-import/conversational-import/chat-foundation/chatFoundationTypes.ts
 */

import type {
  AmbiguityResolutionSnapshot,
  ActiveAmbiguity,
} from './ambiguityResolutionTypes';
import type {
  ChatFoundationMessage,
} from '../chat-foundation/chatFoundationTypes';

// ============================================================================
// 1. Internal helpers
// ============================================================================

/**
 * Builds a deterministic message ID from the ambiguity id, a stable role slug,
 * and a kind slug.
 *
 * Format: `amb-conv-{ambiguityId}-{role}-{kind}`
 */
function buildMessageId(ambiguityId: string, role: string, kind: string): string {
  return `amb-conv-${ambiguityId}-${role}-${kind}`;
}

/**
 * Returns the question text appropriate for the ambiguity's expectedInput kind.
 */
function buildQuestionText(ambiguity: ActiveAmbiguity): string {
  switch (ambiguity.expectedInput.kind) {
    case 'numeric_choice':
      return `¿Cuál opción prefieres? Responde 1, 2${ambiguity.options.length > 2 ? `, 3${ambiguity.options.length > 3 ? `, ${String(ambiguity.options.length)}` : ''}` : ''}.`;
    case 'free_text':
      return 'Por favor, escribe tu respuesta.';
    case 'confirmation':
      return '¿Confirmas que la información es correcta?';
    case 'clarification':
      return 'Por favor, proporciona más detalles.';
  }
}

/**
 * Returns the expected input hint text for the ambiguity's expectedInput kind.
 */
function buildExpectedInputHint(ambiguity: ActiveAmbiguity): string {
  switch (ambiguity.expectedInput.kind) {
    case 'numeric_choice':
      return `Respuesta esperada: número de opción (1-${String(ambiguity.options.length)}).`;
    case 'free_text':
      return 'Respuesta esperada: texto libre.';
    case 'confirmation':
      return 'Respuesta esperada: sí o no.';
    case 'clarification':
      return 'Respuesta esperada: texto explicativo.';
  }
}

/**
 * Returns the privacy warning text when the ambiguity has privacy risk.
 */
const PRIVACY_WARNING_TEXT =
  'Esta información puede afectar la privacidad de los participantes. Por favor, confirma el tratamiento seguro antes de continuar.';

/**
 * Returns the blocking error text when the ambiguity is blocking.
 */
function buildBlockingReasonText(ambiguity: ActiveAmbiguity): string {
  return ambiguity.blockingReason ?? 'El flujo está bloqueado hasta que resuelvas esta ambigüedad.';
}

/**
 * Returns the redirect message content for OutOfScopeRequestAmbiguity.
 */
const OUT_OF_SCOPE_REDIRECT_TEXT =
  'Puedes continuar con la preparación de la carga histórica en cualquier momento.';

// ============================================================================
// 2. Public mapper function
// ============================================================================

/**
 * Maps an AmbiguityResolutionSnapshot to an ordered array of ChatFoundationMessages.
 *
 * When there is no active ambiguity, returns an empty array (the runtime / renderer
 * can handle this gracefully).
 *
 * When there is an active ambiguity, produces messages following this pattern:
 * 1. Thinking (assistant, thinking kind)
 * 2. Explanation (assistant, plain_text)
 * 3. Impact (assistant, safe_details)
 * 4. Numbered options (assistant, plain_text) — if options exist
 * 5. Question (assistant, plain_text)
 * 6. Expected input hint (assistant, plain_text)
 * 7. Privacy warning (assistant, warning kind) — if privacyRisk is true
 * 8. Blocking error (assistant, error kind) — if severity is blocking (excludes OutOfScope)
 * 9. Safe redirect (assistant, handoff kind) — if OutOfScopeRequestAmbiguity
 *
 * Rules:
 * - Pure and deterministic: same input always produces same output.
 * - No side effects.
 * - Does not mutate the input.
 * - No `any`, no `as any`, no Date, no Math.random.
 * - No PII, no raw rows, no workbook data.
 * - Does not apply resolutions (H49 responsibility).
 *
 * @param snapshot - An AmbiguityResolutionSnapshot from H47 detection mapper.
 * @returns An ordered array of ChatFoundationMessage instances.
 */
export function mapAmbiguityResolutionToChatMessages(
  snapshot: AmbiguityResolutionSnapshot,
): ChatFoundationMessage[] {
  const { activeAmbiguity } = snapshot;

  if (activeAmbiguity === undefined) {
    return [];
  }

  const ambiguity = activeAmbiguity;

  // We create a non-mutated copy by building the array sequentially.
  const messages: ChatFoundationMessage[] = [];

  // Shared metadata for messages that preserve line breaks
  const LINE_BREAK_META = { preserveLineBreaks: true } as const;

  // ------------------------------------------------------------------
  // 1. Thinking message
  // ------------------------------------------------------------------
  messages.push({
    id: buildMessageId(ambiguity.id, 'assistant', 'thinking'),
    role: 'assistant',
    kind: 'thinking',
    status: 'delivered',
    tone: 'info',
    content: 'Analizando información disponible...',
    metadata: {
      showAvatar: true,
      showAssistantIcon: true,
    },
  });

  // ------------------------------------------------------------------
  // 2. Explanation message
  // ------------------------------------------------------------------
  messages.push({
    id: buildMessageId(ambiguity.id, 'assistant', 'explanation'),
    role: 'assistant',
    kind: 'plain_text',
    status: 'delivered',
    tone: 'neutral',
    content: ambiguity.userFacingExplanation,
    metadata: LINE_BREAK_META,
  });

  // ------------------------------------------------------------------
  // 3. Impact message
  // ------------------------------------------------------------------
  messages.push({
    id: buildMessageId(ambiguity.id, 'assistant', 'impact'),
    role: 'assistant',
    kind: 'safe_details',
    status: 'delivered',
    tone: 'info',
    content: ambiguity.impactSummary,
    metadata: LINE_BREAK_META,
  });

  // ------------------------------------------------------------------
  // 4. Numbered options as text (only when options exist)
  // ------------------------------------------------------------------
  if (ambiguity.options.length > 0) {
    const optionsContent = ambiguity.options
      .map((opt, idx) => {
        const label = opt.label;
        const recommended = opt.isRecommended === true ? ' (Recomendado)' : '';
        return `${String(idx + 1)}. ${label}${recommended}`;
      })
      .join('\n');

    messages.push({
      id: buildMessageId(ambiguity.id, 'assistant', 'options'),
      role: 'assistant',
      kind: 'plain_text',
      status: 'delivered',
      tone: 'neutral',
      content: optionsContent,
      metadata: LINE_BREAK_META,
    });
  }

  // ------------------------------------------------------------------
  // 5. Question message
  // ------------------------------------------------------------------
  const questionText = buildQuestionText(ambiguity);
  messages.push({
    id: buildMessageId(ambiguity.id, 'assistant', 'question'),
    role: 'assistant',
    kind: 'plain_text',
    status: 'delivered',
    tone: 'neutral',
    content: questionText,
    metadata: LINE_BREAK_META,
  });

  // ------------------------------------------------------------------
  // 6. Expected input hint
  // ------------------------------------------------------------------
  const expectedInputText = buildExpectedInputHint(ambiguity);
  messages.push({
    id: buildMessageId(ambiguity.id, 'assistant', 'expected-input'),
    role: 'assistant',
    kind: 'plain_text',
    status: 'delivered',
    tone: 'info',
    content: expectedInputText,
    metadata: LINE_BREAK_META,
  });

  // ------------------------------------------------------------------
  // 7. Privacy warning
  // ------------------------------------------------------------------
  if (ambiguity.privacyFlags.privacyRisk) {
    messages.push({
      id: buildMessageId(ambiguity.id, 'assistant', 'privacy-warning'),
      role: 'assistant',
      kind: 'warning',
      status: ambiguity.severity === 'blocking' ? 'blocked' : 'delivered',
      tone: 'warning',
      content: PRIVACY_WARNING_TEXT,
      metadata: LINE_BREAK_META,
    });
  }

  // ------------------------------------------------------------------
  // 8. Blocking error (for blocking severity, excluding OutOfScope
  //    which has its own redirect handling)
  // ------------------------------------------------------------------
  if (
    ambiguity.severity === 'blocking' &&
    ambiguity.type !== 'OutOfScopeRequestAmbiguity'
  ) {
    messages.push({
      id: buildMessageId(ambiguity.id, 'assistant', 'blocking'),
      role: 'assistant',
      kind: 'error',
      status: 'blocked',
      tone: 'error',
      content: buildBlockingReasonText(ambiguity),
      metadata: LINE_BREAK_META,
    });
  }

  // ------------------------------------------------------------------
  // 9. Safe redirect for OutOfScopeRequestAmbiguity
  // ------------------------------------------------------------------
  if (ambiguity.type === 'OutOfScopeRequestAmbiguity') {
    messages.push({
      id: buildMessageId(ambiguity.id, 'assistant', 'redirect'),
      role: 'assistant',
      kind: 'handoff',
      status: 'delivered',
      tone: 'info',
      content: OUT_OF_SCOPE_REDIRECT_TEXT,
      metadata: LINE_BREAK_META,
    });
  }

  return messages;
}
