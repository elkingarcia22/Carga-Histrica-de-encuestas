# Historical Load Draft Review Architecture

## 1. Purpose

Definir la revisión del Historical Load Draft como paso humano de control antes de una fase futura.

- No importa datos.
- No crea catálogos globales.
- No aprueba automáticamente.
- No compara encuestas.
- No genera dashboard.
- Solo prepara una revisión formal del borrador.

## 2. Current State

El sistema ya cuenta con:
- carga conversacional,
- parser local,
- contract assembler,
- selección de grupo,
- Matching Engine,
- decisiones explicadas,
- Historical Load Draft builder,
- integración conversacional del resumen,
- QA de integración aprobada,
- determinismo validado.

## 3. Review Entry Conditions

Cuándo se puede entrar al modo revisión:
- existe Historical Load Draft,
- no hay raw JSON visible,
- se conoce status del draft,
- se conoce readiness summary,
- se conoce política PII,
- se conocen unresolvedDecisions,
- se conocen blockingRisks.

Si hay decisiones pendientes:
No mostrar revisión final como aprobable.
Continuar one-decision-at-a-time.

## 4. Review States

not_ready
needs_decisions
blocked_by_risk
ready_for_human_review
approved_for_later_import_phase

No usar:
readyForComparison
comparisonReady
dashboardReady
productionImported

## 5. Review Information Architecture

Secciones visibles futuras:
Resumen ejecutivo
Estado del borrador
Archivos considerados
Grupo de encuesta
Ciclo histórico
Homologaciones principales
Entidades survey-only
Política PII/participantes
Riesgos bloqueantes
Decisiones pendientes
Auditoría resumida
Acciones disponibles

No mostrar:
raw rows
full contract JSON
full MatchingResult
full HistoricalLoadDraft
emails completos
documentos completos
debug IDs como copy principal

## 6. Review Actions

Acciones futuras permitidas:
Resolver siguiente decisión pendiente
Revisar riesgos
Marcar para revisión posterior
Confirmar como listo para fase futura
Volver al resumen

Acciones prohibidas:
Importar ahora
Crear datos globales
Actualizar catálogo
Enviar a producción
Generar comparativo
Ir a dashboard
Conectar Claude
Guardar en backend

## 7. Approval Policy

La aprobación no ocurre automáticamente.
La aprobación solo puede ser “aprobado para fase futura de importación”.
No implica importación real.
No implica persistencia.
No implica creación de catálogos.
No implica comparación.

Condiciones mínimas para “approved_for_later_import_phase”:
unresolvedDecisionsCount = 0
blockingRisksCount = 0
PII policy reviewed
survey-only entities explicitly acknowledged
human confirmation received

## 8. Blocking Rules

Bloquear revisión/aprobación si:
hay decisiones pendientes,
hay riesgos PII sin resolver,
hay escala incompatible no aceptada,
hay preguntas nuevas sin decisión,
hay valores survey-only sin reconocimiento,
hay errores estructurales críticos.

## 9. PII and Data Minimization Policy

NO_RAW_ROWS_RENDERED = YES
NO_FULL_CONTRACT_DUMP = YES
NO_FULL_MATCHING_RESULT_DUMP = YES
NO_FULL_HISTORICAL_LOAD_DRAFT_DUMP = YES
NO_EMAILS_OR_DOCUMENTS_VISIBLE = YES
NO_STORAGE_CREATED = YES
NO_BACKEND_CREATED = YES
NO_CLAUDE_CONNECTION_CREATED = YES
LOCAL_ONLY_PROCESSING = YES

## 10. Audit and Traceability

La futura revisión mostrará auditoría resumida:
qué archivos entraron,
qué grupo se seleccionó,
qué decisiones se resolvieron,
qué riesgos quedaron,
qué política PII fue elegida,
qué quedó survey-only.

No mostrar logs técnicos completos ni IDs internos como copy principal.

## 11. Out of Scope

import final
persistencia en base de datos
APIs
Claude/LLM enrichment
creación de catálogos globales
dashboard comparativo
ARR/retention analysis
reportes comparativos
rutas nuevas
pantallas nuevas
export final
aprobación automática

## 12. Future Phase Plan

Fase 11B · Historical Load Draft Review Type Scaffolding
- crear tipos/contrato de revisión si son necesarios.
- sin UI.

Fase 11C · Historical Load Draft Review Mapper
- mapear draft + readiness + decisions a review model.
- sin UI nueva.

Fase 11D · Historical Load Draft Review UI Build
- mostrar revisión conversacional final.
- visible UI checkpoint YES.

Fase 11E · Historical Load Draft Review QA
- validar privacidad, gating, copy y boundaries.
