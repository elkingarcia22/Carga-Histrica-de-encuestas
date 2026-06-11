# Fase 4E2 · Historical Preview Simulated Architecture Lock Report

## 1. Resumen ejecutivo
La Fase 4E2 bloquea la arquitectura técnica y visual de la pantalla inicial "Historical Preview Simulated · Resumen histórico". Basándose en el intake documental previo, se define la frontera entre U3-SIM y la preview, los contratos locales puramente sintéticos, la fuente única de verdad mediante un adapter determinístico y la arquitectura de componentes a utilizar. Esta definición habilita un desarrollo posterior seguro y desacoplado, garantizando que no existan integraciones reales con datos productivos o binarios.

## 2. Estado formal
`HISTORICAL_PREVIEW_SIM_ARCHITECTURE_LOCKED_WITH_MOCK_DATA_GATE`

## 3. Gate inicial
Verificación completada:
- Rama actual: `main`
- HEAD: `a002fa35cb0d5c6fd494f9b877fbbd8020f7a97a`
- `origin/main`: `a002fa35cb0d5c6fd494f9b877fbbd8020f7a97a`
- Tracking: `origin/main` (Ahead 0, Behind 0)
- Working tree: Limpio
- Únicos cambios detectables locales: Documentos autorizados.
- `package.json` y `package-lock.json` intactos.
- `src/**` intacto.
- Sin rutas nuevas, Worker, parser ni dependencias.

## 4. Fuentes revisadas
- **Gobernanza:** `docs/HISTORICAL_PREVIEW_SIMULATED_INTAKE.md`, `docs/ARCHITECTURE.md`, `docs/SCREEN_MAP.md`, `docs/MOCK_DATA_CONTRACT.md`.
- **U3-SIM:** `src/lib/survey-import/simulation/simulationTypes.ts`, `src/lib/survey-import/simulation/simulatedImportAdapter.ts`, `src/screens/survey-import/SimulatedProcessingScreen.tsx`.
- **Datos:** Fixture `aggregated-happy-path`.
- **Starter Kit:** Tokens B2B, Survey Analytics.

## 5. Alcance y no alcance
**Alcance:** La pantalla "Historical Preview Simulated · Resumen histórico" como subvista terminal dentro de la macroetapa actual (Cargar).
**No alcance:** Detalle por pregunta, segmentos profundos, configuración, importación real, exportación, comparativo funcional completo de encuestas.

## 6. Frontera U3-SIM–Preview
- Evento conceptual: `OPEN_SIMULATED_HISTORICAL_PREVIEW`.
- Precondiciones: U3-SIM finalizó con `completed`, `nextView === 'historical-preview-simulated'`, divulgación (disclosure) activa.
- Transporte futuro: Únicamente transferirá una referencia sintética (`previewId` o `scenarioId`). Cero objetos `File` o `Map` binario.
- Owner de transición: `SurveyImportUploadScreen` orquestará la visibilidad entre U2/U3-SIM y la Preview.

## 7. Ownership de vista
Las vistas `upload-idle`, `files-selected`, `simulated-processing` y `historical-preview-simulated` convivirán orquestadas en un componente centralizado superior. La preview será pasiva (controlada por props) y no decidirá por sí misma sobre navegación ni limpieza de estados binarios de U2.

## 8. Arquitectura por capas
1. **Orquestador:** Gestiona la vista y transferencias, sin transformar métricas.
2. **Preview adapter:** Puro, consumirá referencias y generará un contrato de preview compacto. Sin React, ni red.
3. **Contrato local:** Describe identidad, KPIs y estado.
4. **Screen:** Coordina layout, encabezado, acciones y disclosure.
5. **Componentes presentacionales:** Renderizan la UI de cada módulo basados únicamente en el contrato.

## 9. Fuente única de verdad
Se utilizará un adapter local puro que transformará el fixture en un modelo `HistoricalPreviewModel`.
- Queda **prohibido** importar fixtures directamente en los componentes de UI.
- Los componentes recibirán exclusivamente el modelo derivado.

