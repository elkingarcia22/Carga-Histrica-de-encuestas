# Arquitectura del Proyecto

## Estructura de Directorios (Objetivo)

```text
src/
├─ config/
│  └─ navigation.ts    # Configuración centralizada de navegación
├─ components/
│  ├─ ui/              # shadcn base (Button, Avatar, Pagination, etc.)
│  ├─ layout/          # AppShell, Sidebar, Header, PageShell
│  ├─ navigation/      # Breadcrumbs, TabsNav, PaginationShell
│  ├─ utility/         # Tag, SectionHeader, PageHeader
│  ├─ data-display/    # TableShell, StatusBadge
│  ├─ feedback/        # EmptyState, Alert, Skeleton, Progress, Sonner (UbitsToaster)
│  ├─ ai/              # AIInsightCard, AIPanel
│  ├─ charts/          # EChart, ChartShell, ChartCard, BarChart, LineChart, AreaChart, DonutChart, SparklineChart, KpiCard, HeatmapChart, TrendMetricLineChart, theme, types
│  ├─ forms/           # Field, FormSection, SearchableSelect, MultiSelect
│  ├─ filters/         # FilterBar
│  ├─ overlays/        # ModalShell, DrawerShell, ConfirmDialog
│  ├─ date/            # [7D.1] Calendar, DatePicker, DateRangePicker, MonthPicker, QuarterSelector, PeriodSelector, DateFilterBar
│  ├─ range/           # [7D.1B] RangeSlider (UBITS wrapper for Slider)
│  ├─ upload/          # [7D.2] FileUpload, UploadZone, FilePreview, AttachmentList, UploadProgress, ImportCsvPanel (Data Import)
│  ├─ selection/       # [7D.3] CardSelection, RadioCardGroup, CheckboxCardGroup, SelectableCard, OptionTile, SegmentedControl (Visual Selection Suite)
│  ├─ media/           # [7D.4] UbitsCarousel, Gallery, ImageGrid, PreviewCard, MediaPreview, EmptyGalleryState (Media Suite)
│  ├─ survey-analytics/# [7D.5] DeltaPill, InlineLegend, MetricComparisonFooter, ResponseStackedBar, ResponseStackedBarGroup, TrendMetricLineChart, SurveyMetricCard, FavorabilityDistributionCard, ParticipationTrendCard (Survey Analytics Suite)
│  ├─ ai-interaction/  # [8.7B] Chip, AIButton, AILoader, SaveIndicator (Lightweight AI Suite)
│  ├─ examples/
│  └─ forms/           # Ejemplos de integración técnica
├─ styles/
│  ├─ tokens.css       # Variables de diseño (UBITS + shadcn)
│  └─ globals.css      # Directivas de Tailwind y estilos base
├─ lib/
│  └─ utils.ts         # Funciones de utilidad (cn, etc.)
├─ icons/              # [8.5B] Icon System (Registry + Wrapper)
│  ├─ iconTypes.ts      # Tipado estricto (Name, Size, Tone)
│  ├─ iconRegistry.ts   # Mapeo semántico a proveedores
│  └─ UbitsIcon.tsx     # Wrapper central accesible
└─ utils/              # Lógica de negocio y helpers genéricos
```

## Estrategia de Componentes (Fase 7B.4)
1. **Controles Binarios (ui):**
   - `Checkbox`: Selección booleana o múltiple discreta.
   - `RadioGroup`: Selección única en sets pequeños de opciones.
   - `Switch`: Alternancia de estados binarios (On/Off) con feedback inmediato.
2. **Overlays & Shells (overlays):**
   - `ModalShell`: Wrapper UBITS sobre Dialog para contenido estructurado y diálogos.
   - `DrawerShell`: Wrapper UBITS sobre Sheet para paneles laterales y edición contextual.
   - `ConfirmDialog`: Wrapper UBITS sobre AlertDialog para acciones críticas e irreversibles.

## Estrategia de Validación Funcional
...

## Gestión de Fechas (Fase 7D.1)
1. **Lógica de Negocio:** Se utiliza exclusivamente el objeto `Date` nativo de JavaScript para toda la manipulación de fechas.
2. **Formateo:** Se utiliza `Intl.DateTimeFormat` para la localización y visualización de fechas según el locale del usuario.
3. **Dependencias:** 
   - `date-fns`: Aparece en el proyecto únicamente como dependencia requerida por `react-day-picker` v9. 
   - **Prohibición:** Está estrictamente prohibido importar `date-fns`, `dayjs` o `moment` dentro del código custom de UBITS (`src/components/date/*`, etc.).
   - Toda la lógica compartida debe residir en `src/components/date/dateUtils.ts`.

## Survey Analytics (Fase 7D.5)
1. **Foundations (7D.5A/B):** Componentes atómicos como `DeltaPill` y `ResponseStackedBar` (HTML/CSS) para distribución.
2. **Trend Analytics (7D.5C):** `TrendMetricLineChart` utiliza la infraestructura de `echarts` existente (`ChartCard` + `theme.ts`).
3. **Cards Analíticas (7D.5D):** `SurveyMetricCard`, `FavorabilityDistributionCard` y `ParticipationTrendCard` componen los átomos anteriores. Reutilizables y genéricas.
4. **QA Integral (7D.5E - Pendiente):** Validación técnica y de accesibilidad de toda la suite analítica.

## Governance Architecture (Fase 8.0)

### Estructura de Carpetas (Futura - Fase 8.1)
```text
src/
├─ mocks/                 # [8.1] Mock data layer (generators, transformers, queries)
│  ├─ generators/
│  ├─ transformers/
│  ├─ types.ts
│  ├─ index.ts
│  └─ README.md
├─ pages/                 # [8.4+] Real business screens (dashboards, reports)
│  └─ components/         # Screen-specific composable sections
└─ (same as above)
```

### Principios de Arquitectura (Fase 8.0+)

1. **Capa de Componentes (Fases 1-7D):** 
   - 47 componentes avanzados + 39 base = 86 componentes listos
   - Capa pura de UI (sin datos, sin lógica de negocio)
   - No sufre cambios después de Fase 7D (congelada)

2. **Capa de Datos Mock (Fase 8.1):**
   - `src/mocks/` contiene generadores y transformadores
   - Simula comportamiento de API (filtros, paginación)
   - Interruptor fácil a APIs reales (Fase 9+)

3. **Capa de Screens (Fase 8.4+):**
   - Compone componentes + datos mock únicamente
   - Props-driven (todos los datos vía props)
   - URL state para filtros (shareable)

4. **Capa de APIs (Fase 9+):**
   - No incluida en Fase 8
   - Se conecta en lugar de mock layer
   - No requiere cambios en screens

### Patrones de Gobernanza (Fase 8.0 - 8.2)

**Fase 8.2: Dashboard Shell Patterns** (✅ Completada - 2026-05-05)

Cuatro documentos de arquitectura definen los patrones estructurales para construcción de dashboards:

1. **DASHBOARD_SHELL_PATTERNS.md** (~600 líneas)
   - Estructura de dashboard: Header → Filters → Metric Section → Distribution Section → Timeline Section → Secondary Section → Footer
   - Grid system: 12-column responsive (desktop-first baseline 1200px)
   - Responsive breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (large)
   - Spacing & rhythm using Tailwind gap utilities
   - Light/dark mode with UBITS CSS tokens (no hardcoded hex)
   - Accesibilidad baseline: WCAG 2.1 AA, semantic HTML, ARIA, keyboard navigation
   - Patrones prohibidos: No decorative gradients, no glassmorphism, no hardcoded colors

2. **DASHBOARD_LAYOUT_RECIPES.md** (~700 líneas)
   - 7 plantillas reutilizables: KPI Row (4-wide), Two-Column, Full-Width+Panel, Survey Analytics, Bento, Table+Filters, Gallery
   - Cada plantilla incluye estructura Tailwind, breakpoints, espaciado, notas de accesibilidad

3. **DASHBOARD_STATE_PATTERNS.md** (~600 líneas)
   - 7 patrones de estado: Loading (Skeleton), Loaded (data), Empty, Error, Partial Load, Filtered Empty, Permission/Stale
   - Reglas de transición y accesibilidad para cada estado

4. **DASHBOARD_QA_RULES.md** (~1000 líneas)
   - Marco de validación multi-tier cubriendo 14 categorías
   - Technical QA: build passes, TS 0 errors, no `any`, no unused imports
   - Design System: zero hardcoded colors, Tailwind spacing only, semantic typography
   - Accessibility: 4.5:1 contrast, semantic HTML, ARIA labels, keyboard nav
   - Responsive: tested at 375, 768, 1440px, no horizontal scroll
   - Data layer: all from src/mocks/, no fetch/axios, no hardcoding
   - Performance: LCP < 2.5s, INP < 200ms, CLS < 0.1
   - Component composition: library components only, type-safe props
   - Blocking criteria para Phase 8.3 advancement

**Phase 8.3: Component Decision Gate + First Screen Intake** (✅ 2026-05-05)

Governance documents for first dashboard build:
- `ANTIGRAVITY.md` — 10 mandatory constraints for screen development
- `FIRST_SCREEN_INTAKE.md` — Survey Analytics Dashboard requirements
- `FIRST_SCREEN_COMPONENT_DECISION_GATE.md` — 12/12 components approved
- `FIRST_SCREEN_COMPONENT_MAP.md` — Layout with component placement
- `FIRST_SCREEN_MOCK_DATA_MAP.md` — Mock data bindings to components
- `FIRST_SCREEN_QA_PLAN.md` — 9-tier QA strategy (40+ scenarios)
- `FIRST_SCREEN_BUILD_PROMPT.md` — Phase 8.4 build authorization

**Fase 8.5: Icon System & Production Readiness** (✅ 8.5A/B/C - 2026-05-06)

### Icon System Architecture
- **Core**: Lucide React (Mandatory for shadcn/ui base).
- **Brand**: Iconly Pro (Target for business logic/dashboards).
- **Pattern**: Registry + Wrapper (`UbitsIcon`).
- **Status (2026-05-06)**: Infrastructure ready. Real Iconly migration is **BLOCKED** until assets/license delivery. Lucide acts as the current and primary technical fallback.

---

*Documento de arquitectura UBITS v3.0.0*
*Última revisión: 2026-05-06*

**Phase 8 Timeline:** 8.0 (✅) → 8.1 (✅) → 8.2 (✅) → 8.3 (✅) → 8.4 (✅) → 8.5 (✅) → 8.6 (8.6C ✅) → 8.6D (Blocked) → 9.0 (API)

---

### Navigation Shell Architecture (Phase 8.6C)
- **Componentes**: `PlaygroundSidebar`, `UbitsSubNav`, `UbitsMobileTabBar`.
- **Infrastructure**: `src/components/navigation/`.
- **Estabilización**: Hotfix 8.6C.1 (Aprobado). 0 HEX en TSX, 0 text-white.
- **Siguiente**: Fase 8.6D · Home/List Template Patterns (Bloqueada hasta cierre formal).

## Arquitectura de Importación (Fase 2)
La arquitectura técnica del dominio de importación (wizard, pipeline local, límites de estado y adaptadores) está documentada como una extensión del sistema en:
- [IMPORT_ARCHITECTURE.md](./IMPORT_ARCHITECTURE.md)
- [U2_INTERACTION_ARCHITECTURE.md](./U2_INTERACTION_ARCHITECTURE.md)
- [U3_PARSER_PROFILING_ARCHITECTURE.md](./U3_PARSER_PROFILING_ARCHITECTURE.md)
- [U3_SIMULATED_PROCESSING_ARCHITECTURE.md](./U3_SIMULATED_PROCESSING_ARCHITECTURE.md)
- [HISTORICAL_PREVIEW_SIMULATED_ARCHITECTURE.md](./HISTORICAL_PREVIEW_SIMULATED_ARCHITECTURE.md)
- [HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_ARCHITECTURE.md](./HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_ARCHITECTURE.md)
- [NEXT_CAPABILITY_INTAKE.md](./NEXT_CAPABILITY_INTAKE.md)
- [CONVERSATIONAL_IMPORT_INTAKE.md](./CONVERSATIONAL_IMPORT_INTAKE.md)
- [CONVERSATIONAL_IMPORT_ARCHITECTURE.md](./CONVERSATIONAL_IMPORT_ARCHITECTURE.md)
- [CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE.md](./CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE.md)

### Chat Foundation Message Renderer
- Module: `src/features/historical-import/conversational-import/chat-foundation/`
- Created `ChatFoundationMessageRenderer` and `ChatFoundationMessageBubble`.
- Supports rendering `user`, `assistant`, and `system` messages based on foundation types.
- Supports kinds: `plain_text`, `structured`, `confirmation`, `warning`, `error`, `safe_details`, `thinking`, `handoff`.
- Enforces behavior invariants: Assistant avatar always visible, icon system consistent, safe markdown handling, no raw markdown leaks, zero hardcoded colors.
- Ready for future integration. No changes to the runtime flow or existing UI in this phase.
- Phase Markers:
  - PHASE_11D_H44_H3_CHAT_FOUNDATION_MESSAGE_RENDERER_COMPLETE
  - CHAT_FOUNDATION_MESSAGE_RENDERER_CREATED
  - CHAT_FOUNDATION_MESSAGE_BUBBLE_CREATED
  - PLAIN_TEXT_MESSAGES_RENDERED
  - STRUCTURED_MESSAGES_RENDERED
  - CONFIRMATION_MESSAGES_RENDERED
  - WARNING_MESSAGES_RENDERED
  - ERROR_MESSAGES_RENDERED
  - SAFE_DETAILS_MESSAGES_RENDERED
  - THINKING_MESSAGES_RENDERED
  - HANDOFF_MESSAGES_RENDERED
  - ASSISTANT_AVATAR_ALWAYS_VISIBLE
  - ASSISTANT_ICON_SYSTEM_CONSISTENT
  - USER_MESSAGE_STYLE_CONSISTENT
  - ASSISTANT_MESSAGE_STYLE_CONSISTENT
  - SYSTEM_WARNING_STYLE_CONSISTENT
  - ERROR_MESSAGE_STYLE_CONSISTENT
  - SAFE_DETAILS_RENDERING
  - NO_RAW_MARKDOWN_LEAKS
  - NO_BROKEN_ICON_RENDERING
  - NO_RUNTIME_UI_INTEGRATION
  - NO_FLOW_CHANGES
  - NO_PLAYGROUND_CREATED
  - NO_ROUTE_CREATED
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H44_H4_CHAT_FOUNDATION_THINKING_BEHAVIOR_READY
  - PHASE_11D_H44_H5_CHAT_FOUNDATION_CONVERSATION_POLICY_COMPLETE
  - R1H5_DEFINED_BUT_NOT_TRIGGERED
  - PHASE_11D_H44_H6_CHAT_FOUNDATION_VISUAL_PLAYGROUND_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

- [Conversational Import Mock Contract](./CONVERSATIONAL_IMPORT_MOCK_CONTRACT.md) - Definición del contrato sintético para el Workspace Conversacional.
- [Conversational Import Closure](./CONVERSATIONAL_IMPORT_CLOSURE.md) - Cierre formal de la experiencia conversacional como primera pantalla.
- [Conversational Import Next Capability](./CONVERSATIONAL_IMPORT_NEXT_CAPABILITY.md) - Definición de la siguiente capacidad del workspace conversacional.
- [Inline Structure Review Architecture](./INLINE_STRUCTURE_REVIEW_ARCHITECTURE.md) - Definición de arquitectura para la revisión de estructura inline.
- [Synthetic File Mount Flow Architecture](./SYNTHETIC_FILE_MOUNT_FLOW_ARCHITECTURE.md) - Definición del flujo de montaje sintético de archivos en el chat.

## Conversational Import Wizard

The historical import prototype will operate as a chat-first import assistant. It will guide survey scope selection, general configuration, structure matching, ambiguity resolution, sandbox import confirmation and result-link handoff entirely through conversational commands. Traditional mapping screens, tabs and side-panel editors are out of scope for this prototype flow.

## Conversational Structure Review

* **Architecture Decision:** CONVERSATIONAL_STRUCTURE_REVIEW_ARCHITECTURE_LOCKED
* **Review Mode:** CONVERSATIONAL_STEP_BY_STEP
* **Review Panel CTA:** NO DIRECT CTA
* **Reveal Mode:** ONE_STEP_AT_A_TIME
* **Inline Panel Visibility:** HIDDEN BY DEFAULT
* **Approval Flow Location:** CHAT_TIMELINE

### Step-by-Step Flow
1. REVIEW_FILES_STEP
2. REVIEW_DEMOGRAPHICS_STEP
3. REVIEW_DIMENSIONS_STEP
4. REVIEW_QUESTIONS_STEP
5. REVIEW_MAPPINGS_STEP
6. REVIEW_APPROVED_CONTRACT_STEP


## Demo Fixture Mode

The historical import prototype will use a curated demo fixture for QS Clima 2024/2025 to validate the structure review experience before implementing a general secure row inventory parser. This fixture is scoped, non-production, local, mock/curated, and must not be represented as real import capability.

### Controlled Overlay Editing Architecture
The historical import prototype will support future non-destructive review adjustments through a Review Overlay Layer. Source fixture data and original detected structures remain immutable. Future UI may resolve labels, mappings, demographic states and review decisions from source + overlay, but must not mutate the source layer or claim production persistence.
- [Read-only to Edit Mode Decision Gate](./READ_ONLY_TO_EDIT_MODE_DECISION_GATE.md)

#### Overlay Editing Types (Phase 11D-H30)
- **Module**: `src/features/historical-import/overlay-editing/`
- **Core Types**: `OverlayAction`, `OverlayActionType`, `OverlayState`, etc.
- **Validation**: Pure validation functions inside `overlayEditingValidation.ts` to block PII, empty labels, etc.
- **Privacy**: Does not store raw data. Focuses strictly on structurally approved fields.

#### Controlled Rename UI (Phase 11D-H32)
- **Entry point**: "Ajustar etiquetas" from the read-only structure review chat message.
- **Scope**: Allows renaming of visible dimension and question labels.
- **State**: In-memory local `globalOverlayState` within `ConversationalImportWorkspace`.
- **Visibility**: Rendered in `ControlledRenameReview.tsx`, overrides `InlineReviewPanel` in `viewMode = "controlled_rename"`.
- **Validation**: Inline validation using the `overlay-editing` module logic.
- **Persistence**: Non-persistent. Applied instantly to the read-only fixture representation in the chat timeline without mutating the `qsClimaDemoFixture`.

