# Demographics Workspace Integration Architecture

<!-- PHASE_11G_D_DEMOGRAPHICS_WORKSPACE_INTEGRATION_ARCHITECTURE_LOCKED -->
<!-- DEMOGRAPHICS_WORKSPACE_ENTRY_POINT_DEFINED -->
<!-- DEMOGRAPHICS_MAIN_MESSAGE_INTEGRATION_DEFINED -->
<!-- DEMOGRAPHICS_RUNTIME_STATE_MODEL_DEFINED -->
<!-- DEMOGRAPHICS_TEXT_COMMANDS_DEFINED -->
<!-- DEMOGRAPHICS_DETAIL_FLOW_DEFINED -->
<!-- DEMOGRAPHICS_DESTINATION_CHANGE_FLOW_DEFINED -->
<!-- DEMOGRAPHICS_INVALID_SYNC_FLOW_DEFINED -->
<!-- DEMOGRAPHICS_CONFIRMATION_FLOW_DEFINED -->
<!-- DEMOGRAPHICS_NUMERIC_SELECTION_CONTEXT_RULE_DEFINED -->
<!-- DEMOGRAPHICS_PLACEHOLDER_CONTEXT_RULE_DEFINED -->
<!-- DEMOGRAPHICS_THINKING_POLICY_DEFINED -->
<!-- DEMOGRAPHICS_PRIVACY_RULES_DEFINED -->
<!-- DEMOGRAPHICS_NEXT_PHASES_DEFINED -->
<!-- ALL_ACTIONS_BY_CHAT_TEXT_ONLY_DEFINED -->
<!-- NO_ACTION_BUTTONS_FOR_REVIEW_DEFINED -->
<!-- NO_SIDE_PANEL_EDITOR_DEFINED -->
<!-- NO_EXTERNAL_REVIEW_TAB_DEFINED -->
<!-- NO_FORM_MODE_EDITOR_DEFINED -->

## Context

This document defines the technical architecture for integrating Step `2/7 · Demográficos` into the `ConversationalImportWorkspace` runtime.

The following modules already exist and must be consumed (not modified by this architecture):

- `docs/DEMOGRAPHICS_REVIEW_ARCHITECTURE.md` — Full architecture for demographics review
- `src/features/historical-import/conversational-import/demographics-review/demographicsReviewTypes.ts` — All types including `DemographicReviewField`, `DemographicsReviewSummary`, `DemographicsReviewConversationViewModel`, `DemographicsConversationMessage`
- `src/features/historical-import/conversational-import/demographics-review/demographicsReviewMockData.ts` — 12 mock demographic fields with items, destinations, match reasons
- `src/features/historical-import/conversational-import/demographics-review/demographicsReviewMapper.ts` — `matchDemographicToSystem`, `mapDetectedFieldToReviewField`, `mapFieldsToReviewSummary`, `mapReviewSummaryToConversationViewModel`, `getDestinationText`, `getDestinationReasonText`
- `src/features/historical-import/conversational-import/demographics-review/demographicsReviewMessageMapper.ts` — `createDemographicsReviewMainMessage`, `createDemographicsReviewDetailMessage`, `createDemographicsReviewConfirmationMessage`, `createDemographicsDestinationChangeMessage`, `createDemographicsInvalidSystemSyncMessage`, `createDemographicsUnknownCommandMessage`, `findFieldByIndexOrName`

---

## 1. Current State That Must Be Replaced

The current implementation of `2/7 · Demográficos` at `ConversationalImportWorkspace.tsx:1856` uses `getMatchReviewSectionMessage("demographics", scope, false)` which returns:

```
2/7 · Demográficos

Detecté campos demográficos y segmentadores asociados a la encuesta.

Resultado del match:
- Demográficos detectados: 7
- Alineados: 7
- Nuevos: 0
- Por revisar: 0
- No interpretables: 0

Ejemplos seguros:
- Gerencia
- Área
- Rol
- Antigüedad
- Sede
- Nivel
- Departamento

Recomendación:
Usar estos campos solo como segmentadores agregados. No se mostrarán datos individuales.

¿Confirmas esta sección?
```

