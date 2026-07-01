# Simplified Question Review Flow Architecture

This document defines the technical architecture and specifications for the simplified question review flow in Step 1/7 of the historical import conversational workspace.

## 1. Flow Overview & Main Message
The previous summary-based overview is replaced by a direct, comprehensive list of all questions grouped by dimension.

### Message Format:
```text
1/7 · Preguntas y escalas

Detecté 37 preguntas. Las agrupé por dimensión para que puedas revisar su configuración.

Dimensión: Liderazgo

P1. ¿Tu líder directo te brinda retroalimentación constructiva?
Tipo de pregunta: Escala de valoración
Tipo de escala: Likert 5 puntos
Detalle de escala: Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo

P2. ¿Confías en las decisiones de la dirección de la empresa?
Tipo de pregunta: Escala de valoración
Tipo de escala: Likert 5 puntos
Detalle de escala: Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo

Dimensión: eNPS

P37. ¿Qué tan probable es que recomiendes trabajar en esta empresa?
Tipo de pregunta: eNPS
Tipo de escala: NPS 0–10
Detalle de escala: Detractores 0–6 · Pasivos 7–8 · Promotores 9–10

Puedes responder:
1. Elegir una pregunta para modificar
2. Escribir directamente qué quieres ajustar
3. Continuar a Demográficos
```

---

## 2. Editing Constraints
The editability of components is restricted as follows:

*   `QUESTION_TYPE_EDITING_ALLOWED = YES`
*   `SCALE_TYPE_EDITING_ALLOWED = YES`
*   `SCALE_DETAIL_EDITING_ALLOWED = YES`
*   `DIMENSION_EDITING_ALLOWED = NO`

If the user attempts to modify a dimension (e.g., "cambia la dimensión de la pregunta 3 a Liderazgo"), the system must block it and return:
> "Las dimensiones están bloqueadas en este paso. Puedes ajustar tipo de pregunta, tipo de escala o detalle de escala."

---

## 3. Guided Selection Flow
When the conversation is in the question selection state, the user can choose a question by index (e.g., "modificar pregunta 5", "pregunta 5", "5").

Upon receiving a valid question index, the system transitions to field selection, prompting:
```text
¿Qué quieres modificar de la pregunta 5?

1. Tipo de pregunta
2. Tipo de escala
3. Detalle de la escala
4. Escribir el ajuste con tus palabras
```

### Options for Fields:
1.  **Tipo de pregunta**: Offer valid options: `Escala de valoración`, `Selección única`, `Selección múltiple`, `Texto abierto`, `NPS`, `eNPS`, `Matriz`, `Desconocido`.
2.  **Tipo de escala**: Offer valid options: `Likert 5`, `Likert 7`, `NPS 0–10`, `Sí / No`, `Frecuencia`, `Acuerdo`, `Personalizada`, `No aplica`, `Desconocida`.
3.  **Detalle de la escala**: Allow direct free-text entry of scales (e.g., "1 a 5, donde 1 es muy en desacuerdo y 5 es muy de acuerdo").

---

## 4. Free-Text NLP/Command Parsing
The agent must support single-turn free-text updates (e.g., "cambia la pregunta 5 a NPS", "la pregunta 8 debe ser abierta", "el detalle de escala de la pregunta 4 debe ser de 1 a 5").
*   Interpret target question, target field, and the new value.
*   Ask for clarification if target or value is ambiguous.
*   Do not invent/hallucinate values.

---

## 5. Post-Edit Action & Demographics Transition
After a successful edit, the system shows a summary of the updated question:
```text
Listo. Actualicé la pregunta 5.

Pregunta 5
Tipo de pregunta: Escala de valoración
Tipo de escala: Likert 5 puntos
Detalle de escala: 1 a 5, donde 1 es muy en desacuerdo y 5 es muy de acuerdo

Puedes responder:
1. Seguir editando preguntas
2. Continuar a Demográficos
```

When the user chooses to continue (either via "2" or typing "Continuar a Demográficos"), the flow advances to Step 2/7 (Demográficos) keeping changes locally. No actual imports, database writes, or network API requests are performed.

---

## 6. Architecture & Code Impact
*   **`questionScaleDimensionReviewMessageMapper.ts`**: Replace overview message logic with full list renderer grouped by dimension.
*   **`questionScaleDimensionEditingMapper.ts`**: Update the mapper logic to reject dimension modifications and handle question-only edit states.
*   **`ConversationalImportWorkspace.tsx`**: Support state management for:
    *   `reviewing_all_questions`
    *   `awaiting_question_selection`
    *   `awaiting_edit_field_selection`
    *   `awaiting_edit_value`
    *   `edited_question_summary`
    *   `ready_to_continue_to_demographics`

---

## 7. QA Visual Checklist
*   Check that all questions grouped by dimension are printed.
*   Check that question type, scale type, and scale detail are printed for each.
*   Confirm dimension editing displays a warning message blocking the request.
*   Confirm selection of a question index triggers field choice menu.
*   Confirm choosing a field prompts for new value.
*   Confirm free-text editing modifies the selected target field.
*   Confirm "Seguir editando" goes back to question list/input.
*   Confirm "Continuar a Demográficos" advances step to 2/7.
*   Check that composer focus is maintained after each assistant turn.
*   Verify no action buttons, side panels, or form editors are rendered.

---

## 8. Decision Gate: Conversational Editing Flow Modifications

**CONVERSATIONAL_EDITING_FLOW_CHANGE_STATUS = JUSTIFIED_BY_DECISION_GATE**

