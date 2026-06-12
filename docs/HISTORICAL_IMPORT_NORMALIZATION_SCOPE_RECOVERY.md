# Fase 4E-R0 · Historical Import Normalization Scope Recovery Audit Report

## 1. Resumen ejecutivo
La Fase 4E-R0 ejecuta una auditoría documental y técnica de recuperación sobre la línea 4E del prototipo. Se identificó una desviación temprana de dominio que reorientó el flujo de carga histórica hacia una vista analítica y comparativa de favorabilidad, participación e insights (dashboard), alejándose de su propósito real: la normalización y mapeo estructural de datos externos hacia el modelo UBITS. Este informe documenta la desviación, bloquea los desarrollos desviados, evalúa el inventario existente, rescata los patrones reutilizables y establece las bases conceptuales para recuperar la Fase 4E bajo el dominio correcto de importación.

## 2. Estado formal
`HISTORICAL_IMPORT_NORMALIZATION_SCOPE_RECOVERED`

## 3. Gate inicial
Verificación y reporte inicial completado:
- **Rama actual:** `main`
- **HEAD completo:** `9ea624f1b8044bf40de32d89ba18a45344dd81cd`
- **Mensaje de HEAD:** `docs(survey-import): align historical preview mock contract math`
- **origin/main:** Coincide con HEAD (`9ea624f1b8044bf40de32d89ba18a45344dd81cd`)
- **Tracking:** `origin/main`
- **Ahead/Behind:** 0 / 0
- **Staging:** Vacío
- **Working Tree / Untracked:** Solamente contiene los cuatro archivos autorizados (`docs/PROMPT_LOG.md` modificado, y `src/config/survey-import/historicalPreviewConfig.ts`, `src/lib/survey-import/historical-preview/historicalPreviewTypes.ts`, `src/mocks/survey-import/historical-preview/historicalPreviewScenarios.ts` untracked).
- **Remotos:** `origin` y `upstream` presentes y sincronizados.

## 4. Objetivo funcional recuperado
El flujo "Carga Histórica de Encuestas" busca recibir archivos de encuestas finalizadas de plataformas externas, detectar su estructura, identificar la información (preguntas, registros, metadata) y prepararla para ser importada al modelo UBITS permitiendo al humano mapear campos y resolver incidencias.
**No debe tener como objetivo primario** comparar favorabilidad, calcular eNPS, mostrar tendencias analíticas ni evaluar insights de clima. La analítica será posterior a la importación y pertenece a otro dominio del producto.

## 5. Punto exacto de desviación
La desviación ocurrió durante las definiciones iniciales de la Fase 4E (particularmente en `docs/HISTORICAL_PREVIEW_SIMULATED_INTAKE.md`), al concebir la "Historical Preview" como un dashboard de comparación de métricas (Periodo Base vs Comparativo, Favorabilidad, Participación, Insights), heredando lógicas analíticas productivas tempranamente y omitiendo el paso crucial de mostrar la estructura interpretada, las incidencias y el mapeo.

## 6. Flujo correcto U1–U5
- **U1 · Selección:** Recibir archivos; no leer contenido.
- **U2 · Archivos seleccionados:** Validación superficial; administración del lote; boundary binario.
- **U3-SIM · Procesamiento inicial simulado:** Simular inspección estructural y preparación de normalización; no producir analítica.
- **Futura U4-SIM · Vista previa de normalización histórica:** Mostrar estructura detectada, interpretación de datos, incidencias y estado del mapeo. Preparar el paso a configuración.
- **Futura U5-SIM · Configuración y mapeo:** Confirmar mapeos, elegir tratamientos y preparar la importación final.

## 7. Frontera U3-SIM–U4-SIM
La transición de U3-SIM a U4-SIM abandona la simulación del procesamiento binario y traslada al usuario a una pantalla que muestra qué se entendió del archivo (estructuras, hojas, preguntas, registros), para que evalúe las incidencias detectadas y entienda qué normalizaciones se propondrán antes de configurar. No se transfiere favorabilidad agregada.

## 8. Primera pantalla correcta
**Nombre recomendado:** `Vista previa de normalización`