This is a flat summary. It does NOT show:
- All detected demographics in a single view
- Items detected per demographic
- Sync destination per demographic
- Match reason per demographic

**The Owner requires** that `2/7 · Demográficos` works exactly like `1/7 · Preguntas y escalas`: showing all fields with full detail, and enabling review by chat text only.

The future integration must replace `getMatchReviewSectionMessage("demographics", ...)` with a call to `createDemographicsReviewMainMessage(viewModel)` using the existing mapper pipeline:

```
demographicsReviewMockData.createDemographicsReviewMockData()
  -> demographicsReviewMapper.mapFieldsToReviewSummary()
  -> demographicsReviewMapper.mapReviewSummaryToConversationViewModel()
  -> demographicsReviewMessageMapper.createDemographicsReviewMainMessage()
  -> assistant message (DemographicsConversationMessage.text)
```

---

## 2. Entry to Step 2/7 · Demográficos

### Trigger

The workspace enters `2/7 · Demográficos` after the user confirms `1/7 · Preguntas y escalas`, either by:
- Selecting option "2" (Continuar a Demográficos) at line 1059
- Typing "continuar a demográficos" at line 1743

Both currently set `conversationalEditState = "reviewing_demographics"`.

### Entry Action (Future Implementation)

Upon entering `reviewing_demographics`, the workspace must:

1. Derive mock data: `const mockFields = createDemographicsReviewMockData()`
2. Derive summary: `const summary = mapFieldsToReviewSummary(mockFields)`
3. Derive view model: `const viewModel = mapReviewSummaryToConversationViewModel(summary)`
4. Derive main message: `const mainMsg = createDemographicsReviewMainMessage(viewModel)`
5. Render `mainMsg.text` as assistant content
6. Set runtime state to `main_review`

### Rules

- `ENTRY_DATA_SOURCE = MOCK_DATA_ONLY` — No real data, no workbook rows, no live API
- `ENTRY_MESSAGE_HARDCODED = NO` — Must derive through mapper pipeline, not hardcode string in workspace
- `ENTRY_FIELDS_HARDCODED_IN_JSX = NO` — No demographic fields rendered in JSX; all fields come from message mapper output
- `ENTRY_TRANSITION = FROM_STEP_1_CONFIRMATION` — Only after 1/7 is confirmed
- `ENTRY_THINKING = DEFAULT_LIGHT` — Entry transition already shows "Pensando..." from the step transition; demographics message itself is lightweight

---

## 3. Main Message Expected

The initial message for `2/7 · Demográficos` rendered by `createDemographicsReviewMainMessage` must display:

```
2/7 · Demográficos

Detecté {n} campos demográficos y segmentadores asociados a la encuesta.

Estos son los demográficos encontrados:

{index}. {detectedName}
Items detectados: {sampleItemsPreview}
Destino: {destinationText}
Motivo: {matchReason}

...

Resumen:
- Sincronizados con sistema: {count}
- Creados solo en esta encuesta: {count}
- Por revisar: {count}
- Excluidos: {count}

Puedes responder:
1. Confirmar demográficos
2. Revisar {nombre del demográfico}
3. Cambiar destino de sincronización
4. Excluir un demográfico
5. Continuar sin cambios
```

### Example with Mock Data

