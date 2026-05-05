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
│  ├─ charts/          # EChart, theme, registerECharts, types
│  ├─ forms/           # Field, FormSection, SearchableSelect, MultiSelect
│  ├─ filters/         # FilterBar
│  └─ overlays/        # ModalShell, DrawerShell, ConfirmDialog
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