## 10. Auditoría de fixtures y datos faltantes
- **Fixture principal:** `aggregated-happy-path`. El fixture solo contiene métricas para un único periodo (`configuration.period`).
- **Datos respaldados por fixture existente:** Encuesta, tipo, periodo disponible, favorabilidad del periodo disponible, participación, respuestas, distribución, segmentos, capacidades.
- **Datos aún no respaldados:** Segundo periodo, métricas del segundo periodo, delta, serie histórica, comparación de distribución, insight de subida o caída.
- Los datos no respaldados se clasificarán como: `SYNTHETIC_PREVIEW_VALUE_REQUIRES_MOCK_CONTRACT`.
- El adapter no debe inventar estos datos libremente; la Fase 4E3 definirá el Mock Data Contract para estos.

## 11. Contrato local conceptual
```typescript
interface HistoricalPreviewModel {
  isSynthetic: boolean;
  survey: SurveyIdentity;
  periodSelection: PeriodSelection;
  kpis: KpiItem[];
  responseDistribution: DistributionItem[];
  historicalTrend: TrendPoint[];
  capabilities: CapabilityItem[];
  segments: SegmentSummary;
  insights?: InsightItem[];
  disclosure: string;
  status: PreviewStatus;
}
```

## 12. Identidad de encuesta
Consumirá `displayName`, `surveyTypeLabel`, `mode` (agregado) de los fixtures.

## 13. Periodos
- **Periodo base:** Periodo cronológicamente anterior.
- **Periodo comparativo:** Periodo más reciente.
- **Estado:** `PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT`.
- No asumir que el único periodo del fixture es automáticamente el periodo base.
- No construir fechas nuevas en el adapter sin el contrato mock de Fase 4E3.

## 14. KPIs
- **Favorabilidad:** Valor sintético permitido, fórmula productiva diferida, escala productiva no fijada (`PROVISIONAL_LOCKED_FOR_SIMULATION`).
- **Participación:** Distingue total de respuestas y universo. Usar `participationRate` si existe (`PROVISIONAL_LOCKED_FOR_SIMULATION`).
- **Respuestas:** Extraído de `totalResponses`.
- **Delta:** Puntos porcentuales, comparativo menos base (`PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT`).

## 15. Distribución
- Mantener los valores sintéticos definidos por el Mock Data Contract.
- Validar la suma de porcentajes.
- Aceptar una tolerancia documental de redondeo claramente definida (Fase 4E3).
- Aplicar únicamente redondeo de presentación. No redistribuir diferencias.
- Si la suma está fuera de tolerancia, marcar la preview como `preview-limited`. No falsear 100%.
- **Estado:** `LOCKED`.

## 16. Tendencia y Starter Kit Audit
| Componente | Ruta exacta | Props relevantes | Estado interno | Reutilizable | Wrapper | Restricción |
| --- | --- | --- | --- | --- | --- | --- |
| Card | `src/components/ui/card.tsx` | estandar | stateless | Si | No | Ninguna |
| Badge | `src/components/ui/badge.tsx` | variant | stateless | Si | No | Ninguna |
| Alert | `src/components/ui/alert.tsx` | variant | stateless | Si | No | Ninguna |
| Separator | `src/components/ui/separator.tsx` | estandar | stateless | Si | No | Ninguna |
| UbitsIcon | `src/icons/UbitsIcon.tsx` | name | stateless | Si | No | Ninguna |
| ImportWizardShell | `src/components/layout/ImportWizardShell.tsx` | children | stateless | Si | No | Ninguna |
| TrendMetricLineChart | `src/components/survey-analytics/TrendMetricLineChart.tsx` | data | stateful (echarts) | `REUSABLE_AFTER_ADAPTER` | Sí | Accesibilidad |
| FavorabilityDistributionCard | `src/components/survey-analytics/FavorabilityDistributionCard.tsx` | distribution | stateless | `REUSABLE_AFTER_ADAPTER` | Sí | Adaptar contrato |