```
2/7 · Demográficos

Detecté 12 campos demográficos y segmentadores asociados a la encuesta.

Estos son los demográficos encontrados:

1. Gerencia
Items detectados: Comercial, Operaciones, Tecnología, Talento
Destino: Se sincronizará con "Departamento o área de trabajo"
Motivo: Gerencia se interpreta como área organizacional porque sus valores parecen áreas internas y coincide semánticamente con Departamento o área de trabajo.

2. Área
Items detectados: Comercial, Operaciones, Tecnología
Destino: Se sincronizará con "Departamento o área de trabajo"
Motivo: Alias directo: Área es sinónimo de Departamento o área de trabajo.

...

12. Segmento personalizado
Items detectados: Premium, Standard, Básico
Destino: Requiere revisión
Motivo: El nombre no coincide claramente con ningún demográfico precargado del sistema.

Resumen:
- Sincronizados con sistema: 7
- Creados solo en esta encuesta: 3
- Por revisar: 1
- Excluidos: 0

Puedes responder:
1. Confirmar demográficos
2. Revisar {nombre del demográfico}
3. Cambiar destino de sincronización
4. Excluir un demográfico
5. Continuar sin cambios
```

### Rules

- `MAIN_MESSAGE_SHOWS_ALL_FIELDS = YES`
- `MAIN_MESSAGE_SHOWS_DETECTED_ITEMS = YES`
- `MAIN_MESSAGE_SHOWS_DESTINATION_PER_FIELD = YES`
- `MAIN_MESSAGE_SHOWS_MATCH_REASON = YES`
- `MAIN_MESSAGE_SHOWS_AGGREGATE_SUMMARY = YES`
- `MAIN_MESSAGE_SHOWS_TEXT_COMMANDS = YES`
- `MAIN_MESSAGE_USES_EXISTING_MAPPER = YES` — Must call `createDemographicsReviewMainMessage()` not a workspace inline string

---

## 4. Runtime State Model

A conceptual state model for the demographics review runtime inside the workspace:

```typescript
type DemographicsReviewStatus =
  | 'main_review'
  | 'field_detail'
  | 'awaiting_destination'
  | 'awaiting_confirmation'
  | 'section_confirmed';

interface DemographicsReviewRuntimeState {
  status: DemographicsReviewStatus;
  selectedFieldId: string | null;
  pendingDestinationChange: {
    fieldId: string;
    requestedSystemLabel: string | null;
    action: 'sync_with_system' | 'create_in_survey_only' | 'excluded';
  } | null;
  confirmedFieldIds: string[];
  excludedFieldIds: string[];
  destinationOverrides: Record<string, 'sync_with_system' | 'create_in_survey_only' | 'excluded'>;
  lastVisibleFieldList: string; // Snapshot of field list order at last main message
  lastMessageKind: 'main_review' | 'field_detail' | 'confirmation' | 'destination_change' | 'invalid_sync' | 'unknown_command';
}
```

### Status Transitions

```
main_review
  → (user: revisar {name}) → field_detail
  → (user: confirmar demográficos) → section_confirmed
  → (user: continuar sin cambios) → section_confirmed

field_detail
  → (user: confirmar este demográfico) → main_review
  → (user: sincroniza con ...) → awaiting_destination
  → (user: crear solo en encuesta) → main_review (with override)
  → (user: excluir) → main_review (with exclusion)
  → (user: volver a la lista) → main_review

awaiting_destination
  → (user: selects valid system demo) → main_review (with override)
  → (user: selects invalid system demo) → main_review (with error message)
  → (user: cancels) → field_detail

awaiting_confirmation
  → (user confirms) → section_confirmed
```

### Critical Rule

```
NUMERIC_SELECTION_MUST_USE_VISIBLE_CONTEXT = YES
```

If the visible message lists 12 demographics, `revisar 2` must select the second demographic in that visible list (index 1 of the fields array at the time the message was rendered), not a global index from an external source.

This means `findFieldByIndexOrName` already implements this correctly — it reads from the `fields` parameter passed at call time. The workspace must always pass the fields array from the last rendered view model.

---

## 5. Text Commands

The following text commands must be supported by the workspace routing logic. All are chat-text only.

### Primary Commands (from main_review)