### Draft Preparation
The historical import prototype will convert resolved review structures into a local Historical Load Draft before any future import execution. The draft is a safe intermediate artifact, not a persisted import, not a backend operation, and not a comparison dashboard.

#### Draft Preparation Types (Phase 11D-H36)
- **Module**: `src/features/historical-import/draft-preparation/types.ts`
- **Core Types**: `HistoricalLoadDraft`, `HistoricalLoadDraftStatus`, `HistoricalLoadDraftReadiness`, `HistoricalLoadDraftReadinessBlocker`, etc.
- **Privacy**: Preserves explicit boundaries (no raw rows, no PII).
- **Architecture Validation**: No data creation, no mappers, no UI, no backend connection implemented yet.

#### Draft Readiness Mapper (Phase 11D-H37)
- **Module**: `src/features/historical-import/draft-preparation/draftReadinessMapper.ts`
- **Purpose**: Pure mapper to evaluate if the reviewed structure is ready for a local Historical Load Draft preparation.
- **Output**: `HistoricalLoadDraftReadiness`
- **Rules**: Pure, deterministic, no side effects, no API connections, no data persistence.
- **Privacy**: Explicit blockers for API, storage, and Claude connections (`privacy_boundary_blocked`).
- **Phase Completion Markers**:
  - PHASE_11D_H37_DRAFT_READINESS_MAPPER_COMPLETE
  - DRAFT_READINESS_MAPPER_CREATED
  - DRAFT_READINESS_INPUT_DEFINED
  - DRAFT_READINESS_OUTPUT_DEFINED
  - DRAFT_READINESS_BLOCKERS_IMPLEMENTED
  - DRAFT_READINESS_WARNINGS_IMPLEMENTED
  - DRAFT_READINESS_STATUS_DERIVATION_IMPLEMENTED
  - DRAFT_READINESS_PRIVACY_RULES_IMPLEMENTED
  - DRAFT_READINESS_OVERLAY_RULES_IMPLEMENTED
  - DRAFT_READINESS_SUMMARY_IMPLEMENTED
  - DRAFT_PREPARATION_INDEX_EXPORTS_UPDATED
  - NO_DRAFT_DATA_CREATED
  - NO_DRAFT_FINAL_OBJECT_CREATED
  - NO_DRAFT_PREVIEW_UI_CREATED
  - NO_PREPARE_DRAFT_BUTTON_CREATED
  - NO_RUNTIME_UI_INTEGRATION
  - NO_FIXTURE_DATA_CHANGES
  - NO_OVERLAY_TYPES_CHANGES
  - NO_DRAFT_TYPES_CHANGES
  - NO_CONVERSATIONAL_FLOW_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_BACKEND_CREATED
  - NO_STORAGE_CREATED
  - NO_CLAUDE_CONNECTION_CREATED
  - NO_API_CONNECTIONS
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - COMPARISON_DASHBOARD_OUT_OF_SCOPE
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H38_DRAFT_PREVIEW_UI_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Realistic Survey Import Architecture
- [Realistic Survey Import Architecture](./REALISTIC_SURVEY_IMPORT_ARCHITECTURE.md)
- [Survey File Analysis Contract](./SURVEY_FILE_ANALYSIS_CONTRACT.md)
- [Sandbox Upload Architecture](./SANDBOX_UPLOAD_ARCHITECTURE.md)

### Sandbox Upload Architecture
- **Ubicación documental**: `docs/SANDBOX_UPLOAD_ARCHITECTURE.md`
- **Propósito**: Define el flujo y reglas de montaje de archivos en un entorno seguro antes del procesamiento.
- **Acción futura**: Transición a "Cargar encuesta" desde el estado sintético.
- **Regla principal**: Una encuesta activa por sesión (Single Survey Rule).
- **Seguridad**: Pre-analysis safety gate implementado para prevenir filtraciones de datos e IA prematura.
- **Restricción actual**: No parser/upload runtime todavía; solo arquitectura y validaciones en memoria definidas.

### Parser + Contract to Chat Integration Architecture
- Documento fuente: `docs/PARSER_CONTRACT_TO_CHAT_INTEGRATION_ARCHITECTURE.md`
- Chat será orquestador.
- Parser y assembler siguen aislados.
- Safety gate antes de parsing.
- One decision at a time.
- No UI implementation in 8A.
- First visible checkpoint expected in 8B.

### Survey File Analysis Contract Module
- **Ubicación**: `src/features/historical-import/survey-file-analysis/`
- **Propósito**: Define el contrato estricto de tipos de dominio para el análisis de archivos de encuesta.
- **No ejecuta parser**: Este módulo no procesa archivos.
- **No conecta IA**: No tiene conexión con servicios de IA externos.
- **Uso futuro**: Será la base tipada sobre la cual se implementará el deterministic parser y la capa de validación conversacional posterior.

### Mock UBITS Catalogs Module
- **Ubicación**: `src/features/historical-import/mock-ubits-catalogs/`
- **Propósito**: Define los catálogos mock de UBITS para simular matching y homologación en la arquitectura realista.
- **Catálogos incluidos**: Dimensiones, preguntas, demográficos, valores demográficos, usuarios, tipos de encuesta y aliases.
- **No ejecuta matching**: Este módulo solo expone datos estáticos y tipos.
- **No procesa archivos**: Sin capacidades de parser.
- **No conecta IA**: Completamente aislado del razonamiento semántico.
- **Uso futuro**: Será consultado por las fases de simulación de AI o matching determinista para encontrar correspondencias.

### Sandbox Upload UI (Phase 5B)

- **Ubicación:** `src/features/historical-import/conversational-import/SandboxUploadPanel.tsx`
- **Acción visible:** Cargar encuesta (reemplaza "Montar archivos sintéticos").
- **Selección local controlada:** Permite seleccionar archivos locales con extensiones `.xlsx`, `.xls`, `.csv`.
- **Metadata-only:** Solo se extrae `name`, `size`, `type`, `lastModified` del objeto File.
- **Files in memory only:** No se guarda nada en persistencia, sessionStorage ni localStorage.
- **No parser:** No se usa `FileReader` ni bibliotecas de parseo de excel.
- **No Claude:** No se envían datos al LLM en esta etapa.
- **No storage:** No se suben archivos a S3 ni a un servidor backend.

### Local Parser Architecture
- **Ubicación documental**: `docs/LOCAL_PARSER_ARCHITECTURE.md`
- **Parser como fuente estructural**: Actúa como fuente de verdad estructural.
- **Output**: Genera el `SurveyFileAnalysisContract`.
- **Dependency decision gate**: Requiere validación antes de introducir dependencias.
- **No runtime parser todavía**: Solo se define la arquitectura.
- **Claude fuera de scope**: Claude no participa en esta etapa.

### Local Parser Scaffolding
- Ubicación: `src/features/historical-import/local-parser/`
- Dependencia xlsx instalada.
- Parser runtime no implementado todavía.
- Dynamic header detection documentado como capability.
- Sin integración UI.
- Sin Claude.

### Parser Dependency Decision
- **Documento fuente**: `docs/PARSER_DEPENDENCY_DECISION.md`
- **Recomendación de dependencia futura**: Se recomienda `xlsx` para el prototipo.
- **No instalación en esta fase**: Ningún cambio en dependencias.
- **Header detection dinámico requerido**: Obligatorio, por ej. para compensar offset SIIS.
- **Parser sigue sin implementarse**: Evaluación documental completada.

### Local Parser Prototype v1
- Workbook extraction local.
- Dynamic header detection.
- SIIS-like header offset supported as robust header detection case.
- Output: ParsedWorkbookPreview.
- No UI integration.
- No Claude.
- No matching.
- No full SurveyFileAnalysisContract yet.

### Parser to Contract Assembly Architecture
- Documento fuente: `docs/PARSER_TO_CONTRACT_ASSEMBLY_ARCHITECTURE.md`.
- Input: ParsedWorkbookPreview.
- Output futuro: SurveyFileAnalysisContract.
- Parser no se mezcla con assembler.
- Ambigüedades requieren usuario.
- IA fuera de source of truth.
- No implementación todavía.

### Contract Assembler Type Scaffolding
- Ubicación: `src/features/historical-import/contract-assembler/`.
- Input futuro: ParsedWorkbookPreview.
- Output futuro: SurveyFileAnalysisContract.
- En esta fase solo tipos y placeholders.
- Sin contrato real.
- Sin UI.
- Sin Claude.
- Sin matching.

### Contract Assembler v1
- Ubicación: `src/features/historical-import/contract-assembler/`.
- Input: ParsedWorkbookPreview + MockUbitsCatalogs.
- Output: draft SurveyFileAnalysisContract.
- Ambigüedades quedan como user decisions.
- Sin UI.
- Sin Claude.
- Sin matching engine real.

### Parser + Contract Chat Integration Build
- Existing chat upload flow now orchestrates parser and assembler.
- Safety gate required before file parsing.
- Parser and assembler remain UI-agnostic.
- Chat presents compact structural summary.
- One decision at a time.
- First visible UI checkpoint.
- No Claude, storage, backend or matching.

### Conversational Decision Review Build
- The chat workspace uses the `Contract Assembler v1` output and renders required decisions interactively.
- The `InlineReviewPanel` provides a compact summary of the structure and displays the current decision.
- Only one decision is reviewed at a time to prevent cognitive overload.
- UI state tracks `currentDecisionIndex` locally.
- No Claude, no storage, no backend, no matching engine.

### Composer Attachment Entry Architecture
- Upload entrypoint moves to bottom composer.
- Chat body remains for conversation, summaries, warnings and decisions.
- Safety gate remains before parsing.
- Parser/assembler remain unchanged.
- First implementation will happen in 8D-H1.

### Fase 8D-H1 · Composer Attachment Entry Build
- Upload entrypoint moved to bottom composer.
- Composer supports text and file attachments.
- Selected files appear as compact attachment chips/cards.
- Chat body no longer acts as primary upload panel.
- Safety gate remains before parsing.
- Parser/assembler unchanged.
- Visible UI checkpoint reached.

### Chat Scroll & Attachment Layout Hotfix Architecture
- Chat messages area owns scroll.
- Composer remains fixed/sticky at bottom.
- Upload file grid removed from chat body.
- Composer owns attachment chips.
- Chat body shows compact file summary only.
- No parser/assembler changes.

### Matching Engine Architecture
- Documento fuente: `docs/MATCHING_ENGINE_ARCHITECTURE.md`.
- Matching Engine será determinístico.
- No parsea archivos.
- No renderiza UI.
- No crea datos globales.
- Ambigüedades requieren usuario.
- IA/Claude no es source of truth.
- No implementación en 9A.

### Matching Engine Integration Architecture
- Matching Engine will run after parser preview and contract assembly.
- Integration prepares historical load decisions, not comparison dashboards.
- Matching output feeds explained user decisions.
- Ambiguity remains human-reviewed.
- No global data creation, storage, backend, Claude or dashboard integration.

### Matching Engine Type Scaffolding
- Ubicación: `src/features/historical-import/matching-engine/`.
- Scaffolding de tipos y capabilities.
- No matching runtime todavía.
- No UI.
- No Claude.
- No storage.
- No datos globales.
- Ambigüedades requieren usuario.

### Chat Scroll & Attachment Layout Hotfix Build

- Chat messages container now owns scroll.
- Composer remains fixed/sticky at bottom.
- Safe bottom spacing prevents content overlap.
- File grid removed from chat body.
- Chat body shows compact file summary after send.
- Attachment chips remain in composer.
- Parser/assembler/matching unchanged.

### Auto Analysis, Survey Grouping & Decision UX Architecture
- Local analysis starts automatically after attachment submission.
- Blocking “Continuar análisis local” is removed.
- Chat shows thinking/progress states.
- Report is revealed progressively.
- Files are grouped by survey/cycle when possible.
- Decision actions are contextual, not generic.

### Auto Analysis, Survey Grouping & Decision UX Build

- Local analysis starts automatically after attachment submission.
- Blocking local analysis confirmation removed.
- Non-blocking local analysis notice added.
- Thinking/progress states added.
- Multi-survey grouping added.
- Survey group selection decision uses contextual actions.
- Generic decision actions removed.

### Decision Explanation UX Architecture
- Product context is Carga Histórica de Encuestas.
- Technical decision/warning codes must not be shown as user-facing copy.
- Each decision explains what was detected, why it matters, historical load impact, recommendation and contextual actions.
- Each action explains its consequence.
- Comparison dashboard remains out of scope.

### Decision Explanation UX Build
- User-facing decisions now hide technical codes.
- Decisions explain detected issue, why it matters, historical load impact, recommendation and contextual actions.
- Warnings explain user impact instead of showing raw warning codes.
- Action consequences are visible.
- Product context remains Carga Histórica de Encuestas.
- Comparison dashboard remains out of scope.

### Matching Engine v1 Implementation
- Deterministic matching runtime implemented for Carga Histórica de Encuestas.
- Engine supports demographics, demographic values, questions, dimensions, response scales and participant signals.
- Ambiguous matches require user decisions.
- Engine does not create global data.
- Engine does not connect to UI/chat, Claude, storage or backend.
- Comparison dashboard remains out of scope.

### Matching Engine Integration Build
- Matching Engine now runs after contract assembly and survey group selection.
- Matching output feeds explained decisions in the conversational flow.
- Ambiguity remains user-reviewed.
- No global data is created.
- No storage, backend or Claude integration is introduced.
- Product context remains Carga Histórica de Encuestas.

### Historical Load Draft Architecture
- Historical Load Draft will be created after contract assembly, matching and human decision resolution.
- Draft summarizes historical load readiness, not survey comparison.
- Draft stores mappings, survey-only entities, PII policy, unresolved decisions and audit trail.
- Draft does not create global data, persist records, call APIs, connect Claude or enable dashboards.

### Historical Load Draft Type Scaffolding
- Type scaffolding created for the Historical Load Draft preparation contract.
- No builder, runtime, UI integration, storage, backend or Claude connection was introduced.
- Draft remains a local preparation contract for Carga Histórica de Encuestas.
- Comparison dashboard remains out of scope.

### Historical Load Draft Builder
- Deterministic builder implemented for Historical Load Draft.
- Builder creates local preparation contract from assembled contract, matching decisions and readiness signals.
- Builder does not integrate with UI/chat.
- Builder does not persist data, create global records, call APIs, connect Claude or enable comparison dashboards.

### Historical Load Draft Integration Architecture
- Historical Load Draft will be built after matching review and required decision resolution.
- Draft output will feed a conversational summary, not a dashboard.
- Draft review remains local-only, privacy-preserving and human-reviewed.
- No UI/runtime integration, storage, backend or Claude connection is introduced in this phase.

### Historical Load Draft Integration Build
- Historical Load Draft builder is integrated into the conversational flow after matching review and decision resolution.
- Draft output is mapped to a conversational summary.
- One-decision-at-a-time remains active for unresolved decisions.
- No automatic approval, storage, backend, Claude or comparison dashboard is introduced.

### Historical Load Draft Review Architecture
- Review architecture defines the human confirmation step after Historical Load Draft summary.
- Review does not import data, persist records, create global catalogs or approve automatically.
- Approval means only ready for a future import phase.
- Privacy, one-decision-at-a-time and data minimization remain mandatory.

### Historical Load Draft Review Type Scaffolding
- Type scaffolding created for the Historical Load Draft Review model.
- Review model represents human review state, allowed actions, blocked actions, approval readiness and privacy flags.
- No mapper, runtime, UI integration, storage, backend, Claude connection, final import or automatic approval introduced.
- Comparison dashboard remains out of scope.

### Historical Load Draft Review Mapper
- Mapper created to transform HistoricalLoadDraft into HistoricalLoadDraftReviewModel.
- Mapper derives review state, executive summary, sections, actions, approval readiness, privacy flags and audit summary.
- No UI/chat/runtime integration, storage, backend, Claude, final import or automatic approval introduced.
- Comparison dashboard remains out of scope.

### Historical Load Draft Review UI

- Conversational review UI integrated after Historical Load Draft preparation.
- UI displays review state, executive summary, information sections, approval readiness, privacy flags, actions and audit summary.
- No new route or screen created.
- No final import, automatic approval, storage, backend, Claude or comparison dashboard introduced.

### Historical Load Review UX Hotfix Architecture

- Defines UX corrections for upload entry, survey grouping, bullet-first chat presentation, auto-scroll, decision specificity and analysis accuracy.
- Keeps the experience within the existing conversational workspace.
- No new route, screen, backend, storage, Claude, final import or comparison dashboard introduced.

### Historical Load Review UX Hotfix Build

- "Cargar encuesta" opens the chat and auto-opens the attachment picker.
- Chat presentation prioritizes bullet points with icons; cards are reserved for summaries.
- Uploaded files are grouped into segments inside the survey.
- Chat auto-scrolls to the bottom upon new messages.
- Specific, contextual copy is applied to decisions and warnings.
- Mapped zero demographics/questions and low-confidence analysis cases are handled properly.
- All visible copy is 100% Spanish.
- No new screen, route, backend, storage, Claude, final import or comparison dashboard introduced.

### Real XLSX Content Analysis Architecture
- Documento fuente: `docs/HISTORICAL_XLSX_CONTENT_ANALYSIS_ARCHITECTURE.md`.
- Define el pipeline de inspección de contenido XLSX en cliente (navegador).
- Incluye heurísticas para clasificar hojas, columnas, preguntas y demográficos.
- Identifica archivos que representan resúmenes de segmentos.
- Emite un modelo de confianza (`high`, `medium`, `low`, `blocked`).
- Genera decisiones humanas accionables cuando la confianza es baja.
- El UX debe mostrar descubrimientos (hojas, preguntas probables, etc.) en bullets.
- No se implementa backend, API, storage ni parseo real en esta fase arquitectónica.
- No renderiza datos crudos ni PII en la UI.

