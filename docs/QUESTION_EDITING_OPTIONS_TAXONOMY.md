# Question Editing Options Taxonomy Specification

This document defines the visible option taxonomy and the internal mapping strategy for Step 1/7 (Preguntas y escalas) of the conversational import.

## 1. Approved Taxonomy

### 1.1 Tipo de pregunta (Question Type)
When editing a question's type, the chat must display exactly these 5 business-friendly options:
1.  **Escala de valoración**
2.  **Pregunta abierta**
3.  **Opción única**
4.  **Múltiples respuestas**
5.  **Desplegable**

### 1.2 Tipo de escala (Scale Type)
When editing the scale type, the chat must display exactly these 6 options:
1.  **Likert (escala de preferencias)**
2.  **NPS (recomendabilidad)**
3.  **Visual por estrellas**
4.  **Visual por emociones**
5.  **Escala lineal**
6.  **Likert (NOM 035)**

### 1.3 Detalle / Tipo de valoración (Scale Detail / Evaluation Type)
When editing scale details for rating scales or applicable types, the chat must offer exactly these options:
1.  **Frecuencia (nunca / siempre)**
2.  **Satisfecho (insatisfecho / satisfecho)**
3.  **Acuerdo (en desacuerdo / de acuerdo)**
4.  **Probabilidad (Nada probable / Es probable siempre)**
5.  **Frecuencia (Siempre / Nunca) - NOM 035**
6.  *Allows entering custom text details.*

---

## 2. Business Labels vs. Technical Names

The conversational interface must always display the business labels described above. Technical names (e.g. `rating_scale`, `likert_5`) must never be visible to the user in assistant bubbles, menu choices, or prompts.

---

## 3. Internal Mapping & Contract Extension Strategy

To support the approved taxonomy without over-complicating metadata, the existing types in `questionScaleDimensionReviewTypes.ts` will be extended minimally during the implementation phase:

### 3.1 Question Type Mapping
*   `Escala de valoración` -> `rating_scale`
*   `Pregunta abierta` -> `open_text`
*   `Opción única` -> `single_choice`
*   `Múltiples respuestas` -> `multiple_choice`
*   `Desplegable` -> Extend `QuestionType` with `'dropdown'`

### 3.2 Scale Type Mapping
*   `Likert (escala de preferencias)` -> `likert_5` (or `likert_7` depending on scale details)
*   `NPS (recomendabilidad)` -> `nps_0_10`
*   `Visual por estrellas` -> Extend `ScaleType` with `'visual_stars'`
*   `Visual por emociones` -> Extend `ScaleType` with `'visual_emotions'`
*   `Escala lineal` -> Extend `ScaleType` with `'linear_scale'`
*   `Likert (NOM 035)` -> Extend `ScaleType` with `'likert_nom035'`

### 3.3 Scale Detail Mapping
*   `Frecuencia (nunca / siempre)` -> maps to scale detail anchors `['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre']` (or user custom input)
*   `Satisfecho (insatisfecho / satisfecho)` -> maps to scale detail anchors `['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho']`
*   `Acuerdo (en desacuerdo / de acuerdo)` -> maps to scale detail anchors `['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo']`
*   `Probabilidad (Nada probable / Es probable siempre)` -> maps to scale detail anchors `['Nada probable', 'Poco probable', 'Neutral', 'Probable', 'Muy probable']`
*   `Frecuencia (Siempre / Nunca) - NOM 035` -> maps to scale detail anchors `['Siempre', 'Casi siempre', 'Algunas veces', 'Casi nunca', 'Nunca']` (NOM 035 inverted frequency order)

---

## 4. NLP / Free-Text Interpretation Specifications

The parsing mapper must be updated to interpret natural expressions for the new taxonomy:
*   `“cambia la pregunta 5 a pregunta abierta”` -> maps to `QuestionType` `'open_text'` for question 5.
*   `“usa NPS recomendabilidad”` -> maps to `ScaleType` `'nps_0_10'`.
*   `“la escala debe ser visual por estrellas”` -> maps to `ScaleType` `'visual_stars'`.
*   `“tipo de valoración acuerdo”` -> maps scale detail of the target question to `Acuerdo`.
*   `“usa Likert NOM 035”` -> maps to `ScaleType` `'likert_nom035'`.

---

## 5. Non-Modifiability Constraints

*   Dimension editing attempts (e.g. `“cambia la dimensión de la pregunta 5 a Liderazgo”`) remain strictly blocked and must return:
    > `"Las dimensiones están bloqueadas en este paso. Puedes ajustar tipo de pregunta, tipo de escala o detalle de escala."`

---

## 6. QA Checklist for Implementation Phase

*   [ ] When editing **Tipo de pregunta**, exactly the 5 options are displayed.
*   [ ] When editing **Tipo de escala**, exactly the 6 options are displayed.
*   [ ] When editing **Detalle de la escala**, exactly the 5 business evaluation options + custom option are displayed.
*   [ ] Dimension editing attempts display the block warning message.
*   [ ] Natural language command parsing maps successfully to the extended types.
*   [ ] No old/generic scale types (e.g. "Sí / No", "Likert 7", "Personalizada", "No aplica") are offered.
*   [ ] Conversational interface uses business labels, not technical keys.

---

## 7. Governance Alignment Check

*   **Conversational Editing Flow**: Modifying `conversationalEditingFlow.ts` is strictly prohibited. The implementation was aligned by reverting all changes in `conversationalEditingFlow.ts` and extending the `ConversationalEditContext` interface locally inside `ConversationalImportWorkspace.tsx` (`ExtendedConversationalEditContext`), ensuring complete isolation and preserving the state machine.
*   **Test folder**: All unit tests are located in `src/features/historical-import/conversational-import/question-scale-dimension-review/__tests__/`. No tests exist under `tests/` directory within this feature folder.
