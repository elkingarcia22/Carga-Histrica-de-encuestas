# Historical Import Synthetic Sandbox - Application Parser Decision

## 1. Purpose
Evaluate and establish a formal, documented decision regarding the XLSX parser to be used within the browser runtime of the Historical Import application. This decision evaluates candidates against strict synthetic sandbox requirements, ensuring safe, local-only processing of the golden fixtures without authorizing productive implementation or network transmission.

## 2. Decision Status
**Status:** `APPLICATION_XLSX_PARSER_DEPENDENCY_SELECTED`
**Implementation Status:** `SYN4B_DEPENDENCY_INSTALLATION_GATE_REQUIRED`
**Productive Use:** `PARSER_IMPLEMENTATION_NOT_AUTHORIZED`

## 3. Sources of Truth
* `docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_INTAKE.md`
* `docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_ARCHITECTURE.md`
* `docs/HISTORICAL_IMPORT_SYNTHETIC_MOCK_DATA_CONTRACT.md`
* `fixtures/historical-import/manifest.json`
* Official registries (npm) and documentation for evaluated packages.

## 4. Current Dependency State
* **Installed:** `exceljs@4.4.0`
* **Current Scope:** `FIXTURE_GENERATOR_DEV_ONLY`
* **Application Scope:** Not authorized for browser runtime without explicit evaluation.

## 5. Parser Requirements
* Local `File` input and `ArrayBuffer` parsing.
* No upload endpoint usage.
* Support for multiple worksheets (`answers`, `Dimensions`, `colaboradores`, `Jerarquía`).
* Validation of exact worksheet names and order.
* Extraction of header rows.
* Preservation of numeric, string, and blank cell values.
* Safe ISO timestamp extraction.
* Rejection of large dimensions or corrupt files.
* Capability for cancellation and session disposal.

## 6. Security Model
* **Formula cells:** Reject or treat as unsupported text.
* **Macros:** Reject completely.
* **External links:** Reject completely.
* **Hidden sheets:** Reject or emit warning according to validation policy.
* **Password-protected workbooks:** Reject completely.
* **Images:** Ignore.
* **Comments and notes:** Ignore or warn.
* **Extremely large worksheet dimensions:** Reject.
* **Malformed ZIP structures:** Reject with graceful error.
* **Unsupported cell types:** Reject or map to string fallback.

## 7. Network Guard
* File read through browser-local APIs only (`FileReader`, `ArrayBuffer`).
* No `fetch`, `XMLHttpRequest`, or `WebSocket` utilized by the parser.
* No upload endpoint.
* No analytics containing file-derived values.
* No external AI calls.
* **Assertion:** `NETWORK_REQUESTS_CONTAINING_FILE_CONTENT = ZERO`

## 8. Memory and Disposal
* Workbook bytes retained only during active session.
* Canonical result stored in memory only.
* File reference released after parsing when viable.
* Replace file disposes previous session.
* Remove file clears parser state.
* Reload or close tab clears all content.
* No `localStorage`, `sessionStorage`, `IndexedDB`, or service-worker cache usage.

## 9. Candidate A: Reutilizar ExcelJS
* **Package:** `exceljs@4.4.0`
* **Browser reading support:** Yes (via polyfills/streams).
* **ArrayBuffer support:** Yes.
* **Multiple worksheets:** Yes.
* **Blank-cell behavior:** Retains undefined/null.
* **Numeric cell preservation:** Yes.
* **Date behavior:** Yes.
* **Formula behavior:** Evaluates/reads values.
* **Macro behavior:** Ignores/strips.
* **External-link behavior:** Follows or retains links.
* **Bundle impact:** High (>500KB, heavy polyfill requirements for browser).
* **Tree-shaking:** Poor.
* **Worker compatibility:** Moderate (requires complex bundling).
* **Security findings:** 11 advisories (previously audited for dev).
* **License:** MIT.
* **Maintenance:** Low (infrequent updates).
* **Runtime dependency implications:** Requires bringing a dev dependency into the application bundle. `EXCELJS_APPLICATION_REUSE_REQUIRES_SEPARATE_RUNTIME_GATE`.