### Column Classification Runtime
- Adds pure deterministic column classification over safe workbook metadata.
- Classifies columns into question, demographic, participant identifier, metric, segment, metadata or unknown roles.
- Does not read files, parse XLSX binaries, render UI, call APIs, persist data or expose raw rows.

### Content Analysis UX Integration
- Connects safe XLSX content analysis outputs to the conversational historical import workflow.
- Shows whether internal workbook metadata is available, column classifications if present, and human-review decisions.
- Does not read files, parse binaries, call APIs, persist data, expose raw rows or create comparison outputs.

### Real XLSX Content Analysis Type Scaffolding
- Ubicación: `src/features/historical-import/xlsx-content-analyzer/`.
- Scaffolding de contratos puros para workbook inspection, sheet classification, headers, columns, question/demographic candidates y human decisions.
- Sin runtime, sin parseo, sin UI, sin dependencias externas.
- Privacidad por diseño: sin campos para raw rows, full workbooks o data dumps en los tipos.

### Workbook Inspection Mapper
- Adds a pure deterministic mapper for safe workbook metadata inspection.
- Does not read files, parse XLSX binaries, render UI, call APIs, persist data or expose raw rows.
- Produces typed workbook/sheet inspection output for later column classification phases.

### Content Analysis Metadata Wiring Hotfix (Phase 11D-H10-H2)
- Wires safe internal workbook metadata directly to the UI chat mapper.
- Prevents the filename-only fallback when internal sheets, row counts, and column labels are detected by the local parser.
- Enables the column classification runtime when `sampleColumnLabels` are detected in the metadata.
- Retains safe privacy boundaries (no raw rows, no PII, no data persistence).

## Phase 11D-H11-H1 · Content Analysis UX QA Hotfix
Refined content analysis presentation and bias heuristics, strictly enforcing local-only behavior and preventing raw data exposure.
Markers: PHASE_11D_H11_H1_CONTENT_ANALYSIS_UX_QA_HOTFIX_COMPLETE
Phase 11D-H11-H1 done

## Phase 11D-H11-H2 · Layout-aware Content Analysis & Bullet-only QA Hotfix
Corrected analysis and conversational output to be layout-aware and follow bullet-only rules.
Markers:
PHASE_11D_H11_H2_LAYOUT_AWARE_CONTENT_ANALYSIS_QA_HOTFIX_COMPLETE
SHEET_LAYOUT_CLASSIFICATION_ADDED
AGGREGATED_ITEMS_BY_ROWS_LAYOUT_SUPPORTED
RAW_RESPONSES_BY_COLUMNS_LAYOUT_SUPPORTED
SEGMENT_SUMMARY_LAYOUT_SUPPORTED
ROW_BASED_QUESTION_DETECTION_SUPPORTED
QUESTION_ZERO_FALSE_NEGATIVE_REMOVED
RISK_COUNT_FALSE_POSITIVE_REMOVED
PARTICIPANT_IDENTIFICATION_COPY_STABLE
CARDS_REMOVED_FROM_POST_ANALYSIS_FLOW
BULLETS_ONLY_POST_ANALYSIS_FLOW
MESSAGE_SEQUENCE_STABILIZED
FINAL_REVIEW_NOT_RENDERED_AUTOMATICALLY
OBJECT_OBJECT_BUG_FIXED
SHEET_SUMMARY_NO_LONG_HEADERS
FILENAME_ONLY_FALLBACK_PRESERVED
NO_FAKE_SHEET_NAMES
NO_FAKE_COLUMN_LABELS
NO_FAKE_QUESTION_DETECTION
NO_FAKE_DEMOGRAPHIC_DETECTION
NO_RAW_ROWS_RENDERED
NO_FULL_XLSX_DUMP
NO_RAW_JSON_RENDERED
NO_OBJECT_OBJECT_RENDERED
NO_ENGLISH_COPY
NO_AI_THEME_CSS_CHANGES
NO_BACKEND_CREATED
NO_STORAGE_CREATED
NO_CLAUDE_CONNECTION_CREATED
NO_API_CONNECTIONS
READY_FOR_COMPARISON_OUTPUT_DISABLED
COMPARISON_DASHBOARD_OUT_OF_SCOPE
VISIBLE_UI_CHECKPOINT_YES
READY_FOR_INTERFACE_TESTING
PHASE_11D_H11_CONTENT_ANALYSIS_UX_QA_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
Phase 11D-H11-H2 done

### Phase 11D-H11-H4: Analysis Ready Message Sequence
- Maintained conversational UI integrity by implementing a deterministic 600ms visual pause between the detailed analysis block and the final ready status message, eliminating near-simultaneous rendering and restoring natural chat flow.
### Phase 11D-H11-H4-H1: Typewriter-aware Analysis Ready Sequencing Hotfix
- PHASE_11D_H11_H4_H1_TYPEWRITER_AWARE_SEQUENCE_HOTFIX_COMPLETE
- ANALYSIS_BLOCK_VISUALLY_COMPLETE_BEFORE_READY_MESSAGE
- READY_MESSAGE_NOT_VISIBLE_WHILE_ANALYSIS_IS_TYPING
- READY_MESSAGE_APPEARS_AFTER_A_SHORT_PAUSE
- TYPEWRITER_OR_RENDER_COMPLETION_RESPECTED
- BLIND_DELAY_AS_ONLY_GATE_REMOVED
- MESSAGES_DO_NOT_RENDER_ALMOST_SIMULTANEOUSLY
- NO_STUCK_PROGRESS_MESSAGE
- FINAL_REVIEW_NOT_RENDERED_AUTOMATICALLY
- BULLETS_ONLY_POST_ANALYSIS_FLOW
- NO_CARDS_REINTRODUCED
- NO_OBJECT_OBJECT_RENDERED
- NO_AI_THEME_CSS_CHANGES
- NO_LOCAL_PARSER_CHANGES
- NO_ANALYZER_LOGIC_CHANGES
- NO_BACKEND_CREATED
- NO_STORAGE_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_API_CONNECTIONS
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- VISIBLE_UI_CHECKPOINT_YES
- READY_FOR_INTERFACE_TESTING
- PHASE_11D_H11_CONTENT_ANALYSIS_UX_QA_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## Phase 11D-H12 · Homologation Precheck Architecture

- Defined architecture for homologation precheck.
- See `docs/HOMOLOGATION_PRECHECK_ARCHITECTURE.md`.
- PHASE_11D_H12_HOMOLOGATION_PRECHECK_ARCHITECTURE_COMPLETE

### Homologation Precheck Types and Mapper

- Adds pure types and deterministic mapper for preparing homologation precheck from safe workbook metadata.
- Does not render UI, read files, call APIs, persist data, mutate catalogs or approve imports.
- Produces typed entities, suggestions, human decisions and a compact summary for the future conversational output.

### Fase 11D-H14-R1 · Complete Homologation Precheck Conversational UI

- PHASE_11D_H14_R1_HOMOLOGATION_PRECHECK_CONVERSATIONAL_UI_COMPLETE
- H14_DOCS_ONLY_GAP_RECONCILED
- HOMOLOGATION_PRECHECK_CONVERSATIONAL_UI_CONNECTED
- HOMOLOGATION_PRECHECK_MAPPER_CONSUMED
- SAFE_METADATA_INPUT_USED
- PRE_HOMOLOGATION_MESSAGE_VISIBLE
- PRE_HOMOLOGATION_APPEARS_AFTER_READY_MESSAGE
- PRE_HOMOLOGATION_NOT_VISIBLE_WHILE_PREVIOUS_MESSAGE_IS_TYPING
- PRE_HOMOLOGATION_BULLETS_ONLY
- NO_CARDS_REINTRODUCED
- NO_GRIDS_REINTRODUCED
- NO_FINAL_REVIEW_AUTOMATICALLY_RENDERED
- NO_OBJECT_OBJECT_RENDERED
- NO_STUCK_PROGRESS_MESSAGE
- NO_HOMOLOGATION_MAPPER_CHANGES
- NO_PARSER_CHANGES
- NO_ANALYZER_LOGIC_CHANGES
- NO_CATALOG_MUTATION
- NO_BACKEND_CREATED
- NO_STORAGE_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_API_CONNECTIONS
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- VISIBLE_UI_CHECKPOINT_YES
- PHASE_11D_H15_HOMOLOGATION_PRECHECK_VISUAL_QA_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## Phase 11D-H16: Homologation Precheck Spanish Copy and Summary Hotfix
The conversational block injected by the homologation precheck has been refined to enforce strict localization (Spanish) and a business-readable format.
- Output formatting resides within `homologationPrecheckChatMapper.ts`.
- Extracts safe counts directly from `result.entities` and `result.decisions` arrays.
- Implements fallback strings for missing demographics to avoid runtime errors or hallucinated numbers.

## Phase 11D-H17 · Structure Review Workspace Architecture

- Defined the architecture for the Structure Review Workspace.
- See `docs/STRUCTURE_REVIEW_WORKSPACE_ARCHITECTURE.md`.
- Established Source Structure Layer (immutable) and Review Overlay Layer (editable).
- No UI runtime, no parser changes, no backend/storage/Claude introduced in this phase.
- PHASE_11D_H17_STRUCTURE_REVIEW_WORKSPACE_ARCHITECTURE_COMPLETE

### Fase 11D-H18: Structure Inventory Types and Mapper
- Created a pure module for structure inventory that receives safe metadata and returns a typed inventory.
- Enforced safe label detection, deterministic IDs, and fallback mechanisms for incomplete row-level metadata.

### Fase 11D-H18: Structure Inventory Types and Mapper
- Created a pure module for structure inventory that receives safe metadata and returns a typed inventory.
- Enforced safe label detection, deterministic IDs, and fallback mechanisms for incomplete row-level metadata.
- PHASE_11D_H18_STRUCTURE_INVENTORY_TYPES_MAPPER_COMPLETE
- PHASE_11D_H19_STRUCTURE_INVENTORY_VISUAL_LIST_COMPLETE
- STRUCTURE_INVENTORY_CONVERSATIONAL_UI_CONNECTED
- STRUCTURE_INVENTORY_MAPPER_CONSUMED
- SAFE_METADATA_INPUT_USED
- STRUCTURE_INVENTORY_MESSAGE_VISIBLE
- STRUCTURE_INVENTORY_APPEARS_AFTER_PRE_HOMOLOGATION
- STRUCTURE_INVENTORY_NOT_VISIBLE_WHILE_PREVIOUS_MESSAGE_IS_TYPING
- STRUCTURE_INVENTORY_COUNTS_VISIBLE
- DIMENSIONS_COUNT_VISIBLE
- QUESTIONS_COUNT_VISIBLE
- DEMOGRAPHICS_COUNT_VISIBLE
- METRICS_COUNT_VISIBLE
- SEGMENTS_COUNT_VISIBLE
- DETAIL_AVAILABLE_OR_SAFE_FALLBACK_VISIBLE
- NO_FAKE_DIMENSIONS_OR_QUESTIONS
- NO_EDITOR_CONTROLS
- NO_CARDS_REINTRODUCED
- NO_GRIDS_REINTRODUCED
- NO_FINAL_REVIEW_AUTOMATICALLY_RENDERED
- NO_OBJECT_OBJECT_RENDERED
- NO_STUCK_PROGRESS_MESSAGE
- NO_STRUCTURE_INVENTORY_MAPPER_CHANGES
- NO_HOMOLOGATION_MAPPER_CHANGES
- NO_PARSER_CHANGES
- NO_ANALYZER_LOGIC_CHANGES
- NO_CATALOG_MUTATION
- NO_BACKEND_CREATED
- NO_STORAGE_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_API_CONNECTIONS
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- VISIBLE_UI_CHECKPOINT_YES
- PHASE_11D_H20_STRUCTURE_INVENTORY_VISUAL_QA_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

### Fase 11D-H22 · Assistant Response Presentation Visual Hotfix
- Corrected message renderer to show long structured text natively over the background without a card, gray, or purple wrapper.
- Implemented `AssistantStructuredMessage.tsx` to handle basic markdown formatting without adding external libraries.
- Added emojis/icons directly to the content generation mappers to improve visual hierarchy and match reference expectations.
- PHASE_11D_H22_ASSISTANT_RESPONSE_PRESENTATION_VISUAL_HOTFIX_COMPLETE

### Fase 11D-H23 · Secure Row Inventory Architecture
- Defined architecture for Secure Row Inventory to safely extract rows for structure discovery without exposing PII.
- Document location: `docs/SECURE_ROW_INVENTORY_ARCHITECTURE.md`.
- See document for allowed structural rows, trace models, entity boundaries, and strict privacy boundaries.
- No UI runtime, no parser changes, no backend/storage/Claude introduced in this phase.
- PHASE_11D_H23_SECURE_ROW_INVENTORY_ARCHITECTURE_COMPLETE

### Demo Fixture Data Contract (Phase 11D-H24)
- Defines the data contract for the QS Clima 2024/2025 Demo Fixture.
- Separates Source Fixture Layer from Review Overlay Layer.
- Typing explicitly blocks real responses, PII, and API connections.
- Enables safe simulated rendering of the Structure Review Workspace.
- VISIBLE_UI_CHECKPOINT_NO enforced.

### Demo Fixture QS Clima Data (Phase 11D-H25)
- Implements the curated demo fixture dataset for QS Clima 2024/2025 based on the H24 contract.
- Includes total and segment files, dimensions, curated questions, metrics, demographics, and initial review decisions.
- Completely adheres to privacy boundaries by omitting real responses, PII, and open text.
- No UI, backend, parser, or API connections implemented.
- Prepares the dataset for the visual structure review phase (H26).

### Fase 11D-H38 · Draft Preview UI
- **Objective:** Add a local preview UI to display the draft readiness state before preparing the final historical load draft.
- **Key Constraints:** No actual import is executed, no APIs called, no persistent state saved. The preview simply consumes the `evaluateDraftReadiness` from `draft-preparation` using the current demo fixture and overlay adjustments.
- **Components Introduced:**
  - `DraftReadinessPreview`: Renders readiness state, dimension/question summary, privacy boundaries, and potential blockers/warnings.
  - `draftPreviewMapper`: Maps the demo fixture and overlay state to the `DraftReadinessInput` shape for evaluation.
- **Changes in Workspace:** Added secondary action "Ver preview del borrador" which enables `draft_preview` viewMode and renders `DraftReadinessPreview`.

### Fase 11D-H40-H6 · Numbered Conversational Menu and Participation Count Hotfix
- **Objetivo**: Fix up conversational menu to correctly display numbers (1-9) for navigation and allow input by numeric option. Ensures participation count is visible for structural reviews securely utilizing `qsClimaDemoMetadata`.
- **Componentes**: 
  - `ConversationalImportWorkspace`: Draft Preview component overlay wrapper added participation count.
  - `conversationalEditingFlow`, `conversationalEditingMapper`, `conversationalIntentMapper`: Updated to properly map numbers and display the numbered list correctly.
  - `demoFixtureStructureReviewMapper`, `qsClimaFixture`: Added securely aggregated participation count display to initial analysis.

## Fase 11D-H42 · Conversational Wizard State Types
- PHASE_11D_H42_CONVERSATIONAL_WIZARD_STATE_TYPES_COMPLETE
- CONVERSATIONAL_WIZARD_STATE_TYPES_CREATED
- CONVERSATIONAL_WIZARD_STATE_ID_TYPED
- CONVERSATIONAL_SURVEY_SCOPE_TYPED
- CONVERSATIONAL_GENERAL_CONFIGURATION_TYPED
- CONVERSATIONAL_MATCH_REVIEW_SECTIONS_TYPED
- CONVERSATIONAL_AMBIGUITIES_TYPED
- CONVERSATIONAL_DECISIONS_TYPED
- CONVERSATIONAL_READINESS_TYPED
- CONVERSATIONAL_SANDBOX_IMPORT_STATE_TYPED
- CONVERSATIONAL_IMPORT_WIZARD_STATE_TYPED
- NO_FUNCTIONS_CREATED
- NO_RUNTIME_UI_INTEGRATION
- NO_CONVERSATIONAL_FLOW_CHANGES
- NO_FIXTURE_CHANGES
- NO_DRAFT_PREPARATION_CHANGES
- NO_OVERLAY_TYPES_CHANGES
- NO_IMPORT_EXECUTION
- NO_ROUTE_CREATED
- NO_BACKEND_CREATED
- NO_STORAGE_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_API_CONNECTIONS
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H43_GENERAL_CONFIGURATION_CONVERSATIONAL_FLOW_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H43 · General Configuration Conversational Flow
- PHASE_11D_H43_GENERAL_CONFIGURATION_CONVERSATIONAL_FLOW_COMPLETE
- GENERAL_CONFIGURATION_MAPPER_CREATED
- SEQUENTIAL_STATE_MACHINE_IMPLEMENTED
- SCOPE_SELECTION_STEP_IMPLEMENTED
- NAME_TYPING_STEP_IMPLEMENTED
- TYPE_SELECTION_STEP_IMPLEMENTED
- VISIBILITY_SELECTION_STEP_IMPLEMENTED
- CONFIDENTIALITY_THRESHOLD_TYPING_STEP_IMPLEMENTED
- MAIN_FILE_CONFIRMATION_STEP_IMPLEMENTED
- ASSOCIATED_FILES_CONFIRMATION_STEP_IMPLEMENTED
- GENERAL_CONFIGURATION_SUMMARY_STEP_IMPLEMENTED
- STATE_BASED_CHAT_ROUTING_IMPLEMENTED
- NO_TABS_CREATED
- NO_SIDE_PANEL_EDITOR_CREATED
- NO_FORM_BASED_WIZARD_CREATED
- NO_TABLE_BASED_MAPPING_UI_CREATED
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_CREATED
- NO_BACKEND_CREATED
- NO_STORAGE_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_API_CONNECTIONS
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- VISIBLE_UI_CHECKPOINT_YES
- PHASE_11D_H44_STRUCTURE_REVIEW_CONVERSATIONAL_FLOW_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44 · Conversational Match Review Flow
- **Phase Status**: Completed
- **Changes Made**: Added `conversationalMatchReviewMapper.ts` and updated `ConversationalImportWorkspace.tsx` to handle the conversational match review phase sequentially.
- **Rules applied**: ALL_ACTIONS_BY_CHAT_TEXT_ONLY, NO_TABS, NO_SIDE_PANEL_EDITOR, NO_FORM_BASED_WIZARD.
- **Markers**: PHASE_11D_H44_CONVERSATIONAL_MATCH_REVIEW_FLOW_COMPLETE.

