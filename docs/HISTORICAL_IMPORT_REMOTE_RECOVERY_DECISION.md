# Phase
Fase 4E-R6B2H2B-R3 · Remote Incident Recovery Decision

# 1. Git Preflight Report

| Check | Expected | Actual | Status |
| :--- | :--- | :--- | :--- |
| Branch | `main` | `main` | PASS |
| HEAD | `1ca42ca` | `1ca42cadb319ccf6b112ce4bbbc7a5d5d4ca28e9` | PASS |
| origin/main | `1ca42ca` | `1ca42cadb319ccf6b112ce4bbbc7a5d5d4ca28e9` | PASS |
| Ahead / Behind | `0 / 0` | `0 / 0` | PASS |
| Working Tree | Clean | Clean | PASS |
| Staged / Untracked | 0 / 0 | 0 / 0 | PASS |

# 2. Incident Inputs

* **Cross-Project Contamination**: Commit `1ca42ca` introduced `prospect-import/classification` files into Carga Histórica de Encuestas.
* **Mixed Commits & Regressions**: Commits `56564e7`, `f879b7a`, and `39e4bc0` interleave legitimate U1-U4 features with regressions, visual deviations, and frozen files.
* **Frozen Files Published**: `src/lib/survey-import/historical-preview/historicalPreviewTypes.ts`, `src/config/survey-import/historicalPreviewConfig.ts`, and `src/mocks/survey-import/historical-preview/historicalPreviewScenarios.ts` were tracked and pushed to origin.

# 3. Visual Baseline Decision

* **U1 (Upload Files)**: Wide canvas, compact lateral stepper, wide horizontal dropzone, no right rail, informative callout, fixed footer. Action disabled without files.
* **U2 (Selected Files)**: Top dropzone, compact summary strip, wide list, visual validation, pagination (if needed), fixed footer, no right rail.
* **U3-SIM (Simulated Analysis)**: Simulation disclosure, AILoader, six phases, aggregated summary, bounded file list, minimize action, floating tray, persistent footer, controlled navigation to U4-SIM.
* **U4-SIM (Normalization Preview)**: Disclosure, batch summary, detected files, relations, mapping, issues, CTA to config, wide canvas, no right rail.

# 4. Recovery Options Matrix

## Option A: Recovery branch from origin/main + corrective commits
* **Base**: `1ca42ca`
* **Pros**: Preserves history, PR compatible, no force push, auditable.
* **Cons**: Requires hunk-level review, history retains incidental commits.
* **Verdict**: **SELECTED**

## Option B: Sequential revert of all affected commits
* **Pros**: Explicit Git operation.
* **Cons**: Loses legitimate work temporarily, high conflict probability, extensive reconstruction.
* **Verdict**: REJECTED

## Option C: Branch from 0ed4695 and replace main
* **Pros**: Clean tree.
* **Cons**: Normal PR won't remove exclusive main changes, risks force push, breaks preservation policy.
* **Verdict**: REJECTED

## Option D: Rewrite main
* **Classification**: `EXTRAORDINARY_GOVERNANCE_ONLY`
* **Verdict**: REJECTED

# 5. Selected Recovery Strategy
`FORWARD_RECOVERY_FROM_CURRENT_ORIGIN_MAIN_WITH_SELECTIVE_RECONSTRUCTION`

# 6. Operational Branch Base
`1ca42cadb319ccf6b112ce4bbbc7a5d5d4ca28e9`

# 7. Comparison Baseline
`0ed46951f5981a58dda681c1452f10b54709e858`

# 8. 1ca42ca Treatment
`FULL_REVERT_REQUIRED`
* Future revert eliminates the four `prospect-import` routes.
* Does not affect U1–U4, R3, or Starter Kit.

# 9. 56564e7 Treatment

