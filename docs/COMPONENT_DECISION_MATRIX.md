# Component Decision Matrix

| Componente | Starter actual | Comparativo | Legacy David | Existe en shadcn | Decisión final | Tipo implementación | Prioridad |
|---|---|---|---|---|---|---|---|
| **Button** | Prueba | Nativo | Custom | Sí | shadcn + Wrapper | shadcn wrapper UBITS | ✅ Aprobado |
| **Card** | Prueba | Nativo | Custom | Sí | shadcn + Wrapper | shadcn wrapper UBITS | ✅ Aprobado |
| **Badge** | Adaptado | Nativo | Custom | Sí | shadcn directo | Variantes UBITS. | ✅ Aprobado |
| **Input** | Adaptado | Nativo | Custom | Sí | shadcn directo | Altura 40px, focus azul. | ✅ Aprobado |
| **Dropdown Menu** | Instalado | N/A | Custom | Sí | shadcn directo | Estilo B2B compacto. | ✅ Aprobado |
| **Tooltip** | Instalado | N/A | Custom | Sí | shadcn directo | Delay 200ms, sobrio. | ✅ Aprobado |
| **Checkbox** | Instalado | N/A | Custom | Sí | shadcn directo | Estado checked azul UBITS.| ✅ Aprobado |
| **Radio Group** | Instalado | N/A | Custom | Sí | shadcn directo | Radios sobrios enterprise. | ✅ Aprobado |
| **Switch** | Instalado | N/A | Custom | Sí | shadcn directo | Alternancia binaria clara. | ✅ Aprobado |
| **ModalShell** | Adaptado | N/A | Custom | Sí | UBITS Wrapper | Wrapper sobre Dialog base. | ✅ Aprobado |
| **ConfirmDialog** | Adaptado | N/A | Custom | Sí | UBITS Wrapper | Wrapper sobre AlertDialog. | ✅ Aprobado |
| **DrawerShell** | Adaptado | N/A | Custom | Sí | UBITS Wrapper | Wrapper sobre Sheet base. | ✅ Aprobado |
| **Alert** | Adaptado | N/A | Custom | Sí | shadcn adaptado | Inline feedback. | ✅ Aprobado |
| **Skeleton** | Adaptado | N/A | Custom | Sí | shadcn directo | Loading states. | ✅ Aprobado |
| **Progress** | Adaptado | N/A | Custom | Sí | shadcn directo | Task completion. | ✅ Aprobado |
| **Avatar** | Instalado | N/A | Custom | Sí | shadcn directo | Identidad visual. | ✅ Aprobado |
| **Pagination** | Instalado | N/A | Custom | Sí | shadcn directo | Navegación base. | ✅ Aprobado |
| **PaginationShell** | Creado | N/A | N/A | No | UBITS Wrapper | Wrapper para tablas. | ✅ Aprobado |
| **Accordion** | Instalado | N/A | Custom | Sí | shadcn directo | Contenido colapsable. | ✅ Aprobado |
| **Tag** | Creado | N/A | N/A | No | UBITS Custom | Categorización ligera. | ✅ Aprobado |
| **SectionHeader** | Creado | N/A | N/A | No | UBITS Custom | Encabezados sección. | ✅ Aprobado |
| **PageHeader** | Creado | N/A | N/A | No | UBITS Custom | Encabezados página. | ✅ Aprobado |
| **Sonner** | Instalado | N/A | Custom | Sí | shadcn directo | Feedback efímero. | ✅ Aprobado |
| **UbitsToaster** | Creado | N/A | N/A | No | UBITS Wrapper | Wrapper sobre Sonner. | ✅ Aprobado |
| **EChart** | Creado | N/A | N/A | No | Apache ECharts | Wrapper base React. | ✅ Aprobado |
| **ChartShell** | Futuro | N/A | N/A | No | UBITS Wrapper | Contenedor de estado. | ⏳ Pendiente |
| **ChartCard** | Futuro | N/A | N/A | No | UBITS Wrapper | Contenedor visual. | ⏳ Pendiente |
| **BarChart** | Futuro | N/A | N/A | No | UBITS Preset | Gráfico de barras. | ⏳ Pendiente |
| **LineChart** | Futuro | N/A | N/A | No | UBITS Preset | Gráfico de líneas. | ⏳ Pendiente |
| **DonutChart** | Futuro | N/A | N/A | No | UBITS Preset | Gráfico circular. | ⏳ Pendiente |

## Notas
- **Fase 7B.3:** Controles binarios integrados exitosamente.
- **Fase 7B.5:** Feedback & Status (Alert, Skeleton, Progress, Sonner) integrados.
