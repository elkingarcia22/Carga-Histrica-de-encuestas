# Matching Engine Integration Architecture

## 1. Purpose
Definir cómo se integrará el Matching Engine v1 al flujo de Carga Histórica de Encuestas.

El objetivo de la integración no es comparar encuestas en UI, sino preparar una carga histórica más consistente mediante homologación asistida y decisiones humanas.

## 2. Current State
El flujo actual ya hace:
- recepción de archivos desde composer,
- análisis local automático,
- agrupación por encuesta/ciclo,
- parsing local,
- contract assembly,
- explicación de warnings y decisiones,
- revisión one-decision-at-a-time.

Matching Engine v1 ya existe, pero todavía no está conectado.

## 3. Integration Point
El Matching Engine debe ejecutarse después de:
- parser preview
- contract assembly
- survey group selection, si hay múltiples grupos

Y antes de:
- decisiones finales de homologación
- preparación de contrato histórico final

Flujo propuesto:
Files submitted
→ Local parser preview
→ Contract assembler
→ Survey grouping decision if needed
→ Matching Engine v1
→ Matching explanation mapper
→ Decision review one at a time
→ Historical load draft ready for later phase

## 4. Input Contract
El Matching Engine recibirá:
- Parsed structural metadata
- SurveyFileAnalysisContract draft
- Mock UBITS catalogs
- Selected survey group
- Detected columns
- Detected questions
- Detected demographics
- Detected dimensions
- Detected response scales
- Participant/PII signals

No debe recibir:
- raw full rows
- complete participant identifiers
- emails/documents as visible UI data
- backend data
- Claude output

## 5. Output Contract
El Matching Engine debe producir:
- matching candidates
- confidence scores
- warnings
- required user decisions
- audit events

El output no debe:
- create global data
- mutate mock catalogs
- mark readyForComparison
- trigger dashboard
- persist anything
- send data externally

## 6. Decision Review Integration
Los resultados ambiguos del Matching Engine se convierten en decisiones humanas explicadas usando la arquitectura H5:
- qué detecté
- por qué importa
- impacto en carga histórica
- recomendación
- acciones contextuales
- consecuencia por acción

Ejemplos de decisiones:
- Confirmar si “Área” corresponde a “Gerencia”
- Crear “Honduras” solo para esta encuesta histórica
- Marcar una pregunta como nueva histórica
- Confirmar si escala 1-5 equivale a favorabilidad
- Excluir columnas sensibles
- Tratar encuesta como anónima

## 7. One Decision at a Time
ONE_DECISION_AT_A_TIME_REMAINS = YES

La integración no debe mostrar toda la cola de decisiones.
Debe mostrar:
- 1 decisión actual
- 1 recomendación si aplica
- acciones concretas
- consecuencias visibles
- confirmación después de elegir
- siguiente decisión solo después de resolver la actual

## 8. Ambiguity Policy
El motor puede sugerir candidatos, pero no resolver ambigüedad automáticamente.
Reglas:
- exact/high confidence can be proposed as recommended
- medium confidence requires user confirmation
- low/none confidence becomes new historical/survey-only decision
- PII always requires explicit user decision
- global data creation never happens automatically

## 9. Historical Load Outcome
El resultado de la integración es preparar una carga histórica, no un comparativo.

Output esperado posterior a integración (HistoricalLoadDraft):
- matched demographics
- survey-only demographic values
- matched or new questions
- matched or new dimensions
- response scale compatibility status
- participant/PII handling decision
- audit trail
- remaining unresolved decisions

No output permitido:
- dashboard comparativo
- comparison report
- readyForComparison true
- ARR/retention dashboard
- visual comparison screen

## 10. Data Minimization and Privacy
- NO_RAW_ROWS_RENDERED = YES
- NO_FULL_CONTRACT_DUMP = YES
- NO_EMAILS_OR_DOCUMENTS_VISIBLE = YES
- NO_STORAGE_CREATED = YES
- NO_BACKEND_CREATED = YES
- NO_CLAUDE_CONNECTION_CREATED = YES
- LOCAL_ONLY_PROCESSING = YES

## 11. Technical Boundaries
No modificar en integración futura sin fase específica:
- local-parser
- contract-assembler
- mock-ubits-catalogs
- survey-file-analysis
- matching-engine core scoring
- shadcn/ui base
- package files
- routes
- dashboard

La futura fase de build puede crear adaptadores en `conversational-import` o un mapper de integración, pero eso debe definirse en 9E, no ahora.

## 12. Phase Plan
Fase 9E · Matching Engine Integration Build
- conectar Matching Engine después del contract assembler,
- transformar output en decisiones explicadas,
- mantener chat one-decision-at-a-time,
- visible UI checkpoint YES.

Fase 9F · Matching Engine Integration QA
- validar flujo con archivos 2024/2025,
- validar decisiones de homologación,
- validar privacidad y no storage,
- validar no dashboard/comparativo.

Fase 10A · Historical Load Draft Architecture
- definir contrato final de carga histórica preparada.
