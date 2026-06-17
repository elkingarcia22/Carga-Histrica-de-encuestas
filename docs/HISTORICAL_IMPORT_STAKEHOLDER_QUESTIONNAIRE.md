# HISTORICAL_IMPORT_STAKEHOLDER_QUESTIONNAIRE

## Product
1. **Decision ID:** HI-Q-PROD-001
   **Question:** ¿Cuál equipo será propietario operativo del servicio de ingesta histórica?
   **Why it is needed:** To assign the Product Owner and Technical Owner roles for the vertical.
   **Target Responder:** Product Leadership / VP of Engineering.
   **Unlocks:** Wave 1 governance decisions.
   **Fallback Posture:** `NO_IMPLEMENTATION_PHASE_AUTHORIZED`

2. **Decision ID:** HI-Q-PROD-002
   **Question:** ¿La misma persona puede corregir el mapping y aprobar la publicación a Core?
   **Why it is needed:** To define segregation of duties in the RBAC model.
   **Target Responder:** Product Owner / Compliance.
   **Unlocks:** Approval and publication authority (Wave 4).
   **Fallback Posture:** `NO_UNATTENDED_APPROVAL`

## Data
3. **Decision ID:** HI-Q-DATA-001
   **Question:** ¿Quién es el Data Owner responsable de la información de las encuestas históricas?
   **Why it is needed:** To authorize data processing, retention, and AI usage.
   **Target Responder:** Data Governance / Chief Data Officer.
   **Unlocks:** Wave 1 governance decisions.
   **Fallback Posture:** `NO_PRODUCTIVE_FILE_PROCESSING`

4. **Decision ID:** HI-Q-DATA-002
   **Question:** ¿Cuál es el identificador canónico de tenant que debe propagarse desde la sesión hasta la base de datos, object storage, jobs y audit trail?
   **Why it is needed:** To implement strict tenant isolation across all layers.
   **Target Responder:** Enterprise Architecture / Data Platform.
   **Unlocks:** Tenant isolation strategy (Wave 2).
   **Fallback Posture:** `NO_MULTI_TENANT_PROCESSING`

## Engineering & Infrastructure
5. **Decision ID:** HI-Q-INFRA-001
   **Question:** ¿Qué proveedor cloud y región están autorizados corporativamente para almacenar y procesar archivos de encuestas de clientes?
   **Why it is needed:** To establish the foundational deployment environment and comply with data residency.
   **Target Responder:** Enterprise Architecture / Cloud Infrastructure.
   **Unlocks:** Cloud, Database, Storage, and Worker runtime choices (Wave 3).
   **Fallback Posture:** `NO_PRODUCTIVE_PERSISTENCE`

6. **Decision ID:** HI-Q-INFRA-002
   **Question:** ¿Qué motor de base de datos relacional y servicio de object storage se utilizarán para staging y almacenamiento de originales?
   **Why it is needed:** To design the physical persistence layer.
   **Target Responder:** Infrastructure / Data Platform.
   **Unlocks:** Physical persistence schema (Wave 3).
   **Fallback Posture:** `NO_PRODUCTIVE_PERSISTENCE`

7. **Decision ID:** HI-Q-INFRA-003
   **Question:** ¿Qué proveedor de autenticación corporativo se utilizará para validar las sesiones y proveer los claims de identidad y tenant?
   **Why it is needed:** To implement the authentication middleware and establish RBAC.
   **Target Responder:** Security Architecture / Identity Team.
   **Unlocks:** Authentication model (Wave 3).
   **Fallback Posture:** `NO_IMPLEMENTATION_PHASE_AUTHORIZED`

## Security, Privacy, and Legal
8. **Decision ID:** HI-Q-SEC-001
   **Question:** ¿Cuáles son las reglas exactas de PII permitida, enmascarada o bloqueada en los archivos de encuestas históricas?
   **Why it is needed:** To design the sanitization and parsing logic, and to ensure compliance.
   **Target Responder:** Privacy / Legal / Security.
   **Unlocks:** PII allowlist/blocklist (Wave 2).
   **Fallback Posture:** `PRODUCTIVE_RAW_SAMPLE_PROCESSING_NOT_AUTHORIZED`

9. **Decision ID:** HI-Q-SEC-002
   **Question:** ¿Durante cuánto tiempo puede conservarse el archivo original, los datos de staging y los logs después de una importación completada o fallida?
   **Why it is needed:** To implement automated lifecycle and deletion workflows.
   **Target Responder:** Privacy / Legal / Data Owner.
   **Unlocks:** Retention and deletion evidence (Wave 2).
   **Fallback Posture:** `NO_PRODUCTIVE_FILE_UPLOAD`

10. **Decision ID:** HI-Q-SEC-003
    **Question:** ¿Quién puede aprobar la creación de samples sanitizados derivados de archivos reales de clientes, y dónde deben almacenarse?
    **Why it is needed:** To provide developers with safe test data without violating privacy or storing raw data in Git.
    **Target Responder:** Security / Privacy / Data Owner.
    **Unlocks:** Safe sample storage and certification (Wave 5).
    **Fallback Posture:** `NO_RAW_FILES_IN_GIT`

## AI Governance
11. **Decision ID:** HI-Q-AI-001
    **Question:** ¿Está autorizado enviar headers, respuestas abiertas o metadata del archivo a un proveedor de IA? En caso afirmativo, ¿cuál es el proveedor y contrato (DPA) autorizado?
    **Why it is needed:** To enable AI-assisted mapping while ensuring zero data retention and compliance.
    **Target Responder:** Legal / Security / AI Governance.
    **Unlocks:** AI policy (Wave 3).
    **Fallback Posture:** `AI_PRODUCTIVE_FILE_CONTENT_DISABLED_UNTIL_CORPORATE_APPROVAL`

## Operations
12. **Decision ID:** HI-Q-OPS-001
    **Question:** ¿Quién será el equipo On-call responsable de responder a incidentes en producción para el servicio de ingesta?
    **Why it is needed:** To define SLOs, alerting routes, and support access.
    **Target Responder:** Operations / SRE / Product Leadership.
    **Unlocks:** Incident ownership (Wave 1).
    **Fallback Posture:** `NO_IMPLEMENTATION_PHASE_AUTHORIZED`
