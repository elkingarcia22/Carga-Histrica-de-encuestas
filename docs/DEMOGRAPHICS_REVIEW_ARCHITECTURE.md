# Demographics Review Architecture

<!-- PHASE_11G_A_DEMOGRAPHICS_REVIEW_ARCHITECTURE_LOCKED -->
<!-- SYSTEM_PRELOADED_DEMOGRAPHICS_DEFINED -->
<!-- DEMOGRAPHICS_MATCHING_RULES_DEFINED -->
<!-- DEMOGRAPHICS_ALIAS_RULES_DEFINED -->
<!-- SURVEY_ONLY_DEMOGRAPHICS_RULE_DEFINED -->
<!-- DEMOGRAPHIC_REVIEW_FIELD_MODEL_DEFINED -->
<!-- DETECTED_ITEMS_PER_DEMOGRAPHIC_DEFINED -->
<!-- SYSTEM_SYNC_DESTINATION_DEFINED -->
<!-- SURVEY_ONLY_DESTINATION_DEFINED -->
<!-- NEEDS_REVIEW_DESTINATION_DEFINED -->
<!-- DEMOGRAPHICS_MAIN_MESSAGE_STRUCTURE_DEFINED -->
<!-- DEMOGRAPHICS_DETAIL_MESSAGE_STRUCTURE_DEFINED -->
<!-- DEMOGRAPHICS_CONFIRMATION_MESSAGE_DEFINED -->
<!-- DEMOGRAPHICS_TEXT_COMMANDS_DEFINED -->
<!-- NO_INDIVIDUAL_RESPONDENT_DATA_VISIBLE_DEFINED -->
<!-- NO_RAW_ROWS_VISIBLE_DEFINED -->
<!-- NO_OPEN_TEXT_VISIBLE_DEFINED -->
<!-- NO_WORKBOOK_DUMP_VISIBLE_DEFINED -->
<!-- ALL_ACTIONS_BY_CHAT_TEXT_ONLY_DEFINED -->
<!-- NO_ACTION_BUTTONS_FOR_REVIEW_DEFINED -->
<!-- NO_SIDE_PANEL_EDITOR_DEFINED -->
<!-- NO_EXTERNAL_REVIEW_TAB_DEFINED -->
<!-- NO_FORM_MODE_EDITOR_DEFINED -->

This document defines the technical architecture and specifications for the demographics review flow in Step 2/7 of the historical import conversational workspace.

---

## 1. Product Principle

The 2/7 · Demográficos section must allow the user to understand:

- What demographic fields were detected
- What values/items each field carries
- Which ones match preloaded system demographics
- Which ones will be created only within the survey
- Which ones require review due to ambiguity
- What will happen if the section is confirmed

```
DEMOGRAPHICS_REVIEW_SHOWS_ALL_FIELDS = YES
DEMOGRAPHICS_REVIEW_SHOWS_DETECTED_ITEMS = YES
DEMOGRAPHICS_SYSTEM_SYNC_EXPLICIT = YES
DEMOGRAPHICS_SURVEY_ONLY_CREATION_EXPLICIT = YES
NO_INDIVIDUAL_RESPONDENT_DATA_VISIBLE = YES
ALL_ACTIONS_BY_CHAT_TEXT_ONLY = YES
```

The objective is **not** to edit individual responses or display individual data. It is to prepare aggregate segmenters for later analysis.

---

## 2. System Preloaded Demographics (Source of Truth)

The following is the complete and exclusive list of preloaded system demographics for the prototype scope, based on the UBITS constructor UI screenshots provided by the Owner:

| # | System Demographic Name | ID (Conceptual) |
|---|------------------------|-----------------|
| 1 | Departamento o área de trabajo | `system_demo_dept_area` |
| 2 | Nivel jerárquico en la empresa | `system_demo_level` |
| 3 | País | `system_demo_country` |
| 4 | Ciudad | `system_demo_city` |
| 5 | Columna A | `system_demo_column_a` |
| 6 | Columna B | `system_demo_column_b` |

