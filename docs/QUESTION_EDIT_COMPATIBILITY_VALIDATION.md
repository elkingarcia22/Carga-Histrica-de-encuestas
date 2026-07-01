# Question Edit Compatibility Validation Architecture

<!-- PHASE_11F_F_H4_E_A_QUESTION_EDIT_COMPATIBILITY_VALIDATION_ARCHITECTURE_LOCKED -->
<!-- QUESTION_EDIT_COMPATIBILITY_VALIDATION_REQUIRED -->
<!-- EDIT_OPTIONS_DEPEND_ON_DETECTED_RESPONSE_STRUCTURE -->
<!-- DO_NOT_ALLOW_SEMANTICALLY_INVALID_EDITS -->
<!-- INVALID_EDIT_MUST_EXPLAIN_REASON -->
<!-- INVALID_EDIT_MUST_NOT_MUTATE_STATE -->

## 1. Product Principle

La edición de preguntas no es libre. Debe estar condicionada por la evidencia detectada en los datos históricos.

```
QUESTION_EDITING_COMPATIBILITY_VALIDATION_REQUIRED = YES
EDIT_OPTIONS_DEPEND_ON_DETECTED_RESPONSE_STRUCTURE = YES
DO_NOT_ALLOW_SEMANTICALLY_INVALID_EDITS = YES
INVALID_EDIT_MUST_EXPLAIN_REASON = YES
INVALID_EDIT_MUST_NOT_MUTATE_STATE = YES
```

El sistema debe ayudar al usuario a corregir clasificación, no a transformar artificialmente la naturaleza de respuestas históricas.

---

## 2. QuestionResponseEvidence Model

Modelo conceptual de evidencia por pregunta, derivado del análisis de respuestas históricas:

```typescript
interface QuestionResponseEvidence {
  questionId: string;
  questionText: string;

  // Tipos detectados
  detectedQuestionType: QuestionType;
  detectedScaleType: ScaleType;
  detectedScaleDetail: ScaleDetail | null;

  // Naturaleza del valor de respuesta
  responseValueKind:
    | 'textual_scale_labels'     // Labels Likert textuales
    | 'numeric_scale_values'     // Valores numéricos (0-10, 1-5)
    | 'categorical_single_value' // Categorías únicas no escalares
    | 'categorical_multi_value'  // Selección múltiple
    | 'free_text'                // Texto libre
    | 'mixed'                    // Mezcla inconsistente
    | 'unknown';                 // No determinado

  // Cardinalidad por respondente
  responseCardinality:
    | 'single_per_respondent'    // Una respuesta por usuario
    | 'multiple_per_respondent'  // Múltiples respuestas
    | 'unknown';

  // Shape estructural
  responseShape:
    | 'scale_labels'
    | 'scale_numbers'
    | 'categorical'
    | 'multi_select'
    | 'open_text'
    | 'mixed'
    | 'unknown';

  // Labels conocidos de opciones
  knownOptionLabels: string[];
  knownNumericRange: [number, number] | null;

  // Escala conocida matched
  matchedKnownScale:
    | 'likert_agreement_5'
    | 'likert_frequency_5'
    | 'satisfaction_5'
    | 'nps_0_10'
    | 'nom_035_frequency'
    | 'custom'
    | 'none'
    | 'unknown';

  // Confianza de la detección
  confidence: 'high' | 'medium' | 'low';

  // Warnings de compatibilidad
  compatibilityWarnings: string[];
}
```

---

## 3. Matriz de Compatibilidad

### 3.1 Likert Textual 5 puntos / Acuerdo

**Ejemplo:** `Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo`

**Naturaleza detectada:**
- `responseValueKind = textual_scale_labels`
- `responseCardinality = single_per_respondent`
- `matchedKnownScale = likert_agreement_5`

**Ediciones permitidas:**
- Tipo de pregunta: `Escala de valoración`, `Opción única`, `Desplegable`
- Tipo de escala: `Likert (escala de preferencias)`
- Detalle de escala: `Acuerdo (en desacuerdo / de acuerdo)`, o detalle personalizado que conserve el mismo set semántico de opciones

**Ediciones no permitidas:**
- `Pregunta abierta` — las respuestas no son texto libre
- `Múltiples respuestas` — cada usuario respondió una opción
- `NPS (recomendabilidad)` — los labels son Likert textuales, no valores 0-10
- `Visual por estrellas` — no son valores numéricos discretos
- `Visual por emociones` — no son valores numéricos discretos
- `Escala lineal` — no son valores numéricos continuos
- `Likert (NOM 035)`, salvo que los labels correspondan realmente a NOM 035

