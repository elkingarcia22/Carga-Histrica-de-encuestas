# Question Scale Dimension Review Architecture

## 1. Propósito

Esta arquitectura define cómo debe evolucionar el paso `1/7 · Preguntas y escalas` del flujo conversacional de carga histórica desde un resumen agregado hacia una revisión conversacional detallada, guiada y editable por chat.

Estado actual:

- El paso `1/7` existe en `conversationalMatchReviewMapper.ts:17-21` y produce solo un resumen agregado: preguntas detectadas (37), alineadas (37), nuevas (0), por revisar (0), escalas detectadas (Percepción negativa, neutra, positiva, total respuestas).
- El usuario solo puede responder "confirmar" o "ver detalles". "ver detalles" agrega información marginal pero sigue siendo agregada.
- No existe mecanismo para que el usuario revise, ajuste o confirme el texto, tipo, escala, detalle de escala o dimensión de cada pregunta individual.

Estado deseado:

- El agente presenta preguntas agrupadas por dimensión y tipo de escala.
- El usuario puede navegar entre preguntas, ver detalle completo (texto, tipo, escala, detalle, dimensión, estado).
- El usuario puede modificar cualquier campo por texto en el chat.
- El usuario puede confirmar preguntas individualmente o confirmar toda la sección.
- No se usan botones, paneles laterales, tabs, editores externos ni formularios.
- No se exponen datos sensibles (PII, raw rows, open text, workbook dump, real client data).

Esta fase solo diseña arquitectura. No se implementa código, no se modifica runtime, no se modifica UI.

---

## 2. Boundary de responsabilidades

```
Chat Foundation (src/features/historical-import/conversational-import/chat-foundation/)
└── Renderiza mensajes: plain_text, structured, confirmation, warning, error, safe_details, thinking, handoff.
└── Renderiza avatar, thinking, iconos semánticos.
└── No conoce preguntas, escalas, dimensiones, tipos de encuesta ni reglas de matching.
└── No interpreta respuestas de negocio.

ConversationalImportWorkspace (ConversationalImportWorkspace.tsx)
└── Conserva estado del wizard conversacional (conversationalEditState).
└── Orquesta pasos del flujo (scope selection → general config → match review → ...).
└── Recibe input del usuario, aplica transiciones de estado.
└── Delega render a Chat Foundation.
└── En el paso reviewing_questions_and_scales, actualmente solo invoca getMatchReviewSectionMessage.
└── Futuro: debe gestionar el estado de la revisión detallada de preguntas.

Question Scale Dimension Review Layer (NUEVO — diseño de esta fase)
└── Produce mensajes conversacionales detallados por pregunta.
└── Interpreta comandos del usuario para navegar, ver detalle, modificar y confirmar preguntas.
└── Evalúa si la sección puede ser confirmada.
└── Es puro, determinístico, sin side effects.
└── No renderiza UI. No crea componentes. No modifica el workspace directamente.

Match Review Mapper (conversationalMatchReviewMapper.ts)
└── Actualmente produce el resumen agregado de preguntas y escalas.
└── Futuro: debe proveer la estructura detectada de preguntas (no solo el resumen) para que la Review Layer pueda iterar sobre ellas.
└── Sigue siendo el source de truth del match detectado.

Conversational Editing Flow (conversationalEditingFlow.ts)
└── Actualmente maneja renombre de etiquetas (dimensiones, preguntas).
└── Futuro: debe extenderse para manejar cambios de tipo de pregunta, tipo de escala, dimensión asociada.
└── No modificar su contrato actual. Extender por adición.

Demo Fixture / Mock Data Layer (src/features/historical-import/demo-fixture/)
└── Entrega preguntas sanitizadas del fixture QS Clima.
└── Ya expone preguntas con displayLabel, dimensionId, etc.
└── Los componentes visuales no deben tener datos hardcodeados.
└── El fixture ya existe y no debe mutarse.

Future Import Preparation Layer
└── Consume la estructura final aprobada (preguntas, tipos, escalas, dimensiones confirmadas).
└── No se ejecuta aquí. No se define en esta fase.
```

---

## 3. Contrato conceptual de pregunta revisable

Cada pregunta revisable en el paso 1/7 debe poder representarse con los siguientes campos conceptuales:

