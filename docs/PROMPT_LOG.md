# Prompt Log - plantilla-proyectos-shadcn

### 2026-05-04 21:55 - Fase 7B.3: Binary Form Controls (Completada)
- **Acción:** Instalación y adaptación de controles binarios de formulario.
- **Detalles:**
  - Instalación de `checkbox`, `radio-group` y `switch` vía shadcn.
  - Integración técnica en `App.tsx` con demos de selección múltiple, única y alternancia de estados.
  - Verificación de compatibilidad con el componente `Field`.
  - Sin instalación de Slider, DatePicker ni Calendar.
- **Resultado:** Suite de controles esenciales para formularios enterprise completada.

### 2026-05-04 22:15 - Fase 7B.4.1: ModalShell (Completada)
- **Acción:** Creación de ModalShell como wrapper estructurado UBITS.
- **Detalles:**
  - Implementación de `ModalShell` en `src/components/overlays/`.
  - Soporte para tamaños `sm`, `md`, `lg`, `xl` mediante clases Tailwind.
  - Slots flexibles para `title`, `description`, `footer` y `actions`.
  - Demos en `App.tsx` con modos controlado y no controlado.
- **Resultado:** Base de overlays modal formalizada bajo estándares UBITS.

### 2026-05-04 22:50 - Fase 7B.4.2: DrawerShell (Completada)
- **Acción:** Instalación de Sheet y creación de DrawerShell como wrapper UBITS.
- **Detalles:**
  - Instalación de `sheet` vía shadcn.
  - Implementación de `DrawerShell` con soporte para `side` y `size`.
  - Integración en `App.tsx` con demos de paneles laterales y control de estado.
- **Resultado:** Suite de overlays (Modal + Drawer) completada bajo estándares enterprise.

### 2026-05-04 23:05 - Fase 7B.4.3: ConfirmDialog (Completada)
- **Acción:** Instalación de AlertDialog y creación de ConfirmDialog como wrapper UBITS.
- **Detalles:**
  - Instalación de `alert-dialog` vía shadcn.
  - Implementación de `ConfirmDialog` con soporte para variantes (`default`, `warning`, `destructive`).
  - Soporte para estados de `loading` y `disabled`.
  - Integración en `App.tsx` con demos técnicas de confirmaciones críticas.
- **Resultado:** Trilogía de overlays estructurales (Modal, Drawer, Confirm) completada exitosamente.

### 2026-05-04 23:15 - Fase 7B.5.1: Feedback Base (Completada)
- **Acción:** Instalación y adaptación de Alert, Skeleton y Progress.
- **Detalles:**
  - Instalación de componentes vía shadcn.
  - Formalización del patrón "Cierre manual tras éxito" en `ConfirmDialog.tsx`.
  - Integración en `App.tsx` con demos de alertas contextuales, estados de carga y progreso.
- **Resultado:** Set base de feedback y estados de sistema completado.

### 2026-05-04 23:30 - Fase 7B.5.2: Sonner / Toasts (Completada)
- **Acción:** Instalación y configuración del sistema de notificaciones.
- **Detalles:**
  - Instalado Sonner vía shadcn.
  - Adaptado `sonner.tsx` para eliminar `next-themes` y usar tokens UBITS.
  - Creado `UbitsToaster` con sincronización de tema automática (MutationObserver).
  - Integradas demos en `App.tsx` para éxito, error, advertencia, info y promesas.
- **Resultado:** Sistema de notificaciones (Toasts) implementado y estandarizado.

### 2026-05-04 23:45 - Fase 7B.6.1: Identity & Navigation Extra (Completada)
- **Acción:** Instalación y adaptación de Avatar y Pagination.
- **Detalles:**
  - Instalado `avatar` y `pagination` vía shadcn.
  - Creado `PaginationShell` como wrapper enterprise con resumen de resultados.
  - Integradas demos en `App.tsx` con soporte para fallbacks e interacción de página.
  - No se instaló auth ni rutas protegidas.
- **Resultado:** Base de identidad y navegación de datos cerrada.

### 2026-05-04 23:55 - Fase 7B.6.2: Utility UI opcional (Completada)
- **Acción:** Instalación y creación de componentes utilitarios.
- **Detalles:**
  - Instalado `accordion` vía shadcn.
  - Creados componentes `Tag`, `SectionHeader` y `PageHeader` en `src/components/utility/`.
  - Integradas demos en `App.tsx` con soporte para temas, tonos y slots de acción.
  - No se instaló ECharts ni auth.
