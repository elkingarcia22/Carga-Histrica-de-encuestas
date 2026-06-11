# Historical Preview Simulated Local Contract and Adapter Build Planning

## 1. Objetivo y Alcance
Este documento detalla la planificación técnica para la Fase 4E4. Define la estructura de tipos, la firma del adaptador, y las interfaces locales basadas estrictamente en el `HISTORICAL_PREVIEW_SIMULATED_MOCK_DATA_CONTRACT.md`.

**Nota Restrictiva:** Este documento es exclusivamente de planificación. No se debe codificar en `src/` hasta que la fase 4E5 sea autorizada. El primer bloque constructivo (Fases 4E5A-D) excluye terminantemente props React, componentes, screens y hooks.

## 2. Tipos de Dominio Futuros (Local Types)
Inventario cerrado de tipos a definir en `src/lib/survey-import/historical-preview/historicalPreviewTypes.ts` (sin enums, sin classes, readonly):
- `HistoricalPreviewStatus`
- `HistoricalPreviewScenarioId`
- `HistoricalPreviewPeriodRole`
- `HistoricalPreviewAvailability`
- `HistoricalPreviewDistributionCategory`
- `HistoricalPreviewDeltaDirection`
- `HistoricalPreviewDeltaUnit`
- `HistoricalPreviewCapabilityStatus`
- `HistoricalPreviewSegmentStatus`
- `HistoricalPreviewInsightType`
- `HistoricalPreviewInsightSeverity`
- `HistoricalPreviewSurveyIdentity`
- `HistoricalPreviewPeriodMetrics`
- `HistoricalPreviewDistributionItem`
- `HistoricalPreviewPeriod`
- `HistoricalPreviewFavorabilityDelta`
- `HistoricalPreviewTrendPoint`
- `HistoricalPreviewCapability`
- `HistoricalPreviewSegmentSummary`
- `HistoricalPreviewInsight`
- `HistoricalPreviewDisclosure`
- `HistoricalPreviewModel`
- `HistoricalPreviewScenario`

### Política de Ausencia
- `null` para métricas conocidas pero no disponibles.
- Arrays vacíos únicamente cuando la colección existe y está vacía.
- Objetos o módulos opcionales solo cuando el módulo completo puede estar ausente.
- Disponibilidad explícita para módulos presentacionales.
Prohibido: `0` como ausencia, `""`, `NaN`, `-1`, mezcla arbitraria de `null` y `undefined`.

## 3. Configuración y Copy
Archivo: `src/config/survey-import/historicalPreviewConfig.ts`
Contendrá solo:
- Títulos, disclosure, labels, unidades, labels de distribución y estados.
- Textos limited, empty y error.
- Acciones, textos esperados para insights derivados y accesibilidad.
Prohibido: Valores numéricos de dominio (ej. 68, 74, 6), periodos, respuestas, distribuciones, escenarios, lógica, JSX, React, colores.

## 4. Decision Gate del Fixture Ejecutable
Estrategia: **C. Fixture sintético dedicado** (`LOCKED`).
Archivo: `src/mocks/survey-import/historical-preview/historicalPreviewScenarios.ts`
Contiene exclusivamente escenarios: `ready`, `limited`, `empty`, `error-simulated`.
Características: Determinístico, serializable, sin funciones/React/fechas runtime/datos reales.

## 5. Firma del Adaptador (Adapter)
Archivo: `src/lib/survey-import/historical-preview/historicalPreviewAdapter.ts`
API Recomendada: `createHistoricalPreviewModel(input)` donde `input` es `{ scenarioId }`.
El orquestador entrega el ID, una función local obtiene el escenario, valida, transforma y devuelve una unión discriminada:
- Success con `model` (`HistoricalPreviewModel`).
- Failure con issue seguro (código cerrado, severity, module, safe message key).

Responsabilidades: Valida, deriva delta, deriva tendencia, deriva insights, determina estado. No corrige datos silenciosamente.

### Reglas de Insights
- Favorabilidad: delta > 0 (positivo), delta < 0 (disminución), delta = 0 (neutral, si límite máximo de dos lo permite).
- Participación: dif abs <= 2pp (estable), dif abs > 2pp (variación).

### Invariantes Ejecutables (Fase 4E5D)
1. Escenario sintético.
2. ID permitido.
3. Estado permitido.
4. Dos periodos para ready.
5. Roles únicos.
6. Orden cronológico.
7. Métricas en rango.
8. Conteos enteros.
9. Distribución consistente.
10. Tolerancia 99.9-100.1.
11. Favorabilidad coherente con favorable.
12. Delta correcto.
13. Trend consistente.
14. Capacidades válidas.
15. Segmentos pasivos.
16. Máximo dos insights.
17. Insights justificables.
18. Disclosure persistente.
19. Sin datos reales.
20. Sin objetos binarios.

## 6. Grafo de Dependencias
```text
historicalPreviewTypes
        ↑
historicalPreviewScenarios
        │
        ├──────────────┐
        ↓              ↓
historicalPreviewAdapter ← historicalPreviewConfig
        ↓
HistoricalPreviewModel
```
* Types no importa dominio. Config puede usar `import type`. Fixture importa types. Adapter importa types, fixture y config.

## 7. División Flash 3.0
- **Fase 4E5A · Local Types**: `historicalPreviewTypes.ts`
- **Fase 4E5B · Configuration and Copy**: `historicalPreviewConfig.ts`
- **Fase 4E5C · Executable Synthetic Fixture**: `historicalPreviewScenarios.ts`
- **Fase 4E5D · Deterministic Adapter**: `historicalPreviewAdapter.ts`
- **Fase 5E1 · Independent QA**
- **Fase 6E1 · Hotfix**
- **Fase 7E1 · Closure**

*(Se permite un harness temporal en 4E5D para validar V1-V16, verificando dos ejecuciones idénticas y cero contacto con UI).*

## 8. DEFERRED_TO_PRESENTATIONAL_BUILD_PLAN
Estado: `DEFERRED_TO_PRESENTATIONAL_BUILD_INTAKE`
Se difieren explícitamente a una fase posterior:
- `HistoricalPreviewSimulatedScreenProps`
- Componentes
- Screen
- Charts
- Integración
- Navegación
- Acciones
- Responsive
- QA Visual