| User Input | Action | Notes |
|------------|--------|-------|
| `confirmar demográficos` | Confirm section | Calls `createDemographicsReviewConfirmationMessage`, sets status to `section_confirmed`, advances to step 3 |
| `continuar sin cambios` | Confirm section | Same as confirm; no changes applied |
| `continuar a la siguiente sección` | Confirm section | Same as confirm |
| `revisar {name}` | Show field detail | Calls `createDemographicsReviewDetailMessage`; sets `selectedFieldId` |
| `revisar {n}` | Show field detail by index | Uses numeric context from visible list |
| `sincroniza {name} con {systemDemo}` | Change destination | Validate against system preloaded list |
| `crear {name} solo en la encuesta` | Set survey-only | Always valid |
| `excluir {name}` | Exclude field | Always valid |
| `cambia {name} a encuesta solamente` | Set survey-only | Always valid |
| `confirmar este demográfico` | Confirm field | Sets field reviewStatus to confirmed |

### Secondary Commands (from field_detail)

| User Input | Action |
|------------|--------|
| `volver a la lista` | Return to main_review |
| `confirmar este demográfico` | Confirm this field, return to list |

### Destination Change Variants

| User Input | Validation |
|------------|------------|
| `sincroniza {name} con {systemLabel}` | System label must exist in SYSTEM_PRELOADED_DEMOGRAPHICS |
| `crear {name} solo en la encuesta` | Always valid |
| `excluir {name}` | Always valid |

### Command Parsing Rules

- `INPUT_NORMALIZATION = CASE_INSENSITIVE + ACCENT_INSENSITIVE`
- `NUMERIC_INPUT = ONLY_VALID_IN_VISIBLE_CONTEXT`
- `UNKNOWN_COMMAND = CALL createDemographicsUnknownCommandMessage`
- `AMBIGUOUS_MATCH = CLARIFY_BY_NAME` — If "revisar" could match multiple, ask for clarification

---

## 6. Detail Flow

### Trigger

User types `revisar País` or `revisar 3` in `main_review` state.

### Implementation (Future)

1. Parse the input to find the field using `findFieldByIndexOrName(fields, input)`
2. If not found, respond with unknown command message
3. If found, set `selectedFieldId = field.id`, set status to `field_detail`
4. Call `createDemographicsReviewDetailMessage(field)` and render the text

### Expected Output

```
Detalle de País

Items detectados:
- Colombia
- México
- Perú

Destino actual:
Se sincronizará con "País"

Motivo:
Coincidencia directa con demográfico precargado.

Puedes responder:
1. Confirmar este demográfico
2. Crear solo en encuesta
3. Excluir
4. Volver a la lista
```

### Rules

- `DETAIL_SHOWS_DETECTED_ITEMS = YES`
- `DETAIL_SHOWS_CURRENT_DESTINATION = YES`
- `DETAIL_SHOWS_MATCH_REASON = YES`
- `DETAIL_SHOWS_ACTION_OPTIONS = YES`
- `DETAIL_NO_RAW_ROWS = YES`
- `DETAIL_NO_INDIVIDUAL_RESPONSES = YES`
- `DETAIL_NO_PII = YES`

---

## 7. Destination Change Flow

### Valid Change

User types: `sincroniza Gerencia con Departamento o área de trabajo`

1. Find field by name "Gerencia"
2. Validate "Departamento o área de trabajo" exists in SYSTEM_PRELOADED_DEMOGRAPHICS
3. If valid, record the override in `destinationOverrides` (local state only)
4. Call `createDemographicsDestinationChangeMessage` with previous and new destination text
5. Set status back to `main_review`

### Expected Output

```
Listo. Actualicé el destino de Gerencia.

Gerencia
Destino anterior: Se sincronizará con "Departamento o área de trabajo"
Destino nuevo: Se creará solo en esta encuesta

Motivo:
No existe como demográfico precargado del sistema.
```

### Invalid Change (Non-Existent System Demographic)

User types: `sincroniza Sede con Sede`

