# Historical Import Synthetic Sandbox Architecture

## 1. Purpose
Define the functional and technical architecture of the Synthetic Sandbox for the Historical Import project. The sandbox allows the internal UBITS analyst to upload a synthetic workbook, validate its structure, and view metrics and privacy checks without backend dependency.

## 2. Architecture Status
SYNTHETIC_SANDBOX_ARCHITECTURE_LOCKED

## 3. Sources of Truth
- `docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_INTAKE.md`
- `docs/DESIGN.md`
- `docs/ANTIGRAVITY.md`
- `docs/ARCHITECTURE.md`
- `docs/QA_CHECKLIST.md`

## 4. System Boundary
### Dentro
- Selección local de archivo sintético
- Lectura local en navegador
- Validación estructural
- Normalización en memoria
- Comparación sintética
- Cálculo de métricas sintéticas
- Visualización temporal
- Descarte al recargar, reemplazar o cerrar

### Fuera
- Backend
- Base de datos
- Object storage
- APIs
- Telemetría con contenido del archivo
- Persistencia local permanente
- Multi-tenant
- Autenticación productiva
- Publicación al core
- Datos reales
- IA externa

## 5. Non-Goals
This architecture does not cover real data import, persistent storage, real user routing, or backend processing.

## 6. Data Flow
Local File Selection
→ File Admission Validation
→ Workbook Parsing
→ Sheet Recognition
→ Structural Validation
→ Canonical Normalization
→ Cross-Sheet Validation
→ Period Comparison
→ Metric Computation
→ Privacy Suppression
→ In-Memory View Model
→ Explicit Disposal

- **Responsibility:** Ensure clean, valid data is extracted and presented locally.
- **Input:** Local Synthetic XLSX File.
- **Output:** In-Memory View Model.
- **Failure modes:** File Admission Error, Parsing Error, Structural Error.
- **Memory ownership:** In-Memory only, strictly tied to the sandbox session.
- **Network behavior:** Zero network requests containing file data.
- **Persistence behavior:** Zero local persistence (no IndexedDB, no localStorage).

## 7. Conceptual Modules
- **FileAdmission:** Validates file type, size, and existence.
- **WorkbookReader:** Extracts raw data from the workbook.
- **SheetRecognizer:** Identifies and maps expected sheets.
- **SchemaValidator:** Ensures structural compliance.
- **CanonicalNormalizer:** Translates raw data to standard structures.
- **CrossSheetValidator:** Validates relationships between sheets.
- **QuestionMatcher:** Identifies matching questions between periods.
- **PeriodComparator:** Compares metrics between matching periods.
- **MetricsEngine:** Computes rates, distributions, and eNPS.
- **PrivacyGuard:** Enforces segment privacy rules.
- **SandboxSession:** Manages the sandbox state machine.
- **ViewModelAdapter:** Adapts data for UI components.

## 8. Canonical Data Model
- `SyntheticWorkbook`: Core container.
- `SurveyPeriod`: Period metadata.
- `Respondent`: Individual respondent metadata.
- `Collaborator`: Organizational data of respondent.
- `Question`: Question definition.
- `QuestionSourceBinding`: Source mapping info.
- `Response`: Individual answer.
- `SegmentDimension`: Demographic or structural category.
- `SegmentValue`: Specific segment classification.
- `HierarchyNode`: Organizational tree node.
- `ValidationIssue`: Error, warning or info.
- `ComparisonMatch`: Result of question matching.
- `MetricResult`: Computed result.
- `PrivacyDecision`: Status of privacy suppression.
- `SandboxSessionState`: Current state of the sandbox.

## 9. Identifier Strategy
Separation between:
- `physicalColumnIdentifier`
- `sourceQuestionIdentifier`
- `canonicalQuestionId`
- `surveyPeriodId`
- `responseType`
- `comparabilityStatus`

Comparability statuses:
- MATCHED
- NEW
- REMOVED
- TEXT_CHANGED_REVIEW_REQUIRED
- ID_CHANGED_MATCHED
- NOT_COMPARABLE

Matching strategy:
1. Match por canonical ID explícito.
2. Match por source binding configurado.
3. Match asistido por metadatos estructurados.
4. Sin match automático cuando exista ambigüedad.
5. Nunca usar IA externa para decidir equivalencias.

## 10. Question Types
- `LIKERT_1_TO_5`: valores permitidos 1–5, valores fuera de rango generan error o warning según contrato.
- `ENPS_EXPORTED_1_TO_11`: normalización canónica: exportedValue - 1, resultado canónico 0–10, detractor: 0–6, passive: 7–8, promoter: 9–10.
- `OPEN_TEXT`: no se envía a IA, no participa en favorabilidad, no se muestra en vistas agregadas iniciales, contenido descartado junto con la sesión.
- `UNKNOWN`: bloquea cálculo hasta clasificación.

## 11. Cross-Period Matching
Matching does not rely solely on visible text or physical column names. Deterministic strategy outlined above.

## 12. Validation Architecture
Severities:
- BLOCKING_ERROR
- ERROR
- WARNING
- INFO

Minimum cases:
- Formato distinto de XLSX
- Archivo corrupto
- Archivo por encima del límite
- Hoja requerida faltante
- Hoja inesperada
- Columna obligatoria faltante
- Columna inesperada
- Identifier duplicado
- Respuesta sin colaborador
- Colaborador sin respuesta
- Código jerárquico inexistente
- Referencia circular de jerarquía
- Likert fuera de rango
- eNPS fuera de rango
- Tipo de pregunta desconocido
- Pregunta duplicada
- Periodo duplicado
- Valor vacío permitido
- Valor vacío no permitido
- Pregunta nueva
- Pregunta retirada
- Pregunta no comparable
- Segmento pequeño

