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
| **Charts** | `ECharts` | ✅ Listo | `src/components/charts/EChart.tsx` |
| **Slider** | `Slider` | Futuro | Fase 7B.7 |

## Consideraciones Críticas
1. **0 HEX en TSX**: Todos los componentes deben usar variables CSS de Tailwind.
2. **Consistencia Visual**: Respetar los tokens definidos en `tokens.css`.
3. **Puntualidad**: Migrar solo lo necesario para desbloquear pantallas.
