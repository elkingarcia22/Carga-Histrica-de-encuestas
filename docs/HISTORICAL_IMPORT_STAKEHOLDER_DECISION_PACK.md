# HISTORICAL_IMPORT_STAKEHOLDER_DECISION_PACK

## 1. Executive Summary
The Historical Survey Import project has reached the `4K-R1H2A` architecture preconditions gate. The current state is a functional frontend prototype with in-memory persistence. To proceed to `Architecture Lock` and subsequent implementation, a set of formal corporate, privacy, security, and infrastructure decisions must be resolved and approved by designated stakeholders. This document outlines those required decisions and the necessary steps to unblock the project.

## 2. Current Verified State
* **Application:** Frontend React/Vite application.
* **Persistence:** In-memory TypeScript models only.
* **Backend/Infrastructure:** Not implemented and not authorized.
* **Authentication/Authorization:** Not found.
* **Tenant Isolation:** Not found.
* **Status:** `HISTORICAL_IMPORT_STAKEHOLDER_DECISION_PACK_COMPLETED`, `STAKEHOLDER_DECISIONS_REQUIRED`.

## 3. Why Architecture Lock is Blocked
Architecture Lock está bloqueado porque no existen decisiones autorizadas y verificables sobre persistencia, infraestructura, tenant isolation, autenticación, autorización, privacidad, retención, ownership operativo, residencia de datos y contrato de publicación.

## 4. Decisions Required
Key decisions must be made across the following domains:
* Product and Data Ownership
* Physical Persistence and Infrastructure
* Tenant Isolation Model
* Authentication and Authorization (RBAC)
* Privacy, PII, and Retention
* AI Governance
* Observability and Operations
* Safe Sample Materialization

## 5. Stakeholder Groups
The following groups must be engaged to resolve these decisions:
* Product Management
* Data Architecture / Data Platform
* Enterprise Architecture / Infrastructure
* Security Engineering
* Privacy and Legal
* Operations and Support

## 6. Decision Sequence
1. **Wave 1 — Ownership and governance**: Product owner, Technical owner, Data owner, Security owner, Privacy approver, Deployment owner, Incident owner.
2. **Wave 2 — Privacy and tenant boundaries**: PII, Retention, Region, Tenant identifier, Tenant isolation, Client authorization, Safe sample rules.
3. **Wave 3 — Platform decisions**: Cloud, Database, Storage, Queue, Worker, Authentication, Secrets, Observability.
4. **Wave 4 — Workflow authority**: RBAC, Mapping approval, Staging review, Publication, Deletion, Audit.
5. **Wave 5 — Samples and Architecture Lock**: Sanitization authorization, Safe sample storage, Sample certification, Architecture Lock authorization.

## 7. Decision Dependencies
* Infrastructure decisions depend on Region and Cloud Provider approvals.
* RBAC depends on the chosen Authentication Provider.
* Safe sample generation depends on PII policy and sanitization approval.
* Architecture Lock depends on all of the above.

## 8. Temporary Safe Postures
While decisions remain open, the following postures are enforced:
* `NO_PRODUCTIVE_FILE_UPLOAD`
* `NO_PRODUCTIVE_FILE_PROCESSING`
* `NO_MULTI_TENANT_PROCESSING`
* `NO_CORE_PUBLICATION`
* `NO_PRODUCTIVE_PERSISTENCE`
* `NO_RAW_FILES_IN_GIT`
* `NO_PRODUCTIVE_PII_IN_LOGS`
* `NO_PRODUCTIVE_FILE_CONTENT_SENT_TO_AI`
* `NO_UNATTENDED_APPROVAL`
* `NO_IMPLEMENTATION_PHASE_AUTHORIZED`
* `AI_PRODUCTIVE_FILE_CONTENT_DISABLED_UNTIL_CORPORATE_APPROVAL`
* `PRODUCTIVE_RAW_SAMPLE_PROCESSING_NOT_AUTHORIZED`

## 9. Required Evidence
Each decision must be accompanied by verifiable corporate evidence (e.g., official policy document link, Jira ticket approval, signed DPA, architecture board meeting minutes).

## 10. Approval Requirements
All decisions require an explicit owner and an authorized approver. "TBD" is acceptable only while the decision is OPEN.

## 11. Architecture Preconditions
Before any backend or infrastructure implementation can begin, all items in the `HISTORICAL_IMPORT_ARCHITECTURE_PRECONDITIONS_CHECKLIST.md` must be APPROVED.

## 12. Recommended Meeting Agenda
1. Review Current Verified State and Temporary Safe Postures.
2. Assign Owners to "Wave 1" items.
3. Distribute the Stakeholder Questionnaire.
4. Set deadlines for "Wave 2" and "Wave 3" decisions.

## 13. Expected Outputs
* Completed and signed Decision Register.
* Formal policies for PII, Retention, and AI usage.
* Provisioned infrastructure accounts/projects (post-approval).
* Certified safe samples for development.

## 14. No-Go Conditions
Architecture Lock cannot initiate if:
* No existe product owner.
* No existe technical owner.
* No existe data owner.
* No existe security/privacy approver.
* No existe tenant identifier.
* No existe estrategia de aislamiento.
* No existe política de PII.
* No existe política de retención.
* No existe región autorizada.
* No existe dirección de persistencia.
* No existe almacenamiento autorizado.
* No existe modelo de autenticación.
* No existe autoridad RBAC.
* No existe segregación de aprobación y publicación.
* No existe contrato staging-to-Core.
* No existe política de IA.
* No existen samples sanitizados certificados.
* Se pretende almacenar raw files en Git.
* Se pretende procesar datos reales solo en memoria frontend.
* Se pretende seleccionar infraestructura sin owner ni approver.
