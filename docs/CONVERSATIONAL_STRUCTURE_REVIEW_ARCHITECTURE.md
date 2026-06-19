# Conversational Structure Review Architecture · Comparativo de Encuestas UBITS

## 1. Architecture Decision

CONVERSATIONAL_STRUCTURE_REVIEW_ARCHITECTURE_LOCKED = YES
REVIEW_MODE = CONVERSATIONAL_STEP_BY_STEP
REVIEW_PANEL_DIRECT_CTA = NO
STRUCTURE_REVIEW_REVEAL_MODE = ONE_STEP_AT_A_TIME
INLINE_REVIEW_PANEL_DEFAULT_VISIBILITY = HIDDEN
APPROVAL_FLOW_LOCATION = CHAT_TIMELINE

## 2. Product Goal

Convertir la revisión de estructura en una experiencia conversacional guiada. El usuario no debe enfrentarse a toda la estructura de golpe; el asistente debe pedir aprobación o corrección una categoría a la vez.

## 3. UX Correction From Previous CTA

La acción “Revisar estructura detectada” no debe quedar como botón directo que abre toda la revisión.
Debe reemplazarse por una acción conversacional:
- Empezar revisión guiada
o
- Continuar con revisión paso a paso

La acción no debe mostrar inmediatamente el `InlineReviewPanel`.

## 4. Conversational Review Principle

ONE_STEP_AT_A_TIME = YES
ONE_DECISION_PER_ASSISTANT_TURN = YES
NO_FULL_STRUCTURE_DUMP = YES
NO_ANALYTIC_PANEL_FIRST = YES

Regla:
Cada mensaje del asistente debe pedir una única decisión clara.

## 5. Step-by-Step Review Flow

SYNTHETIC_FILES_STAGED
→ REVIEW_FILES_STEP
→ FILES_APPROVED
→ REVIEW_DEMOGRAPHICS_STEP
→ DEMOGRAPHICS_APPROVED
→ REVIEW_DIMENSIONS_STEP
→ DIMENSIONS_APPROVED
→ REVIEW_QUESTIONS_STEP
→ QUESTIONS_APPROVED
→ REVIEW_MAPPINGS_STEP
→ MAPPINGS_APPROVED
→ REVIEW_APPROVED_CONTRACT_STEP
→ CONTRACT_APPROVED
→ READY_FOR_COMPARISON

## 6. Conversation States

SYNTHETIC_FILES_STAGED
REVIEW_FILES_STEP
FILES_APPROVED
REVIEW_DEMOGRAPHICS_STEP
DEMOGRAPHICS_APPROVED
REVIEW_DIMENSIONS_STEP
DIMENSIONS_APPROVED
REVIEW_QUESTIONS_STEP
QUESTIONS_APPROVED
REVIEW_MAPPINGS_STEP
MAPPINGS_APPROVED
REVIEW_APPROVED_CONTRACT_STEP
CONTRACT_APPROVED
READY_FOR_COMPARISON
REVIEW_CHANGES_REQUESTED

## 7. Assistant Prompt Contract

```typescript
ConversationalReviewAssistantPrompt {
  id: string
  role: "assistant"
  reviewStep: ConversationalReviewStep
  title: string
  body: string
  summaryItems: ReviewSummaryItem[]
  decisionQuestion: string
  actions: ConversationalReviewAction[]
  boundaryNote?: string
}
```

Regla:
decisionQuestion debe contener una sola pregunta.

## 8. User Action Contract

approve_current_step
request_changes_current_step
show_more_detail
go_back_to_previous_step
continue_to_next_step

## 9. Files Review Step

Mensaje sugerido:
Listo. Antes de comparar, revisemos primero los archivos sintéticos detectados.

Encontré:
1. encuesta-clima-2024-sintetica.xlsx
2. encuesta-clima-2025-sintetica.xlsx

¿Apruebas estos archivos para continuar?

Acciones:
- Aprobar archivos
- Cambiar archivos sintéticos
- Ver detalle

## 10. Demographics Review Step

Mensaje sugerido:
Ahora revisemos los demográficos detectados.

Encontré estos campos:
- Gerencia
- Área
- Cargo
- Antigüedad

¿Apruebas estos demográficos?

Acciones:
- Aprobar demográficos
- Corregir demográficos
- Ver detalle

