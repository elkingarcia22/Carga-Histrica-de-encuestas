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

## Segregation of Duties & Conflicts
No owners have been assigned yet. The following conflicts must be assessed when assigning owners:
* **Uploader + Mapping Corrector:** Candidate, requires policy.
* **Mapping Corrector + Mapping Approver:** Segregation decision required.
* **Mapping Approver + Core Publisher:** High-impact segregation decision.
* **Core Publisher + Auditor:** Preferably separated.
* **Security Owner + Security Auditor:** Independence review required.
* **Deletion Operator + Deletion Evidence Approver:** Separation recommended.
* **Developer + Production Approver:** Change-management decision required.

## Governance Rules
* Do not replace `ROLE_OWNER_TBD` without verifiable evidence.
* Differentiate clearly between role, team, and person.
* Explicitly record who approves (A), executes (R), is consulted (C), and is informed (I).
* Maintain segregation of duties as listed above.
