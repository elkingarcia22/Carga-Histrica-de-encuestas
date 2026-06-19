# PARSER_TO_CONTRACT_ASSEMBLY_ARCHITECTURE.md

## 1. Purpose
Definir la arquitectura para transformar `ParsedWorkbookPreview` en `SurveyFileAnalysisContract`.

## 2. Current State
Explicar que ya existe:
- sandbox upload UI metadata-only,
- local parser v1,
- mock UBITS catalogs,
- SurveyFileAnalysisContract,
pero aún no existe contract assembly.

## 3. Assembly Role
Definir que el assembler no parsea archivos.
Solo toma el preview estructural producido por el parser y lo convierte en un contrato inicial.

## 4. Source of Truth Boundary
Definir:
- Parser = fuente de verdad estructural.
- Mock catalogs = fuente de verdad de referencia UBITS simulada.
- Assembler = traductor estructural.
- Usuario = fuente de verdad para decisiones ambiguas.
- IA = fuera de scope y no puede inventar estructura.

## 5. Input Contract
Describir los campos requeridos desde `ParsedWorkbookPreview`:
- fileName
- fileKind
- sheets
- selectedSheetName
- headerRowIndex
- headerValues
- columns
- previewRows
- warnings
- errors

## 6. Output Contract
Describir las entidades a producir en `SurveyFileAnalysisContract`:
- files
- detectedSurveys
- sheets
- columns
- demographics
- dimensions
- questions
- responseScales
- participantDetection
- piiDetection
- warnings
- requiredUserDecisions
- auditTrail
- readyForComparisonOutput

## 7. Assembly Pipeline
Definir etapas:
1. Validate parser preview.
2. Select primary sheet candidate.
3. Normalize headers.
4. Build sheet records.
5. Build column records.
6. Classify column candidates.
7. Detect demographic candidates.
8. Detect question candidates.
9. Detect participant identifier candidates.
10. Detect PII signals.
11. Infer response scale candidates.
12. Generate warnings.
13. Generate required user decisions.
14. Assemble audit trail.
15. Return draft contract.

## 8. Sheet Selection Rules
Definir cómo elegir hoja principal:
- hoja única,
- hoja con mayor densidad tabular,
- hoja con header detectado confiable,
- hoja con más respuestas,
- múltiples hojas requieren decisión del usuario.

## 9. Header Normalization Rules
Definir:
- trim,
- lower/uppercase normalization,
- accent folding,
- whitespace collapse,
- punctuation handling,
- duplicate headers,
- empty headers,
- generated fallback labels.

## 10. Column Classification
Definir categorías:
- participant_identifier
- demographic
- question_response
- dimension_label
- metadata
- timestamp
- score
- unknown

Aclarar que clasificación es candidata, no definitiva.

## 11. Demographic Candidate Assembly
Definir reglas:
- baja/mediana cardinalidad,
- aliases con mock catalogs,
- nombres tipo País, Área, Gerencia, Cargo, Antigüedad,
- valores detectados,
- gaps como Honduras en País,
- user decision si no existe en catálogo.

## 12. Question Candidate Assembly
Definir reglas:
- header largo,
- escala numérica repetida,
- Likert/NPS,
- open text,
- match por alias o texto canónico en mock question catalog,
- nueva pregunta si no hay match.

## 13. Dimension Candidate Assembly
Definir:
- match con dimensión por pregunta,
- match por columna explícita de dimensión si existe,
- unknown dimension si no se puede inferir,
- decisión requerida si ambigua.

## 14. Response Scale Assembly
Definir:
- Likert 1-5,
- Likert 1-7,
- NPS 0-10,
- yes/no,
- free text,
- unknown.

## 15. Participant Detection Assembly
Definir:
- email,
- documento,
- employeeId,
- nombre,
- anonymous,
- identified,
- mixed,
- unknown.

No hacer matching real de usuarios todavía si eso pertenece a Matching Engine.

## 16. PII Detection Assembly
Definir:
- señales de email, documento, nombre, teléfono, salario, texto libre sensible,
- risk levels none/low/medium/high,
- decisiones obligatorias si medium/high.

## 17. Warnings
Definir warnings:
- multiple_sheets_detected,
- low_header_confidence,
- unsupported_columns,
- possible_pii_detected,
- unknown_demographic_value,
- unmatched_question,
- ambiguous_participant_identifier,
- empty_sheet_ignored.

## 18. Required User Decisions
Definir decisiones:
- elegir hoja principal,
- confirmar anonimato,
- aceptar/excluir columnas PII,
- confirmar demográficos,
- crear valores solo para encuesta,
- confirmar preguntas nuevas,
- confirmar preguntas no comparables,
- resolver columnas ambiguas.

## 19. Audit Trail
Definir eventos:
- parser_preview_received,
- primary_sheet_selected,
- headers_normalized,
- columns_classified,
- warnings_generated,
- user_decisions_required,
- draft_contract_created.

## 20. No Hallucination Rules
Definir:
- no inventar hojas,
- no inventar columnas,
- no inventar valores,
- no inventar usuarios,
- no inventar preguntas comparables,
- no asumir matches si confianza baja,
- todo match ambiguo requiere decisión.

## 21. Boundaries
Aclarar fuera de scope:
- implementación del assembler,
- UI integration,
- matching engine real,
- Claude,
- dashboard,
- comparación,
- storage,
- subida productiva.

## 22. Phase Plan
Proponer:
- Fase 7B: Contract assembler type scaffolding.
- Fase 7C: Contract assembler v1 implementation.
- Fase 7D: Contract assembler QA.
- Fase 8A: Matching engine architecture.
