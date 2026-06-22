# Historical Load Draft Architecture

## 1. Purpose
The Historical Load Draft is the internal contract prepared after resolving all matching decisions. It is not a dashboard nor a visual comparison. Its purpose is to define exactly what is ready to be imported into the historical database, what has been matched to existing global records, what remains as a survey-only entity, what human decisions were made, and what risks or pending items remain.

It answers the following questions:
- ¿Qué quedó listo para cargar históricamente?
- ¿Qué quedó homologado?
- ¿Qué quedó como nuevo solo para esta encuesta histórica?
- ¿Qué decisiones humanas se tomaron?
- ¿Qué riesgos o pendientes quedan?

## 2. Current State
The current flow already includes:
- carga conversacional de archivos
- parser local
- contract assembler
- selección de grupo de encuesta
- Matching Engine v1
- integración de matching al chat
- decisiones explicadas
- revisión one-decision-at-a-time
- manejo de PII/participantes
- data minimization

## 3. Draft Creation Point
The Historical Load Draft is created strictly **after**:
- contract assembly
- survey group selection
- matching engine execution
- required matching decisions
- PII/participant decisions
- survey-only value/question decisions

**Proposed Flow:**
Files submitted → Parser preview → Contract assembly → Survey group selection if needed → Matching Engine → Explained decisions one at a time → Decision resolutions → Historical Load Draft → Later phase: review/approval

## 4. Draft Input Contract
The draft receives the following inputs:
- selected survey group
- source file metadata
- parsed structural summary
- assembled survey contract
- matching candidates
- resolved matching decisions
- survey-only decisions
- PII handling decisions
- warnings and audit events

It **must not** receive or expose:
- raw full rows
- complete participant identifiers
- full emails
- full document numbers
- raw MatchingResult JSON
- backend records
- Claude output
- global catalog mutations

## 5. Draft Output Contract
The conceptual blocks of the Historical Load Draft are:
- `draftId`
- `status`
- `sourceSurveyGroup`
- `sourceFiles`
- `surveyIdentity`
- `historicalCycle`
- `demographicsMapping`
- `demographicValuesMapping`
- `questionsMapping`
- `dimensionsMapping`
- `responseScalesMapping`
- `participantPolicy`
- `surveyOnlyEntities`
- `excludedFields`
- `warnings`
- `resolvedDecisions`
- `unresolvedDecisions`
- `auditTrail`
- `readinessSummary`

## 6. Status Model
Allowed states for the draft:
- `drafting`
- `needs_decisions`
- `ready_for_review`
- `blocked_by_risk`
- `approved_for_later_import`

**Prohibited states:** `readyForComparison`, `comparisonReady`, `dashboardReady`.

## 7. Mapping Semantics
How mappings and decisions are represented:
- `matched_to_existing`: Does not create a global catalog item immediately.
- `survey_only`: Only exists within the context of this historical load.
- `new_historical_question`: Does not become global automatically.
- `excluded`: Excluded from further processing.
- `needs_review`: Blocks final approval.
- `not_applicable`

## 8. Participant and PII Policy
The draft must store the **decision taken**, not sensitive data.
Examples:
- `anonymous_survey`
- `exclude_identifiers`
- `keep_identifiers_with_warning`
- `needs_privacy_review`

It must **never** expose:
- complete emails
- full document numbers
- full individual names
- employee identifiers

## 9. Readiness Summary
A readiness summary for the historical load process:
- `totalFiles`
- `selectedSurveyGroupName`
- `mappedDemographicsCount`
- `surveyOnlyValuesCount`
- `mappedQuestionsCount`
- `newHistoricalQuestionsCount`
- `matchedDimensionsCount`
- `scaleCompatibilityStatus`
- `piiPolicyStatus`
- `unresolvedDecisionsCount`
- `blockingRisksCount`

This summary serves to review load readiness, **not** to compare visual results.

## 10. Human Review Policy
- The Historical Load Draft is **not approved automatically**.
- A user must review pending decisions.
- PII risks block approval until explicitly resolved.
- Survey-only entities must remain explicit.
- No global data is created without a future authorized phase.

## 11. Data Minimization
- NO_RAW_ROWS_RENDERED = YES
- NO_FULL_CONTRACT_DUMP = YES
- NO_FULL_MATCHING_RESULT_DUMP = YES
- NO_EMAILS_OR_DOCUMENTS_VISIBLE = YES
- NO_STORAGE_CREATED = YES
- NO_BACKEND_CREATED = YES
- NO_CLAUDE_CONNECTION_CREATED = YES
- LOCAL_ONLY_PROCESSING = YES

## 12. Out of Scope
The following are explicitly excluded from this phase:
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

## 13. Future Phase Plan
- **Fase 10B · Historical Load Draft Type Scaffolding:** crear types y placeholder no conectado.
- **Fase 10C · Historical Load Draft Builder:** construir draft desde contract + matching decisions sin UI nueva.
- **Fase 10D · Historical Load Draft Integration Architecture:** definir cómo mostrar el draft en chat.
- **Fase 10E · Historical Load Draft Review Build:** mostrar resumen del draft en la UI conversacional (visible UI checkpoint YES).
- **Fase 10F · Historical Load Draft QA:** validar privacidad, readiness y no comparación.
