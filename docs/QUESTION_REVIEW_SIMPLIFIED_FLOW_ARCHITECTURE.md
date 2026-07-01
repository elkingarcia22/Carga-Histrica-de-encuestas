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
