# QA Checklist - plantilla-proyectos-shadcn

## Fase 7B: Componentes Base Enterprise (Completada)
- [x] Checkbox, Radio, Switch instalados y funcionales.
- [x] ModalShell, DrawerShell, ConfirmDialog wrappers creados.
- [x] Feedback: Alert, Skeleton, Progress adaptados.
- [x] Sonner / UbitsToaster integrado.
- [x] Identity: Avatar, PaginationShell creados.
- [x] Utility: Accordion, Tag, Headers creados.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

## Fase 7C: Charts Suite (Completada)
- [x] ECharts base infrastructure (wrapper, types, theme).
- [x] ChartShell y ChartCard containers.
- [x] Presets: BarChart, LineChart, AreaChart, DonutChart, SparklineChart.
- [x] KpiCard con soporte para sparklines.
- [x] HeatmapChart especializado.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

## Fase 7D: Componentes Avanzados (En curso)

### Fase 7D.1: Date & Range Inputs (Completada)
- [x] Calendar, DatePicker, DateRangePicker.
- [x] Slider y RangeSlider (wrapper).
- [x] MonthPicker, QuarterSelector, PeriodSelector.
- [x] DateFilterBar (composed).
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7D.2: Upload & Files Suite (Completada)
- [x] FileUpload y UploadZone (infraestructura base).
- [x] FilePreview y AttachmentList (visualización metadata).
- [x] UploadProgress e ImportCsvPanel (data import).
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7D.3: Visual Selection (Completada)
- [x] CardSelection, RadioCardGroup.
- [x] SelectableCard, OptionTile, CheckboxCardGroup.
- [x] SegmentedControl.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7D.4: Carousel & Media (En curso)
#### Fase 7D.4A: Carousel Base (Completada)
- [x] `Carousel.tsx` instalado desde shadcn/ui.
- [x] `UbitsCarousel.tsx` implementado como wrapper enterprise.
- [x] Contenido inyectado por `children`.
- [x] Soporte para controles `prev/next` y `dots`.
- [x] Integración con `SectionHeader`.
- [x] No hay autoplay por defecto.
- [x] Accesibilidad: roles de carrusel y navegación por teclado.
- [x] No hay datos de negocio hardcodeados.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

#### Fase 7D.4B: Gallery & ImageGrid (Completada)
- [x] `ImageGrid.tsx` implementado con variantes cards/compact/bento.
- [x] `Gallery.tsx` implementado con soporte para header y estado vacío.
- [x] Items inyectados por `props` (no hardcodeados).
- [x] Soporte para selección de items (`selectable`, `selectedIds`).
- [x] Placeholders de imagen mediante iconos sobrios.
- [x] No hay preview modal ni modales de imagen.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

#### Hotfix 7D.4B.1: Enterprise Style Refinement (Completada)
- [x] Eliminados gradientes decorativos (`bg-gradient`).
- [x] Eliminado glassmorphism (`backdrop-blur`).
- [x] Eliminadas animaciones de escala agresivas.
- [x] Reemplazadas superficies por tokens sobrios (`bg-card/95`, `bg-primary`).
- [x] Validado estilo sobrio B2B.
- [x] Build exitoso.

### Fase 7D.4C: Media Previews (Completada)
- [x] `PreviewCard.tsx` implementado con metadata y acciones.
- [x] `MediaPreview.tsx` implementado como visor flexible inline.
- [x] `EmptyGalleryState.tsx` especializado para colecciones media.
- [x] Items inyectados por `props`.
- [x] `Gallery.tsx` actualizado para usar `EmptyGalleryState` por defecto.
- [x] No hay Lightbox real ni modales de imagen.
- [x] No hay FileReader ni carga real de archivos.
- [x] No hay datos de negocio.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7D.5: Survey Analytics Suite (Completada)
#### Fase 7D.5A: Survey Analytics Foundations (Completada)
- [x] `DeltaPill.tsx` implementado con soporte para tonos semánticos.
- [x] `InlineLegend.tsx` implementado con orientación horizontal/vertical.
- [x] `MetricComparisonFooter.tsx` implementado con grid responsivo.
- [x] Tipos base en `surveyAnalyticsTypes.ts`.
- [x] Datos inyectados por `props` (no hardcodeados).
- [x] No se crearon charts ni dashboards complejos.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