**Mensaje esperado al intentar cambio inválido:**
```
No puedo cambiar la pregunta {n} a {cambio inválido} porque las respuestas históricas
detectadas no son {razón}.

Opciones compatibles:
1. Escala de valoración
2. Opción única
3. Desplegable
```

### 3.2 NPS Numérico 0-10

**Ejemplo:** `0 · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10`

**Naturaleza detectada:**
- `responseValueKind = numeric_scale_values`
- `knownNumericRange = [0, 10]`
- `matchedKnownScale = nps_0_10`
- `responseCardinality = single_per_respondent`

**Ediciones permitidas:**
- Tipo de pregunta: `Escala de valoración`
- Tipo de escala: `NPS (recomendabilidad)`
- Detalle de escala: `Detractores 0–6 · Pasivos 7–8 · Promotores 9–10`

**Ediciones no permitidas:**
- `Pregunta abierta` — respuestas numéricas, no texto libre
- `Múltiples respuestas` — cardinalidad única
- `Desplegable` — no aplica a rango numérico continuo
- `Opción única` — salvo decisión explícita posterior del Owner
- Likert textual — los valores son numéricos, no labels Likert
- `Visual por estrellas` — el rango NPS 0-10 no es 1-5 estrellas
- `Visual por emociones` — no corresponde

### 3.3 Pregunta Abierta

**Naturaleza detectada:**
- `responseValueKind = free_text`
- `responseCardinality = free_text_per_respondent`

**Ediciones permitidas:**
- Tipo de pregunta: `Pregunta abierta`
- Tipo de escala: No aplica
- Detalle de escala: No aplica

**Ediciones no permitidas:**
- `Escala de valoración` — no se puede convertir texto libre a escala
- `Opción única` — no se puede asignar categorías a texto libre
- `Múltiples respuestas` — no aplica
- `Desplegable` — no aplica

**Motivo:**
Las respuestas históricas son texto libre y no se pueden convertir con seguridad a categorías o escalas sin reclasificación semántica posterior.

### 3.4 Opción Única Categórica

**Naturaleza detectada:**
- `responseValueKind = categorical_single_value`
- `responseCardinality = single_per_respondent`
- `matchedKnownScale = none`

**Ediciones permitidas:**
- Tipo de pregunta: `Opción única`, `Desplegable`
- Tipo de escala: No aplica
- Detalle de escala: No aplica

**Ediciones permitidas condicionalmente:**
- `Escala de valoración`, solo si los labels detectados corresponden claramente a una escala conocida (Likert, frecuencia, etc.)

**Ediciones no permitidas:**
- `Pregunta abierta` — son categóricas, no texto libre
- `Múltiples respuestas` — cardinalidad única

### 3.5 Múltiples Respuestas

**Naturaleza detectada:**
- `responseValueKind = categorical_multi_value`
- `responseCardinality = multiple_per_respondent`

**Ediciones permitidas:**
- Tipo de pregunta: `Múltiples respuestas`
- Tipo de escala: No aplica
- Detalle de escala: No aplica

**Ediciones no permitidas:**
- `Pregunta abierta` — son opciones predefinidas
- `Opción única` — los usuarios seleccionaron varias opciones
- `Desplegable` — no soporta selección múltiple
- `Escala de valoración` — no aplica

### 3.6 Unknown / Mixed

**Naturaleza detectada:**
- `responseValueKind = mixed` o `responseValueKind = unknown`

**Regla:**
No aplicar cambios automáticamente.

**Mensaje esperado:**
```
No tengo suficiente evidencia para validar ese cambio con seguridad.
Puedo mantener la clasificación actual o pedir una aclaración sobre la
estructura esperada de esta pregunta.
```

---

## 4. Comportamiento Conversacional

### 4.1 Al pedir opciones de edición

En vez de mostrar siempre todas las opciones globales, el chat debe mostrar solo opciones compatibles, o separar compatibles/no compatibles con razón.

**Preferencia:**
```
Estas son las opciones compatibles para la pregunta {n}:

1. Escala de valoración
2. Opción única
3. Desplegable

No recomiendo cambiarla a Pregunta abierta o Múltiples respuestas porque las
respuestas históricas detectadas son de selección única sobre una escala Likert.
```

### 4.2 Al intentar un cambio inválido