```text
questionId: string
  └── Identificador único determinístico.

displayIndex: number
  └── Índice visible para el usuario (1-based).

questionText: string
  └── Texto de la pregunta.
  └── Ejemplo: "Me siento orgulloso de trabajar aquí"

questionType: QuestionType
  └── Tipo de pregunta.
  └── Ver tipos definidos abajo.

scaleType: ScaleType
  └── Tipo de escala asociada.
  └── Ver tipos definidos abajo.

scaleDetail: ScaleDetail
  └── Detalle completo de la escala.
  └── Ver sección 4.

dimensionId: string
  └── ID de la dimensión asociada.

dimensionName: string
  └── Nombre visible de la dimensión.

status: QuestionStatus
  └── Estado de alineación de la pregunta.

reviewNotes?: string
  └── Nota opcional sobre la pregunta.

sourceSheetLabel: string
  └── Hoja de origen (Clima, Engagement, eNPS).

confidenceLevel: "high" | "medium" | "low"
  └── Nivel de confianza de la detección.
```

**QuestionType** (tipos de pregunta esperados):

```text
rating_scale     → Escala de valoración (Likert, frecuencia, acuerdo)
single_choice    → Selección única
multiple_choice  → Selección múltiple
open_text        → Texto abierto (pregunta sin escala)
nps              → NPS (Net Promoter Score)
enps             → eNPS (Employee NPS)
matrix           → Matriz de preguntas
unknown          → No se pudo determinar el tipo
```

**ScaleType** (tipos de escala esperados):

```text
likert_5         → Likert 5 puntos
likert_7         → Likert 7 puntos
nps_0_10         → NPS 0–10
binary_yes_no    → Sí / No
frequency        → Frecuencia (Nunca · Rara vez · A veces · Frecuentemente · Siempre)
agreement        → Acuerdo (Totalmente en desacuerdo · ... · Totalmente de acuerdo)
custom           → Escala personalizada
not_applicable   → No aplica (pregunta abierta)
unknown          → No se pudo determinar la escala
```

**QuestionStatus** (estados esperados):

```text
aligned             → Pregunta alineada con catálogo UBITS
needs_review        → Requiere revisión humana
new_question        → Pregunta nueva no encontrada en catálogo
uninterpretable     → No se pudo interpretar la pregunta
edited              → El usuario editó la pregunta
confirmed           → El usuario confirmó la pregunta
```

**Exclusiones explícitas del contrato** (NO incluir):

```text
NO_RAW_ROWS
NO_PARTICIPANT_IDS
NO_OPEN_TEXT_ANSWERS
NO_WORKBOOK_DUMP
NO_PII
NO_REAL_CLIENT_DATA
```

---

## 4. Detalle de escala

Cada escala debe poder representarse con los siguientes campos conceptuales:

```text
scaleLabel: string
  └── Nombre visible del tipo de escala.
  └── Ejemplo: "Likert 5 puntos", "NPS 0–10"

scaleValueRange: string
  └── Rango de valores.
  └── Ejemplo: "1–5", "0–10"

scaleAnchors: string[]
  └── Anclas/etiquetas de la escala en orden.
  └── Ejemplo: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]

scoreDirection: "positive_up" | "positive_down"
  └── Dirección de puntuación (positivo hacia arriba o hacia abajo).

favorableValues: number[]
  └── Valores considerados favorables.
  └── Ejemplo para Likert 5: [4, 5]

neutralValues: number[]
  └── Valores considerados neutrales.
  └── Ejemplo: [3]

unfavorableValues: number[]
  └── Valores considerados desfavorables.
  └── Ejemplo: [1, 2]
```

**Ejemplos concretos:**