**SYSTEM_PRELOADED_DEMOGRAPHICS_SOURCE = OWNER_SCREENSHOT_UBITS_CONSTRUCTOR**

These 6 entries are the only valid system demographics for synchronization. No detected field may be synchronized to a system demographic outside this list.

---

## 3. Matching Rules

### 3.1 Direct Match

When the detected demographic name matches a system preloaded demographic name exactly:

| Detected Name | Matches System Demographic | Match Type |
|---------------|---------------------------|------------|
| País | País | `direct_match` |
| Ciudad | Ciudad | `direct_match` |
| Departamento o área de trabajo | Departamento o área de trabajo | `direct_match` |
| Nivel jerárquico en la empresa | Nivel jerárquico en la empresa | `direct_match` |
| Columna A | Columna A | `direct_match` |
| Columna B | Columna B | `direct_match` |

### 3.2 Alias Match

When the detected demographic name is a known alias for a system demographic:

| Detected Name | Alias For | Match Confidence | Match Reason |
|---------------|-----------|-----------------|--------------|
| Área | Departamento o área de trabajo | `high` | Alias directo: Área es sinónimo de Departamento o área de trabajo |
| Departamento | Departamento o área de trabajo | `high` | Alias directo: Departamento es abreviatura de Departamento o área de trabajo |
| Gerencia | Departamento o área de trabajo | `medium` | Alias contextual: si los valores detectados son áreas organizacionales internas (Comercial, Operaciones, etc.) |
| Nivel | Nivel jerárquico en la empresa | `high` | Alias directo: Nivel es abreviatura de Nivel jerárquico en la empresa |
| Nivel jerárquico | Nivel jerárquico en la empresa | `high` | Alias directo: coincide semánticamente |
| Pais | País | `high` | Variante ortográfica sin acento |
| Depto | Departamento o área de trabajo | `high` | Abreviatura común |
| Dpto | Departamento o área de trabajo | `high` | Abreviatura común |

### 3.3 No Match → Survey-Only

When the detected demographic name does not match any system demographic (direct or alias), it is classified as `survey_only`:

| Detected Name | Reason |
|---------------|--------|
| Rol | No existe como demográfico precargado del sistema |
| Antigüedad | No existe como demográfico precargado del sistema |
| Sede | No existe como demográfico precargado del sistema |
| Unidad | No existe como demográfico precargado del sistema |
| Regional | No existe como demográfico precargado del sistema |
| Equipo | No existe como demográfico precargado del sistema |
| Líder | No existe como demográfico precargado del sistema |
| Segmento personalizado | No existe como demográfico precargado del sistema |
| Generación | No existe como demográfico precargado del sistema |
| RangoSalarial | No existe como demográfico precargado del sistema |
| Cargo | No existe como demográfico precargado del sistema |

### 3.4 Ambiguity (Needs Review)

When a detected field could match multiple system demographics, or its semantic context is unclear:

| Scenario | Match Confidence | reviewStatus |
|----------|-----------------|-------------|
| "Área" with values that could be geographic regions | `low` | `ambiguous` |
| "Gerencia" with mixed values (areas + people names) | `low` | `ambiguous` |
| Generic label "Columna A" with unclear content | `medium` | `ambiguous` |
| Any new field not in alias list with weak semantic signal | `low` | `ambiguous` |

---

## 4. Survey-Only Default Classification

The following fields must default to `survey_only` (created only within the survey) unless the user explicitly changes the destination:

```
SURVEY_ONLY_DEMOGRAPHIC_DEFAULT = YES
NO_AUTOMATIC_SYNC_FOR_UNMATCHED_DEMOGRAPHICS = YES
```

