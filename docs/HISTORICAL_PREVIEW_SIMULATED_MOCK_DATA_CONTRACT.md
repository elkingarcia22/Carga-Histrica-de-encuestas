# Fase 4E3.1 · Historical Preview Simulated Mock Data Contract Documentation Checkpoint Report

## 1. Resumen ejecutivo
La Fase 4E3.1 consolida y audita el "Mock Data Contract" para la pantalla `Historical Preview Simulated · Resumen histórico`. Se han corregido las ambigüedades documentales y establecido reglas exactas para deltas, distribución, participación, capacidades y la matriz de estados V1-V16, asegurando que los valores sintéticos no contradicen la semántica de los fixtures canónicos. Esta fase prohíbe la construcción funcional y asegura una base inmutable y determinística de los contratos locales antes de proceder.

## 2. Estado formal
`HISTORICAL_PREVIEW_SIM_MOCK_CONTRACT_CHECKPOINT_APPROVED`

## 3. Estado inicial de Git
- **Rama actual:** `main`
- **HEAD completo:** `26a7493a56f16d6d667422a31dfaee0cd3afbda9`
- **Mensaje de HEAD:** `docs(survey-import): lock simulated historical preview architecture`
- **origin/main:** `26a7493a56f16d6d667422a31dfaee0cd3afbda9`
- **Tracking:** Up to date con `origin/main`
- **Ahead:** 0
- **Behind:** 0
- **Working Tree:** Limpio
- **Staging:** Vacío
- **Untracked:** 1 (el propio documento)
- **Remotos:** `origin` presente, `upstream` intacto/ausente.

## 4. Separación de fuentes
| Campo de preview | Fuente existente | Campo exacto | Uso permitido | Requiere valor nuevo |
| ---------------- | ---------------- | ------------ | ------------- | -------------------- |
| scenarioId | `DERIVED_FROM_EXISTING_FIXTURE` | `scenarioId` / `id` | Identificación de sesión | No |
| previewId | `SYNTHETIC_PREVIEW_VALUE` | N/A | Referencia en UI | Sí (regla de adapter)|
| survey display name | `EXISTING_FIXTURE_VALUE` | `configuration.name` | Título en UI | No |
| survey type | `EXISTING_FIXTURE_VALUE` | `configuration.surveyType` | Metadato de tipo | No |
| mode | `EXISTING_FIXTURE_VALUE` | `data.mode` | Validación de modo | No |
| source label | `EXISTING_FIXTURE_VALUE` | `configuration.sourceSummary` | Fuente en UI | No |
| period count | `SYNTHETIC_PREVIEW_VALUE` | N/A | Validación: 2 | Sí |
| periodo base | `SYNTHETIC_PREVIEW_VALUE` | N/A | Mock "Q4 2024" | Sí |
| periodo comparativo | `DERIVED_FROM_EXISTING_FIXTURE`| `configuration.period` | Mapeo al mock | Sí |
| favorabilidad por periodo | `SYNTHETIC_PREVIEW_VALUE` | N/A | Valor contractual explícito| Sí |
| participación por periodo | `SYNTHETIC_PREVIEW_VALUE` | N/A | Valor contractual explícito| Sí |
| respuestas por periodo | `SYNTHETIC_PREVIEW_VALUE` | N/A | Valor contractual explícito| Sí |
| distribución por periodo | `SYNTHETIC_PREVIEW_VALUE` | N/A | Buckets sintéticos | Sí |
| delta | `SYNTHETIC_PREVIEW_VALUE` | N/A | Variación determinística | Sí |
| puntos de tendencia | `SYNTHETIC_PREVIEW_VALUE` | N/A | Extracción de métricas | Sí |
| capacidades | `EXISTING_FIXTURE_VALUE` | `preview.capabilities` | Grid de soporte | No |
| segmentos | `DERIVED_FROM_EXISTING_FIXTURE` | `data.segments.length` | Conteo resumido | No |
| insights | `SYNTHETIC_PREVIEW_VALUE` | N/A | Generación determinística| Sí |
| disclosure | `SYNTHETIC_PREVIEW_VALUE` | N/A | Aviso de simulación | Sí |
| estado de preview | `SYNTHETIC_PREVIEW_VALUE` | N/A | Determinación final | Sí |

Ningún campo está clasificado simultáneamente como existente y sintético.