```text
Likert 5:
  scaleLabel: "Likert 5 puntos"
  scaleValueRange: "1–5"
  scaleAnchors: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]
  scoreDirection: "positive_up"
  favorableValues: [4, 5]
  neutralValues: [3]
  unfavorableValues: [1, 2]

Likert 7:
  scaleLabel: "Likert 7 puntos"
  scaleValueRange: "1–7"
  scaleAnchors: ["Totalmente en desacuerdo", "En desacuerdo", "Parcialmente en desacuerdo", "Neutral", "Parcialmente de acuerdo", "De acuerdo", "Totalmente de acuerdo"]
  scoreDirection: "positive_up"
  favorableValues: [6, 7]
  neutralValues: [4]
  unfavorableValues: [1, 2, 3]

NPS 0–10:
  scaleLabel: "NPS 0–10"
  scaleValueRange: "0–10"
  scaleAnchors: ["0 a 10 · Detractores 0–6 · Pasivos 7–8 · Promotores 9–10"]
  scoreDirection: "positive_up"
  favorableValues: [9, 10]
  neutralValues: [7, 8]
  unfavorableValues: [0, 1, 2, 3, 4, 5, 6]

Binaria Sí/No:
  scaleLabel: "Binaria Sí/No"
  scaleValueRange: "0–1"
  scaleAnchors: ["No", "Sí"]
  scoreDirection: "positive_up"
  favorableValues: [1]
  neutralValues: []
  unfavorableValues: [0]

Frecuencia:
  scaleLabel: "Frecuencia"
  scaleValueRange: "1–5"
  scaleAnchors: ["Nunca", "Rara vez", "A veces", "Frecuentemente", "Siempre"]
  scoreDirection: "positive_up"
  favorableValues: [4, 5]
  neutralValues: [3]
  unfavorableValues: [1, 2]
```

---

## 5. Dimensiones

Cada dimensión asociada a una pregunta se representa con:

```text
dimensionId: string
  └── Identificador único de la dimensión.

dimensionName: string
  └── Nombre visible de la dimensión.
  └── Ejemplo: "Compromiso", "Liderazgo", "Cultura"

parentDimensionId?: string
  └── ID de la dimensión padre (si aplica jerarquía).

source: DimensionSource
  └── Cómo se detectó la dimensión.

confidence: "high" | "medium" | "low"
  └── Confianza en la asignación de dimensión.
```

**DimensionSource** (origen de la asignación):

```text
detected_by_sheet       → Detectada por nombre de hoja (Clima, Engagement, eNPS)
detected_by_column      → Detectada por columna en el archivo
inferred_by_dictionary  → Inferida por diccionario de matching
user_corrected          → Corregida por el usuario durante la revisión
not_assigned            → No asignada aún
```

**Casos de asignación:**

```text
1. Dimensión detectada automáticamente:
   source: "detected_by_sheet"
   → La pregunta pertenece a una hoja que mapea directamente a una dimensión.

2. Dimensión inferida por nombre de hoja:
   source: "detected_by_column"
   → El nombre de la hoja indica la dimensión (e.g., "Clima" → "Clima Laboral").

3. Dimensión inferida por columna/diccionario:
   source: "inferred_by_dictionary"
   → El texto de la pregunta o columna coincide con un catálogo.

4. Dimensión corregida por el usuario:
   source: "user_corrected"
   → El usuario cambió la dimensión durante la revisión.

5. Dimensión no asignada:
   source: "not_assigned"
   → No se pudo determinar la dimensión.
```

---

## 6. Experiencia conversacional esperada

El agente no debe listar 37 preguntas de golpe por defecto. Debe usar agrupación progresiva.

**Flujo recomendado al entrar al paso 1/7:**

```
Asistente:
1/7 · Preguntas y escalas

Detecté 37 preguntas. Las organicé por dimensión y tipo de escala.

Resumen:
• Liderazgo: 8 preguntas · Likert 5
• Compromiso: 7 preguntas · Likert 5
• Cultura: 6 preguntas · Likert 5
• eNPS: 1 pregunta · NPS 0–10
• Otras: 15 preguntas

Puedes responder:
1. Ver preguntas por dimensión
2. Ver preguntas que requieren revisión
3. Ver todas las preguntas en bloques
4. Confirmar esta sección
```

**Cuando el usuario pide ver una dimensión:**

```
Usuario: ver dimensión Liderazgo

Asistente:
Dimensión: Liderazgo · 8 preguntas · Likert 5

1. "Mi jefe directo me da retroalimentación útil" · Alineada
2. "Confío en las decisiones de mi jefe directo" · Alineada
3. "Mi jefe directo reconoce mi trabajo" · Alineada
4. "Recibo comunicación clara de mi jefe directo" · Alineada
5. "Mi jefe directo me apoya en mi desarrollo" · Alineada
6. "Mi jefe directo promueve un buen ambiente" · Alineada
7. "Mi jefe directo me involucra en las decisiones" · Alineada
8. "Mi jefe directo es un ejemplo de liderazgo" · Alineada

Para ver detalle de una pregunta, responde con su número.
Para volver, responde "volver".
```

