# Chat Thinking Visibility Policy

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
*   **Composer Processing**: The send button loader and composer lock (`isProcessing`). These can trigger briefly for all inputs to provide immediate interaction feedback and prevent duplicate sends.
*   **Feed Thinking**: The `Pensando...` chat bubble. This is reserved strictly for heavy operations listed above.

---

## 4. Responsibilities Boundary

*   **Conversational Workspace**: Has the business logic. It decides if an action is heavy (setting `showThinking: true` or appending a thinking message payload) or light.
*   **Chat Master Runtime**: Remains a rendering engine. It only renders a `Pensando...` bubble if it receives an explicit active progress message in the message list or an active state signal.
*   **Message Composer**: Only reflects the composer-level processing status (`isProcessing`) and manages focus.
*   **Chat Foundation Components**: Must never auto-generate or inject a thinking bubble on their own without explicit instruction from the workspace runtime.

---

## 5. QA Visual Checklist

Use this checklist during visual regression tests to verify compliance:
*   [ ] Simple responses (e.g. choosing a menu number or entering a question) do NOT display a `Pensando...` feed bubble.
*   [ ] Heavy transitions (e.g. entering "Continuar a Demográficos" or initial file loading) display a `Pensando...` feed bubble.
*   [ ] The `Pensando...` bubble is fully replaced or removed when the final response arrives.
*   [ ] The composer is unlocked and focused when the assistant is awaiting user input.
*   [ ] The send button loader functions briefly on click.
*   [ ] Auto-scroll only scrolls to thinking when thinking is active.
*   [ ] Scrollbar remains fully visible.
