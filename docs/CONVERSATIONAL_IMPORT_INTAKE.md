# Conversational Import Pivot Intake · Comparativo de Encuestas UBITS

## 1. Pivot Decision
- CONVERSATIONAL_IMPORT_PIVOT = YES
- PREVIOUS_DASHBOARD_FLOW_PAUSED = YES
- SYN4C16_DRILLDOWN_QA_PAUSED = YES

## 2. Product Objective
Permitir que el usuario cargue archivos de encuesta en una experiencia conversacional, reciba una propuesta estructurada de lo detectado y pueda aprobar o corregir demográficos, dimensiones y preguntas antes de generar el comparativo.

## 3. Primary User
Analista interno UBITS / Customer Success / equipo de implementación.

## 4. New First Screen Candidate
Conversational Import Workspace
- Nombre visible sugerido: Asistente de importación de encuestas
- Subtítulo sugerido: Carga archivos, revisa la estructura detectada y aprueba los datos antes de generar el comparativo.

## 5. Conversational Flow
1. Usuario inicia conversación.
2. Usuario adjunta uno o varios archivos.
3. Sistema analiza estructura de forma sintética/mock.
4. Sistema responde con hallazgos:
   - archivos detectados
   - hojas detectadas
   - demográficos detectados
   - dimensiones detectadas
   - preguntas detectadas
   - preguntas sin dimensión clara
   - columnas duplicadas o ambiguas
   - errores o advertencias
5. Usuario corrige o aprueba.
6. Sistema genera contrato aprobado.
7. Contrato aprobado alimenta pipeline comparativo.

## 6. File Scope
Solo XLSX sintéticos o fixtures aprobados.
No datos reales.
No carga productiva.
No storage.
No APIs.

## 7. Detected Structure Proposal
Entidades conceptuales:
- DetectedWorkbook
- DetectedSheet
- DetectedDemographic
- DetectedDimension
- DetectedQuestion
- DetectedQuestionDimensionMapping
- DetectedIssue
- DetectedWarning

Ejemplo de respuesta del sistema:
Encontré 6 demográficos, 8 dimensiones y 42 preguntas. Hay 3 preguntas sin dimensión clara. Hay 2 columnas que parecen duplicadas. ¿Quieres revisar la estructura antes de aprobar?

## 8. User Validation Model
El usuario puede:
- aprobar todo
- aprobar por bloques
- renombrar demográficos
- renombrar dimensiones
- reasignar preguntas a dimensiones
- marcar preguntas como excluir
- confirmar columnas ambiguas
- volver a analizar

Recomendación inicial (Aprobación por bloques):
1. Archivos
2. Demográficos
3. Dimensiones
4. Preguntas
5. Mapeo pregunta-dimensión
6. Contrato final

## 9. Approved Output Contract
Salida conceptual: `ApprovedSurveyImportContract`
Incluye:
- approvedFiles
- approvedDemographics
- approvedDimensions
- approvedQuestions
- questionDimensionMappings
- excludedColumns
- warningsAccepted
- approvedAt
- approvedByRole

## 10. Reused Existing Pipeline
- parser core
- schema validation
- cross-sheet validation
- normalization
- metrics
- comparison engine
- comparison view model
- dashboard
- drilldown

## 11. Data Boundary
No real client data.
No productive processing.
No persistent storage.
No APIs.
No direct upload runtime in this phase.
No parser execution in UI yet.

## 12. AI Boundary
No IA real en esta fase.
El comportamiento conversacional puede ser simulado por mocks/reglas.
Cualquier IA-first futura requiere intake y decision gate separado.

## 13. UX Boundary
Layout conceptual:
- Left/main: chat conversation
- Right/side panel: estructura detectada
- Bottom or footer: acciones de aprobación
- System cards: hallazgos, advertencias, contrato aprobado

## 14. Risks
- Riesgo de parecer carga real cuando sigue siendo sandbox.
- Riesgo de mezclar datos reales.
- Riesgo de IA sobredimensionada.
- Riesgo de aceptar estructura incorrecta sin revisión.
- Riesgo de crear upload antes de bloquear arquitectura.

## 15. Open Questions
- ¿El chat será solo para importación o también para análisis posterior?
- ¿El usuario aprueba todo o por bloques?
- ¿La primera versión usará fixtures sintéticos o archivos adjuntos mock?
- ¿El análisis será 100% reglas/mock?
- ¿La UI será una pantalla nueva o reemplazará el dashboard como primera experiencia?
- ¿El dashboard actual queda como resultado posterior?

## 16. Success Criteria
- El usuario entiende qué estructura detectó el sistema.
- El usuario puede corregir mentalmente el flujo antes de aprobar.
- El sistema produce un contrato aprobado conceptual.
- No se usan datos reales.
- No se conecta backend.
- No se crea upload productivo.

## 17. Next Authorized Phase
- CHAT1_CONVERSATIONAL_IMPORT_ARCHITECTURE_READY

## 18. Final Status Markers
- PHASE_4K_CHAT0_COMPLETE
- CONVERSATIONAL_IMPORT_PIVOT_INTAKE_COMPLETED
- CONVERSATIONAL_IMPORT_PIVOT_APPROVED_FOR_ARCHITECTURE
- PREVIOUS_DASHBOARD_FLOW_PAUSED
- SYN4C16_DRILLDOWN_QA_PAUSED
- FIRST_SCREEN_REDEFINED_AS_CONVERSATIONAL_IMPORT_WORKSPACE
- NO_UPLOAD_UI_YET
- NO_PRODUCTIVE_FILE_PROCESSING
- NO_REAL_CLIENT_DATA
- NO_INSIGHTS_AI_YET
- NO_API_CONNECTIONS
- NO_STORAGE
- CHAT1_CONVERSATIONAL_IMPORT_ARCHITECTURE_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
