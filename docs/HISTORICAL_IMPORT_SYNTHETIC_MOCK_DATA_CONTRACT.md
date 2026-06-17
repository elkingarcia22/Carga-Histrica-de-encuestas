# Historical Import Synthetic Mock Data Contract

## 1. Purpose
The objective of this contract is to define deterministically and auditable the data contract that will be used by the future generation of synthetic workbooks for the Historical Import feature.

## 2. Contract Status
Status: `SYNTHETIC_MOCK_DATA_CONTRACT_LOCKED`

## 3. Sources of Truth
- `docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_INTAKE.md`
- `docs/HISTORICAL_IMPORT_SYNTHETIC_SANDBOX_ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/ANTIGRAVITY.md`
- `docs/ARCHITECTURE.md`
- `docs/QA_CHECKLIST.md`
- `docs/PROMPT_LOG.md`

## 4. Contract Identity and Version
- `contractName`: Historical Import Synthetic Mock Data Contract
- `contractVersion`: 1.0.0
- `schemaVersion`: SYN-HI-1
- `generatorSeed`: HISTORICAL-IMPORT-SYNTHETIC-V1

## 5. Artifact Catalog
### Base Workbook
- File: `synthetic-survey-base.xlsx`
- `artifactRole`: BASE_PERIOD
- `surveyPeriodId`: SYN-BASE

### Comparison Workbook
- File: `synthetic-survey-comparison.xlsx`
- `artifactRole`: COMPARISON_PERIOD
- `surveyPeriodId`: SYN-COMPARISON

## 6. Golden Dataset Profile
### Base
- Eligible collaborators: 24
- Answer rows: 18
- Complete answer rows: 16
- Incomplete answer rows: 2
- Hierarchy nodes: 9
- Question columns: 17
- Metadata columns before questions: 14

### Comparison
- Eligible collaborators: 28
- Answer rows: 22
- Complete answer rows: 20
- Incomplete answer rows: 2
- Hierarchy nodes: 11
- Question columns: 17
- Metadata columns before questions: 14

Open Gate: `SANDBOX_RESOURCE_LIMITS_DECISION_REQUIRED`

## 7. Workbook Contract
Both workbooks must contain exactly four sheets in this order, considered canonical for the golden dataset:
1. `answers`
2. `Dimensions`
3. `colaboradores`
4. `Jerarquía`

## 8. Answers Sheet Contract
Exactly these 14 initial columns:
1. `response_id`: string, required, unique
2. `respondent_id`: string, required
3. `survey_period_id`: string, required
4. `completion_status`: COMPLETE | INCOMPLETE
5. `submitted_at`: ISO-8601 synthetic timestamp
6. `org_unit_code`: string
7. `department_code`: string
8. `area_code`: string
9. `site_code`: string
10. `region_code`: string
11. `tenure_band`: synthetic category
12. `age_band`: synthetic category
13. `role_family`: synthetic category
14. `employment_type`: synthetic category

After these columns must appear the physical question columns (number | string | blank).

Rules:
- A valid `respondent_id` must exist in `colaboradores`.
- The golden dataset must not have orphan answers.
- The golden dataset must not have duplicated `response_id`.
- `INCOMPLETE` records may contain empty answers.
- Main metrics must use `COMPLETE` records, unless stated otherwise.
- Do not include names, email, phone, document, or employee number.

## 9. Dimensions Sheet Contract
Exactly these columns:
1. `source_question_identifier`
2. `canonical_question_id`
3. `dimension_id`
4. `dimension_label`
5. `question_label`
6. `question_type`
7. `is_required`
8. `survey_period_id`
9. `display_order`
10. `scale_min`
11. `scale_max`
12. `comparability_hint`
13. `active`

Allowed types: `LIKERT_1_TO_5`, `ENPS_EXPORTED_1_TO_11`, `OPEN_TEXT`, `UNKNOWN`.
Golden dataset must not contain `UNKNOWN`. Negative scenarios can introduce it.

