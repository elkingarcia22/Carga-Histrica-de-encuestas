# PARSER_CONTRACT_TO_CHAT_INTEGRATION_ARCHITECTURE.md

## 1. Purpose
Definir la arquitectura para conectar el parser local y el contract assembler al flujo conversacional de importación de encuestas.

## 2. Current State
Explicar que ya existe:
- Chat-first sandbox upload UI.
- Local parser v1.
- Contract assembler v1.
- Mock UBITS catalogs.
- SurveyFileAnalysisContract.
Pero aún no hay integración runtime entre chat, parser y assembler.

## 3. Integration Role
La integración solo orquesta:
File seleccionado → parser preview → draft contract → mensajes conversacionales → decisiones paso a paso.

## 4. Source of Truth Boundary
- File metadata + File object = entrada local.
- Parser = fuente estructural.
- Assembler = traductor a draft contract.
- Mock catalogs = referencia simulada.
- Usuario = decide ambigüedades.
- IA/Claude = fuera de scope.
- UI = presentación conversacional, no fuente de verdad.

## 5. User Flow Overview
Flujo futuro:
1. Usuario selecciona “Cargar encuesta”.
2. Usuario selecciona archivo.
3. Chat confirma archivo recibido.
4. Usuario acepta safety gate.
5. Parser genera preview.
6. Assembler genera draft contract.
7. Chat muestra resumen estructural.
8. Chat inicia revisión conversacional de decisiones.
9. Usuario resuelve una decisión a la vez.
10. Solo después podrá prepararse comparación.

## 6. Runtime Sequence
Secuencia técnica futura:
- onFileSelected
- validate metadata
- parseWorkbookPreview
- assembleDraftSurveyFileAnalysisContract
- map parser/assembler output to chat messages
- enqueue requiredUserDecisions
- render next decision only

## 7. Chat Message Mapping
Mensajes que debe mostrar el chat:
- Archivo recibido.
- Analizando estructura.
- Hoja detectada.
- Header detectado.
- Columnas detectadas.
- Riesgos / warnings.
- Decisión requerida siguiente.
- Confirmación de resolución.

## 8. First Visible UI Checkpoint
VISIBLE_UI_CHECKPOINT = YES in 8B, not in 8A.

En 8B, el usuario debería ver:
- después de cargar un archivo, mensaje “Estoy analizando la estructura”.
- hoja detectada.
- header detectado.
- resumen de columnas.
- warning si hay PII o múltiples hojas.
- primera decisión conversacional.

## 9. One Decision at a Time Rule
El chat nunca debe mostrar todo el contrato de golpe.
Debe guiar:
- seleccionar hoja,
- confirmar anonimato,
- revisar PII,
- confirmar demográficos,
- confirmar preguntas nuevas,
una decisión a la vez.

## 10. Safety Gate
- antes de parsear contenido, mostrar aviso local/in-memory.
- no storage.
- no backend.
- no Claude.
- archivo analizado solo en runtime local.
- usuario debe confirmar para continuar.

## 11. Parser Integration Boundary
- `parseWorkbookPreview` se llama solo después del safety gate.
- el parser no conoce chat.
- el parser no conoce UI.
- el parser no conoce assembler.
- parser output es `ParsedWorkbookPreview`.

## 12. Contract Assembler Integration Boundary
- assembler recibe `ParsedWorkbookPreview + MockUbitsCatalogs`.
- assembler no conoce UI.
- assembler no llama parser.
- assembler no llama Claude.
- assembler devuelve draft contract + decisions.

## 13. Chat State Model
Estados futuros:
- idle
- upload_panel_open
- file_selected
- safety_gate_pending
- parsing_in_progress
- parser_preview_ready
- contract_assembly_in_progress
- draft_contract_ready
- decision_review_in_progress
- decision_resolved
- blocked_by_error

## 14. Error Handling in Chat
Errores a manejar:
- unsupported file type
- oversized file
- parser failed
- no sheets detected
- header not detected
- multiple sheets need selection
- high PII risk
- assembler failed
- no questions detected

## 15. Warnings Display Rules
Warnings se muestran como bloques conversacionales compactos, no tablas gigantes.
Prioridad:
1. PII/high risk
2. multiple sheets
3. low header confidence
4. unknown demographics
5. unmatched questions

## 16. Data Minimization
- no mostrar filas completas masivas.
- solo preview limitado.
- no exponer datos sensibles completos.
- mascarar emails/documentos en UI futura.
- no enviar raw data a Claude.

## 17. No Hallucination Rules
- chat no inventa columnas.
- chat no inventa preguntas.
- chat no inventa matches.
- chat solo presenta lo que parser/assembler producen.
- ambigüedad se convierte en decisión.

## 18. Out of Scope
- implementación runtime.
- UI changes.
- new components.
- Claude.
- backend.
- storage.
- matching real.
- dashboard.
- comparison output.

## 19. Phase Plan
- Fase 8B: Parser + contract integration build, first visible UI checkpoint.
- Fase 8C: Parser + contract integration QA.
- Fase 8D: Conversational decision review build.
- Fase 8E: Conversational decision review QA.
- Fase 9A: Matching engine architecture.