## 5. Auditoría matemática
Tabla de comprobación matemática del escenario principal:
| Métrica | Base | Comparativo | Delta Matemático | Resultado Contrato |
|---------|------|-------------|------------------|--------------------|
| Favorabilidad | 68 | 74 | 74 - 68 = +6 | +6 |
| Participación | 82 | 85 | 85 - 82 = +3 | N/A (no expuesto)|
| Respuestas | 100 | 120 | N/A | N/A |
| Suma conteos Dist | 68+20+12 = 100 | 89+19+12 = 120 | N/A | Ok |
| Suma % Dist | 68+20+12 = 100% | 74+16+10 = 100%| N/A | Ok |
| `periodCount` | 2 |
| Orden cronológico | `base` antes de `comparativo` |

## 6. Favorabilidad y distribución
**Política seleccionada:** `INTEGER_DISPLAY_PERCENTAGE_POLICY`.
- En el escenario sintético, la favorabilidad contractual coincide numéricamente y de forma exacta con el porcentaje del bucket `favorable` (`period.metrics.favorability === period.distribution[favorable].percentage`).
- Los porcentajes de distribución de la primera preview se representan con precisión entera.
- Los conteos conservan precisión exacta.
- Los porcentajes deben ser compatibles con los conteos al redondear a cero decimales (`round(responseCount / totalResponses × 100) === percentage`).
- No se almacenan simultáneamente porcentajes enteros y decimales para el mismo bucket.
- La UI no recalcula porcentajes.
- El adapter valida, pero no corrige ni normaliza.

Esto no define la fórmula productiva, que continúa `DEFERRED`, sino que se utiliza para asegurar coherencia visual en el prototipo (estado `LOCKED_FOR_SIMULATION`) y no generar una pantalla con datos contradictorios.

## 7. Participación
La participación `participationRate` se tratará como un valor contractual explícito provisto por el contrato mock.
No se calculará dinámicamente derivándolo de respuestas, y no se introduce ninguna variable inventada `invitedCount`. Las variaciones sólo aplicarán internamente para generar insights, no como un KPI visual obligatorio aparte.
- Umbral de estabilidad: Diferencia absoluta ≤ 2 puntos porcentuales → participación estable.

## 8. Delta
- **Base:** 68
- **Comparativo:** 74
- **Delta:** +6
- **Unidad:** `percentage-points`
- **Dirección:** Positiva
- **Formato documental futuro:** `+6 pp`
- **Descripción accesible futura:** `aumentó 6 puntos porcentuales`

## 9. Distribuciones
**Periodo Base:**
| Categoría | Porcentaje | Conteo | Orden |
| --------- | ---------: | -----: | ----: |
| `favorable`| 68% | 68 | 1 |
| `neutral` | 20% | 20 | 2 |
| `unfavorable`| 12% | 12 | 3 |
*Suma conteo = 100, suma % = 100%. Respuestas = 100.*

**Periodo Comparativo:**
| Categoría | Porcentaje | Conteo | Orden |
| --------- | ---------: | -----: | ----: |
| `favorable`| 74% | 89 | 1 |
| `neutral` | 16% | 19 | 2 |
| `unfavorable`| 10% | 12 | 3 |
*Suma conteo = 120, suma % = 100%. Respuestas = 120.*

Ambas distribuciones son estrictamente compatibles y respetan la tolerancia de 99.9 a 100.1 sin normalización ni redistribución en frontend (para el escenario principal, la suma efectiva debe ser exactamente 100).

## 10. Tendencia
- Dos puntos exactos.
- Reutilizan los IDs de `base` y `comparativo`.
- Reutilizan la misma favorabilidad: 68 y 74.
- Reutilizan la misma participación: 82 y 85.
- Mantienen el orden cronológico.
- Copy conceptual: `Comparación entre dos periodos sintéticos` (no se admiten textos como "crecimiento sostenido").

## 11. Capacidades
Las capacidades provienen íntegramente del campo `preview.capabilities` del fixture original `aggregatedHappyPathScenario`.
El contrato las mapea sin inventar valores nuevos:
- `participation`: `available`
- `favorability`: `available`
- `area-comparison`: `available`
El conteo y estado coincidirán con el resumen usado en U3-SIM. No se autoriza navegación ni componentes interactivos de profundidad.

## 12. Segmentos
El contrato mock de preview extrae el total de segmentos pasivos del `data.segments.length` (que da `availableCount: 1`), indicando estado `available` y label correspondiente, sin mapear información personal ni usar los segmentos para generar insights en la vista principal.

