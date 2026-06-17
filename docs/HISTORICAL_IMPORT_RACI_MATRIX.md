# HISTORICAL_IMPORT_RACI_MATRIX

This RACI matrix defines responsibilities for the Historical Survey Import project during the architecture, implementation, and operational phases.

**R** = Responsible (Does the work)
**A** = Accountable (Approves the work, ultimate ownership)
**C** = Consulted (Provides input before a decision or action)
**I** = Informed (Notified after a decision or action)

| Activity | Product Owner | Technical Owner | Data Owner | Security / Privacy | Ops / Infra |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Approve architecture (Architecture Lock)** | A | R | C | C | C |
| **Own database & storage (Cost/Ops)** | I | C | I | I | A/R |
| **Define PII allowlist/blocklist** | C | I | A | R | I |
| **Approve retention & deletion policy** | I | I | A | R | C |
| **Authorize sample sanitization** | C | I | A | R | I |
| **Execute and review sanitized samples** | I | R | C | A | I |
| **Operate worker queues & runtime** | I | R | I | I | A |
| **Respond to production incidents** | I | R | I | C | A |
| **Approve data mapping (Workflow)** | R/A | I | C | I | I |
| **Publish to Core (Workflow)** | R/A | I | I | I | I |
| **Delete raw files (Lifecycle)** | I | R | I | A | C |
| **Audit imports (Compliance)** | I | I | A | R | I |

*Note: Roles not currently filled are designated as `ROLE_OWNER_TBD` in the Decision Register.*
