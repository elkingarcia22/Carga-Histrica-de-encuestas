# Chat Master Runtime UX Architecture

<!-- PHASE_11F_F_H3_E_B_SELECTIVE_THINKING_VISIBILITY_IMPLEMENTED -->
<!-- FEED_LEVEL_THINKING_ONLY_FOR_HEAVY_PROCESSING -->
<!-- THINKING_CLEARS_AFTER_FINAL_RESPONSE -->
<!-- PERSISTENT_THINKING_AFTER_RESPONSE_FIXED -->
<!-- OWNER_VISUAL_REVIEW_REQUIRED -->

This document defines the architectural specifications for the master chat runtime's UX enhancements, specifically covering auto-scroll behavior, scrollbar visibility, AI gradient styling, processing states, and execution boundaries.

---

## 1. Auto-Scroll Mechanics (Sticky Auto-Scroll)

To guarantee that the user is always aware of the assistant's progress without disrupting manually scrolled history, the feed will implement a **Sticky Auto-Scroll** policy.

### Core Architecture
- **Location**: The scroll container inside `ConversationalImportWorkspace.tsx` encloses the chat feed.
- **Scroll Target**: A persistent invisible sentinel `div` (Ref-based target) placed at the very end of the message list.
- **Trigger Events**:
  - User submits a new message.
  - A message of role `assistant` and type `analysis_progress` (thinking) is added.
  - A thinking message is updated or replaced with the final response.
  - Dynamic streaming updates or text expansions occur.
- **Sticky Protection (Manual Scroll Override)**:
  - If the user has scrolled up by more than `100px` from the bottom of the container, auto-scroll is paused to prevent jarring jump effects.
  - If the container is already near the bottom (within `100px`), auto-scroll triggers automatically.
- **Implementation Pattern**:
  ```typescript
  // Conceptual Ref pattern:
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    }
  };
  ```

---

## 2. Visible Scrollbars (Aesthetics & Navigation)

Scrollbars are essential indicators of chat length and navigation. The container must not hide them.

### Styling Specifications
- **Style Rules**:
  - Never use hidden/overflow hacks that render the scrollbar invisible.
  - Scrollbars must use native or standard utility styles, styled via tokens to preserve theme styling.
  - Track color: Transparent or HSL variable from `--color-bg-app` to avoid visual clutter.
  - Thumb color: `var(--color-border)` or a semi-transparent version to adapt seamlessly to theme transitions.
  - Hover thumb color: `var(--color-border-strong)`.
- **Hardcoding Restrictions**: No raw hex codes allowed. All colors must resolve from `src/styles/tokens.css` or Tailwind-configured tokens.

---

## 3. Send Button with AI Gradient

To represent the intelligent agent interface premium aesthetic, the message composer send button will transition from a plain solid background to the approved AI premium gradient.

### Visual Styling
- **Gradient Start**: `var(--color-ai-gradient-start)`
- **Gradient End**: `var(--color-ai-gradient-end)`
- **Premium Shadow**: `var(--shadow-ai-premium)`
- **State Handling**:
  - **Enabled**: Full premium gradient with transition effects on hover.
  - **Disabled / Idle**: Clean, accessible contrast background using standard disabled tokens.
  - **Text contrast**: Ensure absolute readability using semantic contrast tokens. Do not hardcode literal CSS `white` or raw hex values.

---

## 4. Send Button Processing Loader & Key-lock

When a submission is processing, the composer must visually reflect this state and prevent duplicate submissions.

### Behavior Specifications
- **Loader Icon**: The `ArrowRight` icon inside the send button replaces with a spinner/loader icon when the system is processing.
- **Input Disable**: The text area and file attachment interface enter a disabled state (`disabled={isProcessing}`).
- **Key-lock**: The `Enter` key is intercepted and blocked during processing to avoid accidental multiple triggers.
- **API Guard**: A boolean throttle flag inside the submit function acts as an runtime guard.

---

## 5. Assistant Response Processing Transition & Thinking Policy

Assistant responses represent the outcome of the agent's calculations. To maintain clean UX and prevent visual clutter, the visible `Pensando...` (thinking) bubble in the feed must follow the selective visibility policy.

### Core Policy Integration
1. **Selective Thinking**: Feed-level thinking/progress messages (using `AILoader`) are restricted strictly to heavy/long operations (e.g., initial file loading, match structure analysis, final steps transition).
2. **Immediate Transitions**: Lightweight interactions (menu option selection, question selections, contextual inputs, validation errors, and local state edits) must bypass the feed-level thinking loader completely.
3. **Immutability of Finished States**: A thinking bubble must never remain in the feed once a final assistant response is delivered. It must be replaced or cleared.
4. **Composer Processing vs. Feed Thinking**: The message composer send button loader and interface locks (`isProcessing`) may run briefly for all interactions to guarantee rate-limiting and prevent double-clicks, without injecting a thinking bubble in the feed history.

For the full detailed specifications, refer to [docs/CHAT_THINKING_VISIBILITY_POLICY.md](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/docs/CHAT_THINKING_VISIBILITY_POLICY.md).

---

## 6. Implementation Boundaries

To secure governance, changes in the next phase (11F-F-H3-E-B) are strictly confined to these paths:

### Authorized Files
- [MessageComposer.tsx](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/src/features/historical-import/conversational-import/MessageComposer.tsx)
- [ConversationalImportWorkspace.tsx](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/src/features/historical-import/conversational-import/ConversationalImportWorkspace.tsx)
- [chat-foundation/**](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/src/features/historical-import/conversational-import/chat-foundation)
- [tokens.css](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/src/styles/tokens.css)
- [globals.css](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/src/styles/globals.css)

### Prohibited Files
- All test/fixture paths outside authorized boundaries.
- All dashboard, overlay-editing, and draft-preparation paths.
- Global config files (`vite.config.ts`, `vitest.config.ts`, `tsconfig.json`).

---

## 7. QA Checklist for Verification

The final implementation must be verified against this checklist:
- [ ] Auto-scroll triggers smoothly when user sends a message.
- [ ] Auto-scroll triggers when assistant starts thinking.
- [ ] Manual scroll up pauses auto-scroll to prevent viewport hijacking.
- [ ] Scrollbar is clearly visible in the chat feed container.
- [ ] Send button features the AI premium gradient.
- [ ] Send button renders a loader icon when processing.
- [ ] Keyboard input and composer text area are locked during processing.
- [ ] Only heavy processes display the `Pensando...` feed bubble, while light actions bypass it.
- [ ] No hex color codes are hardcoded; all styles reference tokens.