## Conversational Chat Foundation Architecture
- [Conversational Chat Foundation Architecture](./CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE.md)

* **Markers:**
  - PHASE_11D_H44_H1_CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE_COMPLETE

### Phase 11D-H44-H2 · Chat Foundation Types
- Created the strict typescript contracts for the Chat Foundation layer (`chatFoundationTypes.ts`).
- Defines core models without implementing runtime behavior or UI functions.
- Models messages, roles, expected inputs, intents, policies (thinking, safety, conversation), and flow adapters.
- Validated to have ZERO `any` usage, ZERO execution code.
- **Markers**:
  - PHASE_11D_H44_H2_CHAT_FOUNDATION_TYPES_COMPLETE
  - PHASE_11D_H44_H3_CHAT_FOUNDATION_MESSAGE_RENDERER_READY
  - CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE_LOCKED
  - CHAT_SHELL_LAYER_DEFINED
  - MESSAGE_RENDERER_LAYER_DEFINED
  - THINKING_BEHAVIOR_LAYER_DEFINED
  - CONVERSATION_POLICY_LAYER_DEFINED
  - INTENT_NORMALIZATION_LAYER_DEFINED
  - SAFETY_RESPONSE_POLICY_LAYER_DEFINED
  - FLOW_ADAPTER_LAYER_DEFINED
  - DOMAIN_FLOW_LAYER_DEFINED
  - CHAT_BEHAVIOR_INVARIANTS_DEFINED
  - COMMON_RESPONSES_DEFINED
  - MOCKUP_FLOW_INTEGRATION_CONTRACT_DEFINED
  - HISTORICAL_IMPORT_FLOW_ADAPTER_FUTURE_PHASE_DEFINED
  - NO_SRC_CHANGES
  - NO_RUNTIME_UI_INTEGRATION
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H44_H2_CHAT_FOUNDATION_TYPES_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

- PHASE_11D_H44_H4_CHAT_FOUNDATION_THINKING_BEHAVIOR_COMPLETE
- CHAT_FOUNDATION_THINKING_BEHAVIOR_CREATED
- DEFAULT_THINKING_POLICY_CREATED
- THINKING_MESSAGE_FACTORY_CREATED
- THINKING_POLICY_EVALUATOR_CREATED
- THINKING_POLICY_NORMALIZER_CREATED
- THINKING_MESSAGE_USES_ASSISTANT_ROLE
- THINKING_MESSAGE_USES_THINKING_KIND
- THINKING_MESSAGE_SHOWS_AVATAR
- THINKING_MESSAGE_SHOWS_ASSISTANT_ICON
- NO_IDS_GENERATED_INTERNALLY
- NO_DATE_NOW
- NO_NEW_DATE
- NO_MATH_RANDOM
- NO_TIMERS_OR_HOOKS
- NO_RENDERER_MODIFIED
- NO_WORKSPACE_MODIFIED
- NO_RUNTIME_UI_INTEGRATION
- NO_FLOW_CHANGES
- NO_PLAYGROUND_CREATED
- NO_ROUTE_CREATED
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_RUNTIME
- NO_RESULT_LINK_CREATED
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H44_H5_CHAT_FOUNDATION_CONVERSATION_POLICY_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
- PHASE_11D_H44_H5_CHAT_FOUNDATION_CONVERSATION_POLICY_COMPLETE
- CHAT_FOUNDATION_CONVERSATION_POLICY_CREATED
- DEFAULT_CONVERSATION_POLICY_CREATED
- DEFAULT_SAFETY_POLICY_CREATED
- COMMON_RESPONSE_FACTORY_CREATED
- SAFETY_RESPONSE_FACTORY_CREATED
- COMMON_RESPONSE_LOOKUP_HELPER_CREATED
- SAFETY_RESPONSE_LOOKUP_HELPER_CREATED
- AMBIGUOUS_INPUT_RESPONSE_DEFINED
- INVALID_OPTION_RESPONSE_DEFINED
- CONFIRMATION_REQUIRED_RESPONSE_DEFINED
- CANCELLED_RESPONSE_DEFINED
- RESTARTED_RESPONSE_DEFINED
- HELP_RESPONSE_DEFINED
- SAFE_DETAILS_UNAVAILABLE_RESPONSE_DEFINED
- SAFETY_BLOCK_RESPONSE_DEFINED
- OUT_OF_SCOPE_RESPONSE_DEFINED
- PII_REQUEST_RESPONSE_DEFINED
- RAW_ROWS_REQUEST_RESPONSE_DEFINED
- OPEN_TEXT_REQUEST_RESPONSE_DEFINED
- OFFENSIVE_LANGUAGE_RESPONSE_DEFINED
- RACIST_OR_DISCRIMINATORY_LANGUAGE_RESPONSE_DEFINED
- REAL_IMPORT_WITHOUT_AUTHORIZATION_RESPONSE_DEFINED
- API_CONNECTION_WITHOUT_AUTHORIZATION_RESPONSE_DEFINED
- NO_IDS_GENERATED_INTERNALLY
- NO_DATE_NOW
- NO_NEW_DATE
- NO_MATH_RANDOM
- NO_TIMERS_OR_HOOKS
- NO_RENDERER_MODIFIED
- NO_WORKSPACE_MODIFIED
- NO_RUNTIME_UI_INTEGRATION
- NO_FLOW_CHANGES
- NO_PLAYGROUND_CREATED
- NO_ROUTE_CREATED
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_RUNTIME
- NO_RESULT_LINK_CREATED
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H44_H6_CHAT_FOUNDATION_VISUAL_PLAYGROUND_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## PHASE_11D_H44_H6_CHAT_FOUNDATION_VISUAL_PLAYGROUND_COMPLETE
Playground visual implementado.

## PHASE_11D_H44_H6_H1_PLAYGROUND_ISOLATION_AND_VISUAL_STYLE_RESTORE_COMPLETE
Playground aislado y estilos visuales restaurados/alineados al chat existente.

### Playground Isolation & Visual Style Restore (Phase 11D-H44-H6-H1)
- Isolated `ChatFoundationVisualPlayground` to render only when the environment variable `VITE_CHAT_FOUNDATION_PLAYGROUND` is set to `true`.
- Restored normal historical import flow (`ConversationalImportWorkspace`) as the default screen on port 5173.
- Aligned chat foundation message bubbles and styling to match the approved chat layout and UBITS tokens:
  - User bubbles match `rounded-2xl px-4 py-2.5 bg-muted text-foreground max-w-2xl`.
  - Assistant plain text/structured messages render as simple text without bubble cards.
  - Assistant warning, error, and confirmation messages render as Cards (`bg-muted border border-border rounded-xl p-3`).
  - Assistant avatar styled with `bg-ai-gradient text-primary-foreground shadow-sm` enclosing a sparkles UbitsIcon.
  - Thinking state renders using `AILoader` inline component.
- Phase Markers:
  - PHASE_11D_H44_H6_H1_PLAYGROUND_ISOLATION_AND_VISUAL_STYLE_RESTORE_COMPLETE
  - LOCALHOST_5173_RESTORED_TO_HISTORICAL_IMPORT_FLOW
  - PLAYGROUND_NOT_RENDERED_BY_DEFAULT
  - PLAYGROUND_VISIBLE_ON_SEPARATE_DEV_CONTEXT
  - PLAYGROUND_CAN_RUN_ON_PORT_5174
  - CHAT_FOUNDATION_VISUAL_STYLE_MATCHES_EXISTING_CHAT
  - MESSAGE_BUBBLES_MATCH_EXISTING_CHAT_STYLE
  - ASSISTANT_AVATAR_VISIBLE
  - ASSISTANT_ICON_VISIBLE
  - ASSISTANT_ICON_NOT_BROKEN
  - ASSISTANT_ICON_STYLE_MATCHES_EXISTING_CHAT
  - THINKING_MESSAGE_VISIBLE
  - THINKING_STYLE_MATCHES_EXISTING_CHAT
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_FLOW_MIGRATION
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H44_H7_CHAT_FOUNDATION_VISUAL_QA_RETRY_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## PHASE_11D_H44_H6_H2_DEDICATED_CHAT_PLAYGROUND_DEV_ENTRY_COMPLETE
Entrada dedicada de desarrollo del Playground implementada.

### Dedicated Chat Playground Dev Entry (Phase 11D-H44-H6-H2)
- Added dedicated NPM script `dev:chat-foundation` in `package.json` to launch Vite on port 5174 with `--mode chat-foundation`.
- Updated `src/App.tsx` to detect this mode using `import.meta.env.MODE === "chat-foundation"` to conditionally render the `ChatFoundationVisualPlayground` component.
- Preserved the default `npm run dev` behavior to run on port 5173 and show the normal Historical Import flow (`ConversationalImportWorkspace`).
- Phase Markers:
  - DEV_CHAT_FOUNDATION_SCRIPT_CREATED
  - NPM_RUN_DEV_STILL_SHOWS_HISTORICAL_IMPORT_FLOW
  - NPM_RUN_DEV_CHAT_FOUNDATION_SHOWS_PLAYGROUND
  - PLAYGROUND_RUNS_ON_LOCALHOST_5174
  - NO_MANUAL_VITE_ENV_COMMAND_REQUIRED
  - PACKAGE_LOCK_UNCHANGED
  - NO_DEPENDENCIES_ADDED
  - NO_ROUTE_PRODUCT_CREATED
  - NO_NAVIGATION_PRODUCT_CREATED
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_FLOW_MIGRATION
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H44_H7_CHAT_FOUNDATION_VISUAL_QA_RETRY_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## PHASE_11D_H44_H7_H1_CHAT_FOUNDATION_AVATAR_AND_SEMANTIC_ICONS_HOTFIX_COMPLETE
Hotfix de avatar e iconos semánticos del Chat Foundation completado.

### Chat Foundation Avatar & Semantic Icons Hotfix (Phase 11D-H44-H7-H1)
- Removed internal sparkles icon from assistant avatar to render as gradient-only circle matching the existing approved chat.
- Ensured assistant avatar does not change per message type or compete with semantic icons.
- Configured icons to render only when providing semantic meaning (confirmation, warning, error, safety, handoff, safe_details, thinking).
- Added an info icon header to safe_details messages.
- Avoided decorative icon repetition on plain text, structured messages, avatar, and other fields.
- Phase Markers:
  - PHASE_11D_H44_H7_H1_CHAT_FOUNDATION_AVATAR_AND_SEMANTIC_ICONS_HOTFIX_COMPLETE
  - AGENT_AVATAR_GRADIENT_ONLY
  - AGENT_AVATAR_INTERNAL_ICON_REMOVED
  - SEMANTIC_ICONS_ONLY_WHEN_MEANINGFUL
  - NO_DECORATIVE_ICON_REPETITION
  - NO_ICON_SATURATION
  - CHAT_FOUNDATION_VISUAL_STYLE_MATCHES_EXISTING_CHAT
  - MESSAGE_BUBBLES_MATCH_EXISTING_CHAT_STYLE
  - PLAYGROUND_STILL_RUNS_ON_LOCALHOST_5174
  - NPM_RUN_DEV_STILL_SHOWS_HISTORICAL_IMPORT_FLOW
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_FLOW_MIGRATION
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H44_H7_CHAT_FOUNDATION_VISUAL_QA_RETRY_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44-H8 · Historical Import Flow Adapter Architecture
- **Phase Status**: Completed
- **Changes Made**: Created [HISTORICAL_IMPORT_FLOW_ADAPTER_ARCHITECTURE.md](./HISTORICAL_IMPORT_FLOW_ADAPTER_ARCHITECTURE.md) documenting the adapter architecture to decouple the historical import survey logic from the reusable Chat Foundation component.
- **Rules applied**: Pure contract-driven decoupling, no runtime integrations, strict separation of concerns.
- **Summary**:
  - Historical Import Flow Adapter Architecture locked.
  - Chat Foundation remains reusable and isolated.
  - Historical Import flow will connect through the adapter in future phases.
  - No runtime migration yet.
- **Markers**:
  - PHASE_11D_H44_H8_HISTORICAL_IMPORT_FLOW_ADAPTER_ARCHITECTURE_COMPLETE
  - HISTORICAL_IMPORT_FLOW_ADAPTER_ARCHITECTURE_LOCKED
  - CHAT_FOUNDATION_RESPONSIBILITIES_DEFINED
  - HISTORICAL_IMPORT_FLOW_RESPONSIBILITIES_DEFINED
  - FLOW_ADAPTER_RESPONSIBILITIES_DEFINED
  - ADAPTER_STATE_CONTRACT_DEFINED
  - ADAPTER_MESSAGE_CONTRACT_DEFINED
  - ADAPTER_ACTION_CONTRACT_DEFINED
  - ADAPTER_EXPECTED_INPUT_CONTRACT_DEFINED
  - INTENT_NORMALIZATION_BOUNDARY_DEFINED
  - SAFETY_POLICY_BOUNDARY_DEFINED
  - THINKING_BEHAVIOR_BOUNDARY_DEFINED
  - DATA_AND_FIXTURE_BOUNDARY_DEFINED
  - GRADUAL_MIGRATION_PLAN_DEFINED
  - NO_SRC_CHANGES
  - NO_RUNTIME_UI_INTEGRATION
  - NO_FLOW_MIGRATION
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H44_H9_HISTORICAL_IMPORT_FLOW_ADAPTER_TYPES_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44-H9 · Historical Import Flow Adapter Types
- **Phase Status**: Completed
- **Changes Made**: Created type contracts for the Historical Import Flow Adapter in `historicalImportFlowAdapterTypes.ts` and exported them via `index.ts`.
- **Rules applied**: Pure contract-driven typing, no runtime integration, zero `any` or `as any` usage.
- **Summary**:
  - Defined `HistoricalImportFlowAdapterStep` covering 27 flow steps.
  - Defined `HistoricalImportFlowAdapterActionType` and `HistoricalImportFlowAdapterAction` covering 15 actions.
  - Defined `HistoricalImportFlowAdapterExpectedInputType` and `HistoricalImportFlowAdapterExpectedInput` with explicit constraint typing.
  - Defined `HistoricalImportFlowAdapterSafetySignal` and `HistoricalImportFlowAdapterSafetyState` to manage privacy and safety validation.
  - Defined `HistoricalImportFlowAdapterThinkingState` and `HistoricalImportFlowAdapterMetadata`.
  - Defined `HistoricalImportFlowAdapterSnapshot` referencing Chat Foundation message shapes and Conversational Import Wizard state.
- **Markers**:
  - PHASE_11D_H44_H9_HISTORICAL_IMPORT_FLOW_ADAPTER_TYPES_COMPLETE
  - FLOW_ADAPTER_TYPES_CREATED
  - FLOW_ADAPTER_INDEX_CREATED
  - ADAPTER_STEP_CONTRACT_DEFINED
  - ADAPTER_ACTION_CONTRACT_DEFINED
  - ADAPTER_EXPECTED_INPUT_CONTRACT_DEFINED
  - ADAPTER_SNAPSHOT_CONTRACT_DEFINED
  - ADAPTER_SAFETY_CONTRACT_DEFINED
  - ADAPTER_THINKING_CONTRACT_DEFINED
  - ADAPTER_METADATA_CONTRACT_DEFINED
  - CHAT_FOUNDATION_TYPES_REUSED
  - CONVERSATIONAL_WIZARD_TYPES_REUSED
  - NO_RUNTIME_MAPPERS_CREATED
  - NO_COMPONENTS_CREATED
  - NO_HOOKS_CREATED
  - NO_FIXTURES_CREATED
  - NO_UI_CHANGES
  - NO_RUNTIME_INTEGRATION
  - NO_FLOW_MIGRATION
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H44_H10_HISTORICAL_IMPORT_FLOW_ADAPTER_MESSAGE_MAPPER_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44-H10 · Historical Import Flow Adapter Message Mapper
- **Phase Status**: Completed
- **Changes Made**: Created pure mapper functions to translate flow steps and wizard states into Chat Foundation messages.
- **Rules applied**: Pure functional mapping, deterministic message and thinking ID generation, zero side effects.
- **Summary**:
  - Created `historicalImportFlowAdapterMessageMapper.ts` with `mapHistoricalImportFlowAdapterMessages` mapping all 27 steps.
  - Handled thinking messages before agent replies using Chat Foundation's `shouldShowThinkingBeforeAssistantReply` and `createChatFoundationThinkingMessage`.
  - Added warning, error, handoff, and safe details messages.
  - Upgraded index exports.
- **Markers**:
  - PHASE_11D_H44_H10_HISTORICAL_IMPORT_FLOW_ADAPTER_MESSAGE_MAPPER_COMPLETE
  - FLOW_ADAPTER_MESSAGE_MAPPER_CREATED
  - FLOW_ADAPTER_MESSAGE_MAPPER_EXPORTED
  - ALL_ADAPTER_STEPS_HANDLED
  - MESSAGES_USE_CHAT_FOUNDATION_TYPES
  - CONVERSATIONAL_WIZARD_TYPES_REUSED
  - THINKING_MESSAGE_SUPPORTED
  - THINKING_BEFORE_AGENT_REPLY
  - SAFE_DETAILS_MESSAGES_SUPPORTED
  - WARNING_MESSAGES_SUPPORTED
  - ERROR_MESSAGES_SUPPORTED
  - HANDOFF_MESSAGES_SUPPORTED
  - NO_PII_VISIBLE
  - NO_RAW_ROWS_VISIBLE
  - NO_OPEN_TEXT_VISIBLE
  - NO_WORKBOOK_DUMP_VISIBLE
  - NO_RUNTIME_INTEGRATION
  - NO_FLOW_MIGRATION
  - NO_UI_CHANGES
  - NO_COMPONENTS_CREATED
  - NO_HOOKS_CREATED
  - NO_FIXTURES_CREATED
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H44_H11_HISTORICAL_IMPORT_FLOW_ADAPTER_PLAYGROUND_FIXTURE_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44-H11 · Historical Import Flow Adapter Playground Fixture
- **Phase Status**: Completed
- **Changes Made**: Created the playground fixture containing 18 scenarios, updated the index export, and integrated the scenario selector and interactive preview in the Chat Foundation Playground.
- **Rules applied**: Pure functional mapping, deterministic IDs, safe mock state with no PII/raw rows, no product runtime integration.
- **Summary**:
  - Created `historicalImportFlowAdapterPlaygroundFixture.ts` with `historicalImportFlowAdapterPlaygroundScenarios`.
  - Added scenario selector UI in `ChatFoundationVisualPlayground.tsx`.
  - Integrated the preview section using existing `ChatFoundationMessageRenderer` without changing Chat Foundation core components.
