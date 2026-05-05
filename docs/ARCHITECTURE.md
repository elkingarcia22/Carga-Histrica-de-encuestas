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
│  └─ survey-analytics/# [7D.5] DeltaPill, InlineLegend, MetricComparisonFooter, ResponseStackedBar, ResponseStackedBarGroup, TrendMetricLineChart, SurveyMetricCard, FavorabilityDistributionCard, ParticipationTrendCard (Survey Analytics Suite)
├─ examples/
│  └─ forms/           # Ejemplos de integración técnica
├─ styles/
│  ├─ tokens.css       # Variables de diseño (UBITS + shadcn)
│  └─ globals.css      # Directivas de Tailwind y estilos base
├─ lib/
│  └─ utils.ts         # Funciones de utilidad (cn, etc.)
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