## 10. Collaborators Sheet Contract
Columns:
1. `collaborator_id`
2. `survey_period_id`
3. `eligible`
4. `org_unit_code`
5. `department_code`
6. `area_code`
7. `site_code`
8. `region_code`
9. `tenure_band`
10. `age_band`
11. `role_family`
12. `employment_type`
13. `hierarchy_leaf_id`

Rules:
- `collaborator_id` is synthetic and unique within the period.
- No real names or productive IDs.
- Codes use recognizable synthetic prefixes.
- `eligible` must be boolean.
- All valid answer rows must correspond to an eligible collaborator.
- There must be eligible collaborators without answers to test participation.

## 11. Hierarchy Sheet Contract
Columns:
1. `hierarchy_node_id`
2. `hierarchy_node_label`
3. `hierarchy_level`
4. `parent_node_id`
5. `org_unit_code`
6. `active`
7. `display_order`

Allowed levels: `ROOT`, `DIVISION`, `TEAM`.
Labels must be neutral/synthetic (e.g., Organización Sintética, División A, Equipo A1). No real names.

### Base Structure (9 nodes)
- 1 ROOT
- 3 DIVISION
- 5 TEAM

### Comparison Structure (11 nodes)
- 1 ROOT
- 4 DIVISION
- 6 TEAM
The comparison must include a new division and a new team.

## 12. Identifier Conventions
- Response: `RESP-B-001`, `RESP-C-001`
- Respondent/Collaborator: `COL-B-001`, `COL-C-001`
- Hierarchy: `H-ROOT-001`, `H-DIV-A`, `H-TEAM-A1`
- Dimensions: `DIM-CLIMATE`, `DIM-LEADERSHIP`, `DIM-COLLABORATION`, `DIM-DEVELOPMENT`
- Canonical Questions: `Q-CLM-001`, `Q-LDR-001`, `Q-COL-001`, `Q-DEV-001`, `Q-ENPS-001`, `Q-TXT-001`

Identifiers must not look like employee numbers or productive identifiers.

## 13. Canonical Question Catalog
Total 18 canonical questions. Each workbook contains 17 columns.

- Twelve stable Likert (`MATCHED`): `Q-CLM-001` to `Q-CLM-004`, `Q-LDR-001` to `Q-LDR-004`, `Q-COL-001` to `Q-COL-004`
- One stable eNPS (`MATCHED`): `Q-ENPS-001`, `ENPS_EXPORTED_1_TO_11`
- One stable open text (`MATCHED`): `Q-TXT-001`, `OPEN_TEXT`
- One physical ID changed (`ID_CHANGED_MATCHED`): `canonicalQuestionId: Q-DEV-001`, base ID: `B_DEV_01`, comparison ID: `C_GROWTH_07`
- One text modified (`TEXT_CHANGED_REVIEW_REQUIRED`): `canonicalQuestionId: Q-COM-001`. Different synthetic labels across periods. Delta suppressed until review.
- One removed (`REMOVED`): `canonicalQuestionId: Q-LEGACY-001`. Base: YES, Comp: NO.
- One new (`NEW`): `canonicalQuestionId: Q-NEW-001`. Base: NO, Comp: YES.

## 14. Cross-Period Mapping
Addressed in section 13.

## 15. Segment Distribution
Using `org_unit_code`:

### Base
- DIV-A: eligible: 10, complete: 8
- DIV-B: eligible: 8, complete: 5
- DIV-C: eligible: 6, complete: 3
Total: eligible: 24, complete: 16. Participation: 66.67%

### Comparison
- DIV-A: eligible: 11, complete: 9
- DIV-B: eligible: 9, complete: 6
- DIV-C: eligible: 5, complete: 3
- DIV-D: eligible: 3, complete: 2
Total: eligible: 28, complete: 20. Participation: 71.43%

The 2 incomplete rows per period do not count towards completion.

## 16. Synthetic Metric Policy
Policy: `SYNTHETIC_METRIC_POLICY_V1`
- Likert negative: 1–2
- Likert neutral: 3
- Likert positive: 4–5
- Favorability: positive responses / valid Likert responses