- **Markers**:
  - PHASE_11D_H44_H11_HISTORICAL_IMPORT_FLOW_ADAPTER_PLAYGROUND_FIXTURE_COMPLETE
  - FLOW_ADAPTER_PLAYGROUND_FIXTURE_CREATED
  - FLOW_ADAPTER_PLAYGROUND_FIXTURE_EXPORTED
  - FIXTURE_USES_MESSAGE_MAPPER
  - FIXTURE_SCENARIOS_TYPED
  - MINIMUM_SCENARIOS_COVERED
  - MOCK_WIZARD_STATE_SAFE
  - PLAYGROUND_SHOWS_ADAPTER_FIXTURE_SECTION
  - PLAYGROUND_LABELS_ADAPTER_AS_INTERNAL_MOCK
  - PLAYGROUND_STILL_SHOWS_CHAT_FOUNDATION_BASE_MESSAGES
  - CHAT_FOUNDATION_RENDERER_REUSED
  - CHAT_FOUNDATION_CORE_UNCHANGED
  - NO_PII_VISIBLE
  - NO_RAW_ROWS_VISIBLE
  - NO_OPEN_TEXT_VISIBLE
  - NO_WORKBOOK_DUMP_VISIBLE
  - NO_REAL_CLIENT_DATA
  - NPM_RUN_DEV_STILL_SHOWS_HISTORICAL_IMPORT_FLOW
  - NPM_RUN_DEV_CHAT_FOUNDATION_SHOWS_PLAYGROUND
  - PLAYGROUND_RUNS_ON_LOCALHOST_5174
  - NO_PRODUCT_RUNTIME_INTEGRATION
  - NO_FLOW_MIGRATION
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H44_H12_ADAPTER_VISUAL_QA_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44-H12-H1 · Adapter Fixture Main Panel Visual Hotfix
- **Phase Status**: Completed
- **Changes Made**: Promoted the adapter fixture messages section to be the primary panel at the top of the main playground container, set the default selected scenario to 'awaiting_survey_scope_selection', and moved base messages below it in a collapsible container.
- **Rules applied**: Pure functional mapping, deterministic defaults, no product runtime integration.
- **Summary**:
  - Configured `awaiting_survey_scope_selection` as the default selected scenario in `ChatFoundationVisualPlayground.tsx`.
  - Moved the Historical Import Flow Adapter Fixture messages section to be the primary chat display card.
  - Made the Chat Foundation base messages section secondary and collapsible under a native `<details>` element.
- **Markers**:
  - PHASE_11D_H44_H12_H1_ADAPTER_FIXTURE_MAIN_PANEL_VISUAL_HOTFIX_COMPLETE
  - ADAPTER_FIXTURE_MESSAGES_VISIBLE_IN_MAIN_PANEL
  - ADAPTER_FIXTURE_HEADER_VISIBLE_IN_MAIN_PANEL
  - ADAPTER_FIXTURE_LABELS_INTERNAL_MOCK
  - SELECTED_SCENARIO_MESSAGES_RENDERED
  - CHAT_FOUNDATION_RENDERER_REUSED
  - CHAT_FOUNDATION_CORE_UNCHANGED
  - BASE_MESSAGES_STILL_AVAILABLE_BUT_SECONDARY
  - NO_PRODUCT_RUNTIME_INTEGRATION
  - NO_FLOW_MIGRATION
  - NO_CONVERSATIONAL_IMPORT_WORKSPACE_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H44_H12_ADAPTER_VISUAL_QA_RETRY_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H44-H13 · Controlled Runtime Integration Architecture
- **Phase Status**: Completed
- **Changes Made**: Locked the controlled runtime integration architecture by creating design and strategy documentation for the integration between ConversationalImportWorkspace, Historical Import Flow Adapter, and Chat Foundation. No runtime changes or UI modifications were made.
- **Rules applied**: Non-disruptive evolution, feature gating, separation of concerns.
- **Summary**:
  - Controlled Runtime Integration Architecture locked.
  - The real historical import flow remains intact.
  - Runtime integration will be gradual, gated and visually reviewed.
- **Markers**:
  - PHASE_11D_H44_H13_CONTROLLED_RUNTIME_INTEGRATION_ARCHITECTURE_COMPLETE
  - CONTROLLED_RUNTIME_INTEGRATION_ARCHITECTURE_LOCKED
  - RUNTIME_BOUNDARIES_DEFINED
  - INTEGRATION_STAGES_DEFINED
  - FEATURE_GATE_STRATEGY_DEFINED
  - PARITY_CRITERIA_DEFINED
  - RISK_MITIGATION_DEFINED
  - FUTURE_FILES_BOUNDARY_DEFINED
  - H44_H14_CRITERIA_DEFINED
  - NO_SRC_CHANGES
  - NO_RUNTIME_INTEGRATION
  - NO_UI_CHANGES
  - NO_FLOW_MIGRATION
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H44_H14_CONTROLLED_RUNTIME_INTEGRATION_BUILD_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## PHASE_11D_H44_H14_CONTROLLED_RUNTIME_INTEGRATION_BUILD_COMPLETE

Se completó con éxito la integración en runtime del renderizador de Chat Foundation dentro de la Carga Histórica real sin alterar el comportamiento interactivo.

### Invariantes y Verificaciones
- **Feature Gate**: Se habilitó la integración controlada en `ConversationalImportWorkspace.tsx` mediante `HISTORICAL_IMPORT_CHAT_FOUNDATION_RUNTIME_ENABLED = true`.
- **Renderer Swap**: Se reemplazó la visualización de mensajes tradicionales con `<ChatFoundationMessageRenderer />`, manteniendo todos los paneles adjuntos lógicos (`SyntheticMountedFilesPanel`, `SandboxUploadPanel`, etc.) alineados con `ml-11`.
- **Paridad Visual**: El avatar es puramente un gradiente sin iconos internos decorativos, el loader de pensando es sutil y uniforme, y los iconos semánticos se conservan en estados correspondientes.
- **Flujos**: La selección de alcances (1, 2, 3), la configuración general (7 pasos), el match review y el sandbox de resultados siguen operando de manera idéntica.

### Marcadores de Cumplimiento
- PHASE_11D_H44_H14_CONTROLLED_RUNTIME_INTEGRATION_BUILD_COMPLETE
- CONTROLLED_RUNTIME_INTEGRATION_BUILD_COMPLETE
- CHAT_FOUNDATION_RENDERER_USED_IN_REAL_WORKSPACE
- REAL_WORKSPACE_STATE_LOGIC_PRESERVED
- REAL_WORKSPACE_INPUT_PRESERVED
- REAL_WORKSPACE_INTENT_FLOW_PRESERVED
- SCOPE_SELECTION_STILL_WORKS
- GENERAL_CONFIGURATION_STILL_WORKS
- MATCH_REVIEW_STILL_WORKS
- THINKING_VISIBLE_IN_REAL_WORKSPACE
- AGENT_AVATAR_GRADIENT_ONLY_IN_REAL_WORKSPACE
- SEMANTIC_ICONS_NOT_SATURATED_IN_REAL_WORKSPACE
- NO_FULL_WORKSPACE_REWRITE
- NO_CHAT_FOUNDATION_CORE_CHANGES
- NO_APP_TSX_CHANGES
- NO_PACKAGE_JSON_CHANGES
- NO_ROUTE_PRODUCT_CREATED
- NO_NAVIGATION_PRODUCT_CREATED
- ALL_ACTIONS_BY_CHAT_TEXT_ONLY
- NO_SIDE_PANEL_EDITOR
- NO_EXTERNAL_REVIEW_TAB
- NO_FORM_MODE_EDITOR
- NO_ACTION_BUTTONS_FOR_REVIEW
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_RUNTIME
- NO_RESULT_LINK_CREATED
- NO_DASHBOARD_OR_COMPARISON_CHANGES
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- PLAYGROUND_5174_STILL_WORKS
- PLAYGROUND_ADAPTER_FIXTURE_STILL_VISIBLE
- VISIBLE_UI_CHECKPOINT_YES
- PHASE_11D_H44_H15_HISTORICAL_IMPORT_FLOW_VISUAL_REGRESSION_QA_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## PHASE_11D_H44_H17_CHAT_FOUNDATION_RUNTIME_STABILIZATION_COMPLETE

Se estabilizó con éxito el runtime integrado del renderizador de Chat Foundation dentro de la Carga Histórica real sin alterar el comportamiento interactivo, aislando los elementos del playground y asegurando invariantes técnicas.

### Invariantes y Verificaciones
- **Aislamiento de Exports**: Se modificó `flow-adapter/index.ts` para exportar únicamente `mapRuntimeMessageToChatFoundation`, evitando la mezcla de código y fixtures de playground con el flujo real.
- **Determinismo y Pureza**: El mapper en runtime no genera efectos secundarios, es 100% puro y carece de uso de variables temporales o aleatorias.
- **Mapeo de Roles y Estilo**: Los avatares del asistente se muestran como gradientes sin iconos internos decorativos, los mensajes mantienen orden estable e identificadores coherentes heredados del estado.

### Marcadores de Cumplimiento
- PHASE_11D_H44_H17_CHAT_FOUNDATION_RUNTIME_STABILIZATION_COMPLETE
- CHAT_FOUNDATION_RUNTIME_STABILIZATION_COMPLETE
- RUNTIME_ADAPTER_MAPPER_STABLE
- RUNTIME_MESSAGE_IDS_DETERMINISTIC
- RUNTIME_MESSAGE_ORDER_STABLE
- RUNTIME_MAPPER_HAS_NO_SIDE_EFFECTS
- RUNTIME_MAPPER_DOES_NOT_EXPOSE_PII
- WORKSPACE_STATE_LOGIC_STILL_PRESERVED
- WORKSPACE_INPUT_STILL_PRESERVED
- WORKSPACE_INTENT_FLOW_STILL_PRESERVED
- CHAT_FOUNDATION_RENDERER_STILL_USED_IN_REAL_WORKSPACE
- CHAT_FOUNDATION_CORE_UNCHANGED
- FLOW_ADAPTER_EXPORTS_STABLE
- NO_PLAYGROUND_RUNTIME_MIXING
- SCOPE_SELECTION_STILL_WORKS
- GENERAL_CONFIGURATION_STILL_WORKS
- MATCH_REVIEW_STILL_WORKS
- NO_NEW_FEATURES
- NO_NEW_SCREEN
- NO_FULL_WORKSPACE_REWRITE
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_RUNTIME
- NO_RESULT_LINK_CREATED
- NO_DASHBOARD_OR_COMPARISON_CHANGES
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- PLAYGROUND_5174_STILL_WORKS
- PLAYGROUND_ADAPTER_FIXTURE_STILL_VISIBLE
- VISIBLE_UI_CHECKPOINT_NO_UNLESS_VISIBLE_CHANGE
- PHASE_11D_H45_AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H45 · Ambiguity Resolution Flow Architecture
- **Phase Status**: Completed (docs only)
- **Document**: [AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md](./AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md)
- **Changes Made**: Created the architecture document defining the conversational ambiguity resolution flow for the historical import prototype.
- **Rules applied**: No source code changes, no runtime integration, no UI changes, no flow migration, no import execution.
- **Summary**:
  - Defined 14 ambiguity types covering survey scope, naming, type, visibility, dates, files, scales, demographics, dimensions, segments, privacy, duplicates, and out-of-scope requests.
  - Defined 11-state finite flow from `no_ambiguity` to `blocked_until_user_clarifies`.
  - Defined conversation pattern with thinking + explanation + numbered options + text response.
  - Defined resolution rules for number, text, ambiguous, out-of-scope, privacy, and import handling.
  - Defined boundaries with Chat Foundation (render-only), Flow Adapter (translation-only), and Workspace (domain state + orchestration).
  - Enforced privacy and security invariants: NO_PII_VISIBLE, NO_RAW_ROWS_VISIBLE, NO_OPEN_TEXT_VISIBLE, etc.
  - Defined roadmap for H46–H51 future implementation phases.
  - Defined H46 criteria for creating ambiguity resolution types if authorized.
- **Markers**:
  - PHASE_11D_H45_AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE_COMPLETE
  - AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE_LOCKED
  - AMBIGUITY_TYPES_DEFINED
  - AMBIGUITY_STATES_DEFINED
  - AMBIGUITY_CONVERSATION_PATTERN_DEFINED
  - AMBIGUITY_RESOLUTION_RULES_DEFINED
  - CHAT_FOUNDATION_BOUNDARY_DEFINED
  - FLOW_ADAPTER_BOUNDARY_DEFINED
  - WORKSPACE_BOUNDARY_DEFINED
  - PRIVACY_RULES_DEFINED
  - OUT_OF_SCOPE_RULES_DEFINED
  - H46_CRITERIA_DEFINED
  - NO_SRC_CHANGES
  - NO_RUNTIME_INTEGRATION
  - NO_UI_CHANGES
  - NO_FLOW_MIGRATION
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H46_AMBIGUITY_RESOLUTION_TYPES_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H46 · Ambiguity Resolution Types
- **Phase Status**: Completed (types only)
- **Module**: `src/features/historical-import/conversational-import/ambiguity-resolution/`
- **Files Created**:
  - `ambiguityResolutionTypes.ts` — Full type contract for the ambiguity resolution flow.
  - `index.ts` — Public barrel export.
- **Changes Made**: Created pure TypeScript type contracts for the Ambiguity Resolution Flow. No runtime logic, no UI, no mappers, no hooks, no routes.
- **Summary**:
  - Defined `AmbiguityType` union covering all 14 canonical ambiguity categories.
  - Defined `AmbiguitySeverity` — `low | medium | high | blocking`.
  - Defined `AmbiguityResolutionFlowState` — 11-state finite flow.
  - Defined `AmbiguityResolutionOption` — deterministic id, label, description, isRecommended, safetyNote. No callbacks.
  - Defined `AmbiguityExpectedInputKind` and `AmbiguityExpectedInput` — supports numeric_choice, free_text, confirmation, clarification. Required flag included.
  - Defined `AmbiguityPrivacyFlags` — privacyRisk, safeToRender, requiresExplicitConfirmation, redactionApplied.
  - Defined `ActiveAmbiguity` — primary ambiguity entity contract with all required fields. No PII, no raw rows, no open text.
  - Defined `AmbiguityResolutionReceived` — resolution submitted by user, sanitized input only.
  - Defined `AmbiguityResolutionSnapshot` — point-in-time state snapshot compatible with future H47/H48/H49 phases.
- **Markers**:
  - PHASE_11D_H46_AMBIGUITY_RESOLUTION_TYPES_COMPLETE
  - AMBIGUITY_RESOLUTION_TYPES_CREATED
  - AMBIGUITY_RESOLUTION_INDEX_CREATED
  - AMBIGUITY_TYPES_UNION_DEFINED
  - AMBIGUITY_SEVERITY_DEFINED
  - AMBIGUITY_STATES_DEFINED
  - AMBIGUITY_OPTION_CONTRACT_DEFINED
  - AMBIGUITY_EXPECTED_INPUT_DEFINED
  - ACTIVE_AMBIGUITY_CONTRACT_DEFINED
  - AMBIGUITY_RESOLUTION_CONTRACT_DEFINED
  - AMBIGUITY_SNAPSHOT_CONTRACT_DEFINED
  - AMBIGUITY_PRIVACY_FLAGS_DEFINED
  - PUBLIC_EXPORTS_DEFINED
  - NO_DETECTION_LOGIC_CREATED
  - NO_CONVERSATION_MAPPER_CREATED
  - NO_RUNTIME_INTEGRATION
  - NO_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CHANGES
  - NO_FLOW_ADAPTER_CHANGES
  - NO_UI_CHANGES
  - NO_COMPONENTS_CREATED
  - NO_HOOKS_CREATED
  - NO_ROUTES_CREATED
  - NO_FIXTURES_CREATED
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H47_AMBIGUITY_DETECTION_MAPPER_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED
## Fase 11D-H47 · Ambiguity Detection Mapper
- **Phase Status**: Completed (pure mapper, no runtime integration)
- **Module**: `src/features/historical-import/conversational-import/ambiguity-resolution/`
- **Files Created**:
  - `ambiguityDetectionMapper.ts` — Sanitized input contract + pure detection mapper.
  - `src/.../ambiguity-resolution/__tests__/ambiguityDetectionMapper.test.ts` — Unit tests (canonical).
  - `tests/historical-import/conversational-import/ambiguity-resolution/ambiguityDetectionMapper.test.ts` — Vitest-runnable mirror.
- **Files Modified**:
  - `index.ts` — Extended to export H47 mapper function and input contract types.
- **Changes Made**: Created `detectHistoricalImportAmbiguities`, a pure deterministic mapper that receives a sanitized `AmbiguityDetectionInput` and returns an `AmbiguityResolutionSnapshot`. No runtime integration, no UI, no side effects.
- **Summary**:
  - Defined `AmbiguityDetectionInput` — sanitized input contract covering all 14 signal types (scopes, name, type, visibility, date, files, associated files, question/scales, demographics, dimensions, segment/cuts, privacy, conflicts, out-of-scope).
  - Implemented 14 detection functions — one per approved ambiguity category.
  - Priority order defined and enforced: Privacy (1) → OutOfScope (2) → MultipleSurveyScope (3) → MainFile (4) → DuplicateOrConflict (5) → SurveyType (6) → Visibility (7) → EndDate (8) → SurveyName (9) → AssociatedFiles (10) → QuestionScale (11) → DemographicMapping (12) → DimensionMapping (13) → SegmentCut (14).
  - `PrivacyThresholdAmbiguity` is `blocking` when `privacyRisk = true`.
  - `OutOfScopeRequestAmbiguity` always sets `status = 'out_of_scope_redirected'`.
  - `resolvedAmbiguities` is always empty in H47 (no resolution applied).
  - IDs are deterministic (type slug + position index, no Date/Math.random).
  - Input is never mutated.
  - 19 unit tests cover all 14 ambiguity types + priority, determinism, mutation safety, privacy safety.
