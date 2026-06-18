# Historical Import Synthetic Parser Test Infrastructure Decision

## 1. Purpose
Define and formalize the test infrastructure required to support the isolated implementation of the `Historical Import Synthetic Sandbox` parser. This document evaluates test runners, defines strict governance over linting and TypeScript validation, and outlines the fixture access strategy without modifying the existing codebase or installing new dependencies.

## 2. Decision Status
**Status:** PARSER_TEST_RUNNER_SELECTED

## 3. Current Repository State
- **branch:** main
- **HEAD:** origin/main (remote main)
- **ahead:** 0
- **behind:** 0
- **working tree:** clean
- **staging:** empty
- **untracked files:** none

## 4. Existing Scripts
The `package.json` currently has the following scripts:
- `dev`: `vite`
- `build`: `tsc -b && vite build`
- `lint`: `eslint .`
- `preview`: `vite preview`
*Note: A dedicated `test` script is missing.*

## 5. Existing Test Infrastructure
- **Test files:** None found.
- **Test configuration:** None found.
- **Test runners:** Not installed.

## 6. Node and Package Context
- **Node version:** v24.13.0
- **npm version:** 11.6.2
- **React version:** ^19.2.5
- **Vite version:** ^8.0.10
- **TypeScript version:** ~6.0.2
- **ESLint version:** ^10.2.1

## 7. Vitest Assessment
- **Exact candidate version:** 3.0.7
- **License:** MIT
- **Node compatibility:** YES (v24.13.0 supported)
- **Vite compatibility:** YES (Aligned with Vite config)
- **TypeScript compatibility:** YES (Out of the box)
- **ESM support:** YES (Native)
- **Node environment support:** YES
- **ArrayBuffer support:** YES
- **Binary fixture access:** YES (Via Node.js `fs`)
- **Watch mode:** YES (Fast and reliable)
- **Coverage support:** YES (Via `@vitest/coverage-v8`)
- **CI suitability:** YES
- **Required dependencies:** `vitest`, `@vitest/coverage-v8`
- **Required configuration:** `vitest.config.ts` (or integrated in `vite.config.ts`)
- **Package impact:** Development only
- **Maintenance:** Low (Aligned with the existing Vite ecosystem)

## 8. Node Test Runner Assessment
- **node:test availability:** YES (Built-in Node >= 18)
- **Node compatibility:** YES
- **Native TypeScript execution:** PARTIAL (Requires `--experimental-strip-types` in Node 24, or a loader like `tsx` for full compatibility)
- **Compilation requirement:** YES (If not using experimental flags)
- **Loader requirement:** YES (For standard TS features not covered by strip-types)
- **ESM compatibility:** YES
- **ArrayBuffer support:** YES
- **Binary fixture access:** YES
- **Assertions:** YES (via `node:assert`)
- **Mocking:** YES
- **Coverage:** PARTIAL (Experimental in Node core)
- **Additional dependencies:** `tsx` or similar TS loader (Cannot be classified as strictly "dependency-free" for a TS ecosystem)
- **Configuration complexity:** Medium (Manual setup for TS integration and coverage reporting)

## 9. Build-Time Validation Assessment
- **Assessment:** Temporary strategy using compiled TypeScript plus Node assertions.
- **Classification:** NOT_RECOMMENDED
- **Reason:** Does not scale, lacks structured test reporting, coverage, and watch mode ergonomics.

## 10. Jest Assessment
- **ESM compatibility:** PARTIAL (Requires experimental flags or complex configuration)
- **TypeScript transformation:** YES (Requires `ts-jest` or Babel)
- **Vite alignment:** NO (Redundant transformation pipeline)
- **Dependency footprint:** High (Requires multiple adapter packages)
- **Configuration overhead:** High
- **Binary fixture support:** YES
- **Coverage:** YES
- **Maintenance:** High (Friction with Vite ecosystem)

## 11. Comparison Matrix

| Criterion | Vitest | Node test runner | Build-time validation | Jest |
| :--- | :--- | :--- | :--- | :--- |
| Additional dependencies | YES | PARTIAL | NO | YES |
| Vite alignment | YES | NO | NO | NO |
| TypeScript support | YES | PARTIAL | YES | YES |
| ESM support | YES | YES | YES | PARTIAL |
| ArrayBuffer tests | YES | YES | YES | YES |
| Binary fixture access | YES | YES | YES | YES |
| Developer ergonomics | YES | PARTIAL | NO | PARTIAL |
| CI readiness | YES | YES | PARTIAL | YES |
| Coverage | YES | PARTIAL | NO | YES |
| Configuration complexity | Low | Medium | High | High |
| Maintenance cost | Low | Medium | High | High |
| Removal cost | Low | Low | Low | High |
| Recommended | YES | NO | NO | NO |

## 12. Test Environment
The parser is pure logic handling binary buffers.
- **Recommended Environment:** `node` (Node.js runtime)
- **Reasoning:** The parser core receives `ArrayBuffer`, does not depend on React, the DOM, browser storage, or the network. A full browser environment (`jsdom`, `happy-dom`, or real browser) adds unnecessary overhead and is forbidden.

