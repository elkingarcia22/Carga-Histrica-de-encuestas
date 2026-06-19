# Conversational Import Next Capability Intake · Comparativo de Encuestas UBITS

## 1. Current State
- The `Conversational Import Workspace` has been formally closed as the first screen of the prototype.
- The downstream comparison dashboard and drilldown feature exist but are currently disconnected from the conversational flow.
- Strict boundaries remain in place: no real uploads, no file inputs, no productive processing, no real data, no APIs, no storage, and no real AI.

## 2. Decision Context
Following the formal closure of the conversational workspace interface, the next logical step must be defined. The goal is to select a small, sequential, and verifiable capability that advances the prototype's functionality without breaking established boundaries (data, AI, API). We need to decide how the user interacts with the detected mock structure before moving to the downstream dashboard or simulating a more complex upload process.

## 3. Candidate Options

### Opción A · Connect Mock Contract to Downstream Dashboard
- **Objetivo conceptual:** Conectar el ApprovedSurveyImportContractMock con una transición hacia el dashboard comparativo downstream.
- **Riesgo:** Puede parecer procesamiento real si no se comunica como mock.

### Opción B · Conversational Interaction Polish
- **Objetivo conceptual:** Mejorar microinteracciones del chat: estados, mensajes, selección de escenarios, mejor empty/error/loading, mayor claridad de aprobación.
- **Riesgo:** Bajo riesgo técnico, pero bajo impacto si no cambia la narrativa del prototipo.

### Opción C · Inline Structure Review Architecture
- **Objetivo conceptual:** Diseñar cómo el usuario editará demográficos, dimensiones, preguntas y mapeos dentro del flujo conversacional.
- **Riesgo:** Requiere bloquear reglas de edición antes de construir controles.

### Opción D · Simulated Upload Experience Architecture
- **Objetivo conceptual:** Diseñar una experiencia visual de carga simulada más realista sin input real, FileReader ni procesamiento productivo.
- **Riesgo:** Alto riesgo de confusión con carga real.

### Opción E · Future AI-first Intake
- **Objetivo conceptual:** Definir si habrá una capa IA futura para explicar hallazgos o sugerir mapeos.
- **Riesgo:** Requiere decision gate fuerte por IA, privacidad, datos y expectativas.

## 4. Decision Matrix

| Opción | Valor de negocio | Complejidad técnica | Riesgo de gobernanza | Dependencia de datos reales | Requiere nueva arquitectura | Requiere build inmediata | Recomendación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A** (Connect Dashboard) | Alto | Media | Medio | No | No | Sí | No |
| **B** (Interaction Polish) | Bajo | Baja | Bajo | No | No | Sí | No |
| **C** (Inline Review) | Alto | Media | Bajo | No | Sí | No | Sí |
| **D** (Simulated Upload) | Medio | Alta | Alto | No | Sí | No | No |
| **E** (AI-first Intake) | Alto | Alta | Alto | No | Sí | No | No |

## 5. Recommended Next Capability
**Opción C · Inline Structure Review Architecture**

**Justificación:** Antes de conectar dashboard o simular upload más realista, se debe bloquear cómo el usuario podrá corregir o aprobar la estructura detectada: demográficos, dimensiones, preguntas y mapeos.

## 6. Rejected or Deferred Options
- **Opción A:** Deferred until the user review flow (Option C) is fully defined and built.
- **Opción D:** Deferred to avoid confusion with real file uploads until the core conversational logic is complete.
- **Opción E:** Deferred as it requires significant architectural and governance decisions regarding AI integration.
- **Opción B:** Deferred as it is low impact and can be done during final polish phases.

## 7. Risks
- **Scope Creep:** Designing the inline review architecture might lead to overly complex editing rules. We must keep the mock interactions simple and scoped.
- **Boundary Violation:** Attempting to build before locking the architecture could lead to accidental implementations of real form states or state management that breaks current constraints.

## 8. Required Gates
- **Architecture Lock:** The inline structure review architecture must be fully documented and approved before any UI is built.
- **Mock Contract Update:** If the review process requires changes to the `ApprovedSurveyImportContractMock`, these must be defined.

## 9. Success Criteria
- The rules and interactions for editing demographics, dimensions, questions, and mappings are fully documented.
- No UI components are built in the next phase, only architecture documentation.
- The `4K-CHAT8` phase is ready to be executed.

## 10. Next Authorized Phase
`4K-CHAT8 · Inline Structure Review Architecture`

## 11. Final Status Markers
```text
PHASE_4K_CHAT7_COMPLETE
NEXT_CAPABILITY_INTAKE_COMPLETED
CONVERSATIONAL_IMPORT_WORKSPACE_REMAINS_FORMALLY_CLOSED
NEXT_CAPABILITY_DECISION_MATRIX_DOCUMENTED
INLINE_STRUCTURE_REVIEW_RECOMMENDED
NO_REAL_UPLOAD_CREATED
NO_FILE_INPUT_CREATED
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
NO_API_CONNECTIONS
NO_STORAGE
CHAT8_INLINE_STRUCTURE_REVIEW_ARCHITECTURE_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
```