**Cuando el usuario pide ver una pregunta específica:**

```
Usuario: ver pregunta 3

Asistente:
Pregunta #3 · Dimensión: Liderazgo

Texto:
"Confío en las decisiones de mi jefe directo"

Tipo de pregunta:
Escala de valoración

Tipo de escala:
Likert 5 puntos

Detalle de escala:
Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo

Dimensión:
Liderazgo

Estado:
Alineada

Acciones disponibles (responde por texto):
- confirmar → Confirma esta pregunta
- cambiar tipo de pregunta → Cambia el tipo
- cambiar tipo de escala → Cambia la escala
- cambiar dimensión → Cambia la dimensión
- ver detalles → Más contexto
```

**Cuando el usuario modifica algo:**

```
Usuario: cambia la dimensión de la pregunta 3 a Compromiso

Asistente:
Entendido. Cambié la dimensión de la pregunta #3 de Liderazgo a Compromiso.

Estado actual de la pregunta #3:
• Tipo: Escala de valoración
• Escala: Likert 5 puntos
• Dimensión: Compromiso (corregida por usuario)
• Estado: Editada

¿Quieres hacer otro ajuste o confirmas esta pregunta?
```

---

## 7. Comandos conversacionales soportados

Comandos que el usuario puede escribir para navegar y editar en el paso 1/7:

```text
Navegación:
  "ver preguntas"                    → Muestra resumen agrupado
  "ver preguntas por dimensión"     → Muestra lista de dimensiones con conteo
  "ver dimensión Liderazgo"         → Muestra preguntas de una dimensión
  "ver pregunta 3"                  → Muestra detalle completo de la pregunta
  "ver preguntas por revisar"       → Muestra solo preguntas con status needs_review
  "ver detalles"                    → Muestra más contexto de la pregunta actual
  "volver"                          → Vuelve al nivel anterior de navegación

Edición:
  "cambia el tipo de la pregunta 3 a NPS"
  "la pregunta 8 es NPS"
  "ajusta la escala de la pregunta 5 a Likert 5"
  "cambia la dimensión de la pregunta 3 a Liderazgo"
  "la pregunta 12 es texto abierto"
  "edita el texto de la pregunta 7: Nuevo texto aquí"

Confirmación:
  "confirma la pregunta 4"
  "confirma esta sección"

Consulta:
  "ver detalles de la pregunta 6"
```

**Interpretación conceptual de comandos:**

```text
Comando: "cambia el tipo de la pregunta 3 a NPS"
  intent: "change_question_type"
  targetQuestionId: "q_3"
  newQuestionType: "nps"

Comando: "ajusta la escala de la pregunta 5 a Likert 5"
  intent: "change_scale_type"
  targetQuestionId: "q_5"
  newScaleType: "likert_5"

Comando: "cambia la dimensión de la pregunta 3 a Liderazgo"
  intent: "change_dimension"
  targetQuestionId: "q_3"
  targetDimensionName: "Liderazgo"

Comando: "confirma la pregunta 4"
  intent: "confirm_question"
  targetQuestionId: "q_4"

Comando: "confirma esta sección"
  intent: "confirm_section"
  confirmationScope: "all"
```

No implementar parser todavía. Solo diseño.

---

## 8. Reglas de edición por chat

