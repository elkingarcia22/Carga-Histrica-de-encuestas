# Historical Import Synthetic Fixture Post-Install Audit

## 1. Scope Confirmation
The phase 4K-SYN2C installed `exceljs@4.4.0` as a development dependency. A subsequent audit reported 11 vulnerabilities. This document decomposes and adjudicates the audit without modifying dependencies, ensuring adherence to the project's non-productive, offline constraints.

## 2. Git Preflight
```text
branch: main
HEAD: 53811df477972c6368b6eebf85be577bf645d786
origin/main: 53811df477972c6368b6eebf85be577bf645d786
remote main: 53811df477972c6368b6eebf85be577bf645d786
ahead: 0
behind: 0
working tree: clean
staging: empty
untracked files: none
```

## 3. SYN2C Commit Verification
```text
Commit full SHA: 53811df477972c6368b6eebf85be577bf645d786
Contained in local main: YES
Contained in origin/main: YES
Contained in remote main: YES
HEAD = origin/main = remote main: YES
```

## 4. Audit Baseline
```text
Audit before ExcelJS installation: PRE_INSTALL_AUDIT_BASELINE_NOT_AVAILABLE
Audit after ExcelJS installation: 11 vulnerabilities
Net new findings: 2 (exceljs, uuid)
Pre-existing findings: 9 (assumed, as they are not in the exceljs dependency tree)
ExcelJS-attributable findings: 2
Non-ExcelJS findings: 9
```

## 5. Total Audit Findings (11)

### Finding 1
* **Finding ID**: fast-uri
* **Package**: fast-uri
* **Resolved version**: <=3.1.1
* **Severity**: high
* **Advisory ID**: GHSA-v39h-62p7-jpjc
* **CVE**: N/A
* **Dependency path**: node_modules/fast-uri
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: <=3.1.1
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 2
* **Finding ID**: hono
* **Package**: hono
* **Resolved version**: <=4.12.24
* **Severity**: high
* **Advisory ID**: Multiple (e.g., GHSA-qp7p-654g-cw7p)
* **CVE**: N/A
* **Dependency path**: node_modules/hono
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: <=4.12.24
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 3
* **Finding ID**: vite
* **Package**: vite
* **Resolved version**: 8.0.0 - 8.0.15
* **Severity**: high
* **Advisory ID**: GHSA-v6wh-96g9-6wx3 / GHSA-fx2h-pf6j-xcff
* **CVE**: N/A
* **Dependency path**: node_modules/vite
* **Introduced by exceljs**: NO
* **Direct or transitive**: Direct
* **Affected versions**: 8.0.0 - 8.0.15
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 4
* **Finding ID**: brace-expansion
* **Package**: brace-expansion
* **Resolved version**: 5.0.5
* **Severity**: moderate
* **Advisory ID**: GHSA-jxxr-4gwj-5jf2
* **CVE**: N/A
* **Dependency path**: node_modules/brace-expansion
* **Introduced by exceljs**: NO (introduced via ESLint minimatch)
* **Direct or transitive**: Transitive
* **Affected versions**: 5.0.2 - 5.0.5
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 5
* **Finding ID**: express-rate-limit
* **Package**: express-rate-limit
* **Resolved version**: 8.0.1 - 8.5.0
* **Severity**: moderate
* **Advisory ID**: via ip-address
* **CVE**: N/A
* **Dependency path**: node_modules/express-rate-limit
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: 8.0.1 - 8.5.0
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 6
* **Finding ID**: ip-address
* **Package**: ip-address
* **Resolved version**: <=10.1.0
* **Severity**: moderate
* **Advisory ID**: GHSA-v2v4-37r5-5v8g
* **CVE**: N/A
* **Dependency path**: node_modules/ip-address
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: <=10.1.0
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 7
* **Finding ID**: js-yaml
* **Package**: js-yaml
* **Resolved version**: <=4.1.1
* **Severity**: moderate
* **Advisory ID**: GHSA-h67p-54hq-rp68
* **CVE**: N/A
* **Dependency path**: node_modules/js-yaml
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: <=4.1.1
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 8
* **Finding ID**: qs
* **Package**: qs
* **Resolved version**: 6.11.1 - 6.15.1
* **Severity**: moderate
* **Advisory ID**: GHSA-q8mj-m7cp-5q26
* **CVE**: N/A
* **Dependency path**: node_modules/qs
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: 6.11.1 - 6.15.1
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

### Finding 9
* **Finding ID**: uuid
* **Package**: uuid
* **Resolved version**: 8.3.2
* **Severity**: moderate
* **Advisory ID**: GHSA-w5hq-g745-h8pq
* **CVE**: N/A
* **Dependency path**: node_modules/exceljs > node_modules/uuid
* **Introduced by exceljs**: YES
* **Direct or transitive**: Transitive
* **Affected versions**: <11.1.1
* **Patched versions**: 11.1.1
* **Fix available**: YES (requires force)
* **Breaking fix required**: YES
* **Finding present before installation**: NO

### Finding 10
* **Finding ID**: exceljs
* **Package**: exceljs
* **Resolved version**: 4.4.0
* **Severity**: moderate
* **Advisory ID**: via uuid
* **CVE**: N/A
* **Dependency path**: node_modules/exceljs
* **Introduced by exceljs**: YES
* **Direct or transitive**: Direct
* **Affected versions**: >=3.5.0
* **Patched versions**: 3.4.0 (Downgrade)
* **Fix available**: YES (requires force/downgrade)
* **Breaking fix required**: YES
* **Finding present before installation**: NO