## 13. Fixture Access Strategy
The tests must strictly access:
- `fixtures/historical-import/synthetic-survey-base.xlsx`
- `fixtures/historical-import/synthetic-survey-comparison.xlsx`

**Strategy:**
- Read bytes locally using `node:fs` (`fs.readFileSync`).
- Use relative paths constructed via `path.join(process.cwd(), 'fixtures/historical-import/...')` to resolve paths consistently.
- Convert the resulting Node.js `Buffer` to an `ArrayBuffer` using `buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)`.
- **Restrictions:** No copies to `public/**`, no Base64 strings, no absolute paths, no duplicated files, no modifying XLSX fixtures, no reading real non-synthetic files, no network requests.

## 14. TypeScript Strategy
- **Current Command:** `BUILD_INCLUDES_TYPESCRIPT_COMPILATION` (`tsc -b && vite build`)
- **TYPECHECK_ONLY_SCRIPT_NOT_AVAILABLE:** Currently, typechecking is bundled within the build script. A future configuration phase may add a dedicated `"typecheck": "tsc --noEmit"` script. No `package.json` modifications are authorized in this phase.

## 15. Lint Baseline
- **REPOSITORY_GLOBAL_LINT_BASELINE_REPORTED = 26** (25 errors, 1 warning)
- **BASELINE_REQUIRES_REVALIDATION:** Yes, the findings are globally distributed but isolated from the future parser path.
- **Scope:** The findings reside in existing components (`src/components/**`, `src/screens/**`, `src/mocks/**`).
- **Support:** The current `eslint` configuration (v10) supports targeted, scoped executions on new files.

## 16. Scoped Lint Policy
**Status:** SCOPED_LINT_GATE_RECOMMENDED
- **Policy:**
  - No errors in new parser files.
  - No warnings in new parser files.
  - No `eslint-disable` without explicit justification.
  - No increase in the global finding count.
  - No global ignore modifications.
  - The preexisting debt will not be fixed as part of the parser scope.

## 17. Coverage Policy
- **Coverage tool required:** `@vitest/coverage-v8`
- **Coverage threshold:** Defined organically based on critical parsing branches, targeting 100% on the core parser logic. No arbitrary overall project percentage is fixed.
- **Critical branches requiring direct tests:**
  - golden base workbook
  - golden comparison workbook
  - wrong extension
  - empty file
  - oversized declared file
  - corrupt ArrayBuffer
  - missing required sheet
  - blank-cell semantics
  - worksheet order warning
  - unexpected sheet warning

## 18. Recommended Runner
- **Recommended test runner:** Vitest
- **Recommended exact version:** 3.0.7
- **Recommended environment:** `node`
- **Recommended test path:** `src/historical-import/parser/__tests__` (or equivalent scoped parser directory)
- **Recommended fixture access strategy:** Node `fs.readFileSync` converted to `ArrayBuffer`
- **Recommended test script:** `"test": "vitest run"`
- **Recommended run-once script:** `"test:run": "vitest run"`
- **Recommended watch script:** `"test:watch": "vitest"`
- **Recommended coverage script:** `"test:coverage": "vitest run --coverage"`
- **Recommended TypeScript command:** `"typecheck": "tsc --noEmit"`
- **Recommended scoped lint command:** `"lint:parser": "eslint src/historical-import/parser"`
- **Recommended global lint policy:** SCOPED_LINT_GATE_RECOMMENDED
- **Recommended coverage policy:** 100% on core parser files, covering the 10 critical branches.

## 19. Required Dependencies
- `vitest` (devDependencies)
- `@vitest/coverage-v8` (devDependencies)

## 20. Installation Scope
- **Phase:** SYN4C0A (dependency installation)
- **Allowed files:**
  - `package.json`
  - `package-lock.json`
  - `docs/PROMPT_LOG.md`

## 21. Configuration Scope
- **Phase:** SYN4C0B (test configuration and smoke verification)
- **Allowed files:**
  - `package.json` (for adding scripts)
  - `vitest.config.ts` (or equivalent Vite config extension)
  - A single smoke test file (`.test.ts`)
  - `docs/PROMPT_LOG.md`

## 22. Parser Implementation Entry Gate
- **Phase:** SYN4C1 (parser implementation) and SYN4C1T (parser tests)
- **Entry Conditions:** SYN4C0A and SYN4C0B must be formally closed and validated before SYN4C1 execution. The test infrastructure must be active, proving 0% coverage and passing the smoke test prior to physical parser implementation.

## 23. Prohibited Scope
- **Productive Processing:** Remains unauthorized.
- **Code implementation:** No source code modifications in this phase.
- **R1H5:** Remains untriggered.

## 24. Approval Record
This decision documents the transition pathway for testing the parser, formally triggering the need for a dependency installation phase (`SYN4C0A_TEST_DEPENDENCY_INSTALLATION_REQUIRED`).
