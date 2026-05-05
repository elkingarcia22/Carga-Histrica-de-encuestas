# Migration Map (David -> Starter Kit)

| Componente | David (Legacy) | Estado | Estrategia / Archivo |
|---|---|---|---|
| **Button** | `Button` | ✅ Listo | `src/components/ui/button.tsx` |
| **Input** | `Input` | ✅ Listo | `src/components/ui/input.tsx` |
| **Badge** | `Badge` | ✅ Listo | `src/components/ui/badge.tsx` |
| **Dropdown** | `Dropdown` | ✅ Listo | `src/components/ui/dropdown-menu.tsx` |
| **Tooltip** | `Tooltip` | ✅ Listo | `src/components/ui/tooltip.tsx` |
| **Checkbox** | `Checkbox` | ✅ Listo | `src/components/ui/checkbox.tsx` |
| **Radio** | `Radio` | ✅ Listo | `src/components/ui/radio-group.tsx` |
| **Switch** | `Switch` | ✅ Listo | `src/components/ui/switch.tsx` |
| **Modal / Dialog** | `ModalShell` (Dialog) | ✅ Listo | Wrapper UBITS sobre Dialog. |
| **Drawer / Sheet** | `DrawerShell` (Sheet) | ✅ Listo | Wrapper UBITS sobre Sheet. |
| **Confirm / AlertDialog** | `ConfirmDialog` | ✅ Listo | Wrapper UBITS sobre AlertDialog. |
| **Alert** | `Alert` | ✅ Listo | `src/components/ui/alert.tsx` |
| **Skeleton** | `Skeleton` | ✅ Listo | `src/components/ui/skeleton.tsx` |
| **Progress** | `Progress` | ✅ Listo | `src/components/ui/progress.tsx` |
| **Avatar** | `Avatar` | ✅ Listo | `src/components/ui/avatar.tsx` |
| **Pagination** | `Pagination` | ✅ Listo | `src/components/navigation/PaginationShell.tsx` |
| **Accordion** | `Accordion` | ✅ Listo | `src/components/ui/accordion.tsx` |
| **Tag** | `Tag` | ✅ Listo | `src/components/utility/Tag.tsx` |
| **PageHeader** | `PageHeader` | ✅ Listo | `src/components/utility/PageHeader.tsx` |
| **EChart (Base)** | `ECharts` | ✅ Listo | `src/components/charts/EChart.tsx` |
| **ChartShell** | N/A | ✅ Listo | `src/components/charts/ChartShell.tsx` (Contenedor estado) |
| **ChartCard** | N/A | ✅ Listo | `src/components/charts/ChartCard.tsx` (Contenedor visual) |
| **BarChart** | N/A | ⏳ Impl. QA | `src/components/charts/BarChart.tsx` (Preset UBITS) |
| **LineChart** | N/A | ⏳ Impl. QA | `src/components/charts/LineChart.tsx` (Preset UBITS) |
| **AreaChart** | N/A | ✅ Listo | `src/components/charts/AreaChart.tsx` (Preset UBITS) |
| **DonutChart** | N/A | ✅ Listo | `src/components/charts/DonutChart.tsx` (Preset UBITS) |
| **SparklineChart** | N/A | ✅ Listo | `src/components/charts/SparklineChart.tsx` (Preset UBITS) |
| **KpiCard** | N/A | ✅ Listo | `src/components/charts/KpiCard.tsx` (Preset UBITS) |
| **HeatmapChart** | N/A | ✅ Listo | `src/components/charts/HeatmapChart.tsx` (Preset UBITS) |
| **Calendar** | N/A | ✅ 7D.1A | `src/components/ui/calendar.tsx` (shadcn base) |
| **DatePicker** | N/A | ✅ 7D.1A | `src/components/date/DatePicker.tsx` (Wrapper UBITS) |
| **DateRangePicker** | N/A | ✅ 7D.1A | `src/components/date/DateRangePicker.tsx` (Wrapper UBITS) |
| **Slider** | `Slider` | ✅ 7D.1B | `src/components/ui/slider.tsx` |
| **RangeSlider** | `RangeSlider` | ✅ 7D.1B | `src/components/range/RangeSlider.tsx` |

## Fase 7D: Componentes Avanzados