Declarations:
- `SYNTHETIC_TEST_POLICY_ONLY`
- `PRODUCTION_LIKERT_POLICY_NOT_APPROVED`
- `LIKERT_BUCKET_POLICY_DECISION_REQUIRED`

## 17. Synthetic Privacy Policy
Policy: `SYNTHETIC_PRIVACY_POLICY_V1`
- `minimumCompletedResponsesForVisibleSegment`: 4

Declarations:
- `SYNTHETIC_TEST_POLICY_ONLY`
- `PRODUCTION_PRIVACY_THRESHOLD_NOT_APPROVED`
- `SMALL_SEGMENT_THRESHOLD_DECISION_REQUIRED`

Expected Output:
- Base: DIV-A (VISIBLE), DIV-B (VISIBLE), DIV-C (SUPPRESSED_SMALL_SEGMENT)
- Comparison: DIV-A (VISIBLE), DIV-B (VISIBLE), DIV-C (SUPPRESSED_SMALL_SEGMENT), DIV-D (SUPPRESSED_SMALL_SEGMENT)

## 18. Expected Participation
- Base: 16 / 24 = 66.67%
- Comparison: 20 / 28 = 71.43%
- Delta: +4.76 percentage points

## 19. Golden Metric Assertions
- `Q-CLM-001` (Base): 1: 1, 2: 2, 3: 3, 4: 6, 5: 4. Negative: 18.75%, Neutral: 18.75%, Positive/Favorability: 62.50%.
- `Q-CLM-001` (Comp): 1: 1, 2: 1, 3: 2, 4: 8, 5: 8. Negative: 10.00%, Neutral: 10.00%, Positive/Favorability: 80.00%. Delta: +17.50 pp.
- `Q-LDR-001` (Base): 1: 1, 2: 1, 3: 2, 4: 6, 5: 6. Favorability: 75.00%.
- `Q-LDR-001` (Comp): 1: 2, 2: 3, 3: 3, 4: 7, 5: 5. Favorability: 60.00%. Delta: -15.00 pp.
- `Q-DEV-001`: Base favorability: 50.00%, Comparison favorability: 70.00%. Delta: +20.00 pp. Status: `ID_CHANGED_MATCHED`.
- `Q-COM-001`: Both computable. Automatic delta: `NOT_ALLOWED`. Status: `TEXT_CHANGED_REVIEW_REQUIRED`.
- eNPS (Base 16): Detractors: 6, Passives: 4, Promoters: 6. eNPS: 0.
- eNPS (Comp 20): Detractors: 6, Passives: 4, Promoters: 10. eNPS: +20. Delta: +20. Physical values 1-11, normalized by subtracting 1.

## 20. Missing-Value Contract
Optional Likert: `Q-COL-004` (isRequired: false)
- Base: 16 complete respondents. Valid values: 14. Blank values: 2. Valid response rate: 87.50%.
- Comparison: 20 complete respondents. Valid values: 19. Blank values: 1. Valid response rate: 95.00%.
Allowed blanks must not be classified as errors.

## 21. Open-Text Contract
- `Q-TXT-001` (questionType: `OPEN_TEXT`)
- Completely synthetic content. Max 120 characters per response in golden dataset.
- Does not participate in favorability or eNPS. Not sent to AI. Not on first screen. Not logged. Discarded with session.
- Base non-empty: 8
- Comparison non-empty: 10

## 22. Mutation Catalog
1. `MUT-001` · Missing answers sheet
2. `MUT-002` · Missing respondent_id column
3. `MUT-003` · Duplicate response_id
4. `MUT-004` · Response without collaborator
5. `MUT-005` · Collaborator without response
6. `MUT-006` · Invalid hierarchy reference
7. `MUT-007` · Circular hierarchy
8. `MUT-008` · Likert value 6
9. `MUT-009` · eNPS exported value 12
10. `MUT-010` · Unknown question type
11. `MUT-011` · Duplicate canonical question ID
12. `MUT-012` · Unexpected sheet
13. `MUT-013` · Renamed required sheet
14. `MUT-014` · Corrupt workbook
15. `MUT-015` · Non-XLSX file
16. `MUT-016` · New question
17. `MUT-017` · Removed question
18. `MUT-018` · Physical ID changed
19. `MUT-019` · Question text changed
20. `MUT-020` · Small private segment
(Deferred: `MUT-021` · Oversized workbook, until `SANDBOX_RESOURCE_LIMITS_DECISION_REQUIRED` is resolved)