```text
1. Editar una pregunta no confirma toda la sección.
   → Cada pregunta tiene estado individual (aligned | needs_review | new_question | uninterpretable | edited | confirmed).
   → Cambiar un campo marca la pregunta como "edited".
   → Confirmar una pregunta marca la pregunta como "confirmed".
   → Confirmar toda la sección solo es posible cuando se cumplen las reglas de la sección 12.

2. Cambiar tipo de escala debe actualizar el detalle de escala.
   → Si el usuario cambia a "Likert 5", el detalle debe actualizarse automáticamente con los anchors de Likert 5.
   → Si el usuario cambia a "NPS 0–10", el detalle debe actualizarse con la escala NPS.
   → No se requiere que el usuario escriba los anchors manualmente.

3. Cambiar dimensión debe dejar audit trail conceptual.
   → La dimensión anterior se conserva en el historial de la pregunta.
   → source pasa a "user_corrected".
   → No se elimina la dimensión anterior del catálogo.

4. Confirmar sección solo ocurre cuando no hay bloqueos críticos.
   → Ver reglas en sección 12.

5. Inputs ambiguos deben pedir aclaración.
   → "Cambia la pregunta" → "¿Qué pregunta quieres cambiar? Responde con el número."
   → "Cambia la escala" → "¿A qué tipo de escala quieres cambiar?"

6. No se crean botones de acción para revisión o edición.
   → Toda interacción es por texto en el chat.

7. No se abre panel lateral para editar preguntas.
   → Todo ocurre dentro del flujo de mensajes del chat.

8. No se crea editor externo (form mode, tabla editable).
   → Solo edición conversacional por texto.
```

---

## 9. Reglas de privacidad

```text
NO_PII_VISIBLE = YES
  └── No se muestran nombres, correos, IDs de empleados, documentos.

NO_RAW_ROWS_VISIBLE = YES
  └── No se muestran filas individuales de respuestas.

NO_OPEN_TEXT_VISIBLE = YES
  └── No se muestran respuestas abiertas de personas.
  └── Se puede mostrar el texto de la pregunta abierta (e.g., "¿Qué sugerencias tienes?").
  └── No se pueden mostrar ejemplos reales de respuestas abiertas.

NO_WORKBOOK_DUMP_VISIBLE = YES
  └── No se muestran dumps completos de archivos Excel.

NO_REAL_CLIENT_DATA = YES
  └── Solo datos sintéticos/demo/fixture.

Regla para preguntas abiertas:
  └── El texto de la pregunta puede mostrarse (e.g., "¿Qué sugerencias tienes para mejorar?").
  └── Las respuestas a preguntas abiertas NO pueden mostrarse bajo ninguna circunstancia.
  └── El detalle de escala para preguntas abiertas es "No aplica".
```

---

## 10. Relación con datos mock/demo

Estado actual:

- `qsClimaDemoFixture` en `demo-fixture/qsClimaFixture.ts` contiene 37 preguntas con `displayLabel`, `id`, y `dimensionId`.
- `demoFixtureStructureReviewMapper.ts` usa el fixture para generar mensajes de revisión de estructura.
- `conversationalEditingMapper.ts` usa el fixture para listar dimensiones y preguntas.

Evolución requerida:

```text
Mock Data Layer (qsClimaDemoFixture)
  └── Ya contiene preguntas y dimensiones.
  └── Futuro: debe exponer también questionType, scaleType, scaleDetail para cada pregunta.
  └── No mutar fixture actual. Extender contrato si se autoriza en fase 11F-B.

Mappers (demoFixtureStructureReviewMapper, conversationalEditingMapper)
  └── Deben consumir el contrato extendido para generar mensajes detallados.
  └── No hardcodear datos de preguntas en los mappers.

Message Composition (Question Scale Dimension Review Layer)
  └── Produce los mensajes conversacionales usando los mappers.
  └── No contiene datos de preguntas hardcodeados.

Workspace State (ConversationalImportWorkspace)
  └── Conserva el estado de la revisión (pregunta actual, preguntas confirmadas, etc.).
  └── No contiene datos de preguntas.

Visual Renderer (Chat Foundation)
  └── Solo renderiza mensajes. No conoce preguntas, escalas ni dimensiones.
```

**Reglas:**

```text
NO_HARDCODED_QUESTIONS_IN_COMPONENTS = YES
NO_HARDCODED_SCALES_IN_COMPONENTS = YES
NO_HARDCODED_DIMENSIONS_IN_COMPONENTS = YES
MOCK_DATA_SEPARATED_FROM_MAPPERS = YES
MAPPERS_SEPARATED_FROM_MESSAGE_COMPOSITION = YES
MESSAGE_COMPOSITION_SEPARATED_FROM_WORKSPACE_STATE = YES
```

---

## 11. Estados del paso 1/7

Estados conceptuales del paso `reviewing_questions_and_scales`:

