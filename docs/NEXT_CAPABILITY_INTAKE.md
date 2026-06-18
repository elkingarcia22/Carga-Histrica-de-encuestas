# Next Capability Intake · Comparativo de Encuestas UBITS

## 1. Current Prototype State
The first screen of the prototype (`Comparativo de Encuestas UBITS`) has been formally closed. The `ComparisonViewModel` boundary is reconfirmed, and UBITS visual alignment is applied. The prototype remains strictly synthetic.

## 2. Closed First Screen Summary
The `ComparisonResultsDashboard` is fully implemented using mock data. It visually represents the `PeriodComparisonResult` contract with UBITS enterprise design tokens. The layout, responsiveness, and component boundaries are verified.

## 3. Candidate Capabilities
- **Opción A · Upload UI Architecture**: Architecture for future synthetic file upload. Includes visual selection, validation states, error messaging, and parser boundaries. No productive processing.
- **Opción B · First Screen Polish / Visual QA Iteration**: Minor enhancements to the closed screen (layout refinement, responsive tweaks, visual QA).
- **Opción C · Drilldown Architecture**: Architecture for a detailed question view. Includes question selection, detailed distribution, base vs. comparison, and non-comparability states. No routes or AI insights.
- **Opción D · Runtime Synthetic Pipeline Architecture**: Architecture to connect synthetic fixtures to the local runtime pipeline (parser -> normalization -> metrics -> comparison -> view model).
- **Opción E · Insights IA Intake**: Exploration of an AI-first insights layer. Includes use cases, risks, boundaries, and value criteria. No implementation.

## 4. Decision Matrix

| Capability Option | Product Value | Technical Risk | Governance Risk | Dependency Complexity | Fit with Architecture | Recommended Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Upload UI Architecture** | Medium | Medium | Medium | Low | High | Medium |
| **B. First Screen Polish** | Low | Low | Low | Low | High | Low |
| **C. Drilldown Architecture** | High | Low | Low | Low | High | High |
| **D. Runtime Pipeline** | High | High | Medium | High | Medium | Medium |
| **E. Insights IA Intake** | Medium | Medium | High | Low | Low | Low |

## 5. Recommended Next Capability
**Opción C · Drilldown Architecture**
*Reasoning*: It allows advancing the analytical value of the dashboard without opening up real file uploads, APIs, productive data processing, or AI integration risks.

## 6. Risks and Constraints
- Risk of scope creep into real implementation if not strictly limited to architecture.
- Must avoid real API integrations or storage.
- UI must not be built during the architecture phase.

## 7. Data Boundary
- Strictly synthetic data (`ComparisonViewModel`).
- No processing of real client data.
- No network file transmission.

## 8. UX Boundary
- No actual routes created yet.
- No new UI components constructed in this phase.
- Design definitions must align with established UBITS tokens.

## 9. Technical Dependencies
- Existing `ComparisonViewModel` structures.
- Established UI components for reference.
- Documentation standards.

## 10. Decision Gate
- NEXT_CAPABILITY_INTAKE_COMPLETED
- Recommended capability selected and documented.
- All prohibitions remain actively enforced.

## 11. Next Authorized Phase
- SYN4C14_DRILLDOWN_ARCHITECTURE_READY

## 12. Final Status Markers
PHASE_4K_SYN4C13_COMPLETE
NEXT_CAPABILITY_INTAKE_COMPLETED
NEXT_CAPABILITY_DECISION_MATRIX_DOCUMENTED
FIRST_SCREEN_REMAINS_FORMALLY_CLOSED
NO_UPLOAD_UI_YET
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
SYN4C14_DRILLDOWN_ARCHITECTURE_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
