# Drilldown Architecture · Comparativo de Encuestas UBITS

## 1. Architecture Decision

DRILLDOWN_ARCHITECTURE_LOCKED = YES
DRILLDOWN_TYPE = QUESTION_DETAIL

## 2. User Problem

El usuario necesita comprender las razones detrás de las variaciones y puntajes de una pregunta específica en la comparación de encuestas, sin perder el contexto general del dashboard y sin requerir descargar o cruzar manualmente archivos Excel adicionales.

## 3. Primary User

- Administrador de Plataforma UBITS.
- Analista de Talento Humano.
- Líder de Área (consumidor de los resultados).

## 4. Entry Point

User selects a comparable question row from the Synthetic Comparison Results Dashboard.

## 5. Data Boundary

The future drilldown may consume only data derived from ComparisonViewModelResult.
No raw workbook.
No parser runtime.
No WorkbookMetricsResult direct consumption.
No PeriodComparisonResult direct consumption.
No real XLSX.
No APIs.
No storage.

## 6. Drilldown Input Contract

```typescript
// Conceptual contract (no code implemented yet)
interface DrilldownInput {
  questionId: string;
  questionLabel: string;
  questionType: 'multiple-choice' | 'open-text' | 'rating' | 'boolean';
  comparisonStatus: 'comparable' | 'base-only' | 'comparison-only';
  basePeriodLabel?: string;
  comparisonPeriodLabel?: string;
  baseValue?: number | string;
  comparisonValue?: number | string;
  delta?: number;
  deltaDirection?: 'positive' | 'negative' | 'neutral';
  tone?: 'positive' | 'negative' | 'neutral';
  distributionRows?: Array<{
    optionLabel: string;
    baseCount: number;
    basePercentage: number;
    comparisonCount: number;
    comparisonPercentage: number;
    deltaPercentage: number;
  }>;
  availableSegments?: string[];
  metadata?: Record<string, unknown>;
}
```

## 7. Drilldown View Model Proposal

El View Model para el Drilldown recibirá el `DrilldownInput` y lo transformará en los props necesarios para renderizar las secciones de detalle, manejando lógica de presentación (formateo, ordenamiento de distribuciones) de manera aislada de la UI.

## 8. Comparable Question Detail

Para preguntas marcadas como comparables, el drilldown mostrará las siguientes secciones:

- Question header: Título, ID, tipo.
- Metric comparison: Valor base vs valor comparativo destacado.
- Distribution comparison: Tabla o desglose de opciones y sus variaciones.
- Delta explanation: Explicación textual o indicación visual del cambio.
- Participation / blank context: Información sobre respuestas en blanco o N/A para esa pregunta.
- Related metadata: Categoría, dimensiones asociadas.
- QA/debug metadata: IDs originales, raw rows reference (si aplica en synthetic data).

## 9. Non-comparable Question Handling

Para preguntas como:
Q-LEGACY-001 = solo encuesta base
Q-NEW-001 = solo encuesta comparativa

El drilldown debe poder mostrar un estado de no comparabilidad con explicación clara.
Se indicará visualmente a qué periodo pertenece y por qué no hay datos del otro periodo. No se forzarán como comparables.

## 10. Layout Concept

B2B enterprise
desktop-first
fondo gris claro
cards blancas
bordes sutiles
tokens semánticos UBITS
sin saturación visual
sin gráficos innecesarios

La experiencia será: **Dedicated detail section below table**
Evita crear rutas nuevas y mantiene el alcance dentro de la primera experiencia cerrada.

## 11. Screen or Panel Decision

Decisión: **Inline expanded row** o **Dedicated detail section below table** (collapsible/expandable section that appears below the main table, scoped to the current view). 

Confirmado: Dedicated detail section below table.

## 12. Component Candidates

- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Table`, `TableRow`, `TableCell`, `TableHeader` (para distribuciones)
- `Badge` (para estados y tonos)
- `Separator`
- `Button` (para cerrar o colapsar)
- `ScrollArea` (si el contenido es extenso)

## 13. States

- NO_QUESTION_SELECTED
- COMPARABLE_SELECTED
- BASE_ONLY_SELECTED
- COMPARISON_ONLY_SELECTED
- EMPTY_DISTRIBUTION
- ERROR
- LOADING_MOCK

## 14. Accessibility Expectations

- Keyboard navigation (Tab) para abrir/cerrar drilldown.
- `aria-expanded` en la fila seleccionada.
- Focus management al abrir el drilldown.
- Roles semánticos en las tablas de distribución.
- Contraste WCAG AA en tonos y badges.

## 15. QA Criteria

- El drilldown solo recibe datos del View Model existente.
- No se rompe el layout principal al abrir el detalle.
- Las preguntas base-only muestran estado correcto.
- Las preguntas comparison-only muestran estado correcto.
- El cierre del panel limpia el estado.

## 16. Forbidden Work

- No construir UI.
- No crear rutas.
- No modificar código fuente `src/`.
- No modificar tests.
- No procesar archivos reales.
- No conectar APIs ni storage.
- No implementar IA.

## 17. Open Questions

- ¿Deberíamos permitir exportar el detalle de la pregunta a PDF/Excel individualmente en el futuro? (Fuera de scope actual).

## 18. Next Authorized Phase

SYN4C15_DRILLDOWN_BUILD_PROMPT_READY

## 19. Final Status Markers

PHASE_4K_SYN4C14_COMPLETE
DRILLDOWN_ARCHITECTURE_LOCKED
DRILLDOWN_TYPE_QUESTION_DETAIL
FIRST_SCREEN_REMAINS_FORMALLY_CLOSED
COMPARISON_VIEW_MODEL_BOUNDARY_RECONFIRMED
NO_UPLOAD_UI_YET
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
SYN4C15_DRILLDOWN_BUILD_PROMPT_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