Debe:
1. No aplicar el cambio
2. Explicar por qué no es compatible
3. Mostrar alternativas válidas
4. Mantener al usuario dentro del flujo de edición
5. No volver al fallback genérico
6. No mutar el mock state
7. No avanzar a Demográficos automáticamente

### 4.3 Al intentar un cambio válido

Debe:
1. Aplicar el cambio
2. Mostrar resumen con labels de negocio
3. Ofrecer: seguir editando / continuar a Demográficos

### 4.4 Edición libre (NLP)

La validación debe aplicarse también a instrucciones libres como:
- `cambia la pregunta 24 a abierta`
- `la pregunta 24 debe ser múltiple`
- `usa NPS en la pregunta 24`
- `ponle escala lineal a la pregunta 24`

No basta validar solo selección numérica.

---

## 5. IA-first con Moderación

Oportunidad IA-first útil: cuando el usuario intente un cambio inválido, el asistente puede explicar el motivo en lenguaje natural y sugerir alternativas compatibles.

**No crear:**
- Features nuevas
- Scoring complejo
- Análisis predictivo
- Conexiones a APIs externas

---

## 6. Editing Constraints Summary

```
QUESTION_TYPE_EDITING_ALLOWED = YES (with compatibility validation)
SCALE_TYPE_EDITING_ALLOWED = YES (with compatibility validation)
SCALE_DETAIL_EDITING_ALLOWED = YES (with compatibility validation)
DIMENSION_EDITING_ALLOWED = NO
QUESTION_EDITING_COMPATIBILITY_VALIDATION_REQUIRED = YES
EDIT_OPTIONS_DEPEND_ON_DETECTED_RESPONSE_STRUCTURE = YES
DO_NOT_ALLOW_SEMANTICALLY_INVALID_EDITS = YES
INVALID_EDIT_MUST_EXPLAIN_REASON = YES
INVALID_EDIT_MUST_NOT_MUTATE_STATE = YES
INVALID_EDIT_MUST_SUGGEST_COMPATIBLE_OPTIONS = YES
```

---

## 7. Files Impacted (Future Implementation)

### Mappers to modify:
- `questionScaleDimensionEditingMapper.ts` — add compatibility validation layer after intent parsing
- `questionScaleDimensionReviewMessageMapper.ts` — filter options by `QuestionResponseEvidence`

### Types to extend:
- `questionScaleDimensionReviewTypes.ts` — add `QuestionResponseEvidence` type and compatibility enums

### Mock data to extend:
- `questionScaleDimensionReviewMockData.ts` — add `responseEvidence` field to `QuestionReviewItem`

### No UI changes needed
The chat runtime is the only surface; no new components required.

---

## 8. Phase Markers

```
QUESTION_EDIT_COMPATIBILITY_VALIDATION_ARCHITECTURE_LOCKED = YES
QUESTION_RESPONSE_EVIDENCE_MODEL_DEFINED = YES
EDIT_OPTIONS_DEPEND_ON_RESPONSE_STRUCTURE_DEFINED = YES
LIKERT_TEXTUAL_COMPATIBILITY_RULES_DEFINED = YES
NPS_NUMERIC_COMPATIBILITY_RULES_DEFINED = YES
FREE_TEXT_COMPATIBILITY_RULES_DEFINED = YES
SINGLE_CHOICE_COMPATIBILITY_RULES_DEFINED = YES
MULTIPLE_CHOICE_COMPATIBILITY_RULES_DEFINED = YES
UNKNOWN_MIXED_COMPATIBILITY_RULES_DEFINED = YES

INVALID_EDIT_DOES_NOT_MUTATE_STATE_DEFINED = YES
INVALID_EDIT_EXPLAINS_REASON_DEFINED = YES
INVALID_EDIT_SUGGESTS_COMPATIBLE_OPTIONS_DEFINED = YES
FREE_TEXT_EDIT_VALIDATION_DEFINED = YES
NUMERIC_SELECTION_VALIDATION_DEFINED = YES
DIMENSION_EDITING_REMAINS_DISABLED_DEFINED = YES

NO_CODE_CHANGES = YES
NO_RUNTIME_CHANGES = YES
NO_UI_CHANGES = YES
NO_MAPPER_CHANGES = YES
NO_TEST_CHANGES = YES
VISUAL_REVIEW_REQUIRED = NO

NEXT_MAXIMUM_AUTHORIZED_PHASE = Fase 11F-F-H4-E-B · Implement Question Edit Compatibility Validation
```
