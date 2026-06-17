# HISTORICAL_IMPORT_PHYSICAL_PERSISTENCE_MAPPING

## Overview
This document maps the canonical functional data model to its physical persistence schema in the productive environment.

## Verdict
**PHYSICAL_PERSISTENCE_SCHEMA_OWNER_INPUT_REQUIRED**
The current repository is a pure frontend implementation (Vite + React + TypeScript). There are no database configurations, ORM schemas (Prisma, Drizzle, Mongoose), or SQL migrations. The entire data model is currently only defined as TypeScript interfaces in memory (`src/types/survey-import/`).

## Entity Mapping

| Functional entity | Physical table or collection | Primary key | Tenant key | Foreign keys | Unique constraints | Idempotency rule | PII fields | Staging equivalent | Publication target | Source of truth | Confidence | Gate status |
|-------------------|------------------------------|-------------|------------|--------------|--------------------|------------------|------------|--------------------|--------------------|-----------------|------------|-------------|
| Tenant / Organization | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Survey | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Survey Version | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Question | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Scale | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Dimension/Competency | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Participant | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Historical Period | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Response | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Answer | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Import Batch | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Mapping Draft | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Staging Record | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Publication Record | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |
| Audit Event | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | NOT_FOUND | Pending | NOT_FOUND | NOT_FOUND | None | High | OWNER_DECISION_REQUIRED |

## Limitations
No physical schema was inferred or invented. A corporate decision must be made regarding the database engine and table design before any backend implementation can begin.
