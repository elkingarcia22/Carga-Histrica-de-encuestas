# MATCHING_ENGINE_ARCHITECTURE.md

## 1. Purpose
Definir la arquitectura del Matching Engine para homologar entidades detectadas en encuestas contra catálogos simulados UBITS.

## 2. Current State
Explicar que ya existe:
- upload desde composer,
- safety gate,
- parser local,
- contract assembler,
- draft SurveyFileAnalysisContract,
- revisión conversacional de decisiones,
- mock UBITS catalogs.
Pero aún no existe Matching Engine.

## 3. Matching Engine Role
Definir que el Matching Engine no parsea archivos, no renderiza UI y no decide por el usuario.
Solo calcula candidatos de match y confidence.

## 4. Source of Truth Boundary
Definir:
- Parser = estructura.
- Contract assembler = draft contract.
- Mock catalogs = referencia simulada.
- Matching Engine = sugeridor determinístico.
- Usuario = resuelve ambigüedad.
- IA/Claude = fuera de source of truth.

## 5. Inputs
Definir inputs futuros:
- draft SurveyFileAnalysisContract,
- MockUbitsCatalogs,
- decisiones ya resueltas por usuario,
- reglas de normalización,
- límites de confidence.

## 6. Outputs
Definir outputs futuros:
- demographic matches,
- demographic value matches,
- question matches,
- dimension matches,
- participant identity signals,
- match confidence,
- warnings,
- requiredUserDecisions,
- auditTrail events.

## 7. Matching Domains
Definir dominios:
- demographics,
- demographic values,
- questions,
- dimensions,
- participants/users,
- response scales.

## 8. Normalization Rules
Definir:
- trim,
- lowercase,
- accent folding,
- whitespace collapse,
- punctuation simplification,
- singular/plural tolerance,
- alias lookup,
- stopwords controladas.

## 9. Confidence Model
Definir niveles:
- exact,
- high,
- medium,
- low,
- none.

Definir que:
- exact/high pueden sugerirse,
- medium requiere confirmación,
- low/none requiere decisión o nuevo valor/pregunta,
- nunca se aplica automáticamente sin criterio explícito.

## 10. Demographic Matching
Definir:
- match por canonical name,
- alias,
- normalized label,
- known UBITS demographic IDs,
- gaps como Honduras en País,
- valores nuevos solo survey-only.

## 11. Demographic Value Matching
Definir:
- match por valor canónico,
- alias,
- normalized value,
- missing value handling,
- survey-only value proposal,
- no creación global automática.

## 12. Question Matching
Definir:
- match por texto exacto,
- normalized text,
- aliases,
- semantic similarity determinística básica si existe,
- scale compatibility,
- dimension compatibility,
- new question candidate.

No usar IA para inferir equivalencias.

## 13. Dimension Matching
Definir:
- match directo por nombre,
- alias,
- relación con pregunta ya matcheada,
- unknown dimension si hay ambigüedad.

## 14. Response Scale Matching
Definir:
- Likert 1-5,
- Likert 1-7,
- NPS 0-10,
- yes/no,
- free text,
- unknown,
- incompatibilidad bloquea comparabilidad.

## 15. Participant / User Matching
Definir:
- email,
- document,
- employeeId,
- full name,
- inactive users,
- ambiguous users,
- missing users.

Aclarar:
- no crear usuarios globales,
- unmatched users pueden ser survey-only participants,
- PII requiere guardrails.

## 16. PII and Privacy Boundary
Definir:
- matching de participantes usa señales mínimas,
- mascaramiento en UI futura,
- no raw data to Claude,
- no persistence,
- medium/high PII requiere decisión.

## 17. Warnings
Definir warnings:
- ambiguous_match,
- low_confidence_match,
- no_match_found,
- incompatible_scale,
- unknown_demographic_value,
- possible_duplicate_question,
- possible_pii_match,
- inactive_user_match,
- multiple_user_candidates.

## 18. Required User Decisions
Definir decisiones:
- confirm_match,
- reject_match,
- create_survey_only_value,
- create_survey_only_question,
- treat_as_non_comparable,
- resolve_ambiguous_user,
- exclude_pii_column,
- confirm_scale_mapping.

## 19. Audit Trail
Definir eventos:
- matching_started,
- normalization_applied,
- demographic_matches_generated,
- question_matches_generated,
- participant_signals_generated,
- warnings_generated,
- user_decisions_required,
- matching_completed.

## 20. No Hallucination Rules
Definir:
- no inventar catálogos,
- no inventar usuarios,
- no inventar equivalencias,
- no asumir comparabilidad si escala no coincide,
- no crear datos globales,
- no resolver ambigüedad sin usuario.

## 21. Chat Integration Boundary
Definir:
- Matching Engine no renderiza.
- Chat solo mostrará candidatos y decisiones una por una.
- No volcará matriz completa.
- No expondrá PII completa.

## 22. Out of Scope
- implementación,
- UI,
- Claude,
- backend,
- storage,
- productive platform writes,
- dashboard,
- comparison output.

## 23. Phase Plan
Proponer:
- Fase 9B: Matching Engine Type Scaffolding.
- Fase 9C: Matching Engine v1 Implementation.
- Fase 9D: Matching Engine QA.
- Fase 10A: Matching Results Conversational Review Architecture.

## Architecture Status
- PHASE_9A_MATCHING_ENGINE_ARCHITECTURE_COMPLETE = YES
- MATCHING_ENGINE_ARCHITECTURE_LOCKED = YES
- MATCHING_ENGINE_IS_DETERMINISTIC = YES
- MATCHING_ENGINE_IS_NOT_UI = YES
- MATCHING_ENGINE_IS_NOT_AI = YES
- MATCHING_ENGINE_DOES_NOT_PARSE_FILES = YES
- MATCHING_ENGINE_DOES_NOT_CREATE_GLOBAL_DATA = YES
- USER_DECISIONS_REQUIRED_FOR_AMBIGUITY = YES
- NO_CLAUDE_AS_SOURCE_OF_TRUTH = YES
- NO_RUNTIME_IMPLEMENTATION_YET = YES
- NO_UI_CHANGES_IN_THIS_PHASE = YES
- VISIBLE_UI_CHECKPOINT_NO = YES