```text
summary_ready
  └── El agente mostró el resumen agrupado (por dimensión y tipo de escala).
  └── El usuario puede navegar, ver detalle o confirmar.

listing_by_dimension
  └── El agente está mostrando preguntas de una dimensión específica.
  └── El usuario puede seleccionar una pregunta o volver.

listing_needs_review
  └── El agente está mostrando solo preguntas que requieren revisión.
  └── El usuario puede seleccionar una pregunta o volver.

viewing_question_detail
  └── El agente muestra detalle completo de una pregunta (texto, tipo, escala, detalle, dimensión, estado).
  └── El usuario puede editar, confirmar o volver.

editing_question_type
  └── El agente está esperando que el usuario especifique el nuevo tipo de pregunta.
  └── Input esperado: "rating_scale", "nps", "open_text", etc.

editing_scale_type
  └── El agente está esperando que el usuario especifique el nuevo tipo de escala.
  └── Input esperado: "likert_5", "nps_0_10", "binary_yes_no", etc.

editing_dimension
  └── El agente está esperando que el usuario especifique la nueva dimensión.
  └── Input esperado: nombre de dimensión o número.

awaiting_confirmation
  └── El agente está esperando confirmación para una pregunta o para toda la sección.
  └── Input esperado: "confirmar" o "cancelar".

confirmed
  └── La sección ha sido confirmada. El flujo avanza a 2/7.
  └── No se puede editar después de confirmar.

blocked
  └── Hay bloqueos que impiden confirmar la sección.
  └── El agente explica los bloqueos y espera resolución.
```

**Transiciones de estado:**

```text
summary_ready
  → "ver dimensión X" → listing_by_dimension
  → "ver preguntas por revisar" → listing_needs_review
  → "ver pregunta N" → viewing_question_detail
  → "confirmar esta sección" → (evaluar bloqueos) → confirmed | blocked

listing_by_dimension
  → "ver pregunta N" → viewing_question_detail
  → "volver" → summary_ready

listing_needs_review
  → "ver pregunta N" → viewing_question_detail
  → "volver" → summary_ready

viewing_question_detail
  → "cambiar tipo de pregunta" → editing_question_type
  → "cambiar tipo de escala" → editing_scale_type
  → "cambiar dimensión" → editing_dimension
  → "confirmar" → viewing_question_detail (status → confirmed)
  → "volver" → summary_ready

editing_question_type
  → input válido → viewing_question_detail (con tipo actualizado)
  → input inválido → editing_question_type (pedir aclaración)

editing_scale_type
  → input válido → viewing_question_detail (con escala actualizada)
  → input inválido → editing_scale_type (pedir aclaración)

editing_dimension
  → input válido → viewing_question_detail (con dimensión actualizada)
  → input inválido → editing_dimension (pedir aclaración)

confirmed
  → (fin del paso 1/7, avance a 2/7)

blocked
  → (resolver bloqueos) → summary_ready
```

---

## 12. Confirmación de sección

La sección `1/7 · Preguntas y escalas` puede ser confirmada solo cuando se cumplen TODAS estas condiciones:

```text
1. Todas las preguntas críticas tienen tipo de pregunta definido.
   → questionType no es "unknown" para preguntas que requieren tipo.
   → Preguntas abiertas pueden tener questionType "open_text".

2. Todas las preguntas cerradas tienen tipo de escala definido.
   → scaleType no es "unknown" ni "not_applicable" para preguntas de escala.
   → Preguntas de tipo rating_scale, single_choice, multiple_choice, nps, enps, matrix deben tener escala.

3. Preguntas NPS/eNPS tienen escala NPS 0–10.
   → scaleType === "nps_0_10".

4. Preguntas de clima/cultura tienen dimensión asignada cuando aplica.
   → dimensionId no es null para preguntas que requieren dimensión.

5. No hay preguntas no interpretables críticas (status "uninterpretable") sin resolver.

6. El usuario confirma explícitamente por texto.
   → El usuario escribe "confirmar esta sección" o equivalente.
   → No hay confirmación automática.
```

**Flujo de confirmación exitosa:**

