# HISTORICAL_IMPORT_DECISION_REGISTER

## Scope
This document tracks the mandatory decision gates required to advance the Historical Survey Import project into a productive ingestion phase.

## Decision Gates

| ID | Status | Question | Evidence | Source of Truth | Owner | Required Approver | Closure Criteria | Dependencies | Impact if Open | Last Verified Commit | Notes |
|----|--------|----------|----------|-----------------|-------|-------------------|------------------|--------------|----------------|----------------------|-------|
| HI-DEC-001 | OWNER_DECISION_REQUIRED | Physical persistence schema | NOT_FOUND | None | TBD | TBD | Authorized DB Schema | None | Blocks Data Layer | 635b702 | Model is functional, not physical. |
| HI-DEC-002 | OWNER_DECISION_REQUIRED | Canonical tenant identifier | NOT_FOUND | None | TBD | TBD | Defined Tenant ID | None | Blocks isolation | 635b702 | No tenant context in codebase. |
| HI-DEC-003 | OWNER_DECISION_REQUIRED | Database tenant isolation | NOT_FOUND | None | TBD | TBD | RLS/Middleware rules | HI-DEC-001, HI-DEC-002 | Security risk | 635b702 | No DB isolation mechanisms exist. |
| HI-DEC-004 | OWNER_DECISION_REQUIRED | Object storage tenant isolation | NOT_FOUND | None | TBD | TBD | Bucket prefix/policy | HI-DEC-002 | Security risk | 635b702 | No bucket implementation exists. |
| HI-DEC-005 | OWNER_DECISION_REQUIRED | Authentication provider | NOT_FOUND | None | TBD | TBD | Configured Auth | None | Blocks authz | 635b702 | No auth code exists. |
| HI-DEC-006 | OWNER_DECISION_REQUIRED | RBAC authority | NOT_FOUND | None | TBD | TBD | Role mapping | HI-DEC-005 | Security risk | 635b702 | Roles not mapped to users. |
| HI-DEC-007 | OWNER_DECISION_REQUIRED | Approval authority | NOT_FOUND | None | TBD | TBD | Approval Role | HI-DEC-006 | Governance risk | 635b702 | Missing workflow role definition. |
| HI-DEC-008 | OWNER_DECISION_REQUIRED | Publication authority | NOT_FOUND | None | TBD | TBD | Publish Role | HI-DEC-006 | Governance risk | 635b702 | Missing workflow role definition. |
| HI-DEC-009 | OWNER_DECISION_REQUIRED | Cloud provider | NOT_FOUND | None | TBD | TBD | Approved Provider | None | Blocks deployment | 635b702 | No IaC found. |
| HI-DEC-010 | OWNER_DECISION_REQUIRED | Operational database | NOT_FOUND | None | TBD | TBD | Approved DB Engine | HI-DEC-009 | Blocks persistence | 635b702 | Missing tech stack definition. |
| HI-DEC-011 | OWNER_DECISION_REQUIRED | Object storage | NOT_FOUND | None | TBD | TBD | Approved Storage | HI-DEC-009 | Blocks file upload | 635b702 | Missing tech stack definition. |
| HI-DEC-012 | OWNER_DECISION_REQUIRED | Queue | NOT_FOUND | None | TBD | TBD | Approved Queue | HI-DEC-009 | Blocks async jobs | 635b702 | Missing tech stack definition. |
| HI-DEC-013 | OWNER_DECISION_REQUIRED | Worker runtime | NOT_FOUND | None | TBD | TBD | Approved Runtime | HI-DEC-009 | Blocks processing | 635b702 | Missing tech stack definition. |
| HI-DEC-014 | OWNER_DECISION_REQUIRED | Secrets management | NOT_FOUND | None | TBD | TBD | Approved Vault | HI-DEC-009 | Security risk | 635b702 | No secrets configuration found. |
| HI-DEC-015 | OWNER_DECISION_REQUIRED | Encryption | NOT_FOUND | None | TBD | TBD | Encryption Strategy | None | Compliance risk | 635b702 | Missing security definition. |
| HI-DEC-016 | OWNER_DECISION_REQUIRED | Malware scanning | NOT_FOUND | None | TBD | TBD | Scanning mechanism | HI-DEC-011 | Security risk | 635b702 | Missing upload security. |
| HI-DEC-017 | OWNER_DECISION_REQUIRED | PII allowlist | NOT_FOUND | None | TBD | TBD | Corporate Policy | None | Privacy risk | 635b702 | No PII handling rules found. |
| HI-DEC-018 | OWNER_DECISION_REQUIRED | PII blocklist | NOT_FOUND | None | TBD | TBD | Corporate Policy | None | Privacy risk | 635b702 | No PII handling rules found. |
| HI-DEC-019 | OWNER_DECISION_REQUIRED | Open-text handling | NOT_FOUND | None | TBD | TBD | Corporate Policy | None | Privacy risk | 635b702 | No text sanitization rules. |
| HI-DEC-020 | OWNER_DECISION_REQUIRED | Retention | NOT_FOUND | None | TBD | TBD | Retention Policy | None | Compliance risk | 635b702 | Proposed 7 days unverified. |
| HI-DEC-021 | OWNER_DECISION_REQUIRED | Deletion evidence | NOT_FOUND | None | TBD | TBD | Deletion Workflow | HI-DEC-020 | Compliance risk | 635b702 | No automated deletion proven. |
| HI-DEC-022 | OWNER_DECISION_REQUIRED | Processing region | NOT_FOUND | None | TBD | TBD | Approved Region | HI-DEC-009 | Compliance risk | 635b702 | Data residency undefined. |
| HI-DEC-023 | OWNER_DECISION_REQUIRED | AI provider | NOT_FOUND | None | TBD | TBD | Authorized AI | None | Blocks intelligence | 635b702 | AI currently simulated. |
| HI-DEC-024 | OWNER_DECISION_REQUIRED | AI data-transfer policy | NOT_FOUND | None | TBD | TBD | AI DPA / Policy | HI-DEC-023 | Privacy risk | 635b702 | No data transfer agreement. |
| HI-DEC-025 | OWNER_DECISION_REQUIRED | Observability | NOT_FOUND | None | TBD | TBD | Approved Metrics/Logs | HI-DEC-009 | Ops risk | 635b702 | No APM or logging setup. |
| HI-DEC-026 | OWNER_DECISION_REQUIRED | Incident ownership | NOT_FOUND | None | TBD | TBD | On-call Team | None | Support risk | 635b702 | No CODEOWNERS / Runbooks. |
| HI-DEC-027 | OWNER_DECISION_REQUIRED | Deployment ownership | NOT_FOUND | None | TBD | TBD | Owner Team | None | Support risk | 635b702 | No CODEOWNERS found. |
| HI-DEC-028 | OWNER_DECISION_REQUIRED | Safe sample storage | NOT_FOUND | None | TBD | TBD | Approved Storage | HI-DEC-017 | Blocks development | 635b702 | Storage location undefined. |
| HI-DEC-029 | OWNER_DECISION_REQUIRED | Sample sanitization approval | NOT_FOUND | None | TBD | TBD | Security Sign-off | HI-DEC-028 | Blocks development | 635b702 | No verified samples. |
| HI-DEC-030 | BLOCKED | Architecture Lock authorization | NOT_FOUND | None | TBD | TBD | All gates closed | ALL ABOVE | Blocks project | 635b702 | Awaiting corporate decisions. |