- **Markers**:
  - PHASE_11D_H47_AMBIGUITY_DETECTION_MAPPER_COMPLETE
  - AMBIGUITY_DETECTION_MAPPER_CREATED
  - AMBIGUITY_DETECTION_MAPPER_EXPORTED
  - SANITIZED_INPUT_CONTRACT_DEFINED
  - ALL_APPROVED_AMBIGUITY_TYPES_DETECTABLE
  - DETECTION_RULES_DETERMINISTIC
  - ACTIVE_AMBIGUITY_PRIORITY_DEFINED
  - BLOCKING_PRIVACY_PRIORITY_SUPPORTED
  - OUT_OF_SCOPE_REDIRECT_SUPPORTED
  - RESOLUTION_NOT_APPLIED
  - NO_RUNTIME_SIDE_EFFECTS
  - INPUT_NOT_MUTATED
  - AMBIGUITY_DETECTION_TESTS_CREATED
  - NO_CONVERSATION_MAPPER_CREATED
  - NO_RUNTIME_INTEGRATION
  - NO_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CHANGES
  - NO_FLOW_ADAPTER_CHANGES
  - NO_UI_CHANGES
  - NO_COMPONENTS_CREATED
  - NO_HOOKS_CREATED
  - NO_ROUTES_CREATED
  - NO_PRODUCT_FIXTURES_CREATED
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H48_AMBIGUITY_CONVERSATION_MAPPER_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H48 · Ambiguity Conversation Mapper
- **Phase Status**: Completed (pure mapper, no runtime integration)
- **Module**: `src/features/historical-import/conversational-import/ambiguity-resolution/`
- **Files Created**:
  - `ambiguityConversationMapper.ts` — Pure conversation mapper.
  - `src/.../ambiguity-resolution/__tests__/ambiguityConversationMapper.test.ts` — Unit tests.
- **Files Modified**:
  - `index.ts` — Extended to export H48 mapper function.
- **Changes Made**: Created `mapAmbiguityResolutionToChatMessages`, a pure deterministic mapper that receives an `AmbiguityResolutionSnapshot` and returns an ordered array of `ChatFoundationMessage` instances. No runtime integration, no UI, no side effects.
- **Summary**:
  - When no `activeAmbiguity` exists, returns an empty array.
  - When an ambiguity is active, produces 9 message types in stable order.
  - Thinking message appears first (assistant, thinking kind).
  - Explanation message contains the user-facing explanation (plain_text).
  - Impact message rendered as safe_details with impactSummary content.
  - Numbered options rendered as plain text with "1. Label (Recomendado)" format.
  - Question message adapts to expectedInput.kind (numeric_choice, free_text, confirmation, clarification).
  - Expected input hint as plain text describing the required response format.
  - Privacy warning rendered as warning message when privacyRisk is true.
  - Blocking error rendered as error/blocked for blocking severity (excluding OutOfScope).
  - Safe redirect rendered as handoff for OutOfScopeRequestAmbiguity.
  - All IDs deterministic (amb-conv-{ambiguityId}-assistant-{kind}).
  - No resolution applied. No runtime integration. No UI changes.
  - 18 unit tests cover all required scenarios.
- **Markers**:
  - PHASE_11D_H48_AMBIGUITY_CONVERSATION_MAPPER_COMPLETE
  - AMBIGUITY_CONVERSATION_MAPPER_CREATED
  - AMBIGUITY_CONVERSATION_MAPPER_EXPORTED
  - CHAT_FOUNDATION_MESSAGE_CONTRACT_USED
  - ACTIVE_AMBIGUITY_TO_MESSAGES_SUPPORTED
  - NO_AMBIGUITY_STATE_SUPPORTED
  - THINKING_BEFORE_AGENT_MESSAGE_SUPPORTED
  - AMBIGUITY_EXPLANATION_RENDERED
  - IMPACT_SUMMARY_RENDERED
  - NUMBERED_OPTIONS_RENDERED_AS_TEXT
  - EXPECTED_INPUT_RENDERED_AS_TEXT
  - PRIVACY_WARNING_RENDERED
  - BLOCKING_AMBIGUITY_RENDERED_SAFELY
  - OUT_OF_SCOPE_REDIRECT_RENDERED_SAFELY
  - MESSAGE_IDS_DETERMINISTIC
  - INPUT_NOT_MUTATED
  - NO_RESOLUTION_APPLIED
  - NO_RUNTIME_SIDE_EFFECTS
  - AMBIGUITY_CONVERSATION_TESTS_CREATED
  - NO_DETECTION_LOGIC_CHANGES
  - NO_RUNTIME_INTEGRATION
  - NO_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CORE_CHANGES
  - NO_FLOW_ADAPTER_CHANGES
  - NO_UI_CHANGES
  - NO_COMPONENTS_CREATED
  - NO_HOOKS_CREATED
  - NO_ROUTES_CREATED
  - NO_PRODUCT_FIXTURES_CREATED
  - NO_ROOT_TESTS_CREATED
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - VISIBLE_UI_CHECKPOINT_NO
  - PHASE_11D_H49_AMBIGUITY_RUNTIME_INTEGRATION_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Fase 11D-H48-H1 · Fix Ambiguity Conversation Mapper Governance
- **Phase Status**: Completed (governance hotfix)
- **Problem**: H48 commit placed test at `tests/.../ambiguityConversationMapper.test.ts` instead of authorized `src/.../__tests__/`. vitest.config.ts only included `tests/**`. QA_CHECKLIST.md was not updated.
- **Changes Made**:
  - Removed unauthorized test from `tests/historical-import/conversational-import/ambiguity-resolution/ambiguityConversationMapper.test.ts`.
  - Created authorized test at `src/.../ambiguity-resolution/__tests__/ambiguityConversationMapper.test.ts` with corrected relative imports.
  - Updated `vitest.config.ts` to include `src/**/__tests__/**/*.test.ts` so authorized location is runnable.
  - Updated `docs/QA_CHECKLIST.md` with H48-H1 governance hotfix section.
  - Updated `docs/PROMPT_LOG.md` with H48-H1 governance hotfix entry.
  - No conversation mapper logic changed. No detection logic changed. No runtime integration.
- **Markers**:
  - PHASE_11D_H48_H1_AMBIGUITY_CONVERSATION_MAPPER_GOVERNANCE_HOTFIX_COMPLETE
  - QA_CHECKLIST_UPDATED_FOR_H48
  - UNAUTHORIZED_ROOT_TEST_REMOVED
  - AUTHORIZED_SRC_TEST_PRESENT
  - AMBIGUITY_CONVERSATION_TEST_COVERAGE_PRESERVED
  - NO_CONVERSATION_MAPPER_LOGIC_CHANGES
  - NO_RUNTIME_INTEGRATION
  - NO_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CHANGES
  - NO_FLOW_ADAPTER_CHANGES
  - NO_UI_CHANGES
  - NO_ROOT_TESTS_REMAINING
  - PHASE_11D_H48_READY_FOR_CLOSURE

## Fase 11D-H48-DG1 · Test Discovery Scope Decision Gate
- **Phase Status**: Completed (decision gate)
- **Problem**: H48-H2 reverted the vitest config scope expansion, leaving the authorized test at `src/.../__tests__/ambiguityConversationMapper.test.ts` undiscoverable by the runner. H48 could not close with `AMBIGUITY_CONVERSATION_TEST_PASSED = NO`.
- **Decision**: Approve minimal `vitest.config.ts` expansion to `src/features/**/__tests__/**/*.test.ts` — scoped to `src/features` only, not the entire `src/` tree. No aliases, environment, setup files, or coverage changes.
- **Changes Made**:
  - Updated `vitest.config.ts` include pattern: `'src/features/**/__tests__/**/*.test.ts'` added alongside existing `'tests/**/*.test.ts'`.
  - No product logic changes. No runtime integration. No UI changes. No test file changes.
- **Markers**:
  - PHASE_11D_H48_DG1_TEST_DISCOVERY_SCOPE_DECISION_GATE_COMPLETE
  - SRC_FEATURES_TEST_DISCOVERY_APPROVED
  - VITEST_CONFIG_SCOPE_EXPANSION_MINIMAL
  - AUTHORIZED_SRC_TEST_DISCOVERABLE
  - NO_ROOT_TESTS_CREATED
  - NO_RUNTIME_INTEGRATION
  - NO_WORKSPACE_CHANGES
  - NO_CHAT_FOUNDATION_CHANGES
  - NO_FLOW_ADAPTER_CHANGES
  - NO_UI_CHANGES
  - PHASE_11D_H48_READY_FOR_CLOSURE

## Fase 11D-H49 · Ambiguity Runtime Integration
- **Phase Status**: Completed
- **Problem**: Hardcoded survey scope selection messages in `ConversationalImportWorkspace.tsx` (`handleComposerSend`, `handleSandboxFilesSelected`) needed replacement with the ambiguity runtime chain when `MultipleSurveyScopeAmbiguity` is detected.
- **Solution**: Integrated `mapWorkspaceToAmbiguityDetectionInput` → `detectHistoricalImportAmbiguities` → `mapAmbiguityResolutionToChatMessages` → `mapChatFoundationToRuntimeMessage` chain in both file selection handlers. Filtered `thinking` kind messages from chain output to prevent double-thinking indicators. Preserved hardcoded fallback when no `MultipleSurveyScopeAmbiguity`.
- **Changes Made**:
  - `ConversationalImportWorkspace.tsx`: Added imports for ambiguity chain, added `mapChatFoundationToRuntimeMessage` helper, integrated chain in `handleComposerSend` and `handleSandboxFilesSelected`.
  - `ambiguity-resolution/index.ts`: Exported `WorkspaceAmbiguityContext` type and `mapWorkspaceToAmbiguityDetectionInput` function for H49 runtime use.
  - `ambiguityRuntimeMapper.ts`: Created with `mapWorkspaceToAmbiguityDetectionInput` mapper and `WorkspaceAmbiguityContext` type.
  - `ambiguityRuntimeMapper.test.ts`: Created with 25 tests for all mapper scenarios.
- **Markers**:
  - PHASE_11D_H49_AMBIGUITY_RUNTIME_INTEGRATION_COMPLETE
  - AMBIGUITY_RUNTIME_INTEGRATION_COMPLETE
  - AMBIGUITY_DETECTION_CONNECTED_TO_REAL_WORKSPACE
  - AMBIGUITY_CONVERSATION_MESSAGES_CONNECTED_TO_REAL_WORKSPACE
  - MULTIPLE_SURVEY_SCOPE_AMBIGUITY_VISIBLE_IN_REAL_WORKSPACE
  - TEXT_ONLY_RESOLUTION_PRESERVED
  - USER_RESPONSE_1_STILL_ADVANCES_TO_GENERAL_CONFIGURATION
  - REAL_WORKSPACE_STATE_LOGIC_PRESERVED
  - REAL_WORKSPACE_INPUT_PRESERVED
  - CHAT_FOUNDATION_RENDERER_STILL_USED
  - NO_DUPLICATE_AMBIGUITY_MESSAGES
  - MESSAGE_IDS_DETERMINISTIC
  - NO_UNSANITIZED_LABELS_VISIBLE
  - THINKING_VISIBLE_IN_REAL_WORKSPACE
  - THINKING_MESSAGES_FILTERED_WITHOUT_VISUAL_REGRESSION
  - HARDCODED_SCOPE_SELECTION_FALLBACK_ONLY_WHEN_NO_AMBIGUITY
  - NO_FULL_WORKSPACE_REWRITE
  - NO_CHAT_FOUNDATION_CORE_CHANGES
  - NO_DETECTION_MAPPER_CHANGES
  - NO_CONVERSATION_MAPPER_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_SANDBOX_IMPORT_RUNTIME
  - NO_RESULT_LINK_CREATED
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - PLAYGROUND_5174_STILL_WORKS
  - PLAYGROUND_ADAPTER_FIXTURE_STILL_VISIBLE
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H50_AMBIGUITY_VISUAL_QA_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Phase 11D-H51 · Ambiguity Runtime Stabilization
- **Phase Status**: Completed (stabilization — no code changes)
- **Problem**: Post-integration review needed to verify that the ambiguity runtime (H49) is deterministic, produces no duplicate messages, sanitizes all labels, exposes no PII/raw rows/open text/workbook dump, and preserves all workspace invariants (`awaiting_survey_scope_selection` state, Chat Foundation renderer, hardcoded fallback when no ambiguity).
- **Solution**: Performed a cross‑surface audit of the runtime integration. Confirmed that `handleComposerSend` and `handleSandboxFilesSelected` in `ConversationalImportWorkspace.tsx` use the ambiguity chain without introducing duplicates; `ambiguityRuntimeMapper.ts` is deterministic (same input → same output), pure (no input mutation, no side effects), and sanitizes‑only (no PII, raw rows, open text, or workbook dump). Ran the full QA suite — build, scoped ESLint, vitest, git whitespace check — all green. No code changes were required.
- **Markers**:
  - PHASE_11D_H51_AMBIGUITY_RUNTIME_STABILIZATION_COMPLETE
  - AMBIGUITY_RUNTIME_STABILIZATION_COMPLETE
  - RUNTIME_MAPPER_DETERMINISTIC
  - RUNTIME_MAPPER_NO_INPUT_MUTATION
  - RUNTIME_MAPPER_LABELS_SANITIZED
  - RUNTIME_MAPPER_NO_PII
  - RUNTIME_MAPPER_NO_RAW_ROWS
  - RUNTIME_MAPPER_NO_OPEN_TEXT
  - RUNTIME_MAPPER_NO_WORKBOOK_DUMP
  - NO_DUPLICATE_AMBIGUITY_MESSAGES
  - AWAITING_SURVEY_SCOPE_SELECTION_STATE_PRESERVED
  - CHAT_FOUNDATION_RENDERER_STILL_USED
  - HARDCODED_SCOPE_SELECTION_FALLBACK_PRESERVED
  - NO_CODE_CHANGES_REQUIRED
  - BUILD_PASSED
  - AMBIGUITY_RESOLUTION_SCOPED_LINT_PASSED
  - CONVERSATIONAL_IMPORT_SCOPED_LINT_PASSED
  - HISTORICAL_IMPORT_SCOPED_LINT_PASSED
  - FULL_REGRESSION_TESTS_PASSED
  - GIT_SHOW_CHECK_PASSED
  - VISIBLE_UI_CHECKPOINT_YES
  - PHASE_11D_H52_AMBIGUITY_READY
  - R1H5_DEFINED_BUT_NOT_TRIGGERED

## Phase 11D-H52 · Next Scope Decision Gate
- **Phase Status**: Completed (decision gate — no code changes)
- **Problem**: After closing H49 (Ambiguity Runtime Integration), H50 (Ambiguity Visual QA), and H51 (Ambiguity Runtime Stabilization), the team needed a structured decision on the next governed block.
- **Options Evaluated**:
  - **Option A · Ambiguity Resolution Application Architecture** — Design how a user text response resolves an active ambiguity in a typed, safe, reversible way. Architecture only.
  - **Option B · Expand Next Visible Ambiguity** — Define and expose the next ambiguity category (e.g., SurveyTypeAmbiguity) after MultipleSurveyScopeAmbiguity.
  - **Option C · Conversational Editing Hardening** — Strengthen post-hoc editing of name, type, date, visibility, or threshold via chat.
  - **Option D · Import Preparation Contract** — Move toward the final historical import preparation contract.
- **Decision**: **Select Option A** as H53.
- **Rationale**: Option A is the natural dependency for all other options. Without a typed resolution architecture, each new ambiguity (B) would require ad-hoc wiring; conversational editing (C) would lack a resolution contract; and import preparation (D) is premature without stable typed resolution and conversational review. The current flow uses hardcoded transitions (`"1" → general_configuration`) per ambiguity type — Option A formalizes this into a reusable, testable, typed contract. Architecture-only, no code changes.
- **Rejection Rationale**:
  - **Option B rejected**: Premature without a resolution architecture. Adding SurveyTypeAmbiguity now would require duplicating the hardcoded pattern from scope ambiguity.
  - **Option C rejected**: Conversational editing depends on the typed resolution contract that Option A defines. Doing C before A would result in ad-hoc editing without a stable resolution foundation.
  - **Option D rejected**: Import preparation requires closed resolution and review flows. Premature while ambiguity types are still being integrated.
- **Risks**: Over-engineering if the typed resolution contract becomes too abstract. Mitigation: scope H53 to one concrete ambiguity type (MultipleSurveyScopeAmbiguity) and derive the contract from its actual resolution pattern.
- **Non-goals**: No UI changes. No runtime changes. No new visible ambiguities. No import execution. No dashboard or comparison.
- **Files expected for H53**: New doc file `docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md`, plus markers in existing docs.
- **Visual review expected**: No (architecture-only).
- **Markers**:
  - PHASE_11D_H52_NEXT_SCOPE_DECISION_COMPLETE
  - NEXT_SCOPE_DECISION_COMPLETE
  - OPTIONS_EVALUATED_A_B_C_D
  - RECOMMENDED_NEXT_PHASE_H53_AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE
  - OPTION_A_SELECTED
  - OPTION_B_REJECTED_PREMATURE_WITHOUT_RESOLUTION_ARCHITECTURE
  - OPTION_C_REJECTED_DEPENDS_ON_RESOLUTION_CONTRACT
  - OPTION_D_REJECTED_PREMATURE_IMPORT_PREP
  - NO_CODE_CHANGES
  - NO_RUNTIME_CHANGES
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - PHASE_11D_H53_AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE_READY