```
Usuario: confirmar esta sección

Asistente:
Sección 1/7 · Preguntas y escalas confirmada.

Resumen final:
• 37 preguntas revisadas
• 37 preguntas con tipo asignado
• 36 preguntas con escala asignada
• 1 pregunta abierta sin escala
• 37 preguntas con dimensión
• 0 preguntas no interpretables

Avanzando a 2/7 · Demográficos...
```

**Flujo de confirmación bloqueada:**

```
Usuario: confirmar esta sección

Asistente:
No puedo confirmar la sección aún.

Bloqueos encontrados:
• Pregunta #12: tipo de pregunta no definido (unknown)
• Pregunta #15: escala no asignada
• Pregunta #8: requiere revisión (needs_review)

Resuelve los bloqueos y vuelve a intentar.
```

---

## 13. Out of scope

```text
NO_IMPORTACION_REAL
  └── No se ejecuta importación real en ninguna fase de esta arquitectura.

NO_DASHBOARD
  └── No se crea dashboard ni vista comparativa de resultados.

NO_COMPARATIVO
  └── No se comparan encuestas entre sí.

NO_EDICION_EN_SIDE_PANEL
  └── No se abre panel lateral para editar preguntas.

NO_TABLA_EDITABLE_EXTERNA
  └── No se crea tabla editable fuera del chat.

NO_BOTONES_DE_ACCION
  └── No se agregan botones para revisar, editar o confirmar preguntas.
  └── Toda interacción es por texto en el chat.

NO_AI_OVERHYPE
  └── No se simula AI donde no es necesaria.
  └── La interpretación de comandos debe ser determinística donde sea posible.

NO_APIS_REALES
  └── No se conectan APIs externas.

NO_DATOS_REALES_DE_CLIENTES
  └── Solo datos sintéticos/demo/fixture.
```

---

## 14. Testing strategy futura

Cuando se implemente la capa de revisión de preguntas, se deben probar los siguientes escenarios:

```text
RESUMEN_AGRUPADO_POR_DIMENSION
  └── Dado un set de preguntas, el agente genera resumen agrupado por dimensión con conteos.
  └── Verificar que el resumen incluye: nombre dimensión, cantidad preguntas, tipo escala.

DETALLE_DE_PREGUNTA_INDIVIDUAL
  └── Dado un questionId, el agente genera detalle completo: texto, tipo, escala, detalle, dimensión, estado.

DETALLE_DE_ESCALA_LIKERT
  └── Dado scaleType "likert_5", generar detalle con anchors correctos (Muy en desacuerdo ... Muy de acuerdo).

DETALLE_DE_ESCALA_NPS
  └── Dado scaleType "nps_0_10", generar detalle con rango 0–10 y clasificación Detractores/Pasivos/Promotores.

CAMBIO_DE_DIMENSION_POR_TEXTO
  └── Input "cambia la dimensión de la pregunta 3 a Liderazgo"
  └── Output: dimensión actualizada, source = "user_corrected", status = "edited".

CAMBIO_DE_ESCALA_POR_TEXTO
  └── Input "cambia la escala de la pregunta 5 a Likert 5"
  └── Output: scaleType actualizado, scaleDetail actualizado con anchors Likert 5.

CAMBIO_DE_TIPO_DE_PREGUNTA_POR_TEXTO
  └── Input "la pregunta 8 es NPS"
  └── Output: questionType actualizado a "nps", scaleType actualizado a "nps_0_10".

INPUT_INVALIDO_PIDE_ACLARACION
  └── Input "cambia la pregunta"
  └── Output: mensaje pidiendo número de pregunta.

CONFIRMACION_DE_PREGUNTA
  └── Input "confirma la pregunta 4"
  └── Output: status de pregunta 4 → "confirmed".

CONFIRMACION_DE_SECCION
  └── Input "confirma esta sección"
  └── Output: si cumple reglas → confirmed; si no → blocked con lista de bloqueos.

NO_MUESTRA_RAW_ROWS
  └── Verificar que ningún mensaje contiene raw rows.

NO_MUESTRA_OPEN_TEXT_ANSWERS
  └── Verificar que ningún mensaje muestra respuestas abiertas.

NO_DUPLICA_MENSAJES
  └── Verificar que no se duplican mensajes al navegar o editar.

MANTIENE_ALL_ACTIONS_BY_CHAT
  └── Verificar que no se introducen botones ni paneles laterales.

MANTIENE_DETERMINISMO
  └── Mismo input de preguntas produce mismo output de mensajes.
  └── No depende de Date.now(), Math.random() ni estado externo.

NO_MUTA_INPUT
  └── Los mappers no mutan el array de preguntas de entrada.

NO_PII_EN_OUTPUT
  └── Verificar que ningún mensaje contiene PII.
```