## 17. Segmentos
Resumen numérico basado en `data.segments.length`.

## 18. Capacidades
Mapeo de `preview.capabilities` a lista visual.

## 19. Insights
`VALUABLE_NOW_WITH_LIMITS`. Dos insights sintéticos como máximo.

## 20. Estados de Preview
| Estado | Condición | Módulos visibles | Disclosure | Acción primaria | Acción secundaria | Bloqueo |
| --- | --- | --- | --- | --- | --- | --- |
| `preview-ready` | Contrato mock mapeado correctamente | Todos | Sí | Cerrar vista previa | Volver a archivos | Ninguno |
| `preview-limited` | Suma de distribución fuera de tolerancia, datos parciales | Parciales/Con warnings | Sí | Cerrar vista previa | Volver a archivos | Ninguno |
| `preview-empty` | Sin datos en simulación | Mensaje vacío | Sí | Volver a archivos | Cerrar vista previa | Ninguno |
| `preview-error-simulated` | Escenario sintético incompleto, contrato inválido | Error | Sí | Volver al procesamiento | Cerrar | Continuar bloqueado |

## 21. Acciones y Ownership
- **Volver al procesamiento simulado:** Owner: Orquestador de flujo. Decide si conserva estado `completed` de U3-SIM o lo reconstruye desde el plan.
- **Volver a archivos:** Owner: Orquestador de flujo. Vuelve a U2, preservando lote y binarios, elimina referencia de preview.
- **Cerrar vista previa:** Equivale a "Volver a archivos" para salir de la preview manteniendo el proceso vivo.
- **Continuar a configuración:** `disabled` real, explicación visible, no cambia macroetapa, no callback.

## 22. Arquitectura de componentes
```text
HistoricalPreviewSimulatedScreen
└─ ImportWizardShell
   ├─ ImportWizardHeader
   ├─ ImportWizardSteps
   ├─ HistoricalPreviewDisclosure
   ├─ HistoricalPreviewPeriodComparison
   ├─ HistoricalPreviewKpiGrid
   ├─ HistoricalPreviewAnalyticsGrid
   │  ├─ HistoricalPreviewDistributionCard
   │  └─ HistoricalPreviewTrendCard
   ├─ HistoricalPreviewSupportingSummary
   │  ├─ capacidades
   │  ├─ segmentos
   │  └─ insights sintéticos
   └─ HistoricalPreviewActions
```

## 23. Inventario futuro
**Contratos, configuración y adapter**
- `src/lib/survey-import/historical-preview/historicalPreviewTypes.ts`
- `src/lib/survey-import/historical-preview/historicalPreviewAdapter.ts`
- `src/config/survey-import/historicalPreviewConfig.ts`

**Screen**
- `src/screens/survey-import/HistoricalPreviewSimulatedScreen.tsx`

**Componentes**
- `HistoricalPreviewDisclosure`
- `HistoricalPreviewPeriodComparison`
- `HistoricalPreviewKpiGrid`
- `HistoricalPreviewAnalyticsGrid`
- `HistoricalPreviewDistributionCard`
- `HistoricalPreviewTrendCard`
- `HistoricalPreviewSupportingSummary`
- `HistoricalPreviewActions`

**Integración futura**
- `src/screens/survey-import/SurveyImportUploadScreen.tsx`

