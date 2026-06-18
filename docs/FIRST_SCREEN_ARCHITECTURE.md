# First Screen Architecture · Comparativo de Encuestas UBITS

## 1. Decision
- FIRST_SCREEN_SELECTED = SYNTHETIC_COMPARISON_RESULTS_DASHBOARD
- Nombre visible propuesto: Comparativo de encuestas
- Subtítulo propuesto: Compara resultados entre una encuesta base y una encuesta comparativa usando datos sintéticos validados.

## 2. User
- Analista interno UBITS / Customer Success / equipo de prototipado

## 3. Screen Goal
- Mostrar un dashboard comparativo usando el ComparisonViewModel ya aprobado.
- Proveer validación visual de métricas, KPIs, datos de las encuestas y comparación sin crear carga real ni procesamiento productivo.

## 4. Data Source
- No real XLSX uploads.
- No real client data.
- No APIs.
- No storage.
- Uses existing synthetic fixtures.

## 5. Approved Input Boundary
- La pantalla futura solo podrá consumir `ComparisonViewModelResult` desde `buildComparisonViewModel(...)`.
- No podrá consumir directamente:
  - raw workbook
  - parsed workbook
  - schema validation internals
  - cross-sheet validation internals
  - canonical workbook
  - metrics internals
  - PeriodComparisonResult raw

## 6. View Model Contract
- Consumes `ComparisonViewModelResult` adhering to the Phase 4K-SYN4C7 definitions.

## 7. Layout Concept
- B2B enterprise
- desktop-first
- fondo gris claro
- cards blancas
- bordes sutiles
- acción primaria en azul UBITS
- sin saturación visual
- sin elementos lúdicos
- sin gráficos innecesarios en primera iteración

## 8. Screen Sections
- Page shell
- Header
- Context summary
- KPI summary cards
- Comparison health / inventory card
- Question comparison table/list
- Distribution detail section
- Filter rail or filter row
- Empty/error state area
- QA/debug metadata area for prototype only

## 9. Component Candidates
- Card
- Button
- Badge
- Table
- Tabs
- Select
- Input
- Separator
- Skeleton
- Alert
- UbitsIcon / iconRegistry
- Navigation Shell si ya está presente
- Survey Analytics si ya está presente

*Nota:* Antes de construir, Antigravity debe revisar si estos componentes existen en la rama actual. No modificar shadcn/ui base. No copiar HTML/CSS desde referencias externas.

## 10. Forbidden UI Work
- No crear UI.
- No crear rutas.
- No crear componentes React.
- No escribir JSX.
- No usar Tailwind.
- No crear estilos.
- No usar HEX hardcodeados.
- No usar `text-white`.
- No modificar shadcn/ui.
- No modificar tokens.
- No instalar dependencias.
- No modificar fixtures.
- No procesar datos reales.
- No crear upload real.
- No conectar APIs.
- No usar datos reales de clientes.
- No implementar insights IA.
- No implementar recomendaciones.
- No usar `any`, `any[]` o `as any`.

## 11. Empty / Loading / Error States
- READY
- READY_WITH_WARNINGS
- EMPTY
- ERROR
- LOADING_MOCK

## 12. Accessibility Expectations
- Standard HTML semantic structure and basic a11y for shadcn/ui components where available.

## 13. QA Criteria
- No console errors.
- Visual alignment with Layout Concept constraints.
- git diff --check clean.

## 14. Next Build Phase
- Construcción de la UI para SYNTHETIC_COMPARISON_RESULTS_DASHBOARD utilizando el ComparisonViewModel.

## 15. Open Questions
- NO_INSIGHTS_AI_YET (Solo considerar IA-first en una fase futura si ya existe una visualización estable y si aporta valor real para explicar riesgos/oportunidades).