| Field | Default Destination | Rationale |
|-------|-------------------|-----------|
| Rol | `create_in_survey_only` | No system demographic exists for roles |
| Antigüedad | `create_in_survey_only` | No system demographic exists for seniority |
| Sede | `create_in_survey_only` | No system demographic named "Sede"; "Ciudad" exists but is a different concept |
| Unidad | `create_in_survey_only` | No system demographic matches |
| Regional | `create_in_survey_only` | Could be geographic but no system match |
| Equipo | `create_in_survey_only` | No system demographic matches |
| Líder | `create_in_survey_only` | No system demographic matches |
| Segmento personalizado | `create_in_survey_only` | Generic custom field |
| Generación | `create_in_survey_only` | No system demographic matches |
| Rango salarial | `create_in_survey_only` | No system demographic matches |
| Cargo | `create_in_survey_only` | No system demographic matches |

---

## 5. Conceptual Model: DemographicReviewField

```typescript
interface DemographicReviewField {
  id: string;
  detectedName: string;
  normalizedName: string;
  sourceLabel: string;
  detectedItems: string[];
  detectedItemCount: number;
  sampleItemsPreview: string;
  systemMatchStatus: 'matched_system_demographic' | 'survey_only' | 'needs_review' | 'excluded';
  matchedSystemDemographic: string | null;
  matchConfidence: 'high' | 'medium' | 'low';
  matchReason: string;
  destination: 'sync_with_system' | 'create_in_survey_only' | 'needs_user_decision' | 'excluded';
  reviewStatus: 'confirmed' | 'pending_review' | 'ambiguous' | 'not_interpretable';
  warnings: string[];
}
```

### Field Semantics

| Field | Description |
|-------|-------------|
| `id` | Unique identifier for this demographic review field entry |
| `detectedName` | The original name detected from the source (e.g., "Gerencia", "País") |
| `normalizedName` | Cleaned/normalized version for matching (lowercase, trimmed, accent-normalized) |
| `sourceLabel` | The exact label as it appears in the source file column header |
| `detectedItems` | Full list of unique items/values detected for this demographic |
| `detectedItemCount` | Count of unique items (integer) |
| `sampleItemsPreview` | Human-readable preview string: "Colombia, México, Perú" or "Colombia, México, Perú y 3 más" |
| `systemMatchStatus` | Classification of system matching status |
| `matchedSystemDemographic` | The name of the matched system demographic, or null |
| `matchConfidence` | Confidence level of the match |
| `matchReason` | Human-readable explanation of why the match was made (or not) |
| `destination` | Final destination after review |
| `reviewStatus` | Current review state |
| `warnings` | Array of warning strings (e.g., "Valores detectados mezclan áreas geográficas con áreas organizacionales") |

### Destination Transition Rules

```
confirmed + matched_system_demographic → sync_with_system
confirmed + survey_only → create_in_survey_only
confirmed + needs_review → needs_user_decision (prompt user)
excluded → excluded (removed from survey)
```

### Allowed Destination Changes by Chat

| Current Destination | Can Change To | Validation |
|--------------------|--------------|------------|
| `sync_with_system` | `create_in_survey_only` | Always allowed |
| `sync_with_system` | `excluded` | Always allowed |
| `create_in_survey_only` | `sync_with_system` | Only if a valid system demographic exists |
| `create_in_survey_only` | `excluded` | Always allowed |
| `needs_user_decision` | `sync_with_system` | Only if a valid system demographic exists |
| `needs_user_decision` | `create_in_survey_only` | Always allowed |
| `needs_user_decision` | `excluded` | Always allowed |
| `excluded` | `sync_with_system` | Only if a valid system demographic exists |
| `excluded` | `create_in_survey_only` | Always allowed |

**Invariant**: A demographic can only be synchronized with a system demographic that exists in the preloaded list (Section 2). Attempting to sync with a non-existent system demographic must be rejected with the available system options.

---

## 6. Conversational Message Structures

### 6.1 Main Message (2/7 · Demográficos)