**Objetivo de la pantalla:** Permitir comprender qué archivos fueron reconocidos, qué estructura se detectó, qué periodos y preguntas se encontraron, qué campos requieren mapeo y cuáles son las incidencias estructurales que bloquean o requieren revisión humana antes de confirmar la importación.

## 9. Información candidata
- **Identidad de la importación:** Archivos incluidos, plataforma origen simulada, tipo de archivo, modo detectado (respuestas individuales, resultados agregados, formato desconocido), cantidad de hojas.
- **Resumen estructural:** Periodos, preguntas, registros o respuestas, y columnas detectadas/reconocidas/sin mapear/ignoradas.
- **Estado de normalización:** Listo para configurar, requiere revisión, bloqueado, sin datos suficientes, error simulado.
- **Mapeo preliminar:** Campo externo, campo UBITS propuesto, confianza simulada y estado (reconocido, requiere confirmación, no reconocido, ignorado).
- **Incidencias:** Headers faltantes, columnas duplicadas, tipos inconsistentes, valores vacíos, periodos ambiguos, preguntas duplicadas, opciones no normalizadas, datos insuficientes.
- **Acciones:** Volver al procesamiento, volver a archivos, revisar incidencias, continuar a configuración, cancelar flujo.

## 10. Inventario de código local
| Ruta | Estado Git | Publicado | Propósito actual | Dependencia |
|------|------------|-----------|------------------|-------------|
| `historicalPreviewTypes.ts` | Untracked | No | Contrato local de UI desviado | Ninguna |
| `historicalPreviewConfig.ts` | Untracked | No | Configuración y copy UI desviado | types |
| `historicalPreviewScenarios.ts` | Untracked | No | Fixtures de datos sintéticos analíticos | types |

## 11. Inventario de documentación publicada
| Documento | Commit de introducción (Aprox) | Decisiones válidas reutilizables | Decisiones de dominio incorrecto | Estado recomendado | Documento futuro que lo reemplazará |
|-----------|-------------------------|----------------------------------|----------------------------------|--------------------|--------------------------------------|
| `HISTORICAL_PREVIEW_SIMULATED_INTAKE.md` | `a002fa35` | Base de estados UI simulados, U3-SIM handoff | Dashboard B2B, KPIs, distribución, base/comp | `SUPERSEDED_IN_FULL` | `Fase 4E-R1 Intake` |
| `HISTORICAL_PREVIEW_SIMULATED_ARCHITECTURE.md` | `26a7493a` | Orquestador, adapter puro, no-react UI states | Modelos analíticos, Tolerancias, Componentes Chart | `SUPERSEDED_IN_FULL` | Futura Arq |
| `HISTORICAL_PREVIEW_SIMULATED_MOCK_DATA_CONTRACT.md` | `9ea624f1` | Matrices de validación, Invariantes sintéticos, issues seguros | Favorabilidad, Participación, Deltas, Tolerancias matemáticas | `SUPERSEDED_IN_FULL` | Futuro Contract |
| `HISTORICAL_PREVIEW_SIMULATED_BUILD_PLAN.md` | `dfaa881` | Tipos estrictos cerrados, 4 capas, Invariantes | Tipos de KPIs, Tendencias, Modos analíticos | `SUPERSEDED_IN_FULL` | Futuro Build Plan |
| `HISTORICAL_PREVIEW_BUILD_PLAN_GIT_AUDIT.md` | `9671f25` | Resumen de sanidad Git | N/A | `REFERENCE_ONLY` | N/A |

## 12. Artefactos que se preservan
- U1 (Selección)
- U2 (Archivos) y binary boundary
- Validaciones superficiales
- U3-SIM (Procesamiento) y su reducer
- Timers y cancelación
- Secuencia multiarchivo
- Disclosure
- Separación de responsabilidades: types/config/fixture/adapter
- Issues seguros
- Datos sintéticos
- Ausencia de APIs reales y lectura binaria
- No persistencia de archivos

## 13. Artefactos que requieren refactor
- **`historicalPreviewTypes.ts`**: `REFACTOR`.
  - *Reutilizable*: Patrones de Scenario/Model/AdapterResult, unión discriminada de éxito y fallo, issues seguros, readonly, ausencia explícita.
  - *A retirar*: Favorabilidad, delta, distribución favorable, trend, insights comparativos, `aggregated-comparison`.
