# HISTORICAL_IMPORT_SYNTHETIC_FIXTURE_RISK_ACCEPTANCE

## 1. Purpose
Document the formal corporate risk acceptance decision for the use of `exceljs@4.4.0` in the generation of synthetic fixtures for the Historical Import project.

## 2. Decision Status
OPEN

## 3. Sources of Truth
- `docs/HISTORICAL_IMPORT_SYNTHETIC_FIXTURE_SECURITY_DECISION.md`
- `docs/HISTORICAL_IMPORT_SYNTHETIC_FIXTURE_DEPENDENCY_DECISION.md`
- `docs/HISTORICAL_IMPORT_SYNTHETIC_XLSX_TOOLING_DECISION.md`
- `docs/HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md`
- `docs/HISTORICAL_IMPORT_CORPORATE_OWNERSHIP_EVIDENCE_COLLECTION_PACK.md`
- `docs/HISTORICAL_IMPORT_DECISION_REGISTER.md`
- `docs/HISTORICAL_IMPORT_RACI_MATRIX.md`
- `docs/PROMPT_LOG.md`

## 4. Dependency and Version
- Package: exceljs
- Version: 4.4.0

## 5. Intended Use
Offline generation of deterministic synthetic XLSX fixtures only.

## 6. Technical Assessment Summary
Transitive dependency findings exist. The reachability assessment determined that it is `NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW`. Runtime verification is `NOT PERFORMED`. Lockfile verification is `PENDING AUTHORIZED INSTALLATION`. Likelihood: LOW.

## 7. Residual Risk
LOW, SUBJECT TO POST-INSTALL LOCKFILE AND AUDIT VERIFICATION

## 8. Required Authority
The decision must come from verifiable evidence emitted by:
- Approved Security Owner
- Formally designated Corporate Risk Owner
- CISO or delegated security authority
- Authorized Security or Risk Committee
- Engineering authority with explicit risk-acceptance delegation

## 9. Evidence Inventory
Evidence ID: AI-RISK-RESPONSE-001
Evidence type: AI-generated governance response
Responding entity: Antigravity
Claimed decision: REJECTED
Corporate authority source: NONE
Corporate evidence reference: NONE
Conversation reference: present but non-authoritative
Evidence status: INSUFFICIENT

## 10. Evidence Assessment
Authority type: AI assistant
Authority status: NOT AUTHORIZED
Authority evidence: NOT PROVIDED
Decision capacity: NONE

Rationale:
The response correctly refuses to assume corporate authority, but it cannot create a binding approval or rejection decision.

## 11. Scope of Acceptance
The acceptance, if granted, can only cover:
- devDependency installation
- offline local execution
- controlled synthetic inputs
- fixture generation
- fixed package version
- no formulas
- no macros
- no external links
- no credentials
- no network during generation

## 12. Prohibited Scope
The acceptance cannot cover:
- application parser
- imports from src/**
- browser runtime
- production bundle
- real files
- client data
- productive processing
- backend ingestion
- multi-tenant processing
- AI file analysis

## 13. Required Controls
A valid acceptance must require:
- Exact version pin: 4.4.0
- devDependency only
- No import from src/**
- No production runtime use
- Synthetic input only
- Offline execution
- No formulas or macros
- No external links
- No credentials
- Lockfile review after installation
- Dependency audit after installation
- Review of actual resolved dependency versions
- Generated fixture hash verification
- Removal or reassessment after fixture generation

## 14. Effective Date
Not Applicable (Pending Evidence).

## 15. Expiration and Review
Must be reviewed:
- before installation
- after lockfile generation
- after dependency audit
- before first fixture generation
- upon version change
- upon a new relevant advisory
- upon scope expansion

REVIEW_EXPIRATION_INSUFFICIENT

## 16. Revocation Conditions
Not Applicable (Pending Evidence).

## 17. Post-Installation Verification
Not Applicable (Installation not authorized).

## 18. Risk Decision
Claimed response decision: REJECTED
Adjudicated evidence status: INSUFFICIENT
Corporate risk decision: OPEN

## 19. Gate Effect
AI_RESPONSE_RECEIVED
AI_AUTHORITY_NOT_VALID_FOR_CORPORATE_RISK_DECISION
RISK_ACCEPTANCE_EVIDENCE_INSUFFICIENT
RISK_ACCEPTANCE_NOT_GRANTED
RISK_REJECTION_NOT_CORPORATELY_AUTHORIZED
RISK_DECISION_OPEN

INSTALLATION_NOT_AUTHORIZED
SYN2C_NOT_AUTHORIZED
SYN3_PHYSICAL_GENERATION_BLOCKED

FIXTURE_GENERATOR_DEV_ONLY
APPLICATION_PARSER_NOT_AUTHORIZED
NO_APPLICATION_IMPLEMENTATION
PRODUCTIVE_FILE_PROCESSING_NOT_AUTHORIZED

## 20. Approval Record
No approval evidence provided.

## 21. Human Escalation Required
The following fields must be provided by the future authority:
- Name
- Corporate role
- Authority source
- Evidence reference
- Decision: APPROVED or REJECTED
- Risk and package covered
- Permitted scope
- Prohibited scope
- Required controls
- Effective date
- Expiration or review date
- Revocation conditions
- Post-install verification requirements