```
2/7 · Demográficos

Detecté {n} campos demográficos y segmentadores asociados a la encuesta.

Estos son los demográficos encontrados:

{index}. {detectedName}
Items detectados: {sampleItemsPreview}
Destino: Se sincronizará con "{matchedSystemDemographic}"
Motivo: {matchReason}

...

Puedes responder:
1. Confirmar demográficos
2. Revisar un demográfico
3. Cambiar destino de sincronización
4. Excluir un demográfico
5. Continuar sin cambios
```

### 6.2 Detail Message (Single Demographic Review)

```
Detalle de {detectedName}

Items detectados:
- {item1}
- {item2}
- {item3}

Destino actual:
{destinationDescription}

Puedes responder:
1. Confirmar este demográfico
2. Crear solo en encuesta
3. Excluir
4. Volver a la lista
```

### 6.3 Confirmation Message

```
Sección 2/7 · Demográficos confirmada.

Sincronizados con sistema:
- {demographic1}
- {demographic2}

Creados solo en esta encuesta:
- {demographic3}
- {demographic4}

Avanzando a 3/7 · {nextSection}...
```

### 6.4 Invalid Destination Attempt

```
No puedo sincronizar {detectedName} con un demográfico del sistema llamado {requestedName}
porque no está en la lista de precargados disponibles.

Opciones del sistema:
1. Departamento o área de trabajo
2. Nivel jerárquico en la empresa
3. País
4. Ciudad
5. Columna A
6. Columna B

También puedo crear {detectedName} solo en esta encuesta.
```

---

## 7. Text Commands

All actions must be performed via chat text. No buttons, no side panels, no forms.

### Allowed Commands

| User Input | Action | Example Response |
|------------|--------|-----------------|
| `confirmar demográficos` | Confirm all demographics | Confirmation message (Section 6.3) |
| `revisar {name}` | Show detail for a demographic | Detail message (Section 6.2) |
| `revisar {index}` | Show detail by index number | Detail message (Section 6.2) |
| `sincroniza {name} con {systemDemo}` | Change destination to sync with system | Confirm or reject with reasons |
| `crear {name} solo en la encuesta` | Change to survey-only | Confirmation message |
| `excluir {name}` | Exclude demographic | Confirmation message |
| `cambia {name} a encuesta solamente` | Change to survey-only | Confirmation message |
| `continúa a la siguiente sección` | Proceed without changes | Proceed to 3/7 |
| `confirmar` | Confirm current state | Depends on context |

### Command Examples

```
User: confirmar demográficos
Assistant: Sección 2/7 · Demográficos confirmada.
... (confirmation message)
```

```
User: revisar país
Assistant: Detalle de País
... (detail message)
```

```
User: sincroniza Sede con Sede
Assistant: No puedo sincronizar Sede con un demográfico del sistema...
```

---

## 8. Privacy Rules (Strict)

### Never Show

- Raw rows
- User IDs
- Employee names
- Email addresses
- Individual responses
- Open text
- Workbook dumps
- Counts that could enable reidentification

### Always Show

- Demographic field name
- List of safe unique values
- Unique item count
- Sync destination
- Match reason
- Aggregate warnings

### Items Preview Safety

If a demographic has many items (>5), show a safe preview:

```
Items detectados: Colombia, México, Perú y 4 más.
```

---

## 9. Existing Codebase Context

### Current State

The existing `conversationalMatchReviewMapper.ts` (line 23-27) at:

`src/features/historical-import/conversational-import/conversationalMatchReviewMapper.ts`

