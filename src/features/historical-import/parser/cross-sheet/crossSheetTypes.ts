import type { ParserResult } from "../parserTypes";
import type { SchemaValidationResult, WorkbookSchemaKind } from "../schema/schemaTypes";

export type CrossSheetValidationStatus =
  | "CROSS_SHEET_VALID"
  | "CROSS_SHEET_VALID_WITH_WARNINGS"
  | "CROSS_SHEET_INVALID"
  | "CROSS_SHEET_VALIDATION_FAILED";

export type CrossSheetIssueSeverity = "INFO" | "WARNING" | "ERROR";

export type CrossSheetIssueCode =
  | "PARSER_RESULT_NOT_READY"
  | "SCHEMA_RESULT_NOT_READY"
  | "MISSING_DIMENSION_FOR_ANSWER_COLUMN"
  | "DIMENSION_WITHOUT_ANSWER_COLUMN"
  | "DUPLICATE_DIMENSION_ID"
  | "DUPLICATE_RESPONDENT_ID"
  | "ANSWER_RESPONDENT_NOT_FOUND"
  | "COLLABORATOR_WITHOUT_HIERARCHY_NODE"
  | "HIERARCHY_PARENT_NOT_FOUND"
  | "DUPLICATE_HIERARCHY_NODE_ID"
  | "HIERARCHY_CYCLE_DETECTED"
  | "CROSS_SHEET_VALIDATION_FAILED";

export type CrossSheetEntityKind = "ANSWER" | "DIMENSION" | "COLLABORATOR" | "HIERARCHY_NODE";
export type CrossSheetRelationKind =
  | "ANSWERS_TO_COLLABORATORS"
  | "ANSWERS_TO_DIMENSIONS"
  | "COLLABORATORS_TO_HIERARCHY"
  | "HIERARCHY_TO_HIERARCHY";

export interface CrossSheetIssue {
  code: CrossSheetIssueCode;
  severity: CrossSheetIssueSeverity;
  message: string;
  relationKind?: CrossSheetRelationKind;
  entityKind?: CrossSheetEntityKind;
  entityId?: string;
}

export interface CrossSheetValidationSummary {
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
}

export interface CrossSheetValidationInput {
  parserResult: ParserResult;
  schemaResult: SchemaValidationResult;
  schemaKind?: WorkbookSchemaKind;
}

export interface CrossSheetValidationResult {
  status: CrossSheetValidationStatus;
  issues: CrossSheetIssue[];
  summary: CrossSheetValidationSummary;
}