## Phase 11D-H53 · Ambiguity Resolution Application Architecture
- **Phase Status**: Completed (architecture-only — no code changes)
- **Problem**: After H49 (runtime integration), H50 (visual QA), and H51 (stabilization), the ambiguity chain has detection, conversation, runtime visibility, and runtime mapping — but no typed layer that takes a user's text response and produces a validated, deterministic state patch. The current scope resolution in `ConversationalImportWorkspace.tsx` uses hardcoded keyword matching (`scope1Keywords`, `scope2Keywords`, `scope3Keywords`) for "1", "2", "3" responses. Each new ambiguity type would require duplicating this ad-hoc pattern.
- **Solution**: Designed the Ambiguity Resolution Application Architecture — a new pure, deterministic layer that receives `(activeAmbiguity, sanitizedUserText, currentStateSnapshot)` and produces an `AmbiguityResolutionApplicationResult` with 6 possible states (`applied`, `invalid_input`, `needs_clarification`, `blocked_privacy`, `out_of_scope_redirect`, `no_active_ambiguity`). Defined the input contract, output contract, privacy precedence rules, invalid input rules, and a future implementation plan (H54–H58). Documented in `docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md`.
- **Changes Made**:
  - Created `docs/AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE.md` with 11 sections covering purpose, boundary, input/output contracts, MultipleSurveyScopeAmbiguity rules, invalid input rules, privacy/security, precedence order, state/side-effects, testing strategy, and future implementation plan.
- **Markers**:
  - PHASE_11D_H53_AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE_COMPLETE
  - AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE_LOCKED
  - RESOLUTION_APPLICATION_BOUNDARY_DEFINED
  - TEXT_INPUT_TO_TYPED_RESOLUTION_CONTRACT_DEFINED
  - ACTIVE_AMBIGUITY_INPUT_CONTRACT_DEFINED
  - RESOLUTION_APPLICATION_OUTPUT_CONTRACT_DEFINED
  - MULTIPLE_SURVEY_SCOPE_RESOLUTION_RULES_DEFINED
  - INVALID_INPUT_RULES_DEFINED
  - PRIVACY_PRECEDENCE_RULES_DEFINED
  - OUT_OF_SCOPE_RULES_DEFINED
  - STATE_PATCH_CONCEPT_DEFINED
  - SIDE_EFFECTS_FORBIDDEN
  - TESTING_STRATEGY_DEFINED
  - FUTURE_IMPLEMENTATION_PLAN_DEFINED
  - NO_CODE_CHANGES
  - NO_RUNTIME_CHANGES
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - PHASE_11D_H54_READY

## Phase 11D-H54 · Resolution Application Types
- **Phase Status**: Completed (types-only — no runtime logic, no mapper, no workspace integration)
- **Problem**: The resolution application architecture (H53) defined the conceptual contracts, but no TypeScript types existed for the application layer. The workspace currently handles scope resolution via hardcoded keyword matching without a typed contract.
- **Solution**: Created `src/.../ambiguity-resolution/ambiguityResolutionApplicationTypes.ts` with 9 new contracts: `AmbiguityResolutionApplicationStatus` (6-state union), `WorkspaceResolutionSnapshot` (sanitized workspace snapshot), `AmbiguityResolutionApplicationInput` (input contract), `SurveyScopeSelectionPatch` (scope resolution patch), `AmbiguityResolutionStatePatch` (discriminated union by type), `NextWorkspaceStep` (wizard step targets), `AgentFollowUpMessageIntent` (follow-up semantics), `AmbiguityResolutionApplicationApplicationResult` (output contract), and `MultipleSurveyScopeOptionMapping` (option→scope mapping). Exported all from `index.ts`.
- **Changes Made**:
  - Created `src/features/historical-import/conversational-import/ambiguity-resolution/ambiguityResolutionApplicationTypes.ts` (181 lines, types only).
  - Updated `src/features/historical-import/conversational-import/ambiguity-resolution/index.ts` to export all new types.
- **Markers**:
  - PHASE_11D_H54_RESOLUTION_APPLICATION_TYPES_COMPLETE
  - RESOLUTION_APPLICATION_TYPES_COMPLETE
  - APPLICATION_INPUT_TYPE_DEFINED
  - APPLICATION_RESULT_TYPE_DEFINED
  - APPLICATION_STATUS_UNION_DEFINED
  - WORKSPACE_STATE_SNAPSHOT_TYPE_DEFINED
  - STATE_PATCH_CONCEPT_TYPE_DEFINED
  - NEXT_WORKSPACE_STEP_TYPE_DEFINED
  - AGENT_FOLLOW_UP_INTENT_TYPE_DEFINED
  - MULTIPLE_SURVEY_SCOPE_TYPE_SUPPORT_DEFINED
  - PRIVACY_SAFE_DETAILS_TYPE_DEFINED
  - NO_EXISTING_TYPES_DUPLICATED
  - EXPORTED_FROM_INDEX
  - NO_RUNTIME_LOGIC_CREATED
  - NO_MAPPER_LOGIC_CREATED
  - NO_WORKSPACE_INTEGRATION
  - NO_REACT_IMPORTS
  - NO_COMPONENTS_CREATED
  - NO_TESTS_CREATED
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
## Phase 11D-H55 · Resolution Application Mapper
- **Phase Status**: Completed (pure mapper + tests — no workspace/runtime/UI integration)
- **Problem**: The resolution application types (H54) defined the contracts, but no mapper existed to convert a user's text response into a typed resolution result. The workspace handles scope resolution via hardcoded keyword matching without a layered mapper.
- **Solution**: Created `mapTextToAmbiguityResolutionApplicationResult` — a pure, deterministic mapper that applies strict precedence rules: `blocked_privacy` > `out_of_scope_redirect` > `no_active_ambiguity` > applied > invalid_input. Supports `MultipleSurveyScopeAmbiguity` numeric choice parsing (1/2/3) with deterministic scope ID derivation from option labels. 27 tests cover all paths.
- **Changes Made**:
  - Created `src/.../ambiguity-resolution/ambiguityResolutionApplicationMapper.ts` (~340 lines, pure mapper + helpers).
  - Created `src/.../ambiguity-resolution/__tests__/ambiguityResolutionApplicationMapper.test.ts` (~420 lines, 27 tests).
  - Updated `src/.../ambiguity-resolution/index.ts` to export the new mapper function.
  - Updated `docs/QA_CHECKLIST.md` with H55 section.
- **Markers**:
  - PHASE_11D_H55_RESOLUTION_APPLICATION_MAPPER_COMPLETE
  - RESOLUTION_APPLICATION_MAPPER_CREATED
  - MAPPER_FUNCTION_CREATED
  - MAPPER_FUNCTION_EXPORTED
  - MULTIPLE_SURVEY_SCOPE_RESOLUTION_SUPPORTED
  - VALID_NUMERIC_INPUT_ACCEPTED
  - INVALID_INPUT_REJECTED
  - BLOCKED_PRIVACY_PRECEDENCE
  - OUT_OF_SCOPE_REDIRECT_SUPPORTED
  - NO_ACTIVE_AMBIGUITY_HANDLED
  - UNSUPPORTED_TYPES_NEED_CLARIFICATION
  - DETERMINISTIC_OUTPUT_VERIFIED
  - NO_INPUT_MUTATION
  - NO_PII_EXPOSED
  - NO_RUNTIME_INTEGRATION
  - NO_WORKSPACE_INTEGRATION
  - NO_REACT_IMPORTS
  - NO_COMPONENTS_CREATED
  - NO_TESTS_MODIFIED
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - BUILD_PASSED
  - AMBIGUITY_TESTS_PASSED
  - GIT_SHOW_CHECK_PASSED
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
## Phase 11D-H56 · Resolution Application Workspace Integration
- **Phase Status**: Completed (minimal workspace integration — mapper connected, keyword matching replaced, no full rewrite)
- **Problem**: The workspace's `awaiting_survey_scope_selection` branch used hardcoded keyword matching (`scope1Keywords`, `scope2Keywords`, `scope3Keywords`) and intent detection to interpret user text. This was untested business logic coupled directly to the workspace component.
- **Solution**: Connected `mapTextToAmbiguityResolutionApplicationResult` to the `awaiting_survey_scope_selection` branch. The workspace now stores the `activeAmbiguity` when detected (from the file upload pipeline), constructs a sanitized `AmbiguityResolutionApplicationInput`, and delegates text interpretation to the typed mapper. The mapper's result drives the transition: `applied` advances to general config, `invalid_input` keeps ambiguity active with the mapper's validation message, and all other statuses produce safe fallback messages.
- **Changes Made**:
  - Modified `src/.../ConversationalImportWorkspace.tsx`:
    - Added `setActiveAmbiguity` state to persist detected ambiguity.
    - Added `setActiveAmbiguity(ambiguity ?? null)` in both file upload paths (handleComposerSend and handleSandboxFilesSelected).
    - Added reset in `handleNewChat`.
    - Replaced keyword matching + intent detection in `awaiting_survey_scope_selection` branch with mapper call.
    - Added imports for `mapTextToAmbiguityResolutionApplicationResult` and `ActiveAmbiguity`.
  - Updated `docs/QA_CHECKLIST.md` with H56 section.
- **Markers**:
  - PHASE_11D_H56_RESOLUTION_APPLICATION_WORKSPACE_INTEGRATION_COMPLETE
  - RESOLUTION_APPLICATION_WORKSPACE_INTEGRATION_COMPLETE
  - APPLICATION_MAPPER_CONNECTED_TO_WORKSPACE
  - TEXT_INPUT_RESOLUTION_USES_APPLICATION_MAPPER
  - AWAITING_SURVEY_SCOPE_SELECTION_USES_TYPED_RESULT
  - USER_RESPONSE_1_STILL_ADVANCES_TO_GENERAL_CONFIGURATION
  - INVALID_INPUT_HANDLED_BY_TYPED_RESULT
  - NO_DUPLICATE_SCOPE_SELECTION_MESSAGES
  - TEXT_ONLY_RESOLUTION_STILL_PRESERVED
  - APPLICATION_RESULT_PATCH_APPLIED_BY_WORKSPACE_ONLY
  - CHAT_FOUNDATION_NOT_COUPLED_TO_BUSINESS_RULES
  - NO_FULL_WORKSPACE_REWRITE
  - NO_CHAT_FOUNDATION_CORE_CHANGES
  - NO_FLOW_ADAPTER_CHANGES
  - NO_DETECTION_MAPPER_CHANGES
  - NO_CONVERSATION_MAPPER_CHANGES
  - NO_RUNTIME_MAPPER_CHANGES
  - NO_APPLICATION_MAPPER_CHANGES
  - NO_APPLICATION_TYPES_CHANGES
  - NO_NEW_VISIBLE_AMBIGUITY_CATEGORY
  - NO_NEW_COMPONENTS
  - NO_NEW_ROUTES
  - NO_ACTION_BUTTONS_FOR_REVIEW
  - NO_SIDE_PANEL_EDITOR
  - NO_EXTERNAL_REVIEW_TAB
  - NO_FORM_MODE_EDITOR
  - ALL_ACTIONS_BY_CHAT_TEXT_ONLY
  - NO_PII_VISIBLE
  - NO_RAW_ROWS_VISIBLE
  - NO_OPEN_TEXT_VISIBLE
  - NO_WORKBOOK_DUMP_VISIBLE
  - NO_REAL_CLIENT_DATA
  - BUILD_PASSED
  - AMBIGUITY_TESTS_PASSED
  - FULL_REGRESSION_TESTS_PASSED
  - GIT_SHOW_CHECK_PASSED
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
## Phase 11D-H57 · Visual QA
- **Phase Status**: Completed (7/7 Playwright tests pass, no console errors, no regression)
- **Problem**: H56 introduced a visible UI change (option 3 label: "QS Clima 2024/2025 (multiciclo)"), requiring visual QA.
- **Solution**: Automated Playwright QA script tested app load, chat interaction, file detection, mapper chain, console errors, action buttons, and chat responses. All 7 tests pass.
- **Pre-existing Issue**: The SandboxUploadPanel (`msg.type === "sandbox_upload_panel"`) is never added to chat history, making the "Cargar encuesta" button unable to trigger file selection interactively. This is pre-existing and unrelated to H56 changes. File upload works via the MessageComposer attachment button instead.
- **Markers**:
  - PHASE_11D_H57_VISUAL_QA_COMPLETE
  - APP_LOADS_OK
  - CHAT_INTERACTION_WORKS
  - FILE_DETECTION_WORKS
  - MAPPER_CHAIN_AVAILABLE
  - NO_CONSOLE_ERRORS
  - NO_ACTION_BUTTONS_DURING_AMBIGUITY
  - VISIBLE_CHANGE_DOCUMENTED
  - PLAYWRIGHT_QA_PASSED_7_OF_7
  - PRE_EXISTING_UPLOAD_PANEL_BUG_DOCUMENTED
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
## Phase 11D-H58 · Stabilization — Native File Picker (hidden input)
- **Phase Status**: Completed (hidden `<input type="file">` with `useRef`, reverted `sandbox_upload_panel` approach)
- **Problem**: H57 QA discovered the "Cargar encuesta" button couldn't trigger file selection: no `input[type="file"]` existed in the DOM for the `setTimeout` click to find.
- **Root Cause**: `handleSandboxUploadStart` relied on `document.querySelector('input[type="file"]')` but no such element existed. H58 first tried showing `SandboxUploadPanel`, but the user wants a native file picker, not a visual upload component.
- **Fix**: Added a hidden `<input type="file" accept=".xlsx,.xls,.csv" multiple>` with `useRef` in the component JSX. `handleSandboxUploadStart` clicks the ref to open the native OS file picker. `handleSandboxFileChange` converts FileList to `SandboxFileMetadata[]` and calls `handleSandboxFilesSelected`.
- **Verification**: Build passes, ESLint clean, 155/155 regression tests pass. Playwright e2e confirms: click "Cargar encuesta" → "Adjunta aquí" text shown → files selected via hidden input → ambiguity detected → typing "1" advances to general config.
- **Markers**:
  - PHASE_11D_H58_STABILIZATION_COMPLETE
  - NATIVE_FILE_PICKER_VIA_HIDDEN_INPUT
  - CARGAR_ENCUESTA_BUTTON_WORKS
  - USE_REF_INPUT_FILE
  - SETTIMEOUT_CLICKS_REF
  - NO_NEW_FEATURES_INTRODUCED
  - BUILD_PASSED
  - ESLINT_PASSED
  - FULL_REGRESSION_TESTS_PASSED
  - E2E_UPLOAD_AND_TYPE_1_ADVANCES
  - GIT_SHOW_CHECK_PASSED
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
   - PHASE_11D_COMPLETE
## Phase 11D Close · Conversational Import (Ambiguity Resolution)
- **Phase Status**: Closed — report at `docs/PHASE_11D_CLOSE_REPORT.md`
- **Scope Delivered**: Full ambiguity resolution flow for MultipleSurveyScopeAmbiguity — detection, typed resolution application, workspace integration, native file picker
- **Next Scope Decision**: **Option C — Conversational Editing Hardening** selected
- **Rationale**: Strengthen post-hoc editing of survey metadata (name, type, date, visibility, threshold) via chat. Highest product visibility and user value now that the resolution architecture is in place. Prerequisite for ambiguity expansion and import preparation.
- **Prior Art**: `docs/CONTROLLED_OVERLAY_EDITING_ARCHITECTURE.md` defines overlay editing rules, permitted/prohibited actions, resolved view calculation, conflict rules, and privacy boundaries. Also see `docs/CONVERSATIONAL_IMPORT_NEXT_CAPABILITY.md`.
- **Markers**:
  - PHASE_11D_CLOSE_COMPLETE
  - PHASE_11D_CLOSE_REPORT_CREATED
  - H49_THROUGH_H58_COMPLETE
  - FULL_REGRESSION_PASSED_155
  - PLAYWRIGHT_QA_PASSED_7_OF_7
  - NATIVE_FILE_PICKER_VIA_HIDDEN_INPUT
  - NEXT_SCOPE_OPTION_C_SELECTED
  - CONVERSATIONAL_EDITING_HARDENING_NEXT
## Phase 11F-A · Question Scale Dimension Review Architecture
- **Phase Status**: Completed (architecture-only — no code changes)
- **Phase**: Phase 11F-A · Question Scale Dimension Review Architecture
- **Summary**: Designed the architecture to convert step `1/7 · Preguntas y escalas` from an aggregate summary into a conversational, chat-driven question/scale/dimension review and editing experience.
- **Key Design Decisions**:
  - The review stays entirely inside chat: NO_ACTION_BUTTONS_FOR_REVIEW, NO_SIDE_PANEL_EDITOR, NO_EXTERNAL_REVIEW_TAB, NO_FORM_MODE_EDITOR.
  - Questions are grouped progressively (by dimension, then by review status) rather than listing all 37 at once.
  - A new **Question Scale Dimension Review Layer** sits between the workspace and chat foundation.
  - Editing happens by text commands like "cambia la dimensión de la pregunta 3 a Liderazgo".
  - Privacy rules: NO_PII_VISIBLE, NO_RAW_ROWS_VISIBLE, NO_OPEN_TEXT_VISIBLE, NO_WORKBOOK_DUMP_VISIBLE, NO_REAL_CLIENT_DATA.
- **Document**: [QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE.md](./QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE.md)
- **Changes Made**: Created `docs/QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE.md` with 15 sections covering purpose, boundary, question contract, scale detail, dimensions, conversational experience, commands, editing rules, privacy rules, states, confirmation rules, mock data relationship, out-of-scope rules, testing strategy, and future implementation plan. Updated `docs/ARCHITECTURE.md`, `docs/PROMPT_LOG.md`, `docs/QA_CHECKLIST.md`.
- **Markers**:
  - PHASE_11F_A_QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE_COMPLETE
  - QUESTION_SCALE_DIMENSION_REVIEW_ARCHITECTURE_LOCKED
  - QUESTION_REVIEW_BOUNDARY_DEFINED
  - QUESTION_CONTRACT_DEFINED
  - QUESTION_TYPE_CONTRACT_DEFINED
  - SCALE_TYPE_CONTRACT_DEFINED
  - SCALE_DETAIL_CONTRACT_DEFINED
  - DIMENSION_ASSIGNMENT_CONTRACT_DEFINED
  - QUESTION_REVIEW_CONVERSATIONAL_COMMANDS_DEFINED
  - QUESTION_REVIEW_EDITING_RULES_DEFINED
  - QUESTION_REVIEW_PRIVACY_RULES_DEFINED
  - QUESTION_REVIEW_STEP_STATES_DEFINED
  - QUESTION_REVIEW_CONFIRMATION_RULES_DEFINED
  - QUESTION_REVIEW_TESTING_STRATEGY_DEFINED
  - QUESTION_REVIEW_IMPLEMENTATION_PLAN_DEFINED
  - NO_CODE_CHANGES
  - NO_RUNTIME_CHANGES
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - PHASE_11F_B_READY

