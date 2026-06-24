# Draft Preparation Architecture

## 1. Propósito
Draft Preparation Architecture define cómo convertir una estructura histórica revisada en un borrador local, seguro y verificable antes de cualquier carga real.

## 2. Qué es un Historical Load Draft
Un Historical Load Draft es una representación intermedia de la encuesta histórica preparada para revisión, no una carga ejecutada.

Debe incluir:
- metadata de encuesta;
- ciclos;
- archivos fuente referenciados;
- dimensiones resueltas;
- preguntas resueltas;
- mapeos pregunta-dimensión resueltos;
- métricas agregadas disponibles;
- demográficos seguros;
- segmentos/cortes;
- decisiones pendientes o resueltas;
- boundary de privacidad;
- estado de preparación.

## 3. Qué NO es
- no es importación real;
- no guarda datos;
- no envía datos a API;
- no crea encuesta productiva;
- no crea dashboard comparativo;
- no activa readyForComparison;
- no incluye respuestas individuales;
- no incluye comentarios abiertos;
- no incluye PII;
- no incluye raw rows;
- no incluye dumps de workbook.

## 4. Entradas
- Source Fixture Layer
- Review Overlay Layer
- Resolved View Layer
- Privacy Boundary
- Review Decisions

## 5. Resolved View como fuente del borrador
- labels renombrados por overlay si existen;
- labels source si no hay overlay;
- mapeos fuente;
- futuros mapeos overlay cuando estén autorizados;
- estados de decisión;
- demográficos seguros confirmados o pendientes.

## 6. Entidades del borrador
- HistoricalLoadDraft
- HistoricalLoadDraftSurvey
- HistoricalLoadDraftCycle
- HistoricalLoadDraftSourceFile
- HistoricalLoadDraftDimension
- HistoricalLoadDraftQuestion
- HistoricalLoadDraftQuestionMapping
- HistoricalLoadDraftMetric
- HistoricalLoadDraftDemographic
- HistoricalLoadDraftSegment
- HistoricalLoadDraftReviewDecision
- HistoricalLoadDraftPrivacyBoundary
- HistoricalLoadDraftReadiness

## 7. Estados del borrador
- not_started
- ready_to_prepare
- draft_created
- needs_review
- blocked_by_privacy
- blocked_by_missing_mapping
- approved_for_future_import

*Nota:* `approved_for_future_import` no ejecuta importación ni persistencia.

## 8. Reglas de readiness
- hay al menos un ciclo;
- hay al menos una dimensión;
- hay preguntas asociadas a dimensiones;
- hay métricas agregadas identificadas;
- privacyBoundary no bloquea;
- no hay PII incluida;
- no hay raw rows incluidas;
- no hay decisiones blocking sin resolver.

## 9. Bloqueos de readiness
- missing_cycles
- missing_dimensions
- missing_questions
- missing_question_dimension_mapping
- missing_metrics
- privacy_boundary_blocked
- pii_detected
- raw_rows_detected
- unresolved_blocking_decisions
- unsupported_file_set

## 10. Preview futuro del borrador
- Resumen del borrador;
- Encuesta/ciclo;
- Cantidad de dimensiones;
- Cantidad de preguntas;
- Cantidad de métricas;
- Cantidad de demográficos;
- Cantidad de segmentos;
- Cambios locales aplicados;
- Bloqueos pendientes;
- Estado de privacidad.

## 11. Acción futura “Preparar borrador”
Solo podrá aparecer después de:
- revisión estructural visible;
- overlay local aplicado o descartado;
- readiness evaluado;
- no hay bloqueos críticos.

*Nota:* Esta fase no construye la acción “Preparar borrador”.

## 12. Privacidad
- realResponsesIncluded = false
- openTextIncluded = false
- piiIncluded = false
- rawRowsIncluded = false
- workbookDumpIncluded = false
- apiConnected = false
- storageConnected = false
- claudeConnected = false

## 13. Relación con ARR / Retención / Expansión
Un borrador seguro reduce fricción operativa para equipos Customer Success y People Analytics, acelera la preparación de históricos y habilita futuros análisis de retención, expansión y ARR sin exponer datos sensibles ni crear cargas productivas prematuras.

## 14. Relación con fases futuras
- 11D-H36 · Draft Preparation Types
- 11D-H37 · Draft Readiness Mapper
- 11D-H38 · Draft Preview UI
- 11D-H39 · Draft Preview Visual QA
- 11D-H40 · Hotfix si aplica
- 11D-H41 · Import Execution Decision Gate
