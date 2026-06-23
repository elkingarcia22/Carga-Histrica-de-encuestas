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

- [Conversational Import Mock Contract](./CONVERSATIONAL_IMPORT_MOCK_CONTRACT.md) - Definición del contrato sintético para el Workspace Conversacional.
- [Conversational Import Closure](./CONVERSATIONAL_IMPORT_CLOSURE.md) - Cierre formal de la experiencia conversacional como primera pantalla.
- [Conversational Import Next Capability](./CONVERSATIONAL_IMPORT_NEXT_CAPABILITY.md) - Definición de la siguiente capacidad del workspace conversacional.
- [Inline Structure Review Architecture](./INLINE_STRUCTURE_REVIEW_ARCHITECTURE.md) - Definición de arquitectura para la revisión de estructura inline.
- [Synthetic File Mount Flow Architecture](./SYNTHETIC_FILE_MOUNT_FLOW_ARCHITECTURE.md) - Definición del flujo de montaje sintético de archivos en el chat.

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
