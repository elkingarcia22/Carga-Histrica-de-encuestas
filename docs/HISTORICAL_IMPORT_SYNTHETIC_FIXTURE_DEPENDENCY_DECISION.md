# Historical Import Synthetic Fixture Dependency Decision

## 1. Purpose
Evaluate and adjudicate a decision on introducing a minimal, strictly limited dependency for offline, deterministic generation of synthetic XLSX fixtures for the Historical Import project.

## 2. Decision Status
`SYNTHETIC_FIXTURE_GENERATOR_DEPENDENCY_APPROVED`
`SYN2C_DEV_DEPENDENCY_INSTALLATION_READY`

## 3. Sources of Truth
- docs/HISTORICAL_IMPORT_SYNTHETIC_XLSX_TOOLING_DECISION.md
- docs/HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md
- docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_ARCHITECTURE.md
- docs/ANTIGRAVITY.md
- docs/ARCHITECTURE.md
- docs/QA_CHECKLIST.md
- docs/PROMPT_LOG.md
- package.json
- existing lockfile

## 4. Generator versus Parser Separation
### Track A · Fixture Generator
- **Purpose**: Generar exclusivamente workbooks sintéticos versionados para QA y prototipado.
- **Constraints**: Offline, Node-only, Dev dependency, No import from `src/**`, Deterministic output, multiple worksheets support, numeric and text cell support, blank cell support, stable worksheet/row order, no formulas required, hash verification.

### Track B · Application Parser
- **Purpose**: Leer workbooks sintéticos dentro del navegador en fases posteriores.
- **Status**: `XLSX_PARSER_DEPENDENCY_DECISION_REQUIRED` / `APPLICATION_PARSER_NOT_AUTHORIZED`.
The approval of Track A does not modify the status of Track B.

## 5. Repository Package Context
- **Node Version**: v24.13.0
- **Package Manager**: npm v11.6.2
- **Environment**: ESM module `type: "module"`, Vite-based build setup.

## 6. Evaluation Criteria
- Compatible license (MIT/Apache)
- Offline functionality
- No credentials required
- Limited to `devDependencies`
- Pinned to exact version
- Deterministic generation

## 7. Candidate A
- **Package**: `exceljs`
- **Purpose**: Read, manipulate and write spreadsheet data and styles to XLSX and JSON.
- **Current maintained status**: Active / Maintenance mode.
- **Latest version reviewed**: 4.4.0
- **License**: MIT
- **Direct dependencies**: `archiver`, `dayjs`, `fast-csv`, `jszip`, `saxes`
- **Known security findings**: None for offline generation.
- **Node compatibility**: Yes
- **XLSX writing support**: Yes
- **Multiple-sheet support**: Yes
- **Blank-cell support**: Yes
- **Date handling**: Yes
- **Deterministic-generation feasibility**: High
- **Browser bundle impact**: N/A (Dev dependency)
- **Tree-shaking relevance**: N/A
- **Repository usage scope**: Offline fixture generator only.
- **DevDependency suitability**: High
- **Maintenance risk**: Low
- **Installation impact**: Moderate
- **Lockfile impact**: Adds package and transitive dependencies.
- **Recommended**: Yes

## 8. Candidate B
- **Package**: `xlsx` (SheetJS Community Edition)
- **Purpose**: Spreadsheet parser and writer.
- **Current maintained status**: Deprecated on NPM registry, requires custom registry or tarball for latest updates.
- **Latest version reviewed**: 0.18.5 (NPM)
- **License**: Apache 2.0
- **Direct dependencies**: None
- **Known security findings**: None for offline generation.
- **Node compatibility**: Yes
- **XLSX writing support**: Yes
- **Multiple-sheet support**: Yes
- **Blank-cell support**: Yes
- **Date handling**: Yes
- **Deterministic-generation feasibility**: High
- **Browser bundle impact**: N/A
- **Tree-shaking relevance**: N/A
- **Repository usage scope**: Offline fixture generator only.
- **DevDependency suitability**: High
- **Maintenance risk**: High (NPM registry abandonment).
- **Installation impact**: Low
- **Lockfile impact**: Low
- **Recommended**: No

