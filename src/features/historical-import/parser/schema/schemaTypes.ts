export type SchemaValidationStatus =
  | "SCHEMA_VALID"
  | "SCHEMA_VALID_WITH_WARNINGS"
  | "SCHEMA_INVALID"
  | "SCHEMA_VALIDATION_FAILED";

export type SchemaIssueSeverity = "INFO" | "WARNING" | "ERROR";

export type SchemaIssueCode =
  | "MISSING_REQUIRED_HEADER"
  | "UNEXPECTED_HEADER"
  | "DUPLICATE_HEADER"
  | "WRONG_HEADER_ORDER"
  | "WRONG_COLUMN_COUNT"
  | "WRONG_ROW_COUNT"
  | "UNKNOWN_QUESTION_TYPE"
  | "INVALID_SHEET_SCHEMA"
  | "MISSING_REQUIRED_SHEET_FOR_SCHEMA"
  | "SCHEMA_VALIDATION_FAILED";

export interface SchemaIssue {
  code: SchemaIssueCode;
  severity: SchemaIssueSeverity;
  message: string;
  sheet?: string;
  column?: string;
}

export type QuestionType = "LIKERT" | "ENPS" | "OPEN_TEXT" | "UNKNOWN" | "LIKERT_1_TO_5" | "ENPS_EXPORTED_1_TO_11";

export type WorkbookSchemaKind = "base" | "comparison" | "unknown";

export interface ColumnSchemaContract {
  name: string;
  required: boolean;
  type?: string;
}

export interface SheetSchemaContract {
  sheetName: string;
  required: boolean;
  expectedHeaders: ColumnSchemaContract[];
  expectedColumnCount?: number;
  expectedDataRowCount?: {
    base?: number;
    comparison?: number;
  };
  exactHeaderOrderRequired: boolean;
}

// Omit ParserResult from here, import from parserTypes
import type { ParserResult } from "../parserTypes";

export interface SchemaValidationInput {
  parserResult: ParserResult;
  expectedSchemaKind?: WorkbookSchemaKind;
}

export interface SchemaValidationResult {
  status: SchemaValidationStatus;
  issues: SchemaIssue[];
  schemaKind: WorkbookSchemaKind;
}