## 10. Candidate B: Dedicated Lightweight Parser (read-excel-file)
* **Package:** `read-excel-file`
* **Exact version reviewed:** `5.8.1`
* **License:** MIT.
* **Maintenance:** Active.
* **Browser compatibility:** Excellent (native File/Blob support).
* **TypeScript support:** Excellent.
* **ArrayBuffer support:** Yes.
* **Multiple worksheets:** Yes.
* **Blank-cell handling:** Explicit null/undefined.
* **Bundle impact:** Low (~150KB).
* **Worker compatibility:** High.
* **Known advisories:** None critical.
* **Installation required:** Yes.

## 11. Candidate C: General-purpose Alternative (SheetJS CE)
* **Package:** `xlsx`
* **Exact version reviewed:** `0.18.5`
* **License:** Apache 2.0 (for Community Edition).
* **Maintenance:** High (mostly Pro, CE is slower).
* **Browser compatibility:** Excellent.
* **TypeScript support:** Good.
* **ArrayBuffer support:** Yes.
* **Multiple worksheets:** Yes.
* **Blank-cell handling:** Yes.
* **Bundle impact:** High (~800KB).
* **Worker compatibility:** High.
* **Known advisories:** Occasional ReDoS in older versions.
* **Installation required:** Yes.

## 12. Canonical Adapter Option
* **Canonical JSON adapter:** Conceptually mapping JSON directly to canonical formats.
* **Classification:** `NOT_A_SUBSTITUTE_FOR_XLSX_UPLOAD_VALIDATION`. This may serve for engine testing, but does not close the capability of XLSX upload.

## 13. Comparison Matrix

| Criterion | ExcelJS (A) | read-excel-file (B) | SheetJS (C) |
| :--- | :--- | :--- | :--- |
| Already installed | YES (dev-only) | NO | NO |
| Additional installation required | PARTIAL (move to prod) | YES | YES |
| License | MIT | MIT | Apache 2.0 |
| Maintenance | Low | Active | Active (Pro split) |
| Security | 11 Advisories | Clean | Clean |
| Browser support | PARTIAL (heavy) | YES | YES |
| TypeScript support | YES | YES | YES |
| Multiple sheets | YES | YES | YES |
| Blank preservation | YES | YES | YES |
| Formula visibility | YES | NOT_VERIFIABLE / Ignored | YES |
| Macro handling | NOT_VERIFIABLE | Ignored | Ignored |
| Bundle size | High | Low | High |
| Worker compatibility | PARTIAL | YES | YES |
| API complexity | High | Low | Moderate |
| Contract compatibility | YES | YES | YES |
| Removal cost | Low | Low | Low |
| Recommended | NO | YES | NO |

## 14. Main Thread versus Worker
* **Strategy A (Main thread):** Adequate for golden synthetic workbooks, strict low file-size limits, and initial technical validation. Blocks UI on large files.
* **Strategy B (Web Worker):** Adequate for larger files, responsive progress, and future scale testing. Adds architectural complexity.
* **Decision:** `MAIN_THREAD_FOR_GOLDEN_SANDBOX_APPROVED` for the initial isolated synthetic phase. A future decision may shift to workers for productive scale.

## 15. Initial Resource Limits
* **Maximum simultaneous workbooks:** 2
* **Allowed file extension:** `.xlsx`
* **Allowed workbook type:** non-macro XLSX
* **Required sheets:** 4
* **Unexpected hidden sheets:** reject or warning
* **Maximum file size:** 5MB (Synthetic constraint)
* **Maximum worksheets:** 10
* **Maximum rows per worksheet:** 50,000
* **Maximum columns per worksheet:** 100
* **Maximum open-text length:** 5,000 characters

## 16. Canonical Parser Output
The final implementation must yield a structure equivalent to:
* `ParserResult`
* `WorkbookMetadata`
* `RecognizedSheet`
* `SheetHeader`
* `RawCellValue`
* `CanonicalWorkbookInput`
* `ParserIssue`
* `ParserSessionMetadata`

States:
* `PARSED`
* `PARSED_WITH_WARNINGS`
* `REJECTED`
* `CANCELLED`
* `FAILED`