1. Find field by name "Sede"
2. Attempt to validate "Sede" in SYSTEM_PRELOADED_DEMOGRAPHICS — NOT FOUND
3. Call `createDemographicsInvalidSystemSyncMessage("Sede")`

### Expected Output

```
No puedo sincronizar Sede con un demográfico del sistema llamado "Sede" porque no está en la lista de precargados disponibles.

Opciones del sistema:
1. Departamento o área de trabajo
2. Nivel jerárquico en la empresa
3. País
4. Ciudad
5. Columna A
6. Columna B

También puedo crear Sede solo en esta encuesta.
```

### Critical Invariant

```
INVALID_SYNC_DOES_NOT_MUTATE_STATE = YES
```

An invalid sync attempt must NEVER:
- Create a pending destination change
- Mutate `destinationOverrides`
- Change the field's destination
- Set a fake/forced match

It must only display the error message with available system options and return to `main_review`.

---

## 8. Invalid Sync Blocking

### Detection

A sync request is invalid when:
- The target system demographic does not exist in `SYSTEM_PRELOADED_DEMOGRAPHICS`
- The target system demographic label does not match by exact label (case-insensitive)

### Response

Call `createDemographicsInvalidSystemSyncMessage(fieldName)` and render the text.

The message lists all 6 system preloaded demographics and offers `create_in_survey_only` as alternative.

### Rules

- `SYNC_BLOCKED_FOR_NONEXISTENT_SYSTEM_DEMOGRAPHIC = YES`
- `SYNC_ERROR_LISTS_AVAILABLE_OPTIONS = YES`
- `SYNC_ERROR_OFFERS_SURVEY_ONLY_ALTERNATIVE = YES`
- `INVALID_SYNC_DOES_NOT_MUTATE_STATE = YES`
- `SYNC_ACCEPTS_INDEX_REFERENCE = NO` — Must use label, not index, for system demographic

---

## 9. Confirmation Flow

### Trigger

User types `confirmar demográficos` or `continuar sin cambios` in `main_review` state.

### Implementation (Future)

1. Gather current state: `confirmedFieldIds`, `excludedFieldIds`, `destinationOverrides`
2. Derive final `DemographicsReviewSummary` with overrides applied (locally, no persistence)
3. Call `createDemographicsReviewConfirmationMessage(summary, nextSectionLabel)`
4. Set status to `section_confirmed`
5. Advance to step `3/7` (next section in the flow)

### Expected Output

```
Sección 2/7 · Demográficos confirmada.

Sincronizados con sistema:
- Gerencia → Departamento o área de trabajo
- Área → Departamento o área de trabajo
- País → País
- Ciudad → Ciudad
- Nivel → Nivel jerárquico en la empresa
- Departamento → Departamento o área de trabajo
- Columna A → Columna A
- Columna B → Columna B

Creados solo en esta encuesta:
- Rol
- Antigüedad
- Sede

Por revisar:
- Segmento personalizado

Avanzando a 3/7 · {nextSectionLabel}.
```

### Next Section Label

The next section after 2/7 in the existing flow is `reviewing_participants_or_responses` (line 1859). The label for `3/7` in the conversational match review mapper is `Participantes / respuestas`.

Therefore:

```
NEXT_STEP_LABEL = "Participantes / respuestas"
NEXT_STEP_STATE = "reviewing_participants_or_responses"
```

### Confirmation Rules

- `CONFIRMATION_REQUIRES_NO_PENDING_DECISIONS = NO` — Section can be confirmed even if some fields need review (those remain as "Por revisar")
- `CONFIRMATION_MUTATES_LOCAL_STATE_ONLY = YES` — No backend, no persistence, no real import
- `CONFIRMATION_CLEARS_DEMOGRAPHICS_STATE = YES` — Runtime state resets after advancing
- `CONFIRMATION_ADVANCES_WITHOUT_DELAY = YES` — No heavy processing after confirmation