- **`historicalPreviewConfig.ts`**: `REFACTOR`.
  - *Reutilizable*: Disclosure, textos de estados, acciones, accesibilidad, mensajes seguros.
  - *A retirar*: Labels de favorabilidad, labels de distribución analítica, copy de variación.

## 14. Artefactos que deben ser superseded
Los documentos analíticos mencionados (Intake, Arch, Contract, Build Plan de `HISTORICAL_PREVIEW_SIMULATED`) pasan a estar superseded. No se deben borrar ni reescribir la historia en Git, sino que quedarán formalmente reemplazados por documentación futura.

## 15. Estado de archivos locales no publicados
- `historicalPreviewTypes.ts`: Recomendar Refactor/Rename.
- `historicalPreviewConfig.ts`: Recomendar Refactor/Rename.
- `historicalPreviewScenarios.ts`: Recomendar `DISCARD_LOCAL_UNCOMMITTED` o `REPLACE`. Sus valores analíticos (Q4 2024, Q1 2025, 68, 74 y 6 pp) no corresponden de ninguna manera al flujo estructural de normalización de importación.

## 16. Matriz de recuperación
| Decisión              | Opciones                              | Recomendación | Estado   |
| --------------------- | ------------------------------------- | ------------- | -------- |
| Nombre de pantalla    | Vista previa / Resumen / Estructura   | Evaluar       | OPEN     |
| Artefactos 4E locales | Refactorizar / Reemplazar / Descartar | Auditar       | OPEN     |
| Documentos publicados | Borrar / Reescribir / Supersede       | Supersede     | LOCKED   |
| U3-SIM                | Mantener / Rehacer                    | Mantener      | LOCKED   |
| Analítica comparativa | Mantener aquí / Diferir               | Diferir       | LOCKED   |
| IA para mapping       | Ahora / Después                       | Después       | DEFERRED |
| Datos reales          | Permitidos / Prohibidos               | Prohibidos    | LOCKED   |

## 17. IA-first
La evaluación de Inteligencia Artificial para sugerir mapeos de columnas ambiguas, equivalencias de preguntas, detectar headers o resumir incidencias se designa con estado:
`VALUABLE_LATER_AFTER_DETERMINISTIC_MAPPING`
No se autoriza: llamadas externas, LLMs, clasificación remota, promesas de inferencia real ni generación sin revisión humana.

## 18. Riesgos
1. Persistir con el modelo analítico incorrecto.
2. Perder trabajo reutilizable (issues seguros, uniones discriminadas) al borrar archivos apresuradamente.
3. Commitear archivos locales desviados y dañar `main`.
4. Reescribir historia documental.
5. Mezclar profiling real con simulación.
6. Mostrar una normalización falsa como real.
7. Convertir la futura screen en un dashboard.
8. Construir demasiadas pantallas a la vez.
9. Introducir IA antes de un mapping determinístico.
10. Romper U3-SIM al cambiar su handoff.

## 19. Archivos creados y modificados
- **Creado:** `docs/HISTORICAL_IMPORT_NORMALIZATION_SCOPE_RECOVERY.md`
- **Modificado:** `docs/PROMPT_LOG.md`

## 20. QA de integridad
- `src/**` no sufre alteraciones.
- Nada se añadió al staging, nada se eliminó ni renombró.
- Package.json / lockfile intactos sin instalaciones.
- Cero commits y cero push de la IA.
- U1, U2 y U3-SIM no sufren alteraciones.
- No se construye U4, ni adapter, ni nuevos fixtures.
- Secretos: 0; datos reales: 0; clientes: 0; filenames reales: 0; rutas absolutas expuestas: 0; credenciales: 0.

## 21. Autorización o bloqueo para Fase 4E-R1
Queda **AUTORIZADA** únicamente:
**Fase 4E-R1 · Historical Import Normalization Prototype Intake**
Esa fase documental deberá validar: el objetivo exacto, el usuario principal, la primera pantalla correcta, la estructura esperada, los escenarios mock, los estados, acciones, criterios de éxito, oportunidades de IA y su relación con U3-SIM.
No se autoriza la creación de UI, tipos, config, fixtures ni adapters todavía.

## 22. Estado
COMPLETED