| Componente | Estado | Fase | Archivos |
|---|---|---|---|
| **MonthPicker, QuarterSelector, PeriodSelector, DateFilterBar** | ✅ 7D.1C | 7D.1 | `src/components/date/` |
| **Slider, RangeSlider, ThresholdSlider, PercentageSlider** | En curso (7D.1B) | 7D.1 | `src/components/ui/`, `src/components/range/` |
| **FileUpload, UploadZone** | ✅ 7D.2A | 7D.2 | `src/components/upload/` |
| **FilePreview, AttachmentList** | ✅ 7D.2B | 7D.2 | `src/components/upload/` |
| **ImportCsvPanel, UploadProgress** | ✅ 7D.2C | 7D.2 | `src/components/upload/` |
| **CardSelection, RadioCardGroup** | ✅ 7D.3A | 7D.3 | `src/components/selection/` |
| **CheckboxCardGroup, SelectableCard, OptionTile** | ✅ 7D.3B | 7D.3 | `src/components/selection/` |
| **SegmentedControl** | ✅ 7D.3C | 7D.3 | `src/components/selection/` |
| **Carousel (Base + UbitsWrapper)** | ✅ 7D.4A | 7D.4 | `src/components/media/` |
| **Gallery, ImageGrid** | ✅ 7D.4B | 7D.4 | `src/components/media/` |
| **PreviewCard, MediaPreview, EmptyGalleryState** | ✅ 7D.4C | 7D.4 | `src/components/media/` |
| **DeltaPill, InlineLegend, MetricComparisonFooter** | ✅ 7D.5A | 7D.5 | `src/components/survey-analytics/` |
| **ResponseStackedBar, ResponseStackedBarGroup** | ✅ 7D.5B | 7D.5 | `src/components/survey-analytics/` |
| **TrendMetricLineChart** | ✅ 7D.5C | 7D.5 | `src/components/survey-analytics/` |
| **SurveyMetricCard, ParticipationTrendCard, FavorabilityDistributionCard** | ✅ 7D.5D | 7D.5 | `src/components/survey-analytics/` |

**Ver:** `docs/ADVANCED_COMPONENT_DECISION_MATRIX.md` para matriz completa (29 componentes, clasificación, prioridades, dependencias).

## Fase 8: Gobernanza & Arquitectura

### Fase 8.0: Starter Kit Readiness (✅ 2026-05-05)
- **Status:** Documentación de gobernanza completada
- **Documentos:** STARTER_KIT_READINESS.md, DASHBOARD_ARCHITECTURE.md, MOCK_DATA_STRATEGY.md, SCREEN_BUILD_RULES.md, PHASE_8_ROADMAP.md

### Fase 8.2: Dashboard Shell Patterns (✅ 2026-05-05)
- **Status:** Arquitectura de patrones completada (documentación pura, cero UI)
- **Nuevos Documentos:**
  - `DASHBOARD_SHELL_PATTERNS.md` - Estructura de dashboards, layout responsivo, temas, accesibilidad
  - `DASHBOARD_LAYOUT_RECIPES.md` - 7 plantillas reutilizables (KPI, Two-Column, Full-Width+Panel, Survey Analytics, Bento, Table+Filters, Gallery)
  - `DASHBOARD_STATE_PATTERNS.md` - 7 patrones de estado con transiciones y accesibilidad
  - `DASHBOARD_QA_RULES.md` - Marco QA multi-tier (14 categorías, blocking criteria para Phase 8.3)
- **Prerequisitos para Phase 8.3:** Seleccionar first dashboard, completar intake, mapear componentes, QA review

### Fase 8.3: Components Decision Gate (✅ 2026-05-05)
- **Status:** Survey Analytics Dashboard governance complete
- **Documentos Creados:**
  - `ANTIGRAVITY.md` - Marco de gobernanza con 10 restricciones obligatorias
  - `FIRST_SCREEN_INTAKE.md` - Intake document con requisitos, componentes, datos, accesibilidad
  - `FIRST_SCREEN_COMPONENT_DECISION_GATE.md` - Verificación 12/12 componentes aprobados
  - `FIRST_SCREEN_COMPONENT_MAP.md` - Mapeo de secciones a componentes con responsive layout
  - `FIRST_SCREEN_MOCK_DATA_MAP.md` - Mapeo de mock data layer a componentes
  - `FIRST_SCREEN_QA_PLAN.md` - Plan QA con 9 tiers y 40+ escenarios
  - `FIRST_SCREEN_BUILD_PROMPT.md` - Prompt autorización Phase 8.4
- **Result:** Listo para Phase 8.4 build, zero blockers, governance locked

### Fase 8.4: First Screen Build (⏳ Ready - Next Phase)
- **Criterios:** <300 líneas dashboard, <200 líneas per section, mock layer connection, URL state, loading/empty/error states, responsive (375/768/1440), dark mode, WCAG AA, 80%+ tests

## Consideraciones Críticas
1. **0 HEX en TSX**: Todos los componentes deben usar variables CSS de Tailwind.
2. **Consistencia Visual**: Respetar los tokens definidos en `tokens.css`.
3. **Puntualidad**: Migrar solo lo necesario para desbloquear pantallas.
4. **Fase 7D**: 29 componentes avanzados documentados, bloqueados hasta completar Fase 7C (charts).