## 24. Matriz de decisiones
| Decisión | Estado |
| --- | --- |
| Fixture principal | `LOCKED` |
| Fixture secundario | `PROVISIONAL_LOCKED` |
| Contrato local | `PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT` |
| Adapter | `PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT` |
| Segundo periodo | `PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT` |
| Favorabilidad | `PROVISIONAL_LOCKED_FOR_SIMULATION` |
| Participación | `PROVISIONAL_LOCKED_FOR_SIMULATION` |
| Respuestas | `LOCKED` |
| Delta | `PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT` |
| Distribución | `LOCKED` |
| Tolerancia de redondeo | `PROVISIONAL_LOCKED_PENDING_MOCK_CONTRACT` |
| Tendencia | `REUSABLE_AFTER_ADAPTER` |
| Segmentos | `LOCKED` |
| Capacidades | `LOCKED` |
| Insights | `OUT_OF_SCOPE` |
| Stepper | `LOCKED` |
| Acciones | `LOCKED` |
| Transición desde U3-SIM | `LOCKED` |
| Transición a Configurar | `LOCKED` (Disabled) |
| Fórmulas productivas | `DEFERRED` |
| Procesamiento real | `OUT_OF_SCOPE` |
| Chart candidato | `PROVISIONAL_LOCKED` |
| Responsive | `LOCKED` |
| Disclosure | `LOCKED` |

## 25. Matriz de riesgos
| Riesgo | Probabilidad | Impacto | Mitigación | Evidencia pendiente | Fase responsable |
| --- | --- | --- | --- | --- | --- |
| Acoplamiento directo a fixtures | Alta | Alto | Adapter obligatorio | Código | 4E3 / 4E4 |
| Datos hardcodeados en componentes | Alta | Alto | Props estrictas | Código | 4E4 |
| Segundo periodo inventado sin contrato | Media | Medio | Contrato mock en 4E3 | Doc | 4E3 |
| Delta inconsistente | Alta | Medio | Definición en 4E3 | Doc | 4E3 |
| Distribución fuera de tolerancia | Media | Alto | No normalizar, mostrar limited | Doc | 4E3 |
| Periodos incompatibles | Baja | Medio | Adapter validation | Código | 4E4 |
| Favorabilidad sin fórmula productiva | Alta | Medio | Estado PROVISIONAL | Doc | 4E3 |
| Participación ambigua | Media | Medio | Diferenciar de enviados | Doc | 4E3 |
| Exceso de cards | Alta | Medio | Grid compuesto | Diseño | 4E4 |
| Charts inaccesibles | Media | Alto | Aria-labels y texto alternativo | Código | 4E4 |
| Componente de chart incompatible | Media | Alto | Wrapper o fallback table | Código | 4E4 |
| Disclosure insuficiente | Baja | Alto | Banner permanente | Diseño | 4E4 |
| Usuario interpreta datos como reales | Alta | Alto | Disclosure claro | N/A | 4E1 |
| Insights que aparentan IA | Media | Alto | Limitar a reglas | Código | 4E3 |
| Navegación prematura | Media | Alto | Botón Continuar disabled | Código | 4E4 |
| Regresión de U3-SIM | Baja | Alto | No alterar U3-SIM reducer | Código | 4E4 |
| Responsive que oculta información | Media | Medio | CSS limits | QA visual | 4E4 |
| Uso indebido de segmentos | Baja | Bajo | Solo conteo | N/A | 4E1 |
| Muestras pequeñas | Media | Bajo | Mock controlado | Mock | 4E3 |
| Componentes futuros ausentes del inventario | Baja | Medio | Inventario estricto | N/A | 4E2.1 |

## 26. División Flash 3.0
1. Fase 4E3 · Mock Data Contract.
2. Contratos locales.
3. Configuración y copy.
4. Adapter sintético.
5. Componentes de identidad, disclosure y periodos.
6. KPI grid.
7. Distribución.
8. Tendencia.
9. Supporting summary.
10. Screen.
11. Integración con U3-SIM.
12. QA independiente.
13. Hotfix si aplica.
14. Cierre Git.

## 27. Autorización o bloqueo
**Autorizado** únicamente para `Fase 4E3 · Historical Preview Simulated Mock Data Contract`.
Construcción (TypeScript, adapters, componentes) sigue **bloqueada**.

## 28. Estado
COMPLETED