| Ruta | Cambio | Coincide con baseline visual | Legítimo | Regresión | Acción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/components/survey-import/ImportWizardFooter.tsx` | UI changes | `UNKNOWN_REQUIRES_VISUAL_REVIEW` | Mixed | Mixed | `HUNK_REVIEW_REQUIRED` |
| `src/components/survey-import/ImportWizardHeader.tsx` | UI changes | `UNKNOWN_REQUIRES_VISUAL_REVIEW` | Mixed | Mixed | `HUNK_REVIEW_REQUIRED` |
| `src/components/survey-import/ImportWizardShell.tsx` | Layout changes | `REGRESSED` | No | Yes | `RESTORE_FROM_0ED4695` |
| `src/components/survey-import/ImportWizardSteps.tsx` | Stepper logic | `UNKNOWN_REQUIRES_VISUAL_REVIEW` | Mixed | Mixed | `HUNK_REVIEW_REQUIRED` |
| `src/components/survey-import/InitialUploadPanel.tsx` | Layout changes | `REGRESSED` | No | Yes | `RESTORE_FROM_0ED4695` |
| `src/components/upload/UploadZone.tsx` | Layout changes | `REGRESSED` | No | Yes | `RESTORE_FROM_0ED4695` |
| `src/screens/survey-import/NormalizationPreviewScreen.tsx` | Component logic | `UNKNOWN_REQUIRES_VISUAL_REVIEW` | Mixed | Mixed | `HUNK_REVIEW_REQUIRED` |
| `src/screens/survey-import/SimulatedProcessingScreen.tsx` | Component logic | `UNKNOWN_REQUIRES_VISUAL_REVIEW` | Mixed | Mixed | `HUNK_REVIEW_REQUIRED` |
| `src/screens/survey-import/SurveyImportUploadScreen.tsx` | Layout changes | `REGRESSED` | No | Yes | `RESTORE_FROM_0ED4695` |
| `src/config/survey-import/importWizardContent.ts` | Config | `LEGITIMATE_BUT_REQUIRES_QA` | Yes | No | `KEEP_AFTER_VISUAL_QA` |
| `src/styles/globals.css` | Global styles | `REGRESSED` | No | Yes | `REMOVE` |

# 10. f879b7a Treatment
`HUNK_REVIEW_REQUIRED`. Ensure unused API removal is retained if legitimate, but U1-U4 visual baseline (wide layout, no right rail) is respected. No dead code allowed.

# 11. 39e4bc0 Treatment
* **Legitimate**: Intake/Architecture, R3, U3-SIM, U4-SIM, large batch capacity, pagination.
* **Regression**: Universal heading focus (`REMOVE_AND_REPLACE_LATER_WITH_ROW_AWARE_FOCUS`), frozen files, unauthorized scope.

# 12. Frozen Files Treatment
`REMOVE_FROM_CURRENT_TREE_BY_FORWARD_COMMIT`
Remove from tree, remove imports, do not copy, leave in history.

# 13. R3 Contract Treatment
`PRESERVE_EXACT_UNLESS_DIFF_PROVES_REGRESSION`
Validate types, config, scenarios, adapter, CTA.

# 14. Proposed Recovery Branch
`recovery/historical-import-forward-cleanup`
Created from `origin/main @ 1ca42ca`.

# 15. Future Commit Plan
1. `revert(prospects): remove cross-project classification contamination`
2. `chore(survey-import): remove frozen historical preview artifacts`
3. `fix(survey-import): restore shared wizard shell integrity`
4. `fix(survey-import): align upload and selected-files screens to approved baseline`
5. `fix(survey-import): preserve simulated analysis and tray flow`
6. `fix(survey-import): preserve normalization preview contract and UI`
7. `fix(survey-import): restore large-batch guardrails and pagination`
8. `docs(survey-import): document remote incident recovery`

# 16. QA Strategy
* **Technical**: Typecheck, scoped lint, test, build, `git diff --check`, 0 dependencies, 0 frozen imports, 0 prospect imports.
* **Functional**: U1 → U2 → U3-SIM → U4-SIM, cancel, back, minimize, complete, pagination, 200 items.
* **Visual**: Desktop wide (approx 900px), compare with approved screenshots.

# 17. PR Strategy
* No direct `main` modifications.
* Work in `recovery/historical-import-forward-cleanup`.
* Publish only after full QA.
* PR to `main` with documented removals.
* Require review, no force push, no auto squash.
* Verify Vercel deployment preview before merge.

# 18. Vercel Strategy
Current state: `CONTAMINATED_DEPLOYMENT`.
* Must validate recovery in Preview Deployment.
* Do not promote to Production until U1-U4 visual approval.

# 19. Rollback Strategy
If recovery fails: Do not merge PR. Delete remote recovery branch. `main` stays at `1ca42ca`. No resets.

# 20. Decision Gates Closed
1. Base of recovery branch
2. Comparison baseline
3. Full revert of 1ca42ca
4. 56564e7 strategy
5. f879b7a strategy
6. 39e4bc0 strategy
7. Frozen files removal
8. R3 preservation
9. Visual baseline
10. Future commits
11. Block-based QA
12. PR Strategy
13. Vercel Preview
14. No force push policy
15. Rollback Strategy

# 21. Decision Gates Pending
None.

# 22. Documentation Created
* `docs/HISTORICAL_IMPORT_REMOTE_RECOVERY_DECISION.md`

# 23. Source Code Integrity
`PASS`. No source files modified.

# 24. Final Status
`HISTORICAL_IMPORT_NORMALIZATION_REMOTE_RECOVERY_STRATEGY_LOCKED`

# 25. Next Maximum Authorizable Phase
`Fase 4E-R6B2H2B-R4 · Forward Recovery Branch Execution`