## 23. Expected Validation Matrix
- Missing required sheet: `BLOCKING_ERROR`, cannot continue
- Missing required column: `BLOCKING_ERROR`, cannot continue
- Duplicate response_id: `ERROR`, cannot continue
- Response without collaborator: `ERROR`, cannot continue
- Collaborator without response: `INFO`, can continue
- Invalid hierarchy reference: `ERROR`, cannot continue
- Circular hierarchy: `BLOCKING_ERROR`, cannot continue
- Likert out of range: `ERROR`, cannot continue
- eNPS out of range: `ERROR`, cannot continue
- Unknown question type: `ERROR`, metrics blocked for affected question
- Unexpected sheet: `WARNING`, can continue
- New question: `INFO`, can continue, `comparabilityStatus = NEW`
- Removed question: `INFO`, can continue, `comparabilityStatus = REMOVED`
- Physical ID changed: `INFO`, can continue, `comparabilityStatus = ID_CHANGED_MATCHED`
- Question text changed: `WARNING`, can continue, automatic delta suppressed
- Small segment: `INFO`, can continue, output suppressed

## 24. Fixture Families
- Golden: Valid base workbook, Valid comparison workbook
- Validation mutations: One mutation per artifact
- Performance: Deferred until resource limits are approved

## 25. Anti-Real-Data Rules
Prohibited:
- Real company/person names
- Real employee IDs
- Real emails
- Real locations
- Real organizational units
- Real survey labels copied verbatim
- Real open-text responses
- Real timestamps
- Real tenant identifiers
- Real client-specific codes

All must use prefixes like `SYN-`, `COL-`, `RESP-`, `H-`.
Validation: `REAL_DATA_SIMILARITY_REVIEW_REQUIRED_BEFORE_FIXTURE_COMMIT`

## 26. Determinism and Versioning
Generator must ensure:
- Stable ordering
- Stable IDs
- Stable row counts
- Stable question order
- Stable distributions
- Stable expected metrics
- Stable hashes for a fixed generator version

Any change must increment `contractVersion`, `schemaVersion`, `generatorVersion`.

## 27. Tooling Gates
- `XLSX_PARSER_DEPENDENCY_DECISION_REQUIRED`
- `DEPENDENCY_INSTALLATION_NOT_AUTHORIZED`
- `SYNTHETIC_XLSX_GENERATION_MECHANISM_DECISION_REQUIRED`

## 28. SYN3 Entry Criteria
- [x] Contract document complete
- [x] Contract version defined
- [x] Generator seed defined
- [x] Workbook names defined
- [x] Four sheets defined
- [x] Exact columns defined
- [x] Question catalog defined
- [x] Cross-period statuses defined
- [x] Participant counts defined
- [x] Segment distributions defined
- [x] Golden metric assertions defined
- [x] Privacy test profile defined
- [x] Mutation catalog defined
- [x] Validation matrix defined
- [x] Anti-real-data rules defined
- [x] Determinism rules defined
- [x] No physical mock files created
- [x] Generation mechanism decision recorded

Status: `SYNTHETIC_MOCK_DATA_CONTRACT_LOCKED`
`SYN3_CONTRACT_READY`
`SYN3_PHYSICAL_GENERATION_PENDING_TOOLING_GATE`

## 29. Prohibited Actions
- No physical files created (XLSX, CSV, JSON, TS, etc.)
- No real data usage.
- No code modification.
- No dependency installation.

## 30. Approval Record
Locked in Phase 4K-SYN2.