- **Resultado:** Suite de componentes utilitarios enterprise completada.

### 2026-05-04 24:05 - Fase 7C.1: Charts / ECharts Strategy (Completada)
- **Acción:** Definición de arquitectura y estrategia técnica para visualización de datos.
- **Detalles:**
  - Creado `CHARTS_STRATEGY.md` con principios visuales enterprise.
  - Creado `ECHARTS_DECISION_RECORD.md` justificando el uso de `echarts` directo + wrapper propio.
  - Creado `CHART_COMPONENT_ROADMAP.md` con fases granulares de implementación.
  - No se instalaron dependencias ni se modificó el código fuente.
- **Resultado:** Hoja de ruta técnica y visual para charts establecida.

### 2026-05-04 24:15 - Fase 7C.2: Instalación ECharts + wrapper base (Completada)
- **Acción:** Instalación de dependencias y creación de infraestructura base de charts.
- **Detalles:**
  - Instalado `echarts` (v5.6.0+).
  - Creado `registerECharts.ts` con imports modulares.
  - Creado `theme.ts` vinculado a variables CSS de UBITS.
  - Creado `EChart.tsx` con manejo de ciclo de vida, resize y temas.
  - Integrada demo técnica mínima en `App.tsx`.
  - No se instaló `echarts-for-react`.
  - No se crearon dashboards ni pantallas reales.
- **Resultado:** Infraestructura base para visualización de datos funcional y estandarizada.

### 2026-05-04 — Hotfix Fase 7C.2.1: Corrección infraestructura ECharts (Completado)
- **Motivo:** QA Fase 7C.2 detectó 2 hallazgos Alta bloqueantes antes de ChartShell/ChartCard:
  1. `var(--token)` pasado directamente a ECharts canvas → colores UBITS no aplicaban.
  2. `EChart` con `loading=true` en mount no inicializaba el chart al cambiar a `false`.
- **Correcciones aplicadas:**
  - `theme.ts`: reescrito para resolver tokens vía `getComputedStyle`. HEX directos para series
    (brand, positive, warning, negative, neutral). HSL-channel tokens envueltos en `hsl(h, s%, l%)`.
    Tipo de retorno cambiado de `any` a `UbitsChartTheme`.
  - `EChart.tsx`: chart div siempre en DOM; loading/empty como overlays absolutos.
    MutationObserver con deps `[]` + `optionRef` para evitar recreación por cambios de option.
    `attributeFilter: ['class']` en observer. `height` prop prevalece sobre style.height.
    `onChartReady` movido después de `setOption` inicial.
  - `registerECharts.ts`: eliminado `DatasetComponent` (no usado).
  - `index.ts`: cambiado a `export * from "./theme"` para exportar `UbitsChartTheme`.
- **Resultado:** Infraestructura base de ECharts con theming UBITS correcto en canvas. Lista para Fase 7C.3.

### 2026-05-05 — Fase 7C.3: ChartShell y ChartCard (Completada)
- **Acción:** Creación de contenedores estructurales enterprise para dashboards.
- **Detalles:**
  - Creado `ChartShell.tsx`: contenedor `<section>` con estados loading/empty/error/data inline. `role="img"`, `aria-label`, slot `summary` sr-only, `useId()` para aria linkage. Estado error con div + `border-destructive`. Estado vacío delegado a EChart para evitar Card anidada.
  - Creado `ChartCard.tsx`: superficie `Card` con header custom (meta/title/description/actions/filters) + `CardContent` conteniendo `ChartShell`. Delega todos los estados a ChartShell. `ariaLabel` hace fallback a `title`.
  - `index.ts` actualizado con exports de `ChartShell` y `ChartCard`.
  - `App.tsx` actualizado: FormSection "Phase 7C.3" con demo de transición `demoLoading` (1800ms), ChartShell standalone en estados `empty` y `error`, EChart directo para theming.
  - No se crearon presets (BarChart, LineChart). No se instalaron dependencias.
- **Resultado:** Contenedores estructurales enterprise con accesibilidad completa. Listos para presets en Fase 7C.4.

## Bloqueos o Supuestos
- **Slider:** Reservado para Fase 7B.7.
- **ECharts:** Reservado para Fase 7C.
- **Pantallas de negocio:** Bloqueadas hasta completar Fase 7B core.
