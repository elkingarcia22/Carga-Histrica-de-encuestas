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