currently shows a generic summary for demographics:

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
```

### Target Architecture: What Must Change

The current generic summary must be replaced with the detailed per-field structure defined in Section 6.1. Instead of a flat summary, the assistant must enumerate:

1. Each detected demographic with its name
2. The list of detected items/values
3. The sync destination (system preloaded or survey-only)
4. The match reason

### Existing Demographic Data Sources

- **Fixture demographics** (7 fields): `src/features/historical-import/demo-fixture/qsClimaFixture.ts` lines 260-282
  - Gerencia (management), Área (area), Departamento (department), Rol (role), Antigüedad (seniority), Sede (site), Nivel (level)
- **Demo fixture types**: `src/features/historical-import/demo-fixture/types.ts`
  - `DemoFixtureDemographic` with `demographicType` union including: area, department, management, role, seniority, country, city, site, team, generation, level, range, unknown
- **Detection keywords**: `src/features/historical-import/xlsx-content-analyzer/columnClassificationRuntime.ts`
  - Contains ~15 demographic keywords (genero, edad, cargo, area, etc.)
- **Structure inventory**: `src/features/historical-import/structure-inventory/structureInventoryMapper.ts`
  - Detects demographics by keyword matching
- **Mock UBITS catalogs**: `src/features/historical-import/mock-ubits-catalogs/mockUbitsCatalogs.ts`
  - Contains 2 system demographics: Genero (demo_1), Sede (demo_2)

---

## 10. Implementation Boundaries

This document specifies the **architecture only**. The following constraints apply to implementation:

```
NO_CODE_CHANGES = YES (phase 11G-A)
NO_RUNTIME_CHANGES = YES
NO_UI_CHANGES = YES
NO_MAPPER_CHANGES = YES
NO_TEST_CHANGES = YES
VISUAL_REVIEW_REQUIRED = NO
```

The implementation must:
1. Replace the generic demographics summary in `conversationalMatchReviewMapper.ts` with the detailed per-field message structure
2. Implement the `DemographicReviewField` conceptual model in `conversationalImportTypes.ts`
3. Create a new message mapper for demographics detail/confirmation/error messages
4. Add text command parsing for demographics-specific commands in `conversationalEditingFlow.ts`
5. Add wizard states for demographics detail view in `conversationalWizardTypes.ts`
6. Add mock data for the new demographics review flow in mock fixtures

---

## 11. Match AI Reasoning

The assistant must provide meaningful match reasons without complex scoring, predictions, or external API calls:

| Scenario | Expected Match Reason |
|----------|----------------------|
| Gerencia → Departamento o área de trabajo | "Gerencia se interpreta como área organizacional porque sus valores parecen áreas internas y coincide semánticamente con Departamento o área de trabajo." |
| País → País | "Coincidencia directa con demográfico precargado del sistema." |
| Sede → survey_only | "No existe como demográfico precargado del sistema. Se creará solo para esta encuesta como segmentador agregado." |
| Rol → survey_only | "No existe un demográfico precargado del sistema llamado Rol. Se creará solo en esta encuesta." |

---

## 12. Acceptance Criteria

```
DEMOGRAPHICS_REVIEW_ARCHITECTURE_LOCKED = YES
SYSTEM_PRELOADED_DEMOGRAPHICS_DEFINED = YES
DEMOGRAPHICS_MATCHING_RULES_DEFINED = YES
DEMOGRAPHICS_ALIAS_RULES_DEFINED = YES
SURVEY_ONLY_DEMOGRAPHICS_RULE_DEFINED = YES

DEMOGRAPHIC_REVIEW_FIELD_MODEL_DEFINED = YES
DETECTED_ITEMS_PER_DEMOGRAPHIC_DEFINED = YES
SYSTEM_SYNC_DESTINATION_DEFINED = YES
SURVEY_ONLY_DESTINATION_DEFINED = YES
NEEDS_REVIEW_DESTINATION_DEFINED = YES

DEMOGRAPHICS_MAIN_MESSAGE_STRUCTURE_DEFINED = YES
DEMOGRAPHICS_DETAIL_MESSAGE_STRUCTURE_DEFINED = YES
DEMOGRAPHICS_CONFIRMATION_MESSAGE_DEFINED = YES
DEMOGRAPHICS_TEXT_COMMANDS_DEFINED = YES

NO_INDIVIDUAL_RESPONDENT_DATA_VISIBLE_DEFINED = YES
NO_RAW_ROWS_VISIBLE_DEFINED = YES
NO_OPEN_TEXT_VISIBLE_DEFINED = YES
NO_WORKBOOK_DUMP_VISIBLE_DEFINED = YES

