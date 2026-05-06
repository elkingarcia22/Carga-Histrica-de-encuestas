# NAVIGATION_SHELL_IMPLEMENTATION

## Descripción
Se ha implementado la infraestructura técnica de navegación para el **Playground Shell**, siguiendo los contratos de arquitectura definidos en la Fase 8.6B. Los componentes están diseñados para ser totalmente configurables mediante props, desacoplados de rutas reales y alineados con el sistema de diseño UBITS.

## Componentes Implementados

### 1. `PlaygroundSidebar`
El componente de navegación vertical principal.
- **Visual**: Fondo oscuro (`bg-surface-nav`), ítems con estados activo/hover y soporte para secciones con títulos.
- **Modos**: Soporta variante `full` (desktop) y `rail` (tablet).
- **Gobernanza**: Filtra ítems automáticamente según el `role` (`admin` | `collaborator`).
- **Icons**: Integrado con `UbitsIcon` mediante nombres semánticos.

### 2. `UbitsSubNav`
Navegación horizontal secundaria (Tabs de producto).
- **UX**: Scroll horizontal suave para móvil, indicadores de estado activo con borde inferior.
- **Acciones**: Basado en botones con callbacks, permitiendo su uso en playgrounds sin router.

### 3. `UbitsMobileTabBar`
Barra de navegación inferior para dispositivos móviles.
- **Diseño**: Max 5 ítems con etiquetas y badges.
- **Accesibilidad**: Targets táctiles optimizados y soporte de Aria labels.

## Tipado (`navigationTypes.ts`)
Se establecieron interfaces estrictas para asegurar que cualquier configuración de navegación cumpla con los requisitos del Shell:
- `NavigationItem`: ID, Label, Icon, Badge, Role.
- `NavigationSection`: Agrupación de ítems en el Sidebar.
- `ProductSubNavItem`: Estructura simplificada para navegación secundaria.

## Reglas de Uso
- **No Hardcoding**: La navegación no debe definirse dentro de los componentes.
- **Tokens Only**: Prohibido el uso de HEX. Se utilizan clases de Tailwind mapeadas a `tokens.css`.
- **Accessibility First**: Todos los componentes usan elementos semánticos (`nav`, `button`) y atributos ARIA.

## Relación con Fase 8.6D
Estos componentes actuarán como los bloques de construcción para el **Home/List Template**, donde se integrarán en un Layout con slots definidos.

---
*Implementación de Navegación v1.0*