## 9. Candidate C
- **Package**: `xlsx-populate`
- **Purpose**: Excel XLSX parser/generator written in JavaScript.
- **Current maintained status**: Stagnant / Unmaintained.
- **Latest version reviewed**: 1.21.0
- **License**: MIT
- **Direct dependencies**: `jszip`, `sax`, `lodash`
- **Known security findings**: None severe for offline use, but outdated dependencies.
- **Node compatibility**: Yes (Legacy)
- **XLSX writing support**: Yes
- **Multiple-sheet support**: Yes
- **Blank-cell support**: Yes
- **Date handling**: Yes
- **Deterministic-generation feasibility**: High
- **Browser bundle impact**: N/A
- **Tree-shaking relevance**: N/A
- **Repository usage scope**: Offline fixture generator only.
- **DevDependency suitability**: Low (due to maintenance status)
- **Maintenance risk**: High (Abandoned)
- **Installation impact**: Low
- **Lockfile impact**: Low
- **Recommended**: No

## 10. Security Assessment
The recommended option (`exceljs`) does not require network access after installation, executes offline, requires no credentials, and processes no real files. No high-severity security findings for offline/build-time context.

## 11. License Assessment
`exceljs` uses the MIT License, which is fully compatible with the repository's open/internal usage policies.

## 12. Maintenance Assessment
`exceljs` has a large community and remains actively used. While feature development has slowed, it provides all necessary capabilities for fixture generation robustly.

## 13. Determinism Assessment
`exceljs` permits exact cell assignment, stable row indexing, and static data injection (seeded randomly or hardcoded). File structure output is stable enough for hashing if metadata is controlled.

## 14. Reproducibility Assessment
Reproducibility will be guaranteed by:
- Pinning the exact version in `package.json`.
- Tracking dependencies via `package-lock.json`.
- Running offline with a fixed generator seed.

## 15. Dependency Impact
Adding `exceljs` as a dev dependency will update `package.json` and `package-lock.json`, introducing `exceljs` and a few specific sub-dependencies like `jszip` and `dayjs`.

## 16. Decision Matrix
| Criteria | `exceljs` | `xlsx` | `xlsx-populate` |
| :--- | :--- | :--- | :--- |
| **XLSX Writing** | Yes | Yes | Yes |
| **Maintenance** | Active | NPM Deprecated | Abandoned |
| **Dev Only** | Yes | Yes | Yes |
| **Recommended** | **Yes** | No | No |

## 17. Recommended Dependency
- **Recommended package**: `exceljs`
- **Recommended exact version**: `4.4.0`
- **Recommended dependency classification**: `devDependency`
- **Recommended installation scope**: `package.json` and `package-lock.json` only.
- **Rationale**: Best balance of capability, NPM availability, and license for an offline fixture generator.
- **Key risks**: Large dependency tree compared to raw writers.
- **Mitigations**: Strict limitation to `devDependencies` and zero integration into `src/**`.
- **Removal strategy**: `npm uninstall exceljs` cleanly removes it without affecting production builds.

## 18. Exact Version Policy
The installation must use `--save-exact` or equivalent to pin strictly to `4.4.0`.

## 19. Authorized Installation Scope
- `package.json`
- `package-lock.json`
- `docs/PROMPT_LOG.md`

## 20. Prohibited Integration Scope
- `src/**`
- `fixtures/**`
- `public/**`
- UI components
- Application parser logic

## 21. Removal and Rollback Strategy
If the dependency fails QA in phase SYN2C, rollback involves `git checkout -- package.json package-lock.json` and skipping to alternative solutions.

## 22. Open Risks
- Exact binary determinism of the XLSX zip stream might require disabling timestamps in JSZip internally.

## 23. Future Installation Gate
`SYN2C_DEV_DEPENDENCY_INSTALLATION_READY`

## 24. Approval Record
- **Role**: AI Assistant (Antigravity)
- **Phase**: 4K-SYN2B
- **Status**: Approved for SYN2C.