## 17. Parser Error Model
| Error | Severity | Can continue | User-message intent | Data retained after error |
| :--- | :--- | :--- | :--- | :--- |
| `UNSUPPORTED_FILE_EXTENSION` | Fatal | No | "Formato de archivo no soportado." | None |
| `FILE_TOO_LARGE` | Fatal | No | "El archivo excede el límite de tamaño." | None |
| `CORRUPT_WORKBOOK` | Fatal | No | "El archivo está corrupto o es ilegible." | None |
| `PASSWORD_PROTECTED_WORKBOOK` | Fatal | No | "Archivos con contraseña no soportados." | None |
| `MACRO_ENABLED_WORKBOOK` | Fatal | No | "Archivos con macros no soportados." | None |
| `MISSING_REQUIRED_SHEET` | Fatal | No | "Falta una hoja requerida en el archivo." | None |
| `UNEXPECTED_SHEET` | Warning | Yes | "Hoja no esperada detectada (ignorada)." | Parsed valid sheets |
| `HIDDEN_SHEET` | Warning/Fatal | Yes/No | "Hoja oculta detectada." | Varies based on policy |
| `DUPLICATE_SHEET` | Fatal | No | "Hojas duplicadas detectadas." | None |
| `EMPTY_REQUIRED_SHEET` | Fatal | No | "Hoja requerida está vacía." | None |
| `MISSING_HEADER_ROW` | Fatal | No | "No se encontró fila de cabeceras." | None |
| `DUPLICATE_HEADER` | Fatal | No | "Cabeceras duplicadas detectadas." | None |
| `UNSUPPORTED_CELL_TYPE` | Warning | Yes | "Tipo de celda no soportado convertido a texto."| Fallback text |
| `FORMULA_CELL_NOT_ALLOWED` | Fatal | No | "Celdas con fórmulas no están permitidas." | None |
| `EXTERNAL_LINK_NOT_ALLOWED` | Fatal | No | "Enlaces externos no están permitidos." | None |
| `RESOURCE_LIMIT_EXCEEDED` | Fatal | No | "Límites del parser excedidos." | None |
| `PARSING_CANCELLED` | Info | No | "Procesamiento cancelado por el usuario." | None |
| `UNEXPECTED_PARSER_ERROR` | Fatal | No | "Error interno del parser." | None |

## 18. Recommended Parser
* **Recommended parser:** `read-excel-file`
* **Recommended exact version:** `5.8.1`
* **Recommended execution strategy:** Main thread (`MAIN_THREAD_FOR_GOLDEN_SANDBOX_APPROVED`)
* **Rationale:** Provides strict schema support out-of-the-box, excellent browser compatibility via native File APIs, minimal bundle footprint, and ignores risky components like macros and formulas natively, aligning perfectly with the sandbox security model.
* **Key risks:** May struggle with extremely large corporate files, though the synthetic limits mitigate this.
* **Removal strategy:** If proven inadequate, can be uninstalled and replaced cleanly since its API footprint will be abstracted behind the `ParserResult` models.

## 19. Dependency Classification
* **Recommended dependency classification:** Application Dependency (requires install).

## 20. Implementation Boundary
* **Recommended implementation boundary:** An isolated parsing utility in `src/lib/parser` (not created yet) that maps directly to the canonical output without touching UI or global state.

## 21. Required Controls
* The parser must be strictly gated behind the installation phase.
* Must enforce limits before starting buffer processing.
* Network traffic must be zero.

## 22. Prohibited Scope
* Upload UI.
* Validation UI.
* Comparative dashboard.
* Productive ingestion.
* Backend transmission.
* Persistent storage.

## 23. Installation Gate
* `SYN4B_DEPENDENCY_INSTALLATION_GATE_REQUIRED`

## 24. Implementation Gate
* `PARSER_IMPLEMENTATION_NOT_AUTHORIZED`

## 25. Approval Record
* **Date:** 2026-06-17
* **Phase:** `4K-SYN4A`
* **Outcome:** Dependency candidate `read-excel-file@5.8.1` selected. Implementation blocked pending installation and explicit authorization.
