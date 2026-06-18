# Conversational Import Mock Contract · Comparativo de Encuestas UBITS

## 1. Mock Contract Decision

- **CONVERSATIONAL_IMPORT_MOCK_CONTRACT_LOCKED**: YES
- **MOCK_CONTRACT_SCOPE**: SYNTHETIC_ONLY
- **FIRST_SCREEN**: CONVERSATIONAL_IMPORT_WORKSPACE

## 2. Mock Session Overview

Definición de la sesión mock principal:

```typescript
interface ConversationalImportSessionMock {
  sessionId: string;
  sessionStatus: SessionStatus;
  currentStep: number;
  stagedFiles: SyntheticAttachmentMock[];
  chatMessages: ChatMessageMock[];
  detectedStructure: DetectedStructureMock;
  approvalBlocks: ApprovalBlocksMock;
  approvedContract: ApprovedSurveyImportContractMock | null;
  createdAt: string;
  updatedAt: string;
  source: 'synthetic_sandbox';
}
```

## 3. Session States

Estados permitidos (`SessionStatus`):

```typescript
type SessionStatus = 
  | 'EMPTY_SESSION'
  | 'AWAITING_FILES'
  | 'FILES_STAGED'
  | 'ANALYZING_MOCK'
  | 'STRUCTURE_PROPOSED'
  | 'REVIEWING_DEMOGRAPHICS'
  | 'REVIEWING_DIMENSIONS'
  | 'REVIEWING_QUESTIONS'
  | 'REVIEWING_MAPPINGS'
  | 'CHANGES_REQUESTED'
  | 'PARTIALLY_APPROVED'
  | 'CONTRACT_APPROVED'
  | 'READY_FOR_COMPARISON'
  | 'ERROR';
```

## 4. Chat Message Contract

Mensajes conceptuales:

```typescript
interface ChatMessageMock {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  messageType: 'text' | 'file_staging' | 'structure_summary' | 'warning' | 'approval_request' | 'correction' | 'contract_summary';
  content: string;
  timestamp: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actions?: UserValidationActionMock[];
}
```

## 5. Synthetic Attachment Contract

Archivos staged mock:

```typescript
interface SyntheticAttachmentMock {
  fileId: string;
  fileName: string; // ej. encuesta-clima-2024-sintetica.xlsx
  fileKind: 'excel' | 'csv';
  periodLabel: string;
  fileStatus: 'uploaded' | 'analyzed' | 'error';
  syntheticOnly: true; // Obligatorio
  sheetCount: number;
  detectedRows: number;
  detectedColumns: number;
  warnings?: IssueMock[];
}
```

## 6. Detected Workbook Contract

```typescript
interface DetectedWorkbookMock {
  workbookId: string;
  fileId: string;
  periodLabel: string;
  sheets: DetectedSheetMock[];
  status: 'valid' | 'invalid' | 'warning';
  issues?: IssueMock[];
  warnings?: IssueMock[];
}
```

## 7. Detected Sheets Contract

Sheets mock mínimas:

```typescript
interface DetectedSheetMock {
  sheetId: string;
  name: string; // ej. 'answers', 'Dimensions', 'colaboradores', 'Jerarquía'
  isLikelyDataSheet: boolean;
  status: 'valid' | 'ignored';
}
```

## 8. Detected Demographics Contract

```typescript
interface DetectedDemographicMock {
  demographicId: string;
  label: string; // ej. Gerencia, Área, País, Nivel, Antigüedad, Modalidad de trabajo
  sourceColumn: string;
  confidence: number;
  status: 'auto_approved' | 'needs_review' | 'user_approved' | 'conflict';
  sampleValues: string[];
  approvedLabel?: string;
  issues?: IssueMock[];
}
```

## 9. Detected Dimensions Contract

```typescript
interface DetectedDimensionMock {
  dimensionId: string;
  label: string; // ej. Liderazgo, Cultura, Comunicación, Bienestar, Desarrollo, Reconocimiento, Autonomía, Compromiso
  source: 'sheet' | 'column_header' | 'inferred';
  confidence: number;
  questionCount: number;
  approvedLabel?: string;
  status: 'auto_approved' | 'needs_review' | 'user_approved' | 'conflict';
  issues?: IssueMock[];
}
```

## 10. Detected Questions Contract

```typescript
interface DetectedQuestionMock {
  questionId: string;
  label: string;
  questionType: 'comparable' | 'base_only' | 'comparison_only' | 'unmapped';
  sourceColumn: string;
  detectedDimensionId?: string;
  approvedDimensionId?: string;
  confidence: number;
  status: 'auto_mapped' | 'needs_review' | 'user_approved' | 'excluded';
  included: boolean;
  issues?: IssueMock[];
  warnings?: IssueMock[];
}
```