---

## 10. Thinking Policy

`2/7 · Demográficos` is a lightweight response once the mock analysis already exists. The message mapper produces text synchronously from in-memory data.

| Scenario | Feed Thinking |
|----------|---------------|
| Entry from 1/7 → 2/7 transition | Inherits transition thinking (already set by step change) |
| Main message render | `SHOW_FEED_THINKING = NO` |
| Field detail response | `SHOW_FEED_THINKING = NO` |
| Destination change response | `SHOW_FEED_THINKING = NO` |
| Invalid sync response | `SHOW_FEED_THINKING = NO` |
| Confirmation response | `SHOW_FEED_THINKING = NO` |
| Unknown command response | `SHOW_FEED_THINKING = NO` |

### Rules

- `SHOW_FEED_THINKING_FOR_DEMOGRAPHICS_MAIN_MESSAGE = NO`
- `SHOW_FEED_THINKING_FOR_DEMOGRAPHICS_DETAIL = NO`
- `SHOW_FEED_THINKING_FOR_DESTINATION_CHANGE = NO`
- `SHOW_FEED_THINKING_FOR_INVALID_SYNC = NO`
- `THINKING_MUST_CLEAR_AFTER_FINAL_RESPONSE = YES`
- `PERSISTENT_THINKING_AFTER_RESPONSE_ALLOWED = NO`

The composer may show `isProcessingNextStep` briefly (as it does for all inputs) but must not leave a `Pensando...` bubble in the feed after the final response.

---

## 11. Placeholder Context

When the workspace is in `reviewing_demographics` state, the placeholder text in `MessageComposer` must be contextual.

### Rule

```
PLACEHOLDER_MUST_BE_CONTEXTUAL = YES
PLACEHOLDER_GENERIC_BLOCKED = YES
```

Do NOT show:
- `Cuéntame qué encuesta quieres cargar`
- `Escribe un mensaje...`

DO show:
- `Escribe una instrucción sobre demográficos`

### Implementation Strategy (Future)

Pass the placeholder as a prop or context value from `ConversationalImportWorkspace` to `MessageComposer`. The composer already supports `placeholder` prop (as seen in the existing contextual placeholder logic for `1/7 · Preguntas y escalas`).

---

## 12. Privacy Rules

The demographics review must never show individual respondent data. The existing mock data and mappers already enforce this.

### Never Show

- Raw rows from workbook
- User IDs (collaborator IDs, employee numbers)
- Email addresses
- Employee names
- Individual responses
- Open text responses
- Workbook dumps
- Real client data
- Counts that enable reidentification of individuals

### Always Show

- Demographic field name (`detectedName`)
- Safe unique items list (`sampleItemsPreview` / `detectedItems`)
- Unique item count (`detectedItemCount`)
- Sync destination (`destinationText`)
- Match reason (`matchReason`)
- Aggregate summary counts (total, sync, survey-only, review, excluded)
- Warnings

### Preview Safety

If a demographic has more than `SAFE_ITEMS_PREVIEW_LIMIT` (5) items, show:

```
Items detectados: Colombia, México, Perú y 4 más.
```

### Enforcement

```
NO_RAW_ROWS_VISIBLE_IN_DEMOGRAPHICS = YES
NO_IDS_VISIBLE_IN_DEMOGRAPHICS = YES
NO_EMAILS_VISIBLE_IN_DEMOGRAPHICS = YES
NO_NAMES_VISIBLE_IN_DEMOGRAPHICS = YES
NO_INDIVIDUAL_RESPONSES_VISIBLE = YES
NO_OPEN_TEXT_VISIBLE_IN_DEMOGRAPHICS = YES
NO_WORKBOOK_DUMP_VISIBLE_IN_DEMOGRAPHICS = YES
NO_REAL_CLIENT_DATA_IN_DEMOGRAPHICS = YES
SAFE_ITEMS_PREVIEW_ONLY = YES
```

