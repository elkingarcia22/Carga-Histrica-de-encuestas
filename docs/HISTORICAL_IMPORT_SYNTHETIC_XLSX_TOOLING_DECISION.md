# Historical Import Synthetic XLSX Tooling Decision

## 1. Purpose
Evaluate offline mechanisms for deterministic generation of synthetic XLSX test fixtures (base and comparison) without using real data, accessing the network, or prematurely installing application dependencies, and emit a formal decision gate for phase SYN3.

## 2. Decision Status
SYNTHETIC_XLSX_GENERATION_MECHANISM_PENDING_DEPENDENCY_GATE
SYN3_PHYSICAL_GENERATION_BLOCKED

## 3. Sources of Truth
- `docs/HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md`
- `docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_ARCHITECTURE.md`
- `package.json`

## 4. Current Tooling State
Currently, there is no authorized mechanism to generate XLSX. The environment is configured for the frontend application with standard React/TypeScript tooling, but lacks spreadsheet manipulation libraries.

## 5. Existing Repository Libraries
- **Option A Assessment:** `EXISTING_REPOSITORY_XLSX_GENERATOR_NOT_AVAILABLE`
- `package.json` was inspected. No XLSX generation libraries (e.g., `xlsx`, `exceljs`) are installed. 

## 6. Existing Environment Capabilities
- **Option B Assessment:** `EXISTING_ENVIRONMENT_PYTHON_XLSX_GENERATOR_NOT_AVAILABLE`
- Python runtime is available, but libraries such as `openpyxl`, `xlsxwriter`, and `pandas` are not installed locally.
- **Option C Assessment:** `APPROVED_SYSTEM_XLSX_GENERATOR_NOT_AVAILABLE`
- Offline tools like `csv2xlsx` or `libreoffice` were not found on the system.

## 7. Option A Assessment
`EXISTING_REPOSITORY_XLSX_GENERATOR_NOT_AVAILABLE`
The current Node.js dependencies do not include any capability to write XLSX files.

## 8. Option B Assessment
`EXISTING_ENVIRONMENT_PYTHON_XLSX_GENERATOR_NOT_AVAILABLE`
Standard Python libraries are limited to CSV, and no third-party XLSX generators are installed in the existing environment.

## 9. Option C Assessment
`APPROVED_SYSTEM_XLSX_GENERATOR_NOT_AVAILABLE`
No standalone system CLI utility for generating XLSX is present.

## 10. Option D Assessment
`DEPENDENCY_INSTALLATION_NOT_AUTHORIZED`
Installing a new library (like `exceljs`) could solve the generation requirement, but doing so would alter `package.json` and `package-lock.json`, which is currently prohibited by the phase scope. 
- Candidate capability: `exceljs` or `xlsx`
- Production dependency impact: Avoidable if installed as `devDependencies`.
- Security review required: YES
- License review required: YES
- Maintenance impact: Low for scripts.

## 11. Option E Assessment
`CANONICAL_JSON_SPIKE_POSSIBLE`
A spike to generate the canonical model in JSON is possible offline without dependencies. However, this does not fulfill the core requirement of providing a Golden Workbook to test the application's actual XLSX parsing capabilities. It is not recommended as a full substitute for SYN3.

## 12. Decision Matrix

| Option | Already available | Installation required | Repository dependency impact | Offline | Deterministic | Reproducible in CI | Supports exact contract | Security risk | License review | Operational complexity | Recommended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Option A (Repo Library) | NO | YES | PARTIAL | YES | YES | YES | YES | NOT_VERIFIABLE | NOT_VERIFIABLE | PARTIAL | NO |
| Option B (Python Env) | NO | YES | NO | YES | YES | YES | YES | NOT_VERIFIABLE | NOT_VERIFIABLE | PARTIAL | NO |
| Option C (System Tool) | NO | YES | NO | YES | YES | YES | YES | NOT_VERIFIABLE | NOT_VERIFIABLE | PARTIAL | NO |
| Option D (New Dev Dep) | NO | YES | PARTIAL | YES | YES | YES | YES | NOT_VERIFIABLE | NOT_VERIFIABLE | PARTIAL | NO |
| Option E (JSON Spike) | YES | NO | NO | YES | YES | YES | NO (JSON only) | NO | NO | LOW | NO |

## 13. Recommended Mechanism
No viable offline XLSX generator is currently available without a dependency installation. 

## 14. Reproducibility Strategy
Blocked pending dependency approval.

## 15. Determinism Controls
Blocked pending dependency approval.

## 16. Security and Privacy Constraints
No PII or real client data can be used. All generation must be entirely synthetic and offline.

## 17. Dependency Impact
Any recommended tool in Option D would modify the lockfile. This requires explicit stakeholder authorization.

## 18. Generator versus Parser Separation
`XLSX_PARSER_DEPENDENCY_DECISION_REQUIRED`
The choice of an offline script generator (e.g., Python or Node script) for synthetic fixtures is strictly separated from the runtime application parser. Approval of a generator dependency does NOT approve an application parser dependency.

## 19. Authorized SYN3 Scope
SYN3 is authorized to touch exclusively the following if a mechanism is approved:
- `fixtures/historical-import/synthetic-survey-base.xlsx`
- `fixtures/historical-import/synthetic-survey-comparison.xlsx`
- `fixtures/historical-import/manifest.json`
- `docs/PROMPT_LOG.md`

## 20. Prohibited SYN3 Scope
- `src/**`
- `package.json`
- `package-lock.json`
- Real client files

## 21. Open Decisions
- Authorization to install an XLSX generation dependency (`exceljs`, `xlsx`, or Python equivalent) exclusively for synthetic script generation.
- Application runtime parser decision.

## 22. Approval Record
- Date: 2026-06-17
- Status: SYN3_PHYSICAL_GENERATION_BLOCKED
- Action Required: Dependency Gate Authorization