## 11. Question-Dimension Mapping Contract

```typescript
interface QuestionDimensionMappingMock {
  mappingId: string;
  questionId: string;
  detectedDimensionId?: string;
  approvedDimensionId?: string;
  confidence: number;
  status: 'auto_mapped' | 'needs_review' | 'user_reassigned' | 'approved' | 'excluded';
  userEdited: boolean;
}
```

## 12. Issues and Warnings Contract

```typescript
type IssueType = 
  | 'BLOCKING_SCHEMA_ERROR'
  | 'MISSING_REQUIRED_SHEET'
  | 'UNKNOWN_COLUMN'
  | 'DUPLICATE_COLUMN'
  | 'UNMAPPED_QUESTION'
  | 'LOW_CONFIDENCE_DIMENSION_MAPPING'
  | 'EMPTY_FILE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'SYNTHETIC_ONLY_WARNING'
  | 'PERIOD_MISMATCH'
  | 'DEMOGRAPHIC_LABEL_CONFLICT';

interface IssueMock {
  issueId: string;
  severity: 'blocking' | 'warning' | 'info';
  message: string;
  entityType: 'file' | 'sheet' | 'demographic' | 'dimension' | 'question' | 'mapping';
  entityId?: string;
  suggestedAction?: string;
  resolved: boolean;
}
```

## 13. User Validation Actions Contract

Acciones mock permitidas para el usuario:

```typescript
type ActionType = 
  | 'approveAll'
  | 'approveBlock'
  | 'renameDemographic'
  | 'renameDimension'
  | 'reassignQuestionToDimension'
  | 'excludeQuestion'
  | 'includeQuestion'
  | 'resolveDuplicateColumn'
  | 'acceptWarning'
  | 'requestReanalysis'
  | 'resetSession'
  | 'generateApprovedContract';

interface UserValidationActionMock {
  actionId: string;
  actionType: ActionType;
  targetEntityType?: string;
  targetEntityId?: string;
  payload?: any;
  resultingStatus?: SessionStatus;
  createdByRole: 'user';
  createdAt: string;
}
```

## 14. Approval Blocks Contract

```typescript
interface ApprovalBlockMock {
  blockId: 'files' | 'demographics' | 'dimensions' | 'questions' | 'questionDimensionMappings' | 'finalContract';
  label: string;
  status: 'pending' | 'in_review' | 'approved' | 'changes_requested';
  totalItems: number;
  approvedItems: number;
  warningCount: number;
  blockingIssueCount: number;
  lastUpdatedAt: string;
}

interface ApprovalBlocksMock {
  blocks: ApprovalBlockMock[];
}
```

## 15. Approved Survey Import Contract

```typescript
interface ApprovedSurveyImportContractMock {
  contractId: string;
  sessionId: string;
  approvedFiles: string[]; // fileIds
  approvedDemographics: string[]; // demographicIds
  approvedDimensions: string[]; // dimensionIds
  approvedQuestions: string[]; // questionIds
  questionDimensionMappings: string[]; // mappingIds
  excludedColumns: string[];
  excludedQuestions: string[];
  warningsAccepted: boolean;
  approvalStatus: 'approved';
  approvedAt: string;
  approvedByRole: 'user' | 'system';
  source: 'synthetic_sandbox';
  readyForComparison: true;
}
```

## 16. Mock Scenarios

1. **SCENARIO_EMPTY_SESSION**
   - sessionStatus: `EMPTY_SESSION`
   - user-visible summary: "Asistente listo para recibir archivos."
   - main assistant message: "Hola. Sube tus archivos de encuestas para comenzar."
   - side panel state: Vacío o con instrucciones.
   - approval progress: 0%.
   - available actions: Subir archivos.
   - expected next user action: `file_staging`.

2. **SCENARIO_FILES_STAGED**
   - sessionStatus: `FILES_STAGED`
   - user-visible summary: "Archivos recibidos, listos para análisis."
   - main assistant message: "He recibido los archivos. ¿Deseas que comience el análisis de estructura?"
   - side panel state: Mostrando lista de archivos en staging.
   - approval progress: Block `files` in review.
   - available actions: Iniciar análisis, reset.
   - expected next user action: `approveBlock` (files) / iniciar análisis.

