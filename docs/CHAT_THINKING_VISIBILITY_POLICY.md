# Chat Thinking Visibility Policy

<!-- PHASE_11F_F_H3_E_B_SELECTIVE_THINKING_VISIBILITY_IMPLEMENTED -->
<!-- SELECTIVE_THINKING_VISIBILITY_IMPLEMENTED -->
<!-- FEED_LEVEL_THINKING_ONLY_FOR_HEAVY_PROCESSING -->
<!-- THINKING_CLEARS_AFTER_FINAL_RESPONSE -->
<!-- PERSISTENT_THINKING_AFTER_RESPONSE_FIXED -->

This document defines the selective policy for displaying the `Pensando...` (thinking/progress) bubble in the conversational import feed.

## 1. Selective Feed-Level Thinking

A visible `Pensando...` bubble in the chat feed must only be shown for heavy processes, complex transitions, or operations where the user needs to wait for substantial background work. It must NOT be shown for lightweight responses.

### Heavy Processes (Feed Thinking: YES)
*   **Initial File Analysis**: Analyzing uploaded Excel/Workbook data.
*   **Structure Match Review**: Analyzing and building the initial configuration matching layout.
*   **Structure Approvals**: Submitting the final layout validation before moving to the prepare step.
*   **Step Transitions**: Transitioning between main import steps (e.g. from 1/7 to 2/7).
*   **Multi-step Operations**: Backend processing that takes more than 1 second.

### Lightweight Responses (Feed Thinking: NO)
*   **Simple Menu Choice**: Answering with options like `1`, `2`, `3`.
*   **Guided Prompts**: Transitioning from one simple input step to another (e.g., selecting field type).
*   **Validation Errors**: Reprompting due to invalid numbers, out-of-range questions, or unrecognized text.
*   **Local Edits**: Modifying question text, types, or scale detail which are updated instantly in React state.
*   **Confirmation States**: Confirming local edits or sections.
*   **Survey scope selection**: Choosing 1/2/3 for QS Clima scope.
*   **1/7 Nombre de la encuesta and all general config steps (2/7–7/7)**: Lightweight guided prompts.
*   **Question selection, edit field selection, edit value**: Lightweight wizard steps.
*   **Post-edit summary and continue options**: Immediate confirmations.

---

## 2. No Persistent Thinking Blocker

**THINKING_MUST_CLEAR_AFTER_FINAL_RESPONSE = YES**
**PERSISTENT_THINKING_AFTER_RESPONSE_ALLOWED = NO**

*   A thinking bubble must never remain visible at the end of the feed after the assistant has sent its final message.
*   When a final message arrives, any active thinking bubble must either:
    1.  Be replaced directly by the final response content.
    2.  Be removed from the feed before the final response is appended.

---

## 3. Composer Processing vs. Feed Thinking

We distinguish between two types of visual loaders:
*   **Composer Processing** (`isProcessingNextStep`): The send button loader and composer lock. These trigger for ALL inputs to provide immediate interaction feedback and prevent duplicate sends.
*   **Feed Thinking** (`isFeedThinking`): The `Pensando...` chat bubble. This is reserved strictly for heavy operations listed above. It is controlled by a **separate boolean state** `isFeedThinking` in `ConversationalImportWorkspace.tsx`.

### Implementation (Fase 11F-F-H3-E-B)

The fix introduces `isFeedThinking: boolean` as a separate React state from `isProcessingNextStep`:

```
isProcessingNextStep = true  →  composer locked (ALL operations)
isFeedThinking = true        →  Pensando... in feed (HEAVY operations ONLY)
```

`simulateChatFlow` accepts `options.feedThinking?: boolean`. Only heavy calls pass `feedThinking: true`. The `thinking_continuity` DOM block guards on `isFeedThinking` (not `isProcessingNextStep`).

---

## 4. Responsibilities Boundary

*   **Conversational Workspace**: Has the business logic. It decides if an action is heavy (passing `feedThinking: true` to `simulateChatFlow`) or light (omitting `feedThinking`, defaulting to `false`).
*   **Chat Master Runtime**: Remains a rendering engine. It only renders a `Pensando...` bubble if `isFeedThinking` is explicitly true.
*   **Message Composer**: Only reflects the composer-level processing status (`isProcessing={isProcessingNextStep}`) and manages focus. Unchanged.
*   **Chat Foundation Components**: Never auto-generate or inject a thinking bubble on their own without explicit instruction from the workspace runtime. Unchanged.

---

## 5. QA Visual Checklist

Use this checklist during visual regression tests to verify compliance:
*   [x] Simple responses (e.g. choosing a menu number or entering a question) do NOT display a `Pensando...` feed bubble.
*   [x] Heavy transitions (e.g. initial file loading, structure match review) display a `Pensando...` feed bubble.
*   [x] The `Pensando...` bubble is fully replaced or removed when the final response arrives.
*   [x] The composer is unlocked and focused when the assistant is awaiting user input.
*   [x] The send button loader functions briefly on click.
*   [x] Auto-scroll only scrolls to thinking when `isFeedThinking` is active.
*   [x] Scrollbar remains fully visible.

### Amendment (Fase 11F-F-H4-E-C · Fix Question Review Persistent Thinking)

**Problem**: After rendering the `1/7 · Preguntas y escalas` question list, a "Pensando..." bubble remained persistent in the feed. Root cause: the `simulateChatFlow` function never explicitly cleared `isFeedThinking` for lightweight operations. When a previous heavy call with `keepThinkingAfter: true` left `isFeedThinking = true` in state, the next lightweight call inherited that stale state, causing the `thinking_continuity` component to render a "Pensando..." bubble.

**Fix**:
1. **Defensive clear in `simulateChatFlow`**: When `showFeedThinking` is `false`, explicitly set `setIsFeedThinking(false)` at the start of every operation. This prevents any lightweight operation from inheriting stale thinking state from previous heavy calls.
2. **Explicit clear in question review transition**: In the `.then()` callback of the structure review → question review transition, call `setIsFeedThinking(false)` immediately before the 1500ms `setTimeout` delay. This prevents the "Pensando..." bubble from being visible during the brief delay before the question list appears.

**Before** (`simulateChatFlow`):
```
if (showFeedThinking) setIsFeedThinking(true);
// isFeedThinking NEVER cleared for lightweight ops
```

**After**:
```
if (showFeedThinking) {
  setIsFeedThinking(true);
} else {
  setIsFeedThinking(false);  // explicitly clear stale state
}
```

<!-- OWNER_VISUAL_REVIEW_REQUIRED -->