ALL_ACTIONS_BY_CHAT_TEXT_ONLY_DEFINED = YES
NO_ACTION_BUTTONS_FOR_REVIEW_DEFINED = YES
NO_SIDE_PANEL_EDITOR_DEFINED = YES
NO_EXTERNAL_REVIEW_TAB_DEFINED = YES
NO_FORM_MODE_EDITOR_DEFINED = YES

NO_CODE_CHANGES = YES (phase 11G-A only)
NO_RUNTIME_CHANGES = YES
NO_UI_CHANGES = YES
NO_MAPPER_CHANGES = YES
NO_TEST_CHANGES = YES
VISUAL_REVIEW_REQUIRED = NO

NEXT_MAXIMUM_AUTHORIZED_PHASE = Fase 11G-B · Demographics Mock Data Contract

## Fase 11G-C · Demographics Message Mapper

### Purpose

Convert `DemographicsReviewConversationViewModel` and `DemographicReviewField` into `DemographicsConversationMessage` (text + commands) for the chat runtime. No UI integration.

### Message Functions

| Function | Produces |
|----------|----------|
| `createDemographicsReviewMainMessage` | Main review message: title, all fields with items/destination/reason, aggregated summary, text commands |
| `createDemographicsReviewDetailMessage` | Single field detail: items, current destination, reason, action options |
| `createDemographicsReviewConfirmationMessage` | Section confirmed: sync-with-system list, survey-only list, needs-review list, next section |
| `createDemographicsDestinationChangeMessage` | Destination change: previous vs new destination, reason |
| `createDemographicsInvalidSystemSyncMessage` | Blocks non-system demographic: lists all 6 system preloaded options |
| `createDemographicsUnknownCommandMessage` | Graceful recovery: shows available commands |

### Destination Text Rules

| Destination | Display Text |
|-------------|-------------|
| `sync_with_system` | Se sincronizará con "{matchedSystemDemographic}" |
| `create_in_survey_only` | Se creará solo en esta encuesta |
| `needs_user_decision` | Requiere revisión |
| `excluded` | Excluido de la estructura de demográficos |

### Destination Reason Text Rules

| Destination | Reason Text |
|-------------|-------------|
| `sync_with_system` | Coincidencia directa con demográfico precargado. |
| `create_in_survey_only` | No existe como demográfico precargado del sistema. |
| `needs_user_decision` | El campo puede tener más de una interpretación o no hay suficiente evidencia. |
| `excluded` | No se usará como segmentador para esta encuesta. |

### Commands

All commands are text-only. No action buttons, no action payloads, no UI components.

```
confirmar demográficos
revisar país
revisar 2
sincroniza Gerencia con Departamento o área de trabajo
crear Sede solo en la encuesta
excluir Rol
cambia País a encuesta solamente
continúa a la siguiente sección
```

### Testing

31 tests in `__tests__/demographicsReviewMessageMapper.test.ts` covering:
- Main message: title, all fields, items, destinations, summary, commands
- Detail message: items, destination, action options
- Confirmation: sync list, survey-only list, needs-review, next section
- Destination change: previous vs new
- Invalid sync: blocks non-system demographic, lists all 6 options
- Unknown command: graceful recovery
- Privacy: no raw rows, no emails, no IDs
- Determinism: same input always produces same output
- No Date, Math.random, setTimeout usage

### Markers

```
DEMOGRAPHICS_MESSAGE_MAPPER_IMPLEMENTED = YES
NO_RUNTIME_INTEGRATION = YES
NO_WORKSPACE_CHANGES = YES
NO_UI_CHANGES = YES
BUILD_PASSED = YES
FULL_REGRESSION_TESTS_PASSED = YES
PHASE_11G_D_DEMOGRAPHICS_WORKSPACE_INTEGRATION_ARCHITECTURE_READY = YES
```

---

*Documento de arquitectura para Demographics Review — UBITS Carga Histórica de Encuestas*
*Fase 11G-A · Lock Demographics Review Architecture*
*Última revisión: 2026-07-01*
