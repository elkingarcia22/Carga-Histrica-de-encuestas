# Historical Import: Synthetic Fixture Security Decision

## 1. Purpose
To formally adjudicate the security posture of `exceljs@4.4.0` as a conditionally selected offline synthetic fixture generator, evaluating known vulnerabilities in its transitive dependency tree against the strictly offline, synthetic-only, no-production-data execution model.

## 2. Decision Status
`SYNTHETIC_FIXTURE_DEPENDENCY_TECHNICAL_REVIEW_COMPLETE`
`SYNTHETIC_FIXTURE_DEPENDENCY_CONDITIONALLY_RECOMMENDED`
`LIMITED_RESIDUAL_RISK_IDENTIFIED`
`RISK_ACCEPTANCE_AUTHORITY_REQUIRED`
`RISK_ACCEPTANCE_NOT_YET_GRANTED`
`INSTALLATION_NOT_AUTHORIZED`
`SYN2C_NOT_AUTHORIZED`
`SYN3_PHYSICAL_GENERATION_BLOCKED`

## 3. Sources of Truth
* `npm registry metadata`
* `GitHub Security Advisories`
* `docs/HISTORICAL_IMPORT_SYNTHETIC_FIXTURE_DEPENDENCY_DECISION.md`
* `docs/HISTORICAL_IMPORT_SYNTHETIC_XLSX_TOOLING_DECISION.md`
* `docs/HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md`

## 4. Package Identity
* **Package:** `exceljs`
* **Version:** `4.4.0`
* **Publication date:** 2023-10-19
* **License:** MIT
* **Repository:** git+https://github.com/exceljs/exceljs.git
* **Maintenance classification:** STAGNANT
* **Open issue count:** NOT_VERIFIABLE (Known high backlog)
* **Latest repository activity:** Occasional PR merges, recent pre-release.
* **Newer release available:** 4.4.1-prerelease.0
* **Version deprecated:** False

## 5. Maintenance Assessment
The package is classified as `STAGNANT`. While it remains the most feature-complete offline XLSX generation tool available in the ecosystem, its maintenance cadence has slowed, resulting in unpatched transitive dependencies. This warrants strict isolation.

## 6. Dependency Tree Assessment
* **Direct dependencies:** `archiver`, `dayjs`, `fast-csv`, `jszip`, `readable-stream`, `saxes`, `tmp`, `unzipper`, `uuid`.
* **Relevant transitive dependencies:** `archiver-utils`, `glob`, `minimatch`, `brace-expansion`, `inflight`.
* **Archive-writing dependency chain:** `exceljs` -> `archiver` -> `archiver-utils` -> `glob`.
* **Dependencies used by XLSX output:** `archiver`, `jszip` (for assembling the XMLs into a ZIP archive).
* **Dependencies used only by optional features:** `fast-csv` (for CSV parsing/writing), `saxes` (for heavy XML reading/streaming).

| Package | Resolved version expected | Purpose | Used by fixture-generation path | Known advisory | Reachability in intended fixture-generation path |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `archiver` | ^5.0.0 | Archive creation | Yes | No direct critical | REACHABLE |
| `archiver-utils` | ^2.1.0 | Glob/File utilities | No | Path/Glob handling | NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW |
| `glob` | ^7.x.x | File searching | No | ReDoS (Regular Expression Denial of Service) | NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW |
| `minimatch` | ^3.0.x | Pattern matching | No | ReDoS | NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW |
| `brace-expansion` | ^1.1.x | Brace matching | No | ReDoS | NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW |
| `inflight` | ^1.0.6 | Request coalescing | No | Deprecated/Memory Leak | NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW |

## 7. Security Findings
* **Glob/Minimatch/Brace-expansion:** Widespread ReDoS vulnerabilities in older versions when processing attacker-controlled glob patterns.
* **Inflight:** Deprecated package with potential for unbounded memory usage if exploited in long-running processes.

## 8. Reachability Analysis
* **Reachability in intended fixture-generation path:** `NOT_EXPECTED_TO_BE_REACHABLE_BASED_ON_STATIC_PATH_REVIEW`. `exceljs` builds XLSX files by generating XML buffers/streams in memory and appending them directly to the `archiver` instance via `append()`. It does not appear to invoke `archiver.glob()` or `archiver.directory()`, meaning `glob`, `minimatch`, `brace-expansion`, and `inflight` are not expected to be executed in the normal XLSX writing path.
* **Evidence type:** `STATIC_AND_DOCUMENTARY_REVIEW`
* **Runtime verification:** `NOT_PERFORMED`
* **Lockfile verification:** `NOT_AVAILABLE_UNTIL_AUTHORIZED_INSTALLATION`

