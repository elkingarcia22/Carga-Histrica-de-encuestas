# Historical Load - Real XLSX Content Analysis Architecture

## 1. Purpose
This architecture defines the local strategy to transition the historical import prototype from basic file-name heuristics to real, in-browser XLSX content analysis, blocking the pipeline required to inspect, classify, and extract structure from uploaded files without backend connectivity.

## 2. Problem Statement
The current system successfully groups files by cycle and basic filename patterns. However, it lacks deep inspection capabilities. It cannot accurately identify internal sheets, true column headers, questions, demographic dimensions, response scales, or the structural layout of aggregated vs. raw response files, preventing a high-fidelity historical data draft generation.

## 3. Analysis Pipeline
The local analysis pipeline is structured as follows:
1. **File intake**: Reading the binary stream in the browser.
2. **Workbook inspection**: Extracting high-level sheet metadata and dimensions.
3. **Sheet classification**: Determining the role of each sheet (e.g., demographics vs. responses).
4. **Header detection**: Locating the true header row, which may not be row 1.
5. **Column profiling**: Analyzing column data types, cardinality, and density.
6. **Question candidate detection**: Identifying columns that likely contain survey questions.
7. **Demographic candidate detection**: Identifying columns containing categorical segmentation data.
8. **Response scale detection**: Determining if answers are Likert, numeric, or boolean.
9. **Segment/source file role detection**: Identifying files that represent specific organizational segments.
10. **Confidence scoring**: Evaluating the reliability of the automated classification.
11. **Human decision generation**: Creating targeted questions for the user when confidence is low.
12. **Historical load draft update**: Integrating the analysis into the local draft contract.

## 4. Workbook Inspection
The system will use a local sandbox library (like `xlsx` or similar, running in-browser) to extract the following without rendering raw rows to the UI:
- `filename`
- `sheet names`
- `row count per sheet`
- `column count per sheet`
- `likely header row` (based on non-empty density transitions)
- `non-empty cell density`
- `sample column labels`
- `repeated section patterns`

## 5. Sheet Classification
Sheets must be classified into one of the following roles:
- `raw_responses`: Individual participant rows.
- `aggregated_results`: Pre-calculated metrics.
- `demographics`: Participant master data.
- `question_catalog`: Dictionary of survey questions.
- `metadata`: Cycle information, mappings.
- `segment_summary`: Segment-specific views.
- `unknown`: Requires human classification.

## 6. Column Classification
Columns must be mapped to the following standard roles:
- `question_candidate`
- `demographic_candidate`
- `participant_identifier_candidate`
- `response_value`
- `dimension_or_category`
- `segment_label`
- `metric_or_aggregate`
- `metadata`
- `unknown`

## 7. Question Detection Heuristics
Signals to flag a column as a `question_candidate`:
- Long text headers typical of questions.
- High cardinality of numeric/Likert scale values across rows.
- High number of responses per row indicating a wide survey format.
- Repeated prefix patterns (e.g., Q1, Q2, P1, P2).
- Column headers matching known dimension libraries.
- Low variance in data types (strictly numeric scales 1-5 or text like "De acuerdo").

## 8. Demographic Detection Heuristics
Signals to flag a column as a `demographic_candidate`:
- Headers containing keywords: área, gerencia, cargo, antigüedad, país, ciudad, género, edad/rango, nivel, sede, unidad organizacional.
- Low to medium cardinality (repeating categorical text values).
- Sparse nulls compared to question columns.

## 9. Segment File Role Detection
Files named with segment patterns (e.g., "Resultados Gerencia Supply Chain 2025.xlsx", "Resultados Gerencia Marketing 2025.xlsx") are candidates for `segment_summary`. The system must recognize that these are slices of the same cycle, not independent surveys.

## 10. Confidence Model
The analysis outputs a confidence score for its classifications:
- `high`: Strong heuristic match, automated mapping proceeds.
- `medium`: Likely match but requires passive review.
- `low`: Weak signals, requires explicit human decision.
- `blocked`: File structure unrecognized or unsupported.

## 11. Human Decisions
When confidence is `low` or `medium`, the system generates specific decision requests for the UX:
- Confirm main structural file.
- Confirm if a sheet contains raw responses vs. aggregated results.
- Confirm specific question columns.
- Confirm demographic columns.
- Confirm segment-based file grouping.
- Confirm response scale mappings (e.g., 1-5 vs 1-10).

## 12. UX Output Contract
The conversational interface must present the findings cleanly using lists and icons, never raw JSON or full data dumps. The output contract includes:
- Which file was read.
- What sheets were found.
- Which columns are probable questions.
- Which columns are probable demographics.
- Which columns failed classification.
- The overall confidence level.
- Specific, actionable decisions needed from the user.

## 13. Out of Scope
The following are strictly out of scope for this architecture:
- Real data importation or persistence.
- Backend, DB, or Storage creation.
- Claude or other external API connections.
- Dashboard rendering or comparison views.
- Global catalog integration.
- Full automated approval bypassing human review.

## 14. Future Implementation Plan
- **11D-H7 · XLSX Content Analyzer Type Scaffolding**: Define TypeScript interfaces and stubs.
- **11D-H8 · Workbook Inspection Mapper**: Implement the basic sheet/dimensions extraction.
- **11D-H9 · Column Classification Runtime**: Implement the heuristic logic for headers and data.
- **11D-H10 · Content Analysis UX Integration**: Connect analysis outputs to the conversational UI.
- **11D-H11 · QA**: Validate the analysis pipeline locally.
