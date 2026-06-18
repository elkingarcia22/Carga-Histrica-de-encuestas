# Conversational Import Mock Contract · Comparativo de Encuestas UBITS

## 1. Mock Contract Decision

```text
CONVERSATIONAL_IMPORT_MOCK_CONTRACT_LOCKED = YES
MOCK_CONTRACT_SCOPE = SYNTHETIC_ONLY
FIRST_SCREEN = CONVERSATIONAL_IMPORT_WORKSPACE
```

## 2. Mock Session Overview

```typescript
interface ConversationalImportSessionMock {
  sessionId: string;
  sessionStatus: SessionState;
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

```text
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
```

## 4. Chat Message Contract

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

```typescript
interface SyntheticAttachmentMock {
  fileId: string;
  fileName: string; // e.g. encuesta-clima-2024-sintetica.xlsx
  fileKind: 'excel' | 'csv';
  periodLabel: string;
  fileStatus: 'staged' | 'analyzing' | 'processed' | 'error';
  syntheticOnly: true;
  sheetCount: number;
  detectedRows: number;
  detectedColumns: number;
  warnings: IssueWarningMock[];
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
  issues: IssueWarningMock[];
  warnings: IssueWarningMock[];
}
```

## 7. Detected Sheets Contract

```typescript
interface DetectedSheetMock {
  sheetId: string;
  sheetName: string; // e.g. answers, Dimensions, colaboradores, Jerarquía
  rowCount: number;
  columnCount: number;
  isPrimary: boolean;
}
```

## 8. Detected Demographics Contract

```typescript
interface DetectedDemographicMock {
  demographicId: string;
  label: string; // e.g. Gerencia, Área, País, Nivel, Antigüedad, Modalidad de trabajo
  sourceColumn: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  sampleValues: string[];
  approvedLabel?: string;
  issues: IssueWarningMock[];
}
```

## 9. Detected Dimensions Contract

```typescript
interface DetectedDimensionMock {
  dimensionId: string;
  label: string; // e.g. Liderazgo, Cultura, Comunicación, Bienestar, Desarrollo, Reconocimiento, Autonomía, Compromiso
  source: string;
  confidence: number;
  questionCount: number;
  approvedLabel?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  issues: IssueWarningMock[];
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
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  included: boolean;
  issues: IssueWarningMock[];
  warnings: IssueWarningMock[];
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
interface IssueWarningMock {
  issueId: string;
  severity: 'blocking' | 'warning' | 'info';
  message: string;
  entityType: 'file' | 'sheet' | 'demographic' | 'dimension' | 'question' | 'mapping';
  entityId?: string;
  suggestedAction?: string;
  resolved: boolean;
}
```

Types:
```text
BLOCKING_SCHEMA_ERROR
MISSING_REQUIRED_SHEET
UNKNOWN_COLUMN
DUPLICATE_COLUMN
UNMAPPED_QUESTION
LOW_CONFIDENCE_DIMENSION_MAPPING
EMPTY_FILE
UNSUPPORTED_FILE_TYPE
SYNTHETIC_ONLY_WARNING
PERIOD_MISMATCH
DEMOGRAPHIC_LABEL_CONFLICT
```

## 13. User Validation Actions Contract

```typescript
interface UserValidationActionMock {
  actionId: string;
  actionType: 'approveAll' | 'approveBlock' | 'renameDemographic' | 'renameDimension' | 'reassignQuestionToDimension' | 'excludeQuestion' | 'includeQuestion' | 'resolveDuplicateColumn' | 'acceptWarning' | 'requestReanalysis' | 'resetSession' | 'generateApprovedContract';
  targetEntityType: string;
  targetEntityId: string;
  payload: any;
  resultingStatus: string;
  createdByRole: 'user' | 'system';
  createdAt: string;
}
```

## 14. Approval Blocks Contract

```typescript
interface ApprovalBlocksMock {
  files: ApprovalBlockMock;
  demographics: ApprovalBlockMock;
  dimensions: ApprovalBlockMock;
  questions: ApprovalBlockMock;
  questionDimensionMappings: ApprovalBlockMock;
  finalContract: ApprovalBlockMock;
}

interface ApprovalBlockMock {
  blockId: string;
  label: string;
  status: 'pending' | 'in_review' | 'approved' | 'changes_requested';
  totalItems: number;
  approvedItems: number;
  warningCount: number;
  blockingIssueCount: number;
  lastUpdatedAt: string;
}
```

## 15. Approved Survey Import Contract

```typescript
interface ApprovedSurveyImportContractMock {
  contractId: string;
  sessionId: string;
  approvedFiles: string[];
  approvedDemographics: DetectedDemographicMock[];
  approvedDimensions: DetectedDimensionMock[];
  approvedQuestions: DetectedQuestionMock[];
  questionDimensionMappings: QuestionDimensionMappingMock[];
  excludedColumns: string[];
  excludedQuestions: string[];
  warningsAccepted: boolean;
  approvalStatus: 'approved';
  approvedAt: string;
  approvedByRole: 'user';
  source: 'synthetic_sandbox';
  readyForComparison: boolean;
}
```

## 16. Mock Scenarios

1. **SCENARIO_EMPTY_SESSION**: Initial state, no files uploaded. Waiting for user input.
2. **SCENARIO_FILES_STAGED**: Synthetic files attached to chat. Assistant acknowledges reception.
3. **SCENARIO_STRUCTURE_PROPOSED_WITH_WARNINGS**: Assistant analyzed files and proposed a structure, but highlights some warnings (e.g., mismatched demographic names).
4. **SCENARIO_REVIEWING_MAPPINGS_WITH_UNMAPPED_QUESTIONS**: User is reviewing the mapping of questions to dimensions, with some questions unmapped requiring manual assignment.
5. **SCENARIO_CONTRACT_APPROVED_READY_FOR_COMPARISON**: All blocks approved. The final contract is generated and the system is ready to hand off to the comparison pipeline.
6. **SCENARIO_ERROR_UNSUPPORTED_FILE_TYPE**: User attempts to upload an invalid synthetic file type.

## 17. UI Consumption Boundary

- ConversationalImportSessionMock
- DetectedStructureMock
- ApprovalBlocksMock
- ApprovedSurveyImportContractMock

Prohibited:
- real files
- raw workbook
- parser runtime
- APIs
- storage
- LLM output
- real client data

## 18. Pipeline Handoff Boundary

El contrato aprobado será la única salida conceptual hacia el pipeline comparativo.
No se ejecuta parser ni comparison engine en esta fase.
El dashboard actual queda como resultado downstream.

## 19. AI Boundary

No IA real.
No LLM API.
No clasificación real.
No inferencia sobre datos reales.
Respuestas del asistente serán mock/reglas sintéticas.
Cualquier IA-first real requiere intake separado.

## 20. Data Boundary

Solo datos sintéticos.
No datos de clientes reales.
No storage persistente.

## 21. QA Criteria

- No changes to `src/**`.
- Only documentation changes.
- Valid Git state.

## 22. Forbidden Work

- No UI construction.
- No code modifications.
- No API connections.

## 23. Next Authorized Phase

CHAT3_CONVERSATIONAL_IMPORT_FIRST_SCREEN_BUILD_PROMPT_READY

## 24. Final Status Markers

```text
PHASE_4K_CHAT2_COMPLETE
CONVERSATIONAL_IMPORT_MOCK_CONTRACT_LOCKED
CONVERSATIONAL_IMPORT_SESSION_MOCK_DEFINED
DETECTED_STRUCTURE_MOCK_DEFINED
USER_VALIDATION_ACTIONS_MOCK_DEFINED
APPROVED_IMPORT_CONTRACT_MOCK_DEFINED
MOCK_SCENARIOS_DEFINED
FIRST_SCREEN_CONVERSATIONAL_IMPORT_WORKSPACE_RECONFIRMED
NO_UPLOAD_UI_YET
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
NO_API_CONNECTIONS
NO_STORAGE
CHAT3_CONVERSATIONAL_IMPORT_FIRST_SCREEN_BUILD_PROMPT_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
```
