# Historical Load Draft Integration Architecture

## 1. Purpose
Definir cómo se integrará el Historical Load Draft al flujo conversacional.

Debe quedar claro que el draft resume la preparación de una carga histórica, no compara encuestas ni genera dashboard.

## 2. Current State
El sistema ya tiene:
- carga conversacional de archivos
- parser local
- contract assembler
- selección de grupo de encuesta
- Matching Engine v1
- integración de Matching Engine al chat
- decisiones explicadas
- builder determinístico del Historical Load Draft
- data minimization
- no storage/backend/Claude

## 3. Integration Point
El draft se construirá después de:
- contract assembly
- survey group selection
- matching engine execution
- matching decision review
- PII/participant decisions
- survey-only value/question decisions

Flujo objetivo:
Files submitted
→ Parser preview
→ Contract assembly
→ Survey group selection if needed
→ Matching Engine
→ Explained decisions one at a time
→ Decision resolutions
→ Historical Load Draft builder
→ Draft conversational summary
→ Later phase: review/approval

## 4. Input Mapping
Insumos mapeados al builder:
- selected survey group → sourceSurveyGroup
- uploaded file summaries → sourceFiles
- assembled contract identity → surveyIdentity
- period/year/cycle detection → historicalCycle
- contract summary → assembledContractSummary
- matching result/candidates → matchingCandidates
- resolved decisions → resolvedDecisions
- pending decisions → unresolvedDecisions
- parser/matching warnings → warnings
- matching/build events → auditEvents
- PII decision → participantPolicy

No pasar:
- raw rows
- full contract JSON
- raw MatchingResult dump
- emails completos
- números de documento completos
- identificadores completos
- backend records
- Claude output

## 5. Output Mapping to Chat
Cómo el `HistoricalLoadDraft` se resumirá en conversación.

El resumen visible debe incluir:
- estado del draft
- grupo de encuesta seleccionado
- archivos considerados
- ciclo histórico
- cantidad de demográficos homologados
- cantidad de valores survey-only
- cantidad de preguntas homologadas
- cantidad de preguntas históricas nuevas
- estado de compatibilidad de escalas
- política PII/participantes
- decisiones pendientes
- riesgos bloqueantes

No debe mostrar:
- raw JSON
- raw rows
- full contract
- full MatchingResult
- emails/documentos completos
- debug IDs como copy principal

## 6. Draft Review UX Policy
La futura UI conversacional debe mostrar:
- resumen ejecutivo de preparación
- riesgos y pendientes
- decisiones restantes one-decision-at-a-time
- acciones claras
- consecuencias visibles

No debe mostrar dashboard ni pantalla nueva en esta fase.

## 7. Status Display Policy
Copy esperado por status:
- drafting → Preparando borrador de carga histórica
- needs_decisions → Faltan decisiones para completar el borrador
- ready_for_review → Borrador listo para revisión
- blocked_by_risk → Borrador bloqueado por riesgo pendiente
- approved_for_later_import → Aprobado para una fase futura de importación

No usar:
- readyForComparison
- comparisonReady
- dashboardReady

## 8. Human Review Policy
Reglas de revisión humana:
- El Historical Load Draft no se aprueba automáticamente.
- Si unresolvedDecisionsCount > 0, debe continuar one-decision-at-a-time.
- Si blockingRisksCount > 0, debe bloquear aprobación.
- PII requiere decisión explícita.
- Survey-only entities deben ser visibles como alcance local de la carga histórica.

## 9. Data Minimization and Privacy
- NO_RAW_ROWS_RENDERED = YES
- NO_FULL_CONTRACT_DUMP = YES
- NO_FULL_MATCHING_RESULT_DUMP = YES
- NO_EMAILS_OR_DOCUMENTS_VISIBLE = YES
- NO_STORAGE_CREATED = YES
- NO_BACKEND_CREATED = YES
- NO_CLAUDE_CONNECTION_CREATED = YES
- LOCAL_ONLY_PROCESSING = YES

## 10. Technical Boundaries
No modificar en la futura integración sin fase específica:
- local-parser
- contract-assembler
- matching-engine core
- historical-load-draft builder
- mock-ubits-catalogs
- survey-file-analysis
- shadcn/ui base
- package files
- routes
- dashboard

La futura fase de build podrá crear un mapper/adaptador en `conversational-import`, pero no debe cambiar el builder ni el matching engine core.

## 11. Out of Scope
Queda explícitamente fuera:
- database persistence
- API calls
- Claude/LLM enrichment
- global catalog creation
- dashboard comparativo
- ARR/retention analysis
- comparison reports
- new route
- new screen
- export/import final
- production import
- automatic approval

## 12. Future Phase Plan
Próximas fases:

Fase 10E · Historical Load Draft Integration Build
- conectar builder después de resolver decisiones de matching
- mapear draft a resumen conversacional
- mantener one-decision-at-a-time para pendientes
- visible UI checkpoint YES

Fase 10F · Historical Load Draft Integration QA
- validar resumen visible
- validar privacidad
- validar no raw JSON
- validar no dashboard/comparativo

Fase 11A · Historical Load Draft Review Architecture
- definir revisión/confirmación final del borrador antes de fases futuras de importación
