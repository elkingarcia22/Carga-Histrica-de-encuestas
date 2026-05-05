# QA Checklist - plantilla-proyectos-shadcn

## Fase 7B.2: Overlays & Context (Completada)
- [x] `TooltipProvider` montado en la raíz.
- [x] Estilos base de `Tooltip` adaptados.
- [x] Verificación de 0 HEX en archivos TSX.

## Fase 7B.3: Binary Form Controls (Completada)
- [x] `checkbox` instalado y funcional.
- [x] `radio-group` instalado y funcional.
- [x] `switch` instalado y funcional.
- [x] Compatible con `Field` y `FormSection`.
- [x] Demos integradas en `App.tsx`.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.
- [x] No se instaló `slider`.
- [x] No se instaló `calendar` ni `date-picker`.
- [x] Light/dark validado.

## Fase 7B.4: Shell Overlays (Completada)
### Fase 7B.4.1: ModalShell (Dialog)
- [x] `ModalShell` implementado como wrapper estructurado.
- [x] Utiliza el componente `Dialog` de shadcn existente.
- [x] Soporta slots de `title`, `description`, `footer` y `actions`.
- [x] Implementa tamaños enterprise: `sm`, `md`, `lg`, `xl`.
- [x] Soporta modo controlado (`open`, `onOpenChange`).
- [x] Demos integradas en `App.tsx`.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.

### Fase 7B.4.2: DrawerShell (Sheet)
- [x] `sheet` instalado vía shadcn.
- [x] `DrawerShell` implementado como wrapper estructurado.
- [x] Soporta slots de `title`, `description`, `footer` y `actions`.
- [x] Implementa tamaños enterprise (`sm`, `md`, `lg`, `xl`).
- [x] Soporta múltiples posiciones (`side`: right, left, top, bottom).
- [x] Demos integradas en `App.tsx`.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.

### Fase 7B.4.3: ConfirmDialog (AlertDialog)
- [x] `alert-dialog` instalado vía shadcn.
- [x] `ConfirmDialog` implementado como wrapper estructurado.
- [x] Soporta `title` y `description`.
- [x] Implementa variantes `default`, `warning` y `destructive`.
- [x] Soporta estados `loading` y `disabled`.
- [x] Demos integradas en `App.tsx`.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.

## Fase 7B.5: Feedback & Status (Completada)
### Fase 7B.5.1: Feedback base (Alert, Skeleton, Progress)
- [x] Alert: Variantes semánticas (info, warning, success, destructive) adaptadas a UBITS.
- [x] Skeleton: Animación de pulso suave y variantes de forma.
- [x] Progress: Barra lineal con color primario UBITS.
- [x] Patrón "Cierre manual tras éxito" documentado en `ConfirmDialog.tsx`.
- [x] Demos en `App.tsx`.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.

### Fase 7B.5.2: Sonner / Toasts
- [x] Sonner: Instalado y adaptado para evitar `next-themes`.
- [x] UbitsToaster: Wrapper que sincroniza tema mediante MutationObserver.
- [x] Playground: Demos técnicas de todos los tipos de toast (success, error, warning, info, promise).

## Fase 7B.6: Identity & Navigation Extra
### Fase 7B.6.1: Identity (Avatar, Pagination)
- [x] Avatar: Instalado con soporte para fallbacks e imágenes.
- [x] PaginationShell: Wrapper funcional con resumen de resultados y cambio de página.
- [x] No auth / No rutas protegidas.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.

### Fase 7B.6.2: Utility UI opcional (Accordion, Tags, Headers)
- [x] Accordion: Instalado y funcional.
- [x] Tag: Creado con soporte para tonos y remoción (aria-label).
- [x] Headers: PageHeader y SectionHeader funcionales con slots de acción.
- [x] No hay valores HEX en archivos TSX.
- [x] Build exitoso.

## Fase 7C: Charts / ECharts strategy
### Fase 7C.1: Estrategia técnica y visual
- [x] Documento `CHARTS_STRATEGY.md` creado con principios UBITS.
- [x] Documento `ECHARTS_DECISION_RECORD.md` creado con comparativa técnica.
- [x] Documento `CHART_COMPONENT_ROADMAP.md` creado con fases granulares.
- [x] Decisión técnica: `echarts` directo + wrapper propio.
- [x] No se instalaron dependencias todavía.
- [x] No se modificó `src/` ni se crearon charts.
- [x] No se crearon pantallas ni dashboards.
- [x] Build exitoso.

### Fase 7C.2: Instalación ECharts + wrapper base
- [x] echarts instalado.
- [x] echarts-for-react no instalado.
- [x] EChart wrapper existe.
- [x] registerECharts existe (import modular).
- [x] theme mapping existe (uso de CSS variables).
- [x] types existe.
- [x] resize/dispose validado.
- [x] light/dark preparado (MutationObserver).
- [x] no dashboards / no pantallas.
- [x] no datos reales.
- [x] no HEX en archivos TSX.
- [x] build exitoso.

