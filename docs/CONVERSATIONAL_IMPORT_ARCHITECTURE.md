# Conversational Import Architecture · Comparativo de Encuestas UBITS

## 1. Architecture Decision
CONVERSATIONAL_IMPORT_ARCHITECTURE_LOCKED = YES
FIRST_SCREEN = CONVERSATIONAL_IMPORT_WORKSPACE
DASHBOARD_FLOW = DOWNSTREAM_RESULT
DRILLDOWN_FLOW = PAUSED

## 2. Product Goal
El usuario debe poder cargar o simular la carga de archivos de encuesta en una conversación, revisar la estructura detectada, corregir demográficos, dimensiones y preguntas, y aprobar un contrato antes de generar cualquier comparativo.

## 3. Primary User
Analista interno UBITS / Customer Success / equipo de implementación

## 4. First Screen Definition
Conversational Import Workspace

Nombre visible sugerido:
Asistente de importación de encuestas

Subtítulo sugerido:
Carga archivos, revisa la estructura detectada y aprueba los datos antes de generar el comparativo.

## 5. Conversational Experience Model
1. Usuario abre el workspace conversacional.
2. Sistema explica que el flujo es sandbox sintético.
3. Usuario adjunta o selecciona archivos sintéticos.
4. Sistema simula análisis estructural.
5. Sistema responde con hallazgos.
6. Usuario revisa archivos, demográficos, dimensiones, preguntas y mapeos.
7. Usuario corrige, excluye, renombra o aprueba.
8. Sistema genera ApprovedSurveyImportContract.
9. Usuario confirma que desea generar comparativo.
10. Pipeline posterior consume el contrato aprobado.

## 6. Module Architecture
ConversationalImportWorkspace
ChatTimeline
MessageComposer
SyntheticAttachmentStaging
MockFileIntakeController
StructureDetectionMockEngine
DetectedStructurePresenter
ValidationActionPanel
UserCorrectionController
ApprovalProgressTracker
ApprovedImportContractBuilder
ComparisonPipelineHandoff

## 7. Session State Machine
EMPTY_SESSION
AWAITING_FILES
FILES_STAGED
ANALYZING_MOCK
STRUCTURE_PROPOSED
REVIEWING_DEMOGRAPHICS
REVIEWING_DIMENSIONS
REVIEWING_QUESTIONS
REVIEWING_MAPPINGS
CHANGES_REQUESTED
PARTIALLY_APPROVED
CONTRACT_APPROVED
READY_FOR_COMPARISON
ERROR

## 8. File Intake Boundary
No upload productivo.
No storage.
No APIs.
No datos reales.
Solo archivos sintéticos o fixtures aprobados.
La primera versión puede usar adjuntos mock o selección visual simulada.

## 9. Detected Structure Contract
DetectedWorkbook
DetectedSheet
DetectedDemographic
DetectedDimension
DetectedQuestion
DetectedQuestionDimensionMapping
DetectedIssue
DetectedWarning
DetectedDuplicateColumn
DetectedUnmappedQuestion

## 10. User Validation Contract
approveAll
approveBlock
renameDemographic
renameDimension
reassignQuestionToDimension
excludeQuestion
includeQuestion
resolveDuplicateColumn
acceptWarning
requestReanalysis
resetSession

## 11. Approved Import Contract
ApprovedSurveyImportContract

Debe incluir:
approvedFiles
approvedDemographics
approvedDimensions
approvedQuestions
questionDimensionMappings
excludedColumns
excludedQuestions
warningsAccepted
approvalStatus
approvedAt
approvedByRole
source = synthetic_sandbox

## 12. Pipeline Handoff
El contrato aprobado podrá alimentar después:
parser core
schema validation
cross-sheet validation
normalization
metrics
comparison engine
comparison view model
dashboard
drilldown

Pero en esta fase no se ejecuta pipeline.