#### Hotfix 7D.5A.1: Semantic Color Mapping (Completada)
- [x] Corregido uso de `error` por `destructive` (token oficial).
- [x] Validada visibilidad de métricas negativas (rojo) en DeltaPill e InlineLegend.

#### Fase 7D.5B: Response Distribution (Completada)
- [x] `ResponseStackedBar.tsx` implementado con HTML/CSS nativo.
- [x] `ResponseStackedBarGroup.tsx` implementado con soporte para leyendas compartidas.
- [x] Tipos extendidos en `surveyAnalyticsTypes.ts`.
- [x] Cálculo automático de porcentajes basado en `total` o suma de valores.
- [x] No se utiliza ECharts ni Canvas para estas barras.
- [x] Soporte para tonos semánticos UBITS.
- [x] Tooltips enriquecidos (estilo ECharts) en cada segmento.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

#### Fase 7D.5D: Survey Metric Cards (Completada)
- [x] `SurveyMetricCard.tsx` implementado (composición de DeltaPill + MetricComparisonFooter).
- [x] `FavorabilityDistributionCard.tsx` implementado (composición de ResponseStackedBar).
- [x] `ParticipationTrendCard.tsx` implementado (composición de TrendMetricLineChart + KPI style).
- [x] Todos los datos inyectados por `props` (no hardcodeados).
- [x] Soportan estados `loading`, `empty` (vía `segments.length === 0`) y `error`.
- [x] No hay dashboards ni pantallas reales.
- [x] Hallazgo `showComparison` en `TrendMetricLineChart` corregido (visualización activada con líneas punteadas).
- [x] Hallazgo `text-white` en `ResponseStackedBar` corregido (reemplazado por `text-primary-foreground`).
- [x] Hallazgo deuda técnica `any[]` en `TrendMetricLineChart` corregido (tipado estricto implementado).
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7D.6: QA Integral Advanced Components (Completada)
#### Fase 7D.6 Audit (Completada)
- [x] npm run build exitoso.
- [x] TypeScript 0 errores.
- [x] 0 HEX en archivos `.tsx`.
- [x] 0 instancias de `any` / `any[]`.
- [x] 0 instancias de `as any`.
- [x] 0 `text-white` en componentes avanzados.
- [x] 0 `bg-error` / `text-error` / `border-error`.
- [x] 0 gradientes decorativos.
- [x] 0 glassmorphism / `backdrop-blur` decorativos.
- [x] `package.json` limpio, sin dependencias inesperadas.
- [x] Sin dashboards ni pantallas reales.
- [x] Sin APIs ni fetchers.
- [x] Sin datos de negocio reales.
- [x] App.tsx permanece como playground técnico.
- [x] Todas las documentaciones sincronizadas.

#### Hotfix 7D.6.1: CSS Design Token Compliance (Completada)
- [x] Reemplazado `text-white` con `text-primary-foreground` en `PreviewCard.tsx` L64.
- [x] Reemplazado `text-white` con `text-primary-foreground` en `ImageGrid.tsx` L120.
- [x] Removido `backdrop-blur-[2px]` de `ResponseStackedBar.tsx` L96.
- [x] npm run build exitoso post-hotfix.
- [x] TypeScript 0 errores post-hotfix.
- [x] Verificado: 0 `text-white` en media y survey-analytics.
- [x] Verificado: 0 `backdrop-blur` en survey-analytics.
- [x] Contraste visual preservado en light/dark mode.
- [x] Estados de selección preservados.
- [x] Comportamiento de tooltips preservado.