### Rationale: Why extending `ConversationalEditState` was necessary
To implement the guided, multi-step conversational editing flow required by this phase (selecting a question, choosing which field to edit, entering the new value, and reviewing the post-edit summary) while strictly avoiding any custom UI buttons, side panels, or form editors, it was necessary to maintain conversational state inside the workspace. The existing `ConversationalEditState` did not support intermediate stages of a multi-turn sub-flow.

### Added States & Context Fields
*   **New States in `ConversationalEditState`**:
    *   `"awaiting_question_selection"`: The agent expects the user to pick which question to edit by number/index.
    *   `"awaiting_edit_field_selection"`: The agent asks which field (question type, scale type, scale detail, free text) to modify.
    *   `"awaiting_edit_value"`: The agent awaits the new value/text input for the selected field.
    *   `"edited_question_summary"`: The agent displays the modification results and asks the user whether to continue editing questions or proceed to Demographics.
*   **New Context Fields in `ConversationalEditContext`**:
    *   `targetQuestionIndex?: number`: Tracks which question index is currently being edited.
    *   `editingField?: "question_type" | "scale_type" | "scale_detail" | "free_text"`: Identifies the target field for the modification.

### Safety & No-Regressions Analysis
1.  **Does not break existing flows**: The new states are fully contained within the Question/Scale Review stage (Step 1/7). Transitions to and from other steps (Survey Selection, General Config, Match Review, Ambiguity, and the final transition to Demographics) remain entirely unaffected because they do not enter these specific sub-states.
2.  **No APIs/Persistence/Real Data**: All state modifications are stored purely in React local component memory (`questionReviewData` hook state) and mapped dynamically. There are no HTTP requests, no local storage/IndexedDB writes, and no real import executions.
3.  **Clean architectural boundary**: The workspace component handles state transitions (the State Machine role), while the mappers (`questionScaleDimensionEditingMapper` and `questionScaleDimensionReviewMessageMapper`) remain pure functions translating user text inputs to typed intents, and data back to natural language chat messages.

### QA Validation Checklist
*   [x] Survey selection is still fully functional (single assistant bubble prompt, options 1/2/3 select successfully).
*   [x] General configuration and match review screens function normally.
*   [x] Ambiguity resolution works (e.g. typing conflicting names prompts for clarification).
*   [x] Question review loads the comprehensive list grouped by dimension.
*   [x] Dimension changes are blocked and show a clear warning message.
*   [x] Transition to step 2/7 (Demographics) executes correctly upon user choice.

---

## 9. Robust Question Selection Parsing (Fase 11F-F-H4-C)

To prevent inputs like "preguta 28" or "p28" from falling back to the master chatbot's generic menu, two major changes were implemented:

1.  **State Routing Integration**: The question review sub-states (`"awaiting_question_selection"`, `"awaiting_edit_field_selection"`, `"awaiting_edit_value"`, and `"edited_question_summary"`) are now explicitly included in the first outer routing check inside the conversational workspace. This ensures all user messages received during these sub-states are processed by the Step 1/7 question and scales review flow instead of passing through to the global fallback.
2.  **Flexible Digit Extraction**: The new `parseQuestionSelection(text, totalQuestions)` helper in `questionScaleDimensionEditingMapper.ts` uses robust regular expressions to capture the target question index:
    *   Standalone digits: `28`
    *   Explicit prefixes: `pregunta 28`, `preguta 28`, `p28`, `P28`, `pregunta #28`
    *   Natural phrases: `modificar pregunta 28`, `editar la pregunta 28`, `quiero cambiar la pregunta 28`
3.  **Contextual Validation**:
    *   If no digits are found, it returns a contextual error: `"No pude identificar la pregunta. Responde con el número de pregunta que quieres modificar, por ejemplo: 28."`
    *   If the digit is out of range, it returns: `"No encontré la pregunta X. Responde con un número entre 1 y Y."` (dynamically based on the total questions count).

---

## 10. Question Editing Options Taxonomy Specifications (Fase 11F-F-H4-D-A)

To match the actual builder constructor options, the visible options for editing questions must follow the specifications below:

1.  **Question Type Taxonomy**:
    1. Escala de valoración
    2. Pregunta abierta
    3. Opción única
    4. Múltiples respuestas
    5. Desplegable
2.  **Scale Type Taxonomy**:
    1. Likert (escala de preferencias)
    2. NPS (recomendabilidad)
    3. Visual por estrellas
    4. Visual por emociones
    5. Escala lineal
    6. Likert (NOM 035)
3.  **Scale Detail / Evaluation Type**:
    1. Frecuencia (nunca / siempre)
    2. Satisfecho (insatisfecho / satisfecho)
    3. Acuerdo (en desacuerdo / de acuerdo)
    4. Probabilidad (Nada probable / Es probable siempre)
    5. Frecuencia (Siempre / Nunca) - NOM 035
    *  Also accept custom detail written by the user.

For complete specifications on business labels, internal type mappings, contract extension strategy, and NLP free-text parsing rules, see [docs/QUESTION_EDITING_OPTIONS_TAXONOMY.md](file:///Users/ub-col-pro-lf4/Documents/Carga%20Historica%20de%20encuestas/docs/QUESTION_EDITING_OPTIONS_TAXONOMY.md).

## 11. Governance Alignment (Phase 11F-F-H4-D-B-G1)
The question editing taxonomy implementation has been fully aligned with project governance guidelines. Changes to `conversationalEditingFlow.ts` have been reverted. Instead, the context interface is extended locally in the workspace React component (`ConversationalImportWorkspace.tsx`), preserving the global state machine intact. All unit tests remain housed within `__tests__/`.
