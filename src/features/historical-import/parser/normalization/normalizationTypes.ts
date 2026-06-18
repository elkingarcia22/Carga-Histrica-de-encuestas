import type { ParserResult, RawCellValue } from "../parserTypes";
import type { SchemaValidationResult, WorkbookSchemaKind, QuestionType } from "../schema/schemaTypes";
import type { CrossSheetValidationResult } from "../cross-sheet/crossSheetTypes";

export type NormalizationStatus =
  | "NORMALIZED"
  | "NORMALIZED_WITH_WARNINGS"
  | "NORMALIZATION_REJECTED"
  | "NORMALIZATION_FAILED";

export type NormalizationIssueSeverity = "INFO" | "WARNING" | "ERROR";

export type NormalizationIssueCode =
  | "PARSER_RESULT_NOT_READY"
  | "SCHEMA_RESULT_NOT_READY"
  | "CROSS_SHEET_RESULT_NOT_READY"
  | "MISSING_CANONICAL_SHEET"
  | "MISSING_CANONICAL_HEADER"
  | "INVALID_CANONICAL_ROW"
  | "INVALID_QUESTION_TYPE_FOR_NORMALIZATION"
  | "UNSUPPORTED_CELL_VALUE"
  | "NORMALIZATION_FAILED";

export interface NormalizationIssue {
  code: NormalizationIssueCode;
  severity: NormalizationIssueSeverity;
  message: string;
}

export interface NormalizationInput {
  parserResult: ParserResult;
  schemaResult: SchemaValidationResult;
  crossSheetResult: CrossSheetValidationResult;
  schemaKind: WorkbookSchemaKind;
  sourceFileName?: string;
}

export type CanonicalQuestionType = QuestionType;

export type CanonicalAnswerPrimitive = "NUMBER" | "STRING" | "BOOLEAN" | "DATE" | "BLANK" | "UNSUPPORTED";

export interface CanonicalSourceReference {
  sheetName?: string;
  rowIndex?: number;
  columnIndex?: number;
}

export interface CanonicalQuestion {
  questionId: string;
  sourceQuestionIdentifier: string;
  questionText: string;
  questionType: CanonicalQuestionType;
  physicalColumnKey: string;
  sourceSheetName: string;
  sourceColumnIndex?: number;
}

export interface CanonicalRespondent {
  respondentId: string;
  collaboratorId: string;
  hierarchyLeafId?: string;
  attributes: Record<string, string>;
  sourceRowIndex?: number;
}

export interface CanonicalHierarchyNode {
  nodeId: string;
  parentNodeId?: string;
  nodeName: string;
  nodeType?: string;
  sourceRowIndex?: number;
}

export interface CanonicalAnswerValue {
  rawValue: RawCellValue;
  valueKind: CanonicalAnswerPrimitive;
  questionId: string;
  respondentId: string;
  sourceColumnIndex?: number;
  sourceRowIndex?: number;
}

export interface CanonicalSurveyResponse {
  responseId: string;
  respondentId: string;
  sourceRowIndex?: number;
  answers: CanonicalAnswerValue[];
}

export interface CanonicalWorkbookMetadata {
  workbookId: string;
  workbookKind: WorkbookSchemaKind;
  sourceFileName: string;
  normalizedAt: string;
}

export interface CanonicalWorkbook {
  metadata: CanonicalWorkbookMetadata;
  questions: CanonicalQuestion[];
  respondents: CanonicalRespondent[];
  hierarchyNodes: CanonicalHierarchyNode[];
  responses: CanonicalSurveyResponse[];
  sheetSummary: Record<string, number>;
  issueSummary: Record<NormalizationIssueSeverity, number>;
}

export interface NormalizationResult {
  status: NormalizationStatus;
  issues: NormalizationIssue[];
  workbook: CanonicalWorkbook | null;
}
