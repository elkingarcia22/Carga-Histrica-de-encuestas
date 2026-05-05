# Chart Component Roadmap

## Visión General
Ruta de implementación para la capa de visualización de datos en el starter kit.

## Fases de Implementación

### Fase 7C.2: Infraestructura Base (Instalación)
- **Acción**: Instalación de `echarts` y tipos de TS.
- **Entregables**:
  - `src/components/charts/EChart.tsx`: Wrapper base de React.
  - `src/components/charts/theme.ts`: Mapeo de tokens CSS a configuración de ECharts.
  - `src/components/charts/types.ts`: Tipado base para opciones de gráficos.
- **QA**: Verificación de ciclo de vida (init/dispose) y cambio de tema.

### Fase 7C.3: Contenedores Estructurales ✓ COMPLETADA
- **Acción**: Creación de contenedores para dashboards.
- **Entregables:**
  - `ChartShell` ✓: `<section>` con estados loading/empty/error/data. `role="img"`, `aria-label`, `summary` sr-only, `useId()` para `aria-labelledby`. Error inline con `border-destructive`. Vacío delegado a EChart para evitar Card anidada.
  - `ChartCard` ✓: `<Card>` con header custom (meta/title/description/actions/filters) + `CardContent` → `ChartShell`. `ariaLabel` hace fallback a `title`.
  - `KpiCard`: Reservado para fase posterior si se requiere.
- **Accesibilidad implementada:**
  - `role="img"` + `aria-label` en área del canvas.
  - Slot `summary` con `sr-only` para acceso sin canvas.
  - `useId()` + `aria-labelledby` en `<section>`.
  - Estados loading y empty son semánticos para lectores de pantalla.

### Fase 7C.4: Gráficos de Comparación y Tendencia
- **Acción**: Implementación de gráficos estadísticos base.
- **Entregables**:
  - `BarChart`: Vertical, Horizontal y Stacked.
  - `LineChart`: Simple y Multi-serie.
  - `AreaChart`: Para tendencias de volumen.

### Fase 7C.5: Composición e Indicadores Rápidos
- **Acción**: Implementación de gráficos circulares y métricas simples.
- **Entregables**:
  - `DonutChart` / `PieChart`.
  - `Sparkline`: Versión ultra-compacta para tablas o KPIs.

### Fase 7C.6: Gráficos de Densidad y Especializados
- **Acción**: Implementación de visualizaciones complejas.
- **Entregables**:
  - `HeatmapChart`.
  - `GaugeChart` (si se requiere).

## Arquitectura de Carpetas Futura
```
src/components/charts/
├── core/
│   ├── EChart.tsx        # Wrapper base
│   ├── ChartShell.tsx    # Contenedor de estado
│   └── ChartCard.tsx     # Contenedor visual
├── presets/
│   ├── BarChart.tsx
│   ├── LineChart.tsx
│   └── DonutChart.tsx
├── utils/
│   ├── theme.ts          # Integración de tokens
│   └── options.ts        # Helpers para configuración
└── types.ts
```

## Criterios de Aceptación Globales
- **Accesibilidad**: Labels accesibles y soporte para navegación.
- **Performance**: Importación modular de módulos de ECharts.
- **Estética**: Cero HEX en los componentes, fidelidad 1:1 con `tokens.css`.
- **Responsive**: Ajuste automático del tamaño mediante `ResizeObserver`.