3. **SCENARIO_STRUCTURE_PROPOSED_WITH_WARNINGS**
   - sessionStatus: `STRUCTURE_PROPOSED`
   - user-visible summary: "Estructura detectada con 2 advertencias."
   - main assistant message: "Analicé la estructura. Encontré algunas columnas sin mapear."
   - side panel state: Resumen de demográficos, dimensiones, preguntas y warnings.
   - approval progress: Blocks pendientes.
   - available actions: Revisar demográficos, aceptar warnings.
   - expected next user action: `acceptWarning` o `approveBlock`.

4. **SCENARIO_REVIEWING_MAPPINGS_WITH_UNMAPPED_QUESTIONS**
   - sessionStatus: `REVIEWING_MAPPINGS`
   - user-visible summary: "Revisando mapeo de preguntas a dimensiones."
   - main assistant message: "Hay 3 preguntas sin dimensión clara. ¿A qué dimensión pertenecen?"
   - side panel state: Interfaz de asignación de preguntas.
   - approval progress: Bloques anteriores aprobados, mappings en revisión.
   - available actions: `reassignQuestionToDimension`, `excludeQuestion`.
   - expected next user action: Completar asignaciones y `approveBlock`.

5. **SCENARIO_CONTRACT_APPROVED_READY_FOR_COMPARISON**
   - sessionStatus: `CONTRACT_APPROVED`
   - user-visible summary: "Importación aprobada y lista."
   - main assistant message: "¡Todo listo! El contrato de importación ha sido aprobado y podemos generar el comparativo."
   - side panel state: Resumen final inmutable.
   - approval progress: 100% (Todos aprobados).
   - available actions: Ir al dashboard.
   - expected next user action: Navegar al resultado (downstream).

6. **SCENARIO_ERROR_UNSUPPORTED_FILE_TYPE**
   - sessionStatus: `ERROR`
   - user-visible summary: "Error en el archivo."
   - main assistant message: "El formato del archivo no está soportado. Sube un archivo .xlsx o .csv."
   - side panel state: Oculto o vacío.
   - approval progress: 0%.
   - available actions: `resetSession`.
   - expected next user action: Subir archivo válido.

## 17. UI Consumption Boundary

La futura UI solo podrá consumir:
- `ConversationalImportSessionMock`
- `DetectedStructureMock`
- `ApprovalBlocksMock`
- `ApprovedSurveyImportContractMock`

No podrá consumir:
- real files
- raw workbook
- parser runtime
- APIs
- storage
- LLM output
- real client data

## 18. Pipeline Handoff Boundary

- El contrato aprobado será la única salida conceptual hacia el pipeline comparativo.
- No se ejecuta parser ni comparison engine en esta fase.
- El dashboard actual queda como resultado downstream.

## 19. AI Boundary

- No IA real.
- No LLM API.
- No clasificación real.
- No inferencia sobre datos reales.
- Respuestas del asistente serán mock/reglas sintéticas.
- Cualquier IA-first real requiere intake separado.

## 20. Data Boundary

Datos sintéticos estrictos. Nada de PII o datos reales de clientes en todo el proceso. Todo debe manejarse a nivel de mock para propósitos de visualización e interacción UI.

## 21. QA Criteria

- El documento define claramente las interfaces Typescript necesarias para el contrato mock.
- Los escenarios cubren el ciclo de vida completo de una sesión de importación mock.
- Las restricciones y fronteras están claramente definidas.

## 22. Forbidden Work

- No construir UI.
- No modificar código en `src/`.
- No crear upload real.
- No procesar archivos reales.
- No conectar APIs.
- No usar storage.
- No usar IA real.
- No modificar el dashboard o drilldown.

## 23. Next Authorized Phase

Fase `CHAT3`: Construcción de la primera pantalla UI (Conversational Import Workspace).

## 24. Final Status Markers

- PHASE_4K_CHAT2_COMPLETE
- CONVERSATIONAL_IMPORT_MOCK_CONTRACT_LOCKED
- CONVERSATIONAL_IMPORT_SESSION_MOCK_DEFINED
- DETECTED_STRUCTURE_MOCK_DEFINED
- USER_VALIDATION_ACTIONS_MOCK_DEFINED
- APPROVED_IMPORT_CONTRACT_MOCK_DEFINED
- MOCK_SCENARIOS_DEFINED
- FIRST_SCREEN_CONVERSATIONAL_IMPORT_WORKSPACE_RECONFIRMED
- NO_UPLOAD_UI_YET
- NO_PRODUCTIVE_FILE_PROCESSING
- NO_REAL_CLIENT_DATA
- NO_INSIGHTS_AI_YET
- NO_API_CONNECTIONS
- NO_STORAGE
- CHAT3_CONVERSATIONAL_IMPORT_FIRST_SCREEN_BUILD_PROMPT_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