## 11. Dimensions Review Step

Mensaje sugerido:
Ahora revisemos las dimensiones de la encuesta.

Detecté dimensiones como:
- Liderazgo
- Comunicación
- Bienestar
- Desarrollo

¿Apruebas estas dimensiones?

Acciones:
- Aprobar dimensiones
- Corregir dimensiones
- Ver detalle

## 12. Questions Review Step

Mensaje sugerido:
Ahora revisemos las preguntas detectadas.

Encontré preguntas comparables entre los dos periodos y algunas preguntas nuevas o históricas.

¿Quieres revisar primero las preguntas comparables?

Acciones:
- Revisar comparables
- Ver preguntas nuevas
- Ver preguntas históricas

## 13. Question-Dimension Mapping Review Step

Mensaje sugerido:
Ahora revisemos cómo quedaron asociadas las preguntas a sus dimensiones.

Detecté algunos mapeos automáticos y algunos que necesitan confirmación.

¿Quieres revisar los mapeos pendientes?

Acciones:
- Revisar pendientes
- Aprobar mapeos automáticos
- Ver detalle

## 14. Approval Contract Step

Mensaje sugerido:
Ya revisamos archivos, demográficos, dimensiones, preguntas y mapeos.

¿Apruebas este contrato sintético para preparar el comparativo?

Acciones:
- Aprobar contrato
- Revisar resumen
- Volver a mapeos

## 15. Inline Review Panel Relationship

InlineReviewPanel no debe mostrarse por defecto.
Puede usarse solo como soporte dentro de un paso específico si el usuario pide “Ver detalle”.
No debe convertirse en el flujo principal.
La experiencia principal vive en ChatTimeline.

## 16. Mock Data Rules

Todo mock debe vivir en conversationalImportMock.ts o archivo mock del feature.
No hardcodear arrays de negocio en componentes visuales.
No usar datos reales de clientes.

## 17. Boundary Rules

NO_REAL_UPLOAD_CREATED
NO_FILE_INPUT_CREATED
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
NO_API_CONNECTIONS
NO_STORAGE
NO_PARSER_RUNTIME_IN_UI

## 18. Visual Rules

Mantener chat-first shell.
No volver a dashboard.
No mostrar estructura completa de golpe.
No mostrar panel analítico inicial.
No usar HEX.
No usar text-white.
No usar arbitrary values.
No usar blue/green/red/amber/yellow/slate literals.
Usar tokens UBITS semánticos.

## 19. Accessibility Rules

Cada paso debe tener heading claro.
Cada decisión debe tener botones con texto visible.
No depender solo de color.
El estado actual debe comunicarse en texto.
Los mensajes deben ser legibles por screen readers.

## 20. QA Criteria

- Docs only modifications.
- No source code changes in src/**.
- Clean working tree after commit.
- Whitespace clean.

## 21. Next Authorized Phase

CHAT_VIS4B_CONVERSATIONAL_REVIEW_BUILD_READY

## 22. Final Status Markers

PHASE_4K_CHAT_VIS4A_COMPLETE
CONVERSATIONAL_STRUCTURE_REVIEW_ARCHITECTURE_LOCKED
REVIEW_MODE_CONVERSATIONAL_STEP_BY_STEP
REVIEW_PANEL_DIRECT_CTA_DISABLED
STRUCTURE_REVIEW_ONE_STEP_AT_A_TIME_DEFINED
ONE_DECISION_PER_ASSISTANT_TURN_DEFINED
FILES_REVIEW_STEP_DEFINED
DEMOGRAPHICS_REVIEW_STEP_DEFINED
DIMENSIONS_REVIEW_STEP_DEFINED
QUESTIONS_REVIEW_STEP_DEFINED
MAPPINGS_REVIEW_STEP_DEFINED
CONTRACT_APPROVAL_STEP_DEFINED
INLINE_REVIEW_PANEL_SUPPORTING_ONLY
APPROVAL_FLOW_LOCATION_CHAT_TIMELINE
NO_REAL_UPLOAD_CREATED
NO_FILE_INPUT_CREATED
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
NO_API_CONNECTIONS
NO_STORAGE
NO_PARSER_RUNTIME_IN_UI
CHAT_VIS4B_CONVERSATIONAL_REVIEW_BUILD_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
