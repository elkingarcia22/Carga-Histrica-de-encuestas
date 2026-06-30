# Phase 11D Close Report — Conversational Import (Ambiguity Resolution)

## Overview
Phase 11D implemented the full ambiguity resolution flow for the conversational historical import system, from detection through typed resolution application and workspace integration. 58 sub-phases (H1–H58) spanning architecture, types, mappers, workspace integration, QA, and stabilization.

## Sub-Phase Summary (H49–H58 *)

| Sub-Phase | Focus | Status |
|-----------|-------|--------|
| H49 | Ambiguity Runtime Integration | Complete |
| H50 | Ambiguity Visual QA | Complete |
| H51 | Ambiguity Runtime Stabilization | Complete |
| H52 | Next Scope Decision Gate (Option A selected) | Complete |
| H53 | Ambiguity Resolution Application Architecture | Complete |
| H54 | Resolution Application Types | Complete |
| H55 | Resolution Application Mapper | Complete |
| H56 | Resolution Application Workspace Integration | Complete |
| H57 | Visual QA | Complete |
| H58 | Stabilization — Native File Picker | Complete |

\* H1–H48 were closed in prior Phase 11D close reports.

## What Was Built
- Ambiguity detection for MultipleSurveyScope category
- Typed resolution application architecture (architecture doc, types, mapper, workspace integration)
- Hidden `<input type="file">` native file picker replacing `sandbox_upload_panel`
- Full end-to-end flow: upload → detect ambiguity → present scope options → user types "1" → advance to general configuration
- 155 regression tests passing
- 7/7 Playwright visual QA tests passing
- ESLint clean
- Git show check clean

## Current System State
- Chat-based import flow works for MultipleSurveyScope ambiguity
- Resolution uses principled architecture (types → mapper → workspace integration)
- No PII exposure, no raw data visible, no dashboard/comparison changes
- All actions by chat text only (no action buttons, side panels, form editors)
- File upload uses hidden input via `useRef` (no visual upload panel — pre-existing design decision)

## Next Scope Decision
- **Options Evaluated**:
  - **Option B**: Expand Next Ambiguity Category (SurveyTypeAmbiguity)
  - **Option C**: Conversational Editing Hardening ← **SELECTED**
  - **Option D**: Import Preparation Contract
  - **Stability/Polish**: Tech debt cleanup, additional tests, error handling hardening
- **Decision**: **Select Option C — Conversational Editing Hardening**
- **Rationale**: Strengthen post-hoc editing of survey metadata (name, type, date, visibility, threshold) via chat. Option C provides the highest product visibility and user value now that the resolution architecture is in place. Conversational editing is also a prerequisite for any ambiguity or review flow where users need to correct or refine data — building it now unlocks downstream capabilities.
- **Prior Art**: `docs/CONTROLLED_OVERLAY_EDITING_ARCHITECTURE.md` already defines overlay editing rules, permitted/prohibited actions, resolved view calculation, conflict rules, and privacy boundaries. `docs/CONVERSATIONAL_IMPORT_NEXT_CAPABILITY.md` previously recommended "Inline Structure Review Architecture" (related concept). This provides a running start for conversational editing implementation.
- **Rejection Rationale**:
  - **Option B rejected**: The resolution architecture supports adding new ambiguity categories, but conversational editing is the higher-value capability for end users. Ambiguity expansion can follow once the editing foundation exists.
  - **Option D rejected**: Import preparation requires closed resolution and review/editing flows. Premature while editing capabilities are not yet defined.
  - **Stability/Polish deferred**: Can be addressed incrementally alongside feature work.
- **Open Items**: MultipleSurveyScopeAmbiguity is the only ambiguity category implemented. Options B, D, and Stability/Polish remain available for future selection.

## Markers
- PHASE_11D_CLOSE_COMPLETE
- PHASE_11D_CLOSE_REPORT_CREATED
- H49_THROUGH_H58_COMPLETE
- FULL_REGRESSION_PASSED_155
- PLAYWRIGHT_QA_PASSED_7_OF_7
- NATIVE_FILE_PICKER_VIA_HIDDEN_INPUT
- NEXT_SCOPE_OPTION_C_SELECTED
- CONVERSATIONAL_EDITING_HARDENING_NEXT
