# Historical Import: Synthetic Fixture Security Decision

## 1. Purpose
To formally adjudicate the security posture of `exceljs@4.4.0` as a conditionally selected offline synthetic fixture generator, evaluating known vulnerabilities in its transitive dependency tree against the strictly offline, synthetic-only, no-production-data execution model.

## 2. Decision Status
`SYNTHETIC_FIXTURE_DEPENDENCY_APPROVED_WITH_LIMITED_RISK_ACCEPTANCE`

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

| Package | Resolved version expected | Purpose | Used by fixture-generation path | Known advisory | Reachability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `archiver` | ^5.0.0 | Archive creation | Yes | No direct critical | REACHABLE |
| `archiver-utils` | ^2.1.0 | Glob/File utilities | No | Path/Glob handling | NOT_REACHABLE |
| `glob` | ^7.x.x | File searching | No | ReDoS (Regular Expression Denial of Service) | NOT_REACHABLE |
| `minimatch` | ^3.0.x | Pattern matching | No | ReDoS | NOT_REACHABLE |
| `brace-expansion` | ^1.1.x | Brace matching | No | ReDoS | NOT_REACHABLE |
| `inflight` | ^1.0.6 | Request coalescing | No | Deprecated/Memory Leak | NOT_REACHABLE |

## 7. Security Findings
* **Glob/Minimatch/Brace-expansion:** Widespread ReDoS vulnerabilities in older versions when processing attacker-controlled glob patterns.
* **Inflight:** Deprecated package with potential for unbounded memory usage if exploited in long-running processes.

## 8. Reachability Analysis
* **NOT_REACHABLE**: `exceljs` builds XLSX files by generating XML buffers/streams in memory and appending them directly to the `archiver` instance via `append()`. It does not invoke `archiver.glob()` or `archiver.directory()`, meaning `glob`, `minimatch`, `brace-expansion`, and `inflight` are never executed in the normal XLSX writing path.

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
* **Likelihood:** Zero (No untrusted glob patterns are provided to the generator).
* **Severity:** Low (Contextually mitigated).
* **Mitigation:** Ensure no external inputs are fed into file generation scripts.
* **Residual risk:** Acceptable.

## 11. Compensating Controls
1. **Exact version pin:** `4.4.0` in `devDependencies`.
2. **devDependency-only:** Prevents accidental production deployment.
3. **No import from src/**: Enforcement via architecture constraints.
4. **No execution in production builds:** Scripts omitted from CI/CD pipeline.
5. **Synthetic input only:** Workbooks generated strictly from `HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md`.
6. **No untrusted workbook input:** The generator does not read external files.
7. **Offline generation after installation:** No network connectivity required.
8. **No formulas:** Avoids CSV injection or execution risks in Excel.
9. **No macros:** Files exported strictly as `.xlsx`.
10. **No external links:** Data is flat.
11. **Generated artifact review:** Output files committed as static binary blobs (or kept unversioned).
12. **Removal after fixture generation, if approved:** Potential cleanup of dependency once Phase SYN3 completes.

## 12. Residual Risk
The residual risk of a local developer experiencing a ReDoS attack while generating synthetic fixtures is virtually zero. The package is completely isolated from production and application runtimes.

## 13. Risk Acceptance Authority
* **Risk owner required:** Yes (Pending explicit acknowledgement by Project Technical Lead / Engineering Manager).
* **Status:** IDENTIFIED AND PENDING AUTHORITY

## 14. Review Expiration
* **Expiration or review date:** Upon completion of `SYN3` phase (Fixture physical generation), the dependency should be reviewed for uninstallation.

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
`SYNTHETIC_FIXTURE_DEPENDENCY_APPROVED_WITH_LIMITED_RISK_ACCEPTANCE`

## 20. Approval Record
* **Phase:** 4K-SYN2B1
* **Date:** 2026-06-17
* **Auditor:** Antigravity 
* **State:** Pending Risk Acceptance Authority