## 13. Insights
Máximo 2 insights basados en reglas determinísticas marcados como `isSynthetic: true`.

1. **Insight de favorabilidad**
- `insightId`: `insight-favorability-delta`
- `type`: `positive`
- Condición exacta: `delta > 0`
- Título esperado: `Variación positiva`
- Descripción conceptual: `La favorabilidad aumentó respecto al periodo anterior.`
- Severity: `success`

2. **Insight de participación**
- `insightId`: `insight-participation-delta`
- `type`: `neutral`
- Condición exacta: Diferencia de `participationRate` entre `comparativo` y `base` es `|85 - 82| = 3`, es decir, `> 2`.
- Título esperado: `Variación de participación`
- Descripción conceptual: `La participación presentó variación frente al periodo base.`
- Severity: `info`

## 14. Escenario limited
`historical-preview-limited`
Causa controlada canónica: La distribución está fuera de la tolerancia matemática admitida (ej. suma 101.5%).
Mantiene disclosure, identidad y botón volver. No muestra comparación inventada ni completa con ceros engañosos.

## 15. Escenario empty
`historical-preview-empty`
Causa: Cero periodos renderizables.
Mantiene disclosure y estado `preview-empty`. Cero KPIs, cero distribución, cero tendencia. No contiene cards con valores 0 usados como sustituto de ausencia.

## 16. Escenario error-simulated
`historical-preview-error-simulated`
Causa: Contrato sintético inválido provisto, causando fallo controlado del adapter futuro.
No expone stacks ni errores de red. Posee acción volver. Código interno conceptual: `ERR_INVALID_SYNTHETIC_MOCK`.

## 17. Invariantes
1. `isSynthetic === true`.
2. IDs determinísticos.
3. Sin timestamps variables.
4. Sin archivos.
5. Sin binarios.
6. Sin URLs.
7. Sin callbacks.
8. Period count coherente (`=== 2`).
9. Roles únicos (`base` y `comparison`).
10. Orden cronológico (`base` ocurre antes).
11. Métricas en rango (0-100%).
12. Los conteos suman `totalResponses`.
13. Los porcentajes suman 100 (dentro de tolerancia 99.9% a 100.1% para escenarios futuros).
14. El porcentaje favorable coincide exactamente con favorabilidad.
15. Los porcentajes se expresan como enteros para el escenario principal.
16. Cada porcentaje coincide con el conteo redondeado a cero decimales.
17. El adapter no redondea ni corrige valores.
18. El fixture ya contiene los porcentajes finales aprobados.
19. Los componentes no recalculan distribución.
20. Delta expresado y calculado en puntos porcentuales y con dirección exacta.
21. Tendencia reutiliza métricas e IDs existentes.
22. Insights derivan de reglas justificables determinísticas explícitas.
23. Disclosure es persistente en todos los estados.
24. Ausencias representadas como no disponibles, sin ceros sustitutivos.
25. Sin datos reales.
26. Sin normalización silenciosa.

## 18. Matriz V1–V16
| ID | Caso | Entrada conceptual | Resultado esperado | Estado |
| -- | ---- | ------------------ | ------------------ | ------ |
| V1 | Escenario principal válido | 2 periodos, matemáticas correctas | Renderiza pantalla completa | `PREVIEW_READY` |
| V2 | Delta positivo correcto | Base 68, Comp 74, Delta +6 | Aceptado | `PREVIEW_READY` |
| V3 | Delta inconsistente | Base 68, Comp 74, Delta +10 | Rechazo de contrato (validación previa)| `CONTRACT_REJECTED` |
| V4 | Distribución exacta | % = conteo redondeado, suma = 100%, Fav = Bucket Favorable | Aceptado | `PREVIEW_READY` |
| V5 | Distribución fuera de tolerancia o desigual | Suma = 101.5% o favorabilidad ≠ bucket favorable | Adapter limita módulos | `PREVIEW_LIMITED` |
| V6 | Inconsistencia de conteo o redondeo | Conteos ≠ Respuestas o % ≠ conteo redondeado a cero decimales | Rechazo de contrato | `CONTRACT_REJECTED` |
| V7 | Un solo periodo | 1 periodo base | Adapter limita módulos | `PREVIEW_LIMITED` |
| V8 | Periodos desordenados | Comp anterior a Base | Rechazo de contrato | `CONTRACT_REJECTED` |
| V9 | Métrica fuera de rango | Participación = 150% | Rechazo de contrato | `CONTRACT_REJECTED` |
| V10| Favorabilidad fuera de rango | Favorabilidad = -5% | Rechazo de contrato | `CONTRACT_REJECTED` |
| V11| Métrica ausente | Participación null | Adapter limita a no disponible | `PREVIEW_LIMITED` |
| V12| Insight sin evidencia | Insight positivo pero Delta es -2 | Rechazo de contrato | `CONTRACT_REJECTED` |
| V13| Disclosure ausente | Faltan campos disclosure | Rechazo de contrato | `CONTRACT_REJECTED` |
| V14| `isSynthetic: false` | Estado falso reportado | Rechazo de contrato | `CONTRACT_REJECTED` |
| V15| Escenario vacío | 0 periodos | Adapter procesa vacío | `PREVIEW_EMPTY` |
| V16| Error sintético controlado | Falla al construir modelo desde test | Adapter falla controladamente | `PREVIEW_ERROR_SIMULATED` |