## 13. Metrics Architecture
Calculated metrics:
- Response count
- Eligible collaborator count
- Participation rate
- Valid response rate
- Positive distribution
- Neutral distribution
- Negative distribution
- Favorability
- eNPS
- Question delta
- Dimension delta
- Segment delta

**LIKERT_BUCKET_POLICY_DECISION_REQUIRED** (Pending specific definition of Likert Negative/Neutral/Positive buckets).

## 14. Privacy Architecture
Configurable `PrivacyGuard` with states:
- VISIBLE
- SUPPRESSED_SMALL_SEGMENT
- SUPPRESSED_NO_RESPONSES
- SUPPRESSED_INSUFFICIENT_COMPLETION
- NOT_APPLICABLE

**SMALL_SEGMENT_THRESHOLD_DECISION_REQUIRED** (Threshold must be configurable, not hardcoded from UI).

## 15. Session State Machine
States:
- IDLE
- FILE_SELECTED
- READING
- VALIDATING
- VALID
- VALID_WITH_WARNINGS
- INVALID
- READY_FOR_COMPARISON
- COMPARING
- RESULTS_READY
- DISPOSING
- DISPOSED

Transitions: Replace file, Remove file, Retry validation, Add comparison period, Remove comparison period, Reload browser, Close tab, Validation failure, Unexpected parsing failure.

## 16. Memory and Disposal
- Archivo mantenido únicamente durante la sesión.
- Liberación de referencias después de parseo cuando sea viable.
- Descarte al reemplazar archivo.
- Descarte al reiniciar sesión.
- Sin IndexedDB, sin localStorage, sin sessionStorage para contenido del archivo.
- Sin service worker cache del contenido.
- Sin logs con respuestas o atributos.
- Sin analytics del contenido.

## 17. Resource Limits
**SANDBOX_RESOURCE_LIMITS_DECISION_REQUIRED**
Pending definition of limits for: file size, rows, columns, sheets, open-text length, simultaneous periods.

## 18. Worker Strategy
**MAIN_THREAD_STRATEGY_RECOMMENDED**
Benefits: Simpler implementation, sufficient for small synthetic files.
Risks: UI blocking if files grow too large.
(Worker strategy could be adopted if larger files require it in the future, avoiding main thread blocking).

## 19. XLSX Dependency Gate
**XLSX_PARSER_DEPENDENCY_DECISION_REQUIRED**
**DEPENDENCY_INSTALLATION_NOT_AUTHORIZED**
Alternatives: Existing approved library, Dedicated browser-compatible parser, Conversion to CSV before sandbox, Synthetic JSON adapter for an earlier technical spike.

## 20. Network Guard
No fetch, no XMLHttpRequest, no upload endpoint, no WebSocket, no external AI request, no analytics payload containing file-derived content.
Future QA criteria: `NETWORK_REQUESTS_CONTAINING_FILE_CONTENT = ZERO`

## 21. Existing Component Reuse
- `Upload & Files`: Reusable as-is (UploadZone, FilePreview).
- `Survey Analytics`: Reusable as-is for visual metrics, composition required for new stats.
- `Navigation Shell`: Reusable as-is.
- `UbitsIcon`: Reusable as-is.
- `Button`, `Card`, `Alert`, `Table`, `Progress`, `Tabs`, `Drawer`, `Tooltip`: Reusable as-is.
**COMPONENT_MODIFICATION_DECISION_REQUIRED** if core changes are needed to Shadcn components.

## 22. First Screen Architecture
- **Carga y validación inicial**
- Responsibilities: Select one synthetic base workbook, show local-only reassurance, show file admission state, show sheet recognition, show validation summary, show blocking errors and warnings, allow remove or replace, enable continuation only when valid.
- Out of scope: Comparative dashboard, Detailed segment analytics, AI insights, Core publication, Historical records, Real routes, Backend states.

## 23. Product Decisions
- **TWO_PERIOD_SANDBOX_RECOMMENDED**
- **PRODUCT_DECISION_PENDING** (Multiple files policy)
- **REPORT_AND_REPLACE_ONLY**
- **NO_INLINE_DATA_EDITING** (for the first screen)

## 24. Architecture Decisions
- In-memory architecture locked.
- No network transmission locked.
- Worker strategy: Main thread recommended for synthetic files.

## 25. Risks
- Browser memory exhaustion (Likelihood: Medium, Impact: High, Mitigation: Set size limits, Gate: Pending Limits Decision).
- Main-thread blocking (Likelihood: High on large files, Impact: Medium, Mitigation: Worker strategy or strict size limits).
- Malicious or malformed workbook.
- Formula payloads.
- Unexpected sheet dimensions.
- Open-text exposure.
- Reidentification through segments.
- Incorrect cross-period matching.
- eNPS transformation errors.
- Metric drift from future backend.
- Dependency licensing.
- Unsupported browser APIs.

## 26. Mock Data Contract Requirements
The mock data contract MUST reflect the canonical entities and required sheets (answers, Dimensions, colaboradores, Jerarquía) without containing actual real data.

## 27. Entry Criteria for SYN2
[x] Architecture document approved
[x] Workbook families defined
[x] Canonical entities defined
[x] Required sheets defined
[x] Required column categories defined
[x] Question types defined
[x] Validation issue model defined
[x] Comparison status model defined
[x] Privacy decision model defined
[x] Metrics requiring policy decisions identified
[x] No real data included
[x] XLSX generation does not require an unauthorized dependency

## 28. Prohibited Implementation
- No UI code, routes, mocks, or physical files were generated in this phase.
- No real data was used.
- No external APIs or backend persistence allowed.

## 29. Approval Record
SYNTHETIC_SANDBOX_ARCHITECTURE_LOCKED