---

## 15. Plan de implementación futura

Fases propuestas para implementar la revisión detallada de preguntas, escalas y dimensiones:

```text
11F-B · Question Scale Dimension Mock Data Contract
  └── Extender el contrato mock (DemoFixtureDataset) para incluir:
      - questionType por pregunta
      - scaleType por pregunta
      - scaleDetail por pregunta
      - dimensionId explícito en preguntas
  └── Solo tipos/contratos. No modificar runtime. No modificar UI.
  └── Preservar contracto existente. Extender por adición.

11F-C · Question Review Types
  └── Crear tipos TypeScript para:
      - QuestionReviewItem (contrato de pregunta revisable)
      - QuestionType, ScaleType, ScaleDetail, DimensionAssignment
      - QuestionReviewState (summary_ready, viewing_question_detail, etc.)
      - QuestionReviewCommand (intents de navegación y edición)
  └── Solo tipos. No funciones. No runtime. No UI.

11F-D · Question Review Mapper
  └── Crear mapper puro que:
      - Toma preguntas del fixture/contrato + overlay state
      - Produce mensajes de resumen agrupado
      - Produce mensajes de detalle de pregunta individual
      - Produce mensajes de detalle de escala
  └── No modificar workspace. No modificar UI.
  └── Tests puros (no integration, no runtime).

11F-E · Conversational Question Editing Mapper
  └── Crear mapper puro que:
      - Interpreta comandos de usuario (cambiar tipo, escala, dimensión)
      - Valida cambios
      - Produce nuevo estado de la pregunta
      - Produce mensaje de confirmación del cambio
  └── Extender conversationalEditingFlow.ts por adición.
  └── No modificar el flujo de renombre existente.

11F-F · Workspace Integration
  └── Integrar la revisión detallada en ConversationalImportWorkspace:
      - Reemplazar la llamada a getMatchReviewSectionMessage("questions_and_scales")
      - Manejar los nuevos estados (viewing_question_detail, editing_question_type, etc.)
      - Conectar comandos de edición con la capa de edición
      - Evaluar reglas de confirmación de sección
  └── Feature gate si es necesario.
  └── No romper flujo 5173.

11F-G · Visual QA 5173
  └── Verificar flujo completo en 5173.
  └── Verificar navegación por dimensión, detalle de pregunta, edición, confirmación.
  └── Verificar que no hay botones, paneles laterales, ni datos sensibles.

11F-H · Stabilization / Hotfix si aplica
  └── Bugs encontrados en QA.
  └── Sin nuevas features.
```

No implementar estas fases todavía. Solo están definidas.

---

## Marcadores

```text
PHASE_11F_A_QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE_COMPLETE
QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE_LOCKED
QUESTION_REVIEW_BOUNDARY_DEFINED
QUESTION_CONTRACT_DEFINED
QUESTION_TYPE_CONTRACT_DEFINED
SCALE_TYPE_CONTRACT_DEFINED
SCALE_DETAIL_CONTRACT_DEFINED
DIMENSION_ASSIGNMENT_CONTRACT_DEFINED
QUESTION_REVIEW_CONVERSATIONAL_COMMANDS_DEFINED
QUESTION_REVIEW_EDITING_RULES_DEFINED
QUESTION_REVIEW_PRIVACY_RULES_DEFINED
QUESTION_REVIEW_STEP_STATES_DEFINED
QUESTION_REVIEW_CONFIRMATION_RULES_DEFINED
QUESTION_REVIEW_TESTING_STRATEGY_DEFINED
QUESTION_REVIEW_IMPLEMENTATION_PLAN_DEFINED
NO_CODE_CHANGES
NO_RUNTIME_CHANGES
NO_UI_CHANGES
NO_IMPORT_EXECUTION
NO_DASHBOARD_OR_COMPARISON_CHANGES
READY_FOR_COMPARISON_OUTPUT_DISABLED
PHASE_11F_B_READY
```