## 13. AI Boundary
No IA real en esta fase.
El comportamiento conversacional se puede simular por mocks/reglas.
No LLM API.
No clasificación real de datos.
No inferencia sobre datos reales.
Cualquier IA-first futura requiere intake separado.

## 14. Data Boundary
NO_REAL_CLIENT_DATA
NO_PRODUCTIVE_FILE_PROCESSING
NO_API_CONNECTIONS
NO_STORAGE
NO_UPLOAD_UI_YET
NO_PARSER_RUNTIME_IN_UI_YET

## 15. UX Layout Concept
Main area: chat timeline
Input area: message composer + synthetic attachment action
Side panel: detected structure proposal
Progress area: approval checklist
System cards: findings, warnings, issues, approval summary
Footer/action zone: approve block, request changes, generate contract

Estilo:
UBITS B2B enterprise
desktop-first
fondo gris claro o bg-background
cards blancas
bordes sutiles
tokens semánticos UBITS
acción primaria azul UBITS
sin saturación visual

## 16. Component Candidates
Card
Button
Badge
Alert
Separator
ScrollArea
Textarea
Input
Table
Tabs
Accordion
Progress
Skeleton
UbitsIcon
Upload/File components si ya existen en starter
AI Interaction lightweight controls si existen en rama

## 17. Error and Warning Model
BLOCKING_SCHEMA_ERROR
MISSING_REQUIRED_SHEET
UNKNOWN_COLUMN
DUPLICATE_COLUMN
UNMAPPED_QUESTION
LOW_CONFIDENCE_DIMENSION_MAPPING
EMPTY_FILE
UNSUPPORTED_FILE_TYPE
SYNTHETIC_ONLY_WARNING

## 18. Accessibility Expectations
Chat messages with clear roles.
Detected structure side panel with headings.
Approval actions with visible labels.
Warnings not dependent only on color.
Keyboard-accessible review blocks.
Clear focus order between chat, side panel and actions.

## 19. QA Criteria
No source changes in architecture phase.
No upload real.
No API/storage.
No real data.
No parser runtime in UI.
No hardcoded HEX.
No text-white.
No any/as any.
No Tailwind arbitrary values.
Docs markers complete.
Diff hygiene clean.

## 20. Forbidden Work
No construir UI.
No modificar código.
No crear rutas.
No crear upload real.
No crear file input funcional.
No procesar archivos reales.
No conectar APIs.
No usar storage.
No usar datos reales de clientes.
No implementar IA real.
No modificar parser pipeline.
No modificar dashboard.
No modificar drilldown.
No modificar shadcn/ui base.
No instalar dependencias.
No hacer amend.
No hacer rebase.
No hacer force push.
No activar R1H5.

## 21. Open Questions
¿La primera build usará mock attachments o selección desde fixtures?
¿Se permite un componente visual tipo upload dropzone simulado?
¿El usuario puede editar estructura inline o mediante mensajes?
¿El panel derecho será siempre visible?
¿El contrato aprobado se muestra como JSON conceptual o como resumen visual?
¿El dashboard actual se mantiene accesible como resultado posterior?

## 22. Next Authorized Phase
CHAT2_CONVERSATIONAL_IMPORT_MOCK_CONTRACT_READY

## 23. Final Status Markers
PHASE_4K_CHAT1_COMPLETE
CONVERSATIONAL_IMPORT_ARCHITECTURE_LOCKED
FIRST_SCREEN_CONVERSATIONAL_IMPORT_WORKSPACE_LOCKED
DASHBOARD_FLOW_MARKED_AS_DOWNSTREAM_RESULT
DRILLDOWN_FLOW_PAUSED
APPROVED_IMPORT_CONTRACT_CONCEPT_DEFINED
CONVERSATIONAL_SESSION_STATE_MACHINE_DEFINED
NO_UPLOAD_UI_YET
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
NO_API_CONNECTIONS
NO_STORAGE
CHAT2_CONVERSATIONAL_IMPORT_MOCK_CONTRACT_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
