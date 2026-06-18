
import type {
  SchemaValidationInput,
  SchemaValidationResult,
  SchemaIssue,
  QuestionType
} from "./schemaTypes";
import { WORKBOOK_SCHEMA_CONTRACT } from "./schemaContract";

const ALLOWED_QUESTION_TYPES: QuestionType[] = ["LIKERT", "ENPS", "OPEN_TEXT", "UNKNOWN", "LIKERT_1_TO_5", "ENPS_EXPORTED_1_TO_11"];

export function validateWorkbookSchema(
  input: SchemaValidationInput
): SchemaValidationResult {
  const issues: SchemaIssue[] = [];
  const { parserResult, expectedSchemaKind = "unknown" } = input;

  if (parserResult.status !== "PARSED" && parserResult.status !== "PARSED_WITH_WARNINGS") {
    issues.push({
      code: "SCHEMA_VALIDATION_FAILED",
      severity: "ERROR",
      message: "Cannot validate schema on unparsed workbook."
    });
    return { status: "SCHEMA_VALIDATION_FAILED", issues, schemaKind: expectedSchemaKind };
  }

  const detectedKind = expectedSchemaKind; // In a full implementation, we might detect this if not provided

  for (const sheetContract of WORKBOOK_SCHEMA_CONTRACT) {
    const parsedSheet = parserResult.sheets.find(s => s.sheetName === sheetContract.sheetName);

    if (!parsedSheet) {
      if (sheetContract.required) {
        issues.push({
          code: "MISSING_REQUIRED_SHEET_FOR_SCHEMA",
          severity: "ERROR",
          message: `Required sheet missing: ${sheetContract.sheetName}`,
          sheet: sheetContract.sheetName
        });
      }
      continue;
    }

    // Validate headers
    const observedHeaders = parsedSheet.headers.map(h => h.column);
    const expectedHeaders = sheetContract.expectedHeaders.map(h => h.name);

    // Check for duplicates in observed headers
    const seenHeaders = new Set<string>();
    for (const header of observedHeaders) {
      if (seenHeaders.has(header)) {
        issues.push({
          code: "DUPLICATE_HEADER",
          severity: "ERROR",
          message: `Duplicate header found: ${header}`,
          sheet: parsedSheet.sheetName,
          column: header
        });
      }
      seenHeaders.add(header);
    }

    // Check missing headers
    for (const expected of expectedHeaders) {
      if (!observedHeaders.includes(expected)) {
        issues.push({
          code: "MISSING_REQUIRED_HEADER",
          severity: "ERROR",
          message: `Missing required header: ${expected}`,
          sheet: parsedSheet.sheetName,
          column: expected
        });
      }
    }

    // Check header order
    if (sheetContract.exactHeaderOrderRequired) {
      for (let i = 0; i < expectedHeaders.length; i++) {
        if (observedHeaders[i] && observedHeaders[i] !== expectedHeaders[i]) {
          issues.push({
            code: "WRONG_HEADER_ORDER",
            severity: "ERROR",
            message: `Header order mismatch at index ${i}. Expected ${expectedHeaders[i]}, got ${observedHeaders[i]}`,
            sheet: parsedSheet.sheetName,
            column: observedHeaders[i]
          });
        }
      }
    }

    // Check unexpected headers (only if the sheet specifies an exact match for ALL columns, Answers does not specify all)
    // For Dimensions, colaboradores, Jerarquía we specified all. For Answers we specified 14.
    if (sheetContract.sheetName !== "answers") {
      for (const obs of observedHeaders) {
        if (!expectedHeaders.includes(obs)) {
          issues.push({
            code: "UNEXPECTED_HEADER",
            severity: "WARNING", // Could be error depending on strictness
            message: `Unexpected header found: ${obs}`,
            sheet: parsedSheet.sheetName,
            column: obs
          });
        }
      }
    }

    // Validate column count
    if (sheetContract.expectedColumnCount !== undefined) {
      if (parsedSheet.observedColumnCount !== sheetContract.expectedColumnCount) {
        issues.push({
          code: "WRONG_COLUMN_COUNT",
          severity: "ERROR",
          message: `Expected ${sheetContract.expectedColumnCount} columns, got ${parsedSheet.observedColumnCount}`,
          sheet: parsedSheet.sheetName
        });
      }
    }

    // Validate row count
    if (detectedKind !== "unknown" && sheetContract.expectedDataRowCount) {
      const expectedRows = sheetContract.expectedDataRowCount[detectedKind];
      if (expectedRows !== undefined && parsedSheet.dataRowCount !== expectedRows) {
        issues.push({
          code: "WRONG_ROW_COUNT",
          severity: "ERROR",
          message: `Expected ${expectedRows} rows for ${detectedKind}, got ${parsedSheet.dataRowCount}`,
          sheet: parsedSheet.sheetName
        });
      }
    }

    // Question type validation for Dimensions
    if (sheetContract.sheetName === "Dimensions") {
      for (let i = 0; i < parsedSheet.rawRows.length; i++) {
        const row = parsedSheet.rawRows[i];
        const qType = row["question_type"] as string;
        if (qType && !ALLOWED_QUESTION_TYPES.includes(qType as QuestionType)) {
          issues.push({
            code: "UNKNOWN_QUESTION_TYPE",
            severity: "ERROR",
            message: `Unknown question type: ${qType}`,
            sheet: parsedSheet.sheetName
          });
        }
      }
    }
  }

  // Check for unexpected sheets in workbook
  const expectedSheetNames = WORKBOOK_SCHEMA_CONTRACT.map(c => c.sheetName);
  for (const sheet of parserResult.sheets) {
    if (!expectedSheetNames.includes(sheet.sheetName)) {
      issues.push({
        code: "INVALID_SHEET_SCHEMA",
        severity: "WARNING",
        message: `Unexpected sheet found: ${sheet.sheetName}`,
        sheet: sheet.sheetName
      });
    }
  }

  const hasErrors = issues.some(i => i.severity === "ERROR");
  const hasWarnings = issues.some(i => i.severity === "WARNING");

  let status: "SCHEMA_VALID" | "SCHEMA_VALID_WITH_WARNINGS" | "SCHEMA_INVALID" = "SCHEMA_VALID";
  if (hasErrors) {
    status = "SCHEMA_INVALID";
  } else if (hasWarnings) {
    status = "SCHEMA_VALID_WITH_WARNINGS";
  }

  return {
    status,
    issues,
    schemaKind: detectedKind
  };
}