---

## 13. Future Phases

### 11G-E · Demographics Workspace Integration Build

Integrate the demographics review into `ConversationalImportWorkspace.tsx`:

- Replace `reviewing_demographics` state handler at line 1856 with full routing
- Import and call the existing mapper pipeline (mockData → mapper → messageMapper)
- Support minimum commands: `confirmar`, `revisar {name}`, `revisar {n}`, `volver a la lista`, `continuar sin cambios`
- Set contextual placeholder
- Apply thinking policy (no feed thinking)
- Handle confirmation → advance to `reviewing_participants_or_responses`
- No destination change handling (covered in 11G-F)

**Recommendation**: 11G-E can cover all commands including destination changes, invalid sync, and exclusion if the implementation is straightforward. The default split is:
- 11G-E: entry, main message, field detail, confirmation, advance
- 11G-F: destination changes, invalid sync, exclusion, survey-only toggle

### 11G-F · Demographics Destination Edit Handling

- `sincroniza {name} con {systemLabel}` with validation
- `crear {name} solo en la encuesta`
- `excluir {name}`
- `cambia {name} a encuesta solamente`
- Invalid sync error messages
- Local state mutation for destination overrides

### 11G-G · Owner Visual QA

- Validate full flow in localhost
- Confirm entry from 1/7
- Test all commands
- Test destination changes
- Test invalid sync
- Test confirmation and advance

### 11G-H · Hotfix (if needed)

---

## 14. Acceptance Criteria

```
DEMOGRAPHICS_WORKSPACE_INTEGRATION_ARCHITECTURE_LOCKED = YES
DEMOGRAPHICS_WORKSPACE_ENTRY_POINT_DEFINED = YES
DEMOGRAPHICS_MAIN_MESSAGE_INTEGRATION_DEFINED = YES
DEMOGRAPHICS_RUNTIME_STATE_MODEL_DEFINED = YES
DEMOGRAPHICS_TEXT_COMMANDS_DEFINED = YES
DEMOGRAPHICS_DETAIL_FLOW_DEFINED = YES
DEMOGRAPHICS_DESTINATION_CHANGE_FLOW_DEFINED = YES
DEMOGRAPHICS_INVALID_SYNC_FLOW_DEFINED = YES
DEMOGRAPHICS_CONFIRMATION_FLOW_DEFINED = YES

DEMOGRAPHICS_NUMERIC_SELECTION_CONTEXT_RULE_DEFINED = YES
DEMOGRAPHICS_PLACEHOLDER_CONTEXT_RULE_DEFINED = YES
DEMOGRAPHICS_THINKING_POLICY_DEFINED = YES
DEMOGRAPHICS_PRIVACY_RULES_DEFINED = YES
DEMOGRAPHICS_NEXT_PHASES_DEFINED = YES

ALL_ACTIONS_BY_CHAT_TEXT_ONLY_DEFINED = YES
NO_ACTION_BUTTONS_FOR_REVIEW_DEFINED = YES
NO_SIDE_PANEL_EDITOR_DEFINED = YES
NO_EXTERNAL_REVIEW_TAB_DEFINED = YES
NO_FORM_MODE_EDITOR_DEFINED = YES

NO_CODE_CHANGES = YES
NO_RUNTIME_CHANGES = YES
NO_UI_CHANGES = YES
NO_MAPPER_CHANGES = YES
NO_TEST_CHANGES = YES

VISIBLE_UI_CHANGE_INTRODUCED = NO
OWNER_VISUAL_REVIEW_REQUIRED = NO

NEXT_MAXIMUM_AUTHORIZED_PHASE = Fase 11G-E · Demographics Workspace Integration Build
```

---

*Documento de arquitectura para Demographics Workspace Integration — UBITS Carga Histórica de Encuestas*
*Fase 11G-D · Demographics Workspace Integration Architecture*
*Última revisión: 2026-07-02*
