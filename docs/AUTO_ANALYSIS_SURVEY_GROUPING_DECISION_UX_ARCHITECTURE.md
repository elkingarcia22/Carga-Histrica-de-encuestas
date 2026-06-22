# AUTO_ANALYSIS_SURVEY_GROUPING_DECISION_UX_ARCHITECTURE.md

## 1. Purpose
Definir el ajuste de UX para que la importación funcione como un chat inteligente: el usuario adjunta archivos, el sistema analiza automáticamente en local, informa progreso y guía decisiones una por una.

## 2. Current Problem
Documentar:
- existe confirmación manual “Continuar análisis local”,
- el flujo parece pedir permiso innecesario,
- el reporte aparece demasiado directo,
- no detecta correctamente múltiples encuestas/ciclos,
- las acciones de decisión son genéricas.

## 3. Target UX
Definir:
- usuario adjunta archivo desde composer,
- sistema responde “Recibí los archivos”,
- sistema muestra “Estoy analizando la estructura…”,
- sistema revela hallazgos por pasos,
- si hay múltiples encuestas, muestra grupos detectados,
- decisión actual tiene acciones contextuales.

## 4. Non-blocking Local Analysis Notice
Sustituir el safety gate bloqueante por un aviso informativo:
- análisis local en navegador,
- sin almacenamiento,
- sin Claude,
- sin backend,
- posible detección de PII,
- usuario puede cancelar adjunto antes de enviar,
- después de enviar, análisis local inicia automáticamente.

## 5. Thinking / Analysis State
Definir estados:
- files_received
- grouping_files
- parsing_in_progress
- contract_assembly_in_progress
- structural_summary_ready
- decision_review_in_progress

El chat debe mostrar estado tipo “Estoy analizando…” antes del reporte.

## 6. Progressive Report Reveal
Definir que el reporte no aparece todo de golpe.
Orden sugerido:
1. Archivos recibidos.
2. Agrupación de encuestas detectada.
3. Hoja/header detectado.
4. Columnas detectadas.
5. Riesgos/warnings.
6. Primera decisión requerida.

## 7. Multi-survey Grouping
Definir agrupación por:
- nombre de archivo,
- año detectado: 2024, 2025, etc.,
- tipo de encuesta: Clima, Pulso, Engagement,
- archivos total vs segmentados por gerencia,
- similitud de headers,
- metadata de parser cuando esté disponible.

Ejemplo esperado:
- “Detecté 2 encuestas posibles: Clima 2025 y Clima 2024.”
- “Clima 2025 parece tener archivos total + segmentados por gerencia.”
- “Clima 2024 parece ser otra encuesta/ciclo.”

## 8. Survey Selection Decision
Si hay más de una encuesta, la decisión actual debe ser contextual:
- “¿Cuál encuesta quieres procesar primero?”
Acciones:
- “Procesar Clima 2025”
- “Procesar Clima 2024”
- “Ver detalle de grupos”
- “Cancelar”

No usar:
- Resolver ahora
- Revisar siguiente

## 9. Decision Action Rules
Las acciones deben depender del tipo de decisión:
- select_primary_survey_group → opciones de grupo detectado
- select_primary_sheet → nombres de hojas
- confirm_anonymity → “Confirmar anónima” / “Tiene identificadores”
- accept_or_exclude_pii_columns → “Excluir columnas PII” / “Continuar con alerta”
- confirm_demographic_mapping → “Confirmar mapeo” / “Solicitar ajuste”
- create_survey_only_demographic_value → “Crear solo para esta encuesta” / “No crear”
- confirm_new_question → “Confirmar pregunta nueva” / “Marcar no comparable”
- resolve_ambiguous_column → acciones según columna

## 10. Generic Actions Disabled
Bloquear:
- Resolver ahora
- Revisar siguiente
- Continuar genérico
cuando exista una decisión concreta.

## 11. Chat Body Responsibility
El chat body muestra:
- mensajes,
- análisis progresivo,
- resumen compacto,
- decisión actual,
- confirmación de resolución.

No muestra:
- cola completa de decisiones,
- contrato completo,
- grid de archivos,
- JSON masivo.

## 12. Data Minimization
Definir:
- máximo 3 archivos en resumen,
- contador +X archivos,
- no MIME largo,
- no filas completas,
- no emails/documentos completos,
- no contrato completo.

## 13. Parser / Assembler Boundary
Parser y assembler no cambian en esta fase futura salvo necesidad explícita.
La agrupación inicial puede comenzar desde metadata/nombres de archivo y luego reforzarse con parser preview.

## 14. Out of Scope
- implementación,
- matching engine,
- Claude,
- backend,
- storage,
- dashboard,
- comparación,
- datos reales.

## 15. Phase Plan
- Fase 8D-H4B: Auto Analysis, Survey Grouping & Decision UX Build.
- Fase 8D-H4C: Auto Analysis, Survey Grouping & Decision UX QA.
- Luego retomar reconciliación 9B si aplica.
- Luego Fase 9C.