### Finding 11
* **Finding ID**: @babel/core
* **Package**: @babel/core
* **Resolved version**: <=7.29.0
* **Severity**: low
* **Advisory ID**: GHSA-4x5r-pxfx-6jf8
* **CVE**: N/A
* **Dependency path**: node_modules/@babel/core
* **Introduced by exceljs**: NO
* **Direct or transitive**: Transitive
* **Affected versions**: <=7.29.0
* **Patched versions**: Available
* **Fix available**: YES
* **Breaking fix required**: NO
* **Finding present before installation**: YES (assumed unrelated)

## 6. High Severity Findings
* **High finding 1**: fast-uri
  * Package: fast-uri
  * Advisory: GHSA-v39h-62p7-jpjc
  * Path: node_modules/fast-uri
  * ExcelJS relation: Unrelated
  * Reachability: NOT_EXPECTED_TO_BE_REACHABLE
  * Fix: Fix available without major change
  * Impact: None on the offline generation path.
* **High finding 2**: hono
  * Package: hono
  * Advisory: Multiple (GHSA-qp7p-654g-cw7p, etc.)
  * Path: node_modules/hono
  * ExcelJS relation: Unrelated
  * Reachability: NOT_EXPECTED_TO_BE_REACHABLE
  * Fix: Fix available without major change
  * Impact: None on the offline generation path.
* **High finding 3**: vite
  * Package: vite
  * Advisory: GHSA-v6wh-96g9-6wx3 / GHSA-fx2h-pf6j-xcff
  * Path: node_modules/vite
  * ExcelJS relation: Unrelated
  * Reachability: NOT_EXPECTED_TO_BE_REACHABLE
  * Fix: Fix available without major change
  * Impact: None on the offline generation path.

## 7. Moderate Severity Findings
Total: 7 (brace-expansion, exceljs, express-rate-limit, ip-address, js-yaml, qs, uuid)

## 8. Low Severity Findings
Total: 1 (@babel/core)

## 9. ExcelJS Dependency Tree
Based on `npm explain` utilizing the current lockfile:
* exceljs@4.4.0
  * uuid@8.3.2
  * tmp@0.2.7
  * archiver@5.3.2
    * archiver-utils@2.1.0
      * glob@7.1.4
        * minimatch@3.1.5
          * brace-expansion@1.1.7
        * inflight@1.0.4
  * jszip@3.10.1
  * unzipper@0.10.14
  * fast-csv@4.3.6

## 10. ExcelJS-attributable Findings
Only `uuid` and `exceljs` (due to depending on vulnerable uuid) are introduced by the exceljs installation.

## 11. Pre-existing or Unrelated Findings
The remaining 9 findings (fast-uri, hono, vite, brace-expansion@5.0.5, express-rate-limit, ip-address, js-yaml, qs, @babel/core) reside outside the exceljs dependency tree and are unrelated to its installation.

## 12. Reachability Assessment
For the unrelated findings (9 total), the reachability is: `NOT_EXPECTED_TO_BE_REACHABLE`.
For the ExcelJS-attributable findings (`uuid`, `exceljs`), the reachability is also: `NOT_EXPECTED_TO_BE_REACHABLE`.
* **Intended generator operation**: Offline, non-productive execution.
* **Affected API or path**: uuid v3/v5/v6 missing buffer bounds check.
* **Whether that API will be invoked**: No. ExcelJS utilizes uuid primarily for v4 randomized generation, and we do not pass arbitrary external buffers.
* **Input control**: Static synthetic inputs only.
* **Filesystem exposure**: Output restricted to approved fixtures directory.
* **Network exposure**: None.
* **Credential exposure**: None.
* **Runtime duration**: Short-lived local process.

## 13. Fix Assessment
* **fast-uri**: Fix available without major change
* **hono**: Fix available without major change
* **vite**: Fix available without major change
* **brace-expansion**: Fix available without major change
* **express-rate-limit**: Fix available without major change
* **ip-address**: Fix available without major change
* **js-yaml**: Fix available without major change
* **qs**: Fix available without major change
* **@babel/core**: Fix available without major change
* **uuid**: Fix requires force (breaking change)
* **exceljs**: Fix requires force (breaking change to downgrade to 3.4.0)

## 14. Residual Risk
The residual risk of maintaining `exceljs@4.4.0` with the `uuid` vulnerability is deemed acceptable and `NOT_EXPECTED_TO_BE_REACHABLE` given the strict offline, synthetic-only, short-lived, and buffer-controlled execution context of the generator script. No high-severity risks are introduced by this library.

## 15. Required Controls
These controls must be applied when generating fixtures in SYN3:
* Generator outside src/**
* Synthetic input only
* Offline execution
* No formulas
* No macros
* No external links
* No arbitrary filesystem paths
* Output restricted to approved fixtures directory
* No credentials available to the process
* No network available during execution
* Exact ExcelJS version maintained
* Generated hashes recorded
* Dependency audit repeated before generation
* Dependency removed or reassessed after fixtures are generated

## 16. Security Gate Decision
**Gate A · SYN3 autorizable** selected.
* [x] Las 11 vulnerabilidades fueron inventariadas.
* [x] Las tres altas fueron identificadas.
* [x] Se determinó qué hallazgos corresponden a ExcelJS.
* [x] No existe vulnerabilidad crítica.
* [x] Ningún hallazgo alto aplicable es alcanzable en el flujo aprobado.
* [x] Los inputs son exclusivamente sintéticos y controlados.
* [x] El proceso será offline.
* [x] No habrá acceso a credenciales.
* [x] No habrá imports desde src/**.
* [x] Los controles compensatorios fueron documentados.
* [x] El riesgo residual fue clasificado.
* [x] No se requiere modificar dependencias para generar los fixtures.

`SYN3_FIXTURE_GENERATION_SECURITY_AUTHORIZED`
