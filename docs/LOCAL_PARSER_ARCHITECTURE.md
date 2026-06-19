# LOCAL_PARSER_ARCHITECTURE.md

## 1. Purpose
Definir la arquitectura del parser local determinístico para archivos de encuesta.

## 2. Current State
Explicar que hoy existe upload sandbox metadata-only, contrato de análisis y catálogos mock, pero todavía no existe parser runtime.

## 3. Parser Role
Definir que el parser es source of truth estructural.
La IA no puede inventar columnas, hojas, participantes, respuestas ni valores.

## 4. Supported File Types
Definir:
- .xlsx
- .xls
- .csv

Aclarar que soporte real depende de fase futura y decisión de dependencia.

## 5. Dependency Decision Gate
Definir que no se puede instalar ninguna dependencia de parsing sin gate.
Evaluar opciones futuras:
- librería XLSX,
- parser CSV nativo/simple,
- worker futuro,
- backend futuro.

No elegir implementación todavía si requiere dependencia.

## 6. Input Boundary
El parser futuro recibe File metadata y contenido solo después de safety gate.
No recibe datos desde APIs reales.
No persiste archivos.
No sube archivos.

## 7. Parsing Pipeline
Definir etapas:
1. file validation
2. workbook/csv extraction
3. sheet detection
4. header detection
5. column profiling
6. row sampling
7. semantic role inference
8. survey block detection
9. PII signal detection
10. contract assembly
11. warnings and decisions

## 8. Sheet Detection
Definir cómo distinguir:
- hoja de respuestas,
- hoja de metadata,
- hoja de resumen,
- hoja por área/gerencia,
- hojas vacías,
- hojas no reconocidas.

## 9. Header Detection
Definir cómo detectar encabezados:
- primera fila,
- filas con alta densidad textual,
- encabezados partidos,
- columnas vacías,
- encabezados duplicados,
- encabezados normalizados.

## 10. Column Profiling
Definir:
- tipo de dato inferido,
- porcentaje vacío,
- cardinalidad,
- valores de muestra,
- posibles escalas,
- longitud promedio,
- patrones de email/documento/ID.

## 11. Semantic Role Inference
Definir roles:
- participant_identifier,
- demographic,
- question_response,
- dimension_label,
- metadata,
- timestamp,
- score,
- unknown.

## 12. Demographic Detection
Definir heurísticas para detectar demográficos:
- baja/mediana cardinalidad,
- texto categórico,
- coincidencia con catálogo mock,
- aliases,
- columnas como país, área, cargo, antigüedad.

## 13. Question Detection
Definir heurísticas:
- encabezados largos,
- respuestas escala Likert,
- valores numéricos repetidos,
- preguntas abiertas,
- pregunta NPS,
- preguntas nuevas/no reconocidas.

## 14. Response Scale Detection
Definir:
- Likert 1-5,
- Likert 1-7,
- NPS 0-10,
- texto libre,
- sí/no,
- desconocida.

## 15. Participant Detection
Definir:
- email,
- documento,
- employeeId,
- nombre completo,
- ID interno,
- anónima,
- identificada,
- mixta,
- desconocida.

## 16. PII Detection
Definir señales:
- email,
- nombre,
- documento,
- teléfono,
- salario,
- cargo sensible,
- texto libre con posible PII.

Definir niveles:
- none
- low
- medium
- high

## 17. Multi-survey Detection
Definir señales:
- varios archivos con periodos distintos,
- hojas por encuesta,
- múltiples bloques de encabezados,
- nombres de encuesta diferentes,
- años o fechas diferentes,
- escalas incompatibles.

## 18. Contract Assembly
Mapear cada etapa al `SurveyFileAnalysisContract`.

## 19. Required User Decisions
Definir decisiones que puede producir:
- elegir encuesta,
- confirmar anonimato,
- confirmar columnas PII,
- confirmar demográficos,
- confirmar preguntas,
- excluir columnas,
- resolver ambigüedades.

## 20. Error Handling
Definir errores:
- archivo no soportado,
- archivo vacío,
- hoja vacía,
- encabezado no detectado,
- demasiadas columnas,
- archivo muy grande,
- estructura no tabular,
- PII alta,
- múltiples encuestas.

## 21. Performance and Safety
Definir límites:
- tamaño máximo,
- número máximo de filas a muestrear,
- no bloquear UI,
- posible worker futuro,
- posible backend futuro.

## 22. Claude Boundary
Claude no recibe archivo crudo.
Claude solo podrá recibir contrato, muestras anonimizadas o resumen estructural en fases futuras.
Claude no decide source of truth.

## 23. Out of Scope
- parser runtime,
- lectura real de archivos,
- dependencia XLSX,
- upload productivo,
- matching engine,
- Claude,
- dashboard,
- comparación,
- almacenamiento.

## 24. Phase Plan
Proponer:
- Fase 6B: Dependency decision gate for parsing.
- Fase 6C: Local parser type scaffolding.
- Fase 6D: CSV parser prototype or XLSX parser prototype, según decisión.
- Fase 6E: Parser QA.
- Fase 7A: Matching engine architecture.

---
LOCAL_PARSER_ARCHITECTURE_LOCKED = YES
PARSER_IS_STRUCTURAL_SOURCE_OF_TRUTH = YES
AI_NOT_SOURCE_OF_TRUTH = YES
DEPENDENCY_DECISION_GATE_REQUIRED = YES
NO_RUNTIME_PARSER_YET = YES
NO_FILE_CONTENT_READING_YET = YES
NO_CLAUDE_AT_PARSER_STAGE = YES
SURVEY_FILE_ANALYSIS_CONTRACT_OUTPUT = YES
PII_DETECTION_REQUIRED = YES
MULTI_SURVEY_DETECTION_REQUIRED = YES
PARTICIPANT_DETECTION_REQUIRED = YES