### Hotfix Fase 7C.2.1: Corrección infraestructura ECharts
- [x] Tokens resueltos con `getComputedStyle` — no `var(--token)` directo en ECharts.
- [x] Tokens HEX (brand, positive, warning, negative, neutral) pasados directamente al canvas.
- [x] Tokens HSL-channel (foreground, muted-foreground, border, background) envueltos en `hsl(h, s%, l%)`.
- [x] Loading inicial no bloquea init — chart div siempre en DOM, loading/empty como overlays.
- [x] `MutationObserver` con deps `[]` — no se recrea por cambios en `option`.
- [x] `optionRef` usado en observer callback para acceder a option sin incluirlo en deps.
- [x] `attributeFilter: ['class']` en MutationObserver para limitar observaciones.
- [x] `DatasetComponent` removido de `registerECharts.ts`.
- [x] `getUbitsChartTheme` retorna `UbitsChartTheme` (sin `any`).
- [x] `height` prop prevalece sobre `style.height` (orden: `{ ...style, height }`).
- [x] `onChartReady` llamado después de `setOption` inicial.
- [x] `index.ts` exporta `UbitsChartTheme` vía `export * from "./theme"`.
- [x] No se creó ChartShell.
- [x] No se creó ChartCard.
- [x] No se crearon dashboards ni pantallas.
- [x] No se instalaron dependencias.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7C.3: ChartShell y ChartCard
- [x] `ChartShell.tsx` creado en `src/components/charts/`.
- [x] `ChartCard.tsx` creado en `src/components/charts/`.
- [x] `index.ts` exporta `ChartShell` y `ChartCard`.
- [x] ChartShell usa `<section>` como elemento raíz semántico.
- [x] ChartShell tiene `role="img"` y `aria-label` en el área del gráfico.
- [x] ChartShell tiene slot `summary` con `sr-only` para lectores de pantalla.
- [x] ChartShell usa `useId()` para linkage `aria-labelledby`.
- [x] Estado error: div inline con `border-destructive` — sin componente externo.
- [x] Estado vacío: delegado a `EChart empty` — sin Card anidada.
- [x] ChartCard tiene header estructurado: `meta`, `title`, `description`, `actions`, `filters`.
- [x] ChartCard usa header custom (no `CardHeader`) para control fino de spacing.
- [x] ChartCard delega todos los estados a ChartShell.
- [x] `ariaLabel` en ChartCard hace fallback a `title` cuando no se provee.
- [x] Demo en `App.tsx` actualizada: FormSection "Phase 7C.3".
- [x] Demo incluye transición `demoLoading` (1800ms) → datos reales.
- [x] Demo incluye ChartShell standalone con estados `empty` y `error`.
- [x] Demo incluye EChart directo para theming dinámico.
- [x] No se crearon BarChart, LineChart ni DonutChart preset.
- [x] No se instalaron dependencias nuevas.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

### Fase 7C.4: Presets BarChart, LineChart, AreaChart
- [x] `BarChart.tsx` creado en `src/components/charts/`.
- [x] `LineChart.tsx` creado en `src/components/charts/`.
- [x] `AreaChart.tsx` creado en `src/components/charts/`.
- [x] `index.ts` exporta BarChart, LineChart, AreaChart.
- [x] BarChart soporta `horizontal` y `stacked` props.
- [x] BarChart recibe datos por prop `data: Array<{ label, value }>`.
- [x] LineChart soporta `smooth` prop (default true).
- [x] LineChart recibe datos por prop `data: Array<{ label, value }>`.
- [x] AreaChart usa line series con `areaStyle: { opacity: 0.15 }` — sin gradientes.
- [x] AreaChart recibe datos por prop `data: Array<{ label, value }>`.
- [x] Todos los presets soportan `loading`, `empty`, `error`.
- [x] Todos los presets soportan `title`, `description`, `actions`, `filters`, `footer`.
- [x] Todos los presets soportan `ariaLabel` y `summary` para accesibilidad.
- [x] Todos los presets soportan `height` personalizable.
- [x] Demo en `App.tsx`: 4 ejemplos de presets (BarChart vertical, LineChart, AreaChart, BarChart horizontal).
- [x] Demo incluye transición `demoLoading`.
- [x] No datos de negocio, solo técnicos ("Categoría A", "Lunes", etc).
- [x] No se creó HeatmapChart ni KpiCard ni DonutChart.
- [x] No se crearon dashboards ni pantallas.
- [x] No se instalaron dependencias.
- [x] No hay HEX en archivos `.tsx`.
- [x] Build exitoso.

## Estándares de Calidad Permanentes
- [ ] Visual: Fidelidad 1:1 con tokens oficiales.
- [ ] Performance: 100/100 Lighthouse (Desktop).
- [ ] Código: 0 HEX en archivos `.tsx`.
- [ ] Accesibilidad: WCAG AA.