## 19. Versionado
- `contractId`: `historical-preview-simulated`
- `contractVersion`: `1.0`
- `status`: `approved`
- `contractDate`: `2026-06-11` (solo como metadato documental).
Cualquier inclusión de nuevos campos, cambio de semántica, o modificación de invariantes requerirá aumentar la versión.

## 20. Relación fixture–contrato–adapter
- **Fixtures existentes:** Son evidencia parcial e inmutable y no se modifican.
- **Mock Data Contract:** Es fuente de verdad para los valores sintéticos adicionales, reglas de validación y cálculo exacto del delta sintético.
- **Futuro adapter:** Importará las fuentes, validará estructura, derivará el delta según contrato, derivará insights determinísticamente, determinará el estado (V1-V16) y devolverá un modelo compacto, sin usar React.
- **Componentes:** Recibirán el modelo final y lo formatearán visualmente (ej. "+6 pp"), sin recalcular métricas ni revalidar dominio.

## 21. Consistencia arquitectónica
- Solo una pantalla (`SimulatedProcessingScreen`).
- Máximo cuatro KPIs.
- Dos periodos activos.
- Tendencia limitada a 2 puntos.
- Segmentos informativos pasivos.
- Máximo dos insights en el escenario principal.
- ARR, Retención, Expansión fuera de alcance.
- La etapa `Cargar` de `ImportWizardShell` sigue activa y no existe macroetapa 5.
- `Continuar a configuración` permanece deshabilitado.

## 22. Revisión de seguridad
- Secretos: 0
- Datos reales: 0
- Tokens/Bearer headers: 0
- URLs autenticadas o externas: 0
- Rutas locales/absolutas: 0
- Correos reales / Identificadores personales: 0
- Filenames reales en mock: 0

## 23. Inventario incluido
1. `docs/HISTORICAL_PREVIEW_SIMULATED_MOCK_DATA_CONTRACT.md`
2. `docs/PROMPT_LOG.md`

## 24. Archivos excluidos
Todo el directorio `src/**` permanece intacto. No hay UI, no hay scripts ejecutables, ni cambios de dependencias.

## 25. Staging
Se han preparado los dos únicos archivos autorizados explícitamente sin utilizar comandos masivos.

## 26. Commit
Mensaje único: `docs(survey-import): lock simulated historical preview mock contract`

## 27. Push
Push limpio a `origin main`.

## 28. Estado final
`HISTORICAL_PREVIEW_SIM_MOCK_CONTRACT_CHECKPOINT_APPROVED`

## 29. Confirmación de integridad
La separación de fuentes, matemáticas de deltas, distribuciones e invariantes del contrato se validaron de forma estricta asegurando un ambiente libre de ambigüedades. No se incluyeron modificaciones a código de dominio, ni al framework, ni adiciones de UI.

## 30. Autorización o bloqueo para Fase 4E4
Queda **AUTORIZADA** la siguiente etapa documental:
**Fase 4E4 · Historical Preview Simulated Local Contract and Adapter Build Planning**
La cual podrá definir:
- Tipos locales futuros.
- Configuración.
- Archivos exactos.
- Imports autorizados e invariantes ejecutables.
- Tareas de build para Flash 3.0.
Aún NO se autoriza la creación de los componentes ni de los archivos `.ts`/`.tsx`.

## 31. Estado
COMPLETED