## Phase 11F-B · Question Scale Dimension Mock Data Contract
- **Phase Status**: Completed
- **Phase**: Phase 11F-B · Question Scale Dimension Mock Data Contract
- **Summary**: Created the mock data contract for questions, scales, and dimensions. Built deterministic, sanitized types and data that will serve as the source for future mappers.
- **Files Created**:
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/questionScaleDimensionReviewTypes.ts` — types for QuestionReviewItem, QuestionType, ScaleType, ScaleDetail, DimensionAssignment, QuestionReviewStatus, QuestionReviewStepSummary, and ConversationalCommandSuggestion.
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/questionScaleDimensionReviewMockData.ts` — 37 sanitized questions from Clima (29), Engagement (6), eNPS (1), and open_text (1); with summary, critical issues, suggested commands.
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/index.ts` — public exports.
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/__tests__/questionScaleDimensionReviewMockData.test.ts` — 23 tests verifying contract (count, IDs, types, privacy, dimensions, summary).
- **Design Decisions**:
  - Types are pure union + interface. No functions. No runtime. No UI.
  - Mock data is deterministic: no Date, no Math.random, no side effects, no API calls.
  - 37 questions total to maintain consistency with the current 1/7 summary.
  - Covers 9 dimensions, 4 scale types (likert_5, frequency, binary_yes_no, nps_0_10, not_applicable), both rating_scale/open_text/enps question types.
  - Summary contract includes total, aligned/needs_review/new/uninterpretable counts, questionsByDimension, questionsByScaleType, criticalIssues, canConfirmSection.
  - Privacy tests confirm no PII, no raw rows, no open text answers, no workbook dump.
- **Markers**:
  - PHASE_11F_B_QUESTION_SCALE_DIMENSION_MOCK_DATA_CONTRACT_COMPLETE
  - QUESTION_SCALE_DIMENSION_MOCK_DATA_CONTRACT_COMPLETE
  - QUESTION_REVIEW_TYPES_CREATED
  - QUESTION_REVIEW_MOCK_DATA_CREATED
  - QUESTION_CONTRACT_FIELDS_DEFINED
  - QUESTION_TYPE_UNION_DEFINED
  - SCALE_TYPE_UNION_DEFINED
  - SCALE_DETAIL_CONTRACT_DEFINED
  - DIMENSION_ASSIGNMENT_CONTRACT_DEFINED
  - QUESTION_REVIEW_STATUS_DEFINED
  - QUESTION_REVIEW_SUMMARY_DEFINED
  - CONVERSATIONAL_COMMAND_SUGGESTIONS_DEFINED
  - MOCK_DATA_SANITIZED
  - NO_REAL_CLIENT_DATA
  - NO_RAW_ROWS_IN_MOCK
  - NO_OPEN_TEXT_ANSWERS_IN_MOCK
  - NO_WORKBOOK_DUMP_IN_MOCK
  - EXPORTED_FROM_INDEX
  - NO_WORKSPACE_INTEGRATION
  - NO_RUNTIME_INTEGRATION
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - PHASE_11F_C_READY

## Phase 11F-C · Question Review Mapper
- **Phase Status**: Completed
- **Phase**: Phase 11F-C · Question Review Mapper
- **Summary**: Created a pure, deterministic mapper that converts the question/scale/dimension mock data contract into structured conversational views ready for future chat responses.
- **Files Created**:
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/questionScaleDimensionReviewMapper.ts` — 6 exported pure functions: `mapQuestionReviewToConversationalOverview`, `mapQuestionReviewToDimensionGroups`, `mapQuestionReviewToNeedsReviewList`, `mapQuestionReviewToQuestionDetail`, `mapQuestionReviewToScaleDetailText`, `mapQuestionReviewToSectionConfirmationState`.
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/__tests__/questionScaleDimensionReviewMapper.test.ts` — 36 tests covering overview, dimension groups, needs review, question detail, scale detail, confirmation state, privacy, determinism, immutability, and edge cases.
- **Files Modified**:
  - `src/features/historical-import/conversational-import/question-scale-dimension-review/index.ts` — added `export * from './questionScaleDimensionReviewMapper'`.
- **Design Decisions**:
  - Functions are pure, deterministic, no Date, no Math.random, no side effects, no API calls.
  - ConversationalOverview returns structured data (not strings) so future message composition can consume it as needed.
  - QuestionDetailView includes human-readable labels (questionTypeLabel, scaleTypeLabel, statusLabel) to avoid duplication in future mappers.
  - `_questions` parameter kept in `mapQuestionReviewToConversationalOverview` for API consistency (prefixed with underscore as allowed by TS convention).
  - All 36 tests pass, all lints pass.
- **Markers**:
  - PHASE_11F_C_QUESTION_REVIEW_MAPPER_COMPLETE
  - QUESTION_REVIEW_MAPPER_COMPLETE
  - PURE_QUESTION_REVIEW_MAPPER_CREATED
  - QUESTION_REVIEW_MAPPER_EXPORTED
  - QUESTION_REVIEW_SUMMARY_MAPPED
  - QUESTION_REVIEW_DIMENSION_GROUPS_MAPPED
  - QUESTION_REVIEW_NEEDS_REVIEW_LIST_MAPPED
  - QUESTION_REVIEW_DETAIL_MAPPED
  - LIKERT_SCALE_DETAIL_MAPPED
  - NPS_SCALE_DETAIL_MAPPED
  - SECTION_CONFIRMATION_STATE_MAPPED
  - CONVERSATIONAL_COMMAND_SUGGESTIONS_MAPPED
  - NO_ACTION_PAYLOADS_CREATED
  - DETERMINISTIC_OUTPUT
  - INPUT_NOT_MUTATED
  - PRIVACY_SAFE_OUTPUT
  - QUESTION_REVIEW_MAPPER_TESTS_CREATED
  - QUESTION_REVIEW_MAPPER_TESTS_PASSED
  - NO_WORKSPACE_INTEGRATION
  - NO_RUNTIME_INTEGRATION
  - NO_UI_CHANGES
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - PHASE_11F_D_READY

## Phase 11E-H1 · Chat Foundation Thinking Continuity Hotfix
- **Phase Status**: Completed
- **Problem**: After "Configuración general confirmada" → "Ahora revisaré el match detectado de la estructura.", the chat showed no thinking indicator between the end of one `simulateChatFlow` batch and the start of the next chained batch (via `.then()` → `setTimeout`). The conversation appeared stuck even though the flow was about to continue.
- **Diagnosis**:
  - Root cause: `simulateChatFlow` managed thinking only WITHIN its own batch of messages (adding a "Pensando..." `analysis_progress` message per assistant message in the batch).
  - Between chained `simulateChatFlow` calls (e.g., `.then(() => { setTimeout(() => { simulateChatFlow(nextBatch); }, 1500); })`), there was no thinking signal.
  - The gap occurred at ~`ConversationalImportWorkspace.tsx:636-646` where `msg_assistant_summary` + `msg_assistant_review` were sent in one batch, then 1500ms later the next batch started with `msg_assistant_qs`.
  - Two additional chained sites had the same gap: `handleSandboxFilesSelected` → `handleLocalAnalysisStart` (500ms gap).
- **Solution**:
  1. Added `isProcessingNextStep` state to the workspace — tracks whether the agent has pending responses.
  2. Modified `simulateChatFlow` to accept `{ keepThinkingAfter?: boolean }` option — when true, keeps `isProcessingNextStep` true after the batch finishes.
  3. Updated 3 chained call sites to use `keepThinkingAfter: true` on the first call in the chain.
  4. Added `finally { setIsProcessingNextStep(false); }` to `handleLocalAnalysisStart`.
  5. In the Chat Foundation render section, when `isProcessingNextStep` is true and the last message is not already an `analysis_progress` type, renders a `ChatFoundationMessage` with `kind: "thinking"` → `AILoader` "Pensando..." via `ChatFoundationMessageRenderer`.
  6. Thinking comes from the master Chat Foundation component (`ChatFoundationMessageBubble`), not from hardcoded workspace text or timeout hacks.
- **Verification**: Build passes, ESLint clean, 155/155 regression tests pass.
- **Markers**:
  - PHASE_11E_H1_CHAT_FOUNDATION_THINKING_CONTINUITY_HOTFIX_COMPLETE
  - CHAT_FOUNDATION_THINKING_CONTINUITY_HOTFIX_COMPLETE
  - THINKING_STATE_SOURCE_IDENTIFIED
  - THINKING_STATE_SOURCE = simulateChatFlow batch gaps (no cross-batch thinking signal)
  - THINKING_RENDERED_FROM_MASTER_COMPONENT
  - NO_FAKE_AGENT_TEXT_USED_FOR_THINKING
  - NO_TIMEOUT_HACKS
  - CHAT_FOUNDATION_STYLE_PRESERVED
  - NO_IMPORT_EXECUTION
  - NO_DASHBOARD_OR_COMPARISON_CHANGES
  - READY_FOR_COMPARISON_OUTPUT_DISABLED
  - 5173_THINKING_VISIBLE_AFTER_GENERAL_CONFIG_CONFIRMATION
  - 5173_NEXT_AGENT_STEP_NO_LONGER_LOOKS_STUCK
  - 5173_CHAT_STILL_WORKS
  - 5173_INPUT_1_STILL_ADVANCES
  - 5173_INVALID_INPUT_STILL_REPROMPTS
  - PHASE_11E_H2_VISUAL_QA_READY

## Phase 11F-D Markers

PHASE_11F_D_CONVERSATIONAL_QUESTION_REVIEW_MESSAGE_MAPPER_COMPLETE
QUESTION_REVIEW_MESSAGE_MAPPER_COMPLETE
PURE_MESSAGE_MAPPER_CREATED
QUESTION_REVIEW_MESSAGE_MAPPER_EXPORTED
OVERVIEW_CONVERSATION_MAPPED
DIMENSION_GROUP_CONVERSATION_MAPPED
NEEDS_REVIEW_CONVERSATION_MAPPED
QUESTION_DETAIL_CONVERSATION_MAPPED
CONFIRMATION_STATE_CONVERSATION_MAPPED
LIKERT_LABELS_MAPPED
NPS_LABELS_MAPPED
SCALE_DETAIL_TEXT_MAPPED
CONVERSATIONAL_TEXT_COMMANDS_MAPPED
NO_ACTION_PAYLOADS_CREATED
NO_BUTTONS_CREATED
DETERMINISTIC_OUTPUT
INPUT_NOT_MUTATED
PRIVACY_SAFE_OUTPUT
QUESTION_REVIEW_MESSAGE_MAPPER_TESTS_CREATED
QUESTION_REVIEW_MESSAGE_MAPPER_TESTS_PASSED
NO_WORKSPACE_INTEGRATION
NO_RUNTIME_INTEGRATION
NO_UI_CHANGES
NO_IMPORT_EXECUTION
NO_DASHBOARD_OR_COMPARISON_CHANGES
READY_FOR_COMPARISON_OUTPUT_DISABLED
PHASE_11F_E_READY


## Phase 11F-D-H1 Markers

QUESTION_REVIEW_MESSAGE_MAPPER_TEST_GOVERNANCE_FIXED
TEST_MOVED_TO_AUTHORIZED_TESTS_FOLDER
UNAUTHORIZED_TESTS_FOLDER_REMOVED
QUESTION_SCALE_DIMENSION_REVIEW_TYPES_MODIFICATION_JUSTIFIED


## Phase 11F-E Markers
- PHASE_11F_E_CONVERSATIONAL_QUESTION_EDITING_MAPPER_COMPLETE
- QUESTION_REVIEW_EDITING_MAPPER_COMPLETE
- PURE_EDITING_MAPPER_CREATED
- QUESTION_REVIEW_EDITING_MAPPER_EXPORTED
- VIEW_OVERVIEW_INTENT_SUPPORTED
- VIEW_BY_DIMENSION_INTENT_SUPPORTED
- VIEW_NEEDS_REVIEW_INTENT_SUPPORTED
- VIEW_QUESTION_DETAIL_INTENT_SUPPORTED
- CHANGE_DIMENSION_INTENT_SUPPORTED
- CHANGE_QUESTION_TYPE_INTENT_SUPPORTED
- CHANGE_SCALE_TYPE_INTENT_SUPPORTED
- CONFIRM_QUESTION_INTENT_SUPPORTED
- CONFIRM_SECTION_INTENT_SUPPORTED
- INVALID_INPUT_INTENT_SUPPORTED
- AMBIGUOUS_INPUT_INTENT_SUPPORTED
- TEXT_NORMALIZATION_SUPPORTED
- NO_STATE_CHANGES_APPLIED
- NO_ACTION_PAYLOADS_CREATED
- NO_BUTTONS_CREATED
- DETERMINISTIC_OUTPUT
- INPUT_NOT_MUTATED
- PRIVACY_SAFE_OUTPUT
- QUESTION_REVIEW_EDITING_MAPPER_TESTS_CREATED
- QUESTION_REVIEW_EDITING_MAPPER_TESTS_PASSED
- NO_WORKSPACE_INTEGRATION
- NO_RUNTIME_INTEGRATION
- NO_UI_CHANGES
- NO_IMPORT_EXECUTION
- NO_DASHBOARD_OR_COMPARISON_CHANGES
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- PHASE_11F_F_READY

## Phase 11F-E-H2 Markers
- PHASE_11F_E_H2_TEST_FOLDER_GOVERNANCE_FIXED

## Phase 11F-F Markers
- PHASE_11F_F_QUESTION_REVIEW_WORKSPACE_INTEGRATION_COMPLETE
- QUESTION_REVIEW_WORKSPACE_INTEGRATION_COMPLETE
- QUESTION_REVIEW_VISIBLE_IN_STEP_1
- STEP_1_SHOWS_QUESTION_REVIEW_OVERVIEW
- STEP_1_SHOWS_TOTAL_QUESTIONS
- STEP_1_SHOWS_DIMENSION_GROUPS
- STEP_1_SHOWS_SCALE_TYPES
- STEP_1_SHOWS_NEEDS_REVIEW_SUMMARY
- STEP_1_SHOWS_TEXT_COMMAND_SUGGESTIONS
- VIEW_OVERVIEW_COMMAND_WORKS
- VIEW_BY_DIMENSION_COMMAND_WORKS
- VIEW_NEEDS_REVIEW_COMMAND_WORKS
- VIEW_QUESTION_DETAIL_COMMAND_WORKS
- CHANGE_DIMENSION_COMMAND_WORKS_IN_LOCAL_STATE
- CHANGE_QUESTION_TYPE_COMMAND_WORKS_IN_LOCAL_STATE
- CHANGE_SCALE_TYPE_COMMAND_WORKS_IN_LOCAL_STATE
- CONFIRM_QUESTION_COMMAND_WORKS_IN_LOCAL_STATE
- CONFIRM_SECTION_COMMAND_HANDLED
- AMBIGUOUS_INPUT_HANDLED
- INVALID_INPUT_HANDLED
- LOCAL_SANITIZED_MOCK_STATE_ONLY
- ALL_ACTIONS_BY_CHAT_TEXT_ONLY
- NO_ACTION_BUTTONS_FOR_REVIEW
- NO_SIDE_PANEL_EDITOR
- NO_EXTERNAL_REVIEW_TAB
- NO_FORM_MODE_EDITOR
- VISIBLE_UI_CHANGE_INTRODUCED
- PHASE_11F_G_VISUAL_QA_READY

## Phase 11F-F-H1 Markers
- HOTFIX_11F_F_H1_COMPLETE
- NUMBERED_ALIAS_COMMANDS_1_2_3_MAPPED
- VIEW_ALL_QUESTIONS_IN_BLOCKS_SUPPORTED
- OUT_OF_RANGE_NUMBER_HANDLED_WITH_CLARIFICATION
- TITLE_MARKDOWN_DOUBLE_ASTERISKS_REMOVED
- CONTEXTUAL_STAGE_PLACEHOLDER_SUPPORTED
- SCOPED_LINT_CHECKS_PASSED
- FULL_REGRESSION_TESTS_PASSED

## Phase 11F-F-H2 Markers
- SURVEY_SELECTION_MESSAGES_CONSOLIDATED
- SURVEY_SELECTION_SINGLE_ASSISTANT_BUBBLE
- SURVEY_SELECTION_OPTIONS_VISIBLE
- SURVEY_SELECTION_INSTRUCTION_VISIBLE
- SURVEY_SELECTION_EXPECTED_RESPONSE_EXTRA_MESSAGE_REMOVED
- OPTION_1_SURVEY_SELECTION_WORKS
- OPTION_2_SURVEY_SELECTION_WORKS
- OPTION_3_SURVEY_SELECTION_WORKS
- INVALID_SURVEY_SELECTION_HANDLED_WITH_SINGLE_MESSAGE
- QUESTION_REVIEW_NUMBERED_COMMANDS_STILL_WORK
- QUESTION_REVIEW_PLACEHOLDER_STILL_CONTEXTUAL
- QUESTION_REVIEW_TITLE_STILL_CLEAN
- NO_ACTION_BUTTONS_CREATED
- NO_SIDE_PANEL_EDITOR
- NO_EXTERNAL_REVIEW_TAB
- NO_FORM_MODE_EDITOR
- NO_CHAT_FOUNDATION_CHANGES
- NO_FLOW_ADAPTER_CHANGES
- NO_AMBIGUITY_RESOLUTION_CHANGES
- NO_REAL_IMPORT_EXECUTION
- NO_API_CALLS
- NO_STORAGE_PERSISTENCE
- NO_REAL_CLIENT_DATA
- VISIBLE_UI_CHANGE_INTRODUCED
- OWNER_VISUAL_REVIEW_REQUIRED