## 9. Synthetic-Only Exposure Model
* **Input data:** controlled synthetic-only (no external untrusted data).
* **Execution:** local development tooling (offline scripts).
* **Network during generation:** prohibited.
* **Production runtime usage:** prohibited.
* **Application import:** prohibited.
* **Credential access:** prohibited.

## 10. Risk Matrix
For the ReDoS and Memory Leak vulnerabilities in the transitive tree:
* **Threat:** Denial of Service (CPU/Memory exhaustion).
* **Attack surface:** Glob pattern evaluation / Path resolution.
* **Input trust level:** Absolute (Scripts are developer-authored, inputs are predefined mock configurations).
* **Network exposure:** None.
* **Runtime exposure:** None.
* **Production exposure:** None.
* **Confidentiality impact:** None.
* **Integrity impact:** None.
* **Availability impact:** Low (Would only crash the local generation script).
* **Likelihood:** `LOW`
* **Severity:** Low (Contextually mitigated).
* **Mitigation:** Ensure no external inputs are fed into file generation scripts.
* **Residual risk:** `LOW, SUBJECT_TO POST-INSTALL LOCKFILE AND AUDIT VERIFICATION`

## 11. Required Compensating Controls (Preconditions for Installation)
The following must be implemented and verified if installation is authorized:
1. **Exact version pin:** `4.4.0` in `devDependencies`.
2. **devDependency-only:** Prevents accidental production deployment.
3. **No import from src/**: Enforcement via architecture constraints.
4. **No application runtime integration:** Scripts omitted from CI/CD pipeline and runtime.
5. **Synthetic input only:** Workbooks generated strictly from `HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md`.
6. **Offline generation:** No network connectivity required after installation.
7. **No formulas:** Avoids CSV injection or execution risks in Excel.
8. **No macros:** Files exported strictly as `.xlsx`.
9. **No external links:** Data is flat.
10. **No credentials:** No secrets required.
11. **Lockfile review after installation:** Required.
12. **Dependency audit after installation:** Required.
13. **Hash verification of generated fixtures:** Required.
14. **Removal or reassessment after fixture generation:** Required once Phase SYN3 completes.

## 12. Residual Risk
`LOW, SUBJECT_TO POST-INSTALL LOCKFILE AND AUDIT VERIFICATION`

## 13. Risk Acceptance Authority
* **Required authority:** Approved Security Owner or formally designated corporate Risk Owner
* **Current authority evidence:** `NOT PROVIDED`
* **Risk acceptance status:** `PENDING`
* **Gate effect:** `SYN2C_NOT_AUTHORIZED`

## 14. Review Expiration
* **Risk acceptance review required:**
  - before installation;
  - after lockfile generation and audit;
  - before first fixture generation;
  - upon package-version change;
  - upon new relevant advisory;
  - no later than a formally approved review date.
* **Status:** `REVIEW_EXPIRATION_DATE_REQUIRED`

## 15. Permitted Scope
* Local script execution for generating `fixtures/**/*.xlsx`.
* Use of hardcoded, static, synthetic schemas.

## 16. Prohibited Scope
* Import from any file in `src/**` or `public/**`.
* Processing or reading of real production data.
* Network access during execution.
* Generating files that include macros (`.xlsm`) or executable external links.
* Use of the library as an "Application Parser".

## 17. Installation Preconditions
* [x] License accepted
* [x] Maintenance classification recorded
* [x] Dependency tree reviewed
* [x] Security findings reviewed
* [x] Reachability assessed
* [x] Synthetic-only scope confirmed
* [x] Production import prohibited
* [x] Controls documented
* [x] Residual risk classified
* [x] Risk acceptance authority identified or explicitly pending
* [x] Review expiration defined when applicable
* [x] Installation remains a separate phase

## 18. Removal Conditions
* Completion of `SYN3` phase or identification of an alternative secure offline generator.
* Discovery of an actively exploitable vulnerability in the `append()` stream memory path.

## 19. Final Decision
`SYNTHETIC_FIXTURE_DEPENDENCY_TECHNICAL_REVIEW_COMPLETE`
`SYNTHETIC_FIXTURE_DEPENDENCY_CONDITIONALLY_RECOMMENDED`
`LIMITED_RESIDUAL_RISK_IDENTIFIED`
`RISK_ACCEPTANCE_AUTHORITY_REQUIRED`
`RISK_ACCEPTANCE_NOT_YET_GRANTED`
`INSTALLATION_NOT_AUTHORIZED`
`SYN2C_NOT_AUTHORIZED`
`SYN3_PHYSICAL_GENERATION_BLOCKED`

## 20. Approval Record
* **Phase:** 4K-SYN2B1
* **Date:** 2026-06-17
* **Auditor:** Antigravity 
* **State:** `RISK_ACCEPTANCE_NOT_YET_GRANTED`
