export type ParserStatus = "PARSED" | "PARSED_WITH_WARNINGS" | "REJECTED" | "FAILED";
export type ParserIssueSeverity = "INFO" | "WARNING" | "ERROR";

export type ParserIssueCode =
  | "UNSUPPORTED_FILE_EXTENSION"
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "EMPTY_BUFFER"
  | "BUFFER_TOO_LARGE"
  | "MISSING_REQUIRED_SHEET"
  | "EMPTY_REQUIRED_SHEET"
  | "TOO_MANY_WORKSHEETS"
  | "UNEXPECTED_SHEET"
  | "WRONG_REQUIRED_SHEET_ORDER"
  | "CORRUPT_WORKBOOK"
  | "WORKBOOK_PARSE_FAILED";

export interface ParserIssue {
  code: ParserIssueCode;
  severity: ParserIssueSeverity;
  message: string;
}

export interface WorkbookMetadata {
  fileName: string;
  declaredSize: number;
}

export interface ParserInput {
  buffer: ArrayBuffer;
  metadata: WorkbookMetadata;
}

export type RequiredSheetName = "answers" | "Dimensions" | "colaboradores" | "Jerarquía";

export type RawCellValue = string | number | boolean | Date | null | undefined;

export type RawWorkbookRow = Record<string, RawCellValue>;

export interface SheetHeader {
  column: string;
  type?: string;
}

export interface RecognizedSheet {
  sheetName: string;
  sheetIndex: number;
  rowCount: number;
  dataRowCount: number;
  observedColumnCount: number;
  headers: SheetHeader[];
  rawRows: RawWorkbookRow[];
}

export interface ParserSessionMetadata {
  startTime: number;
  endTime: number;
  durationMs: number;
}

export interface ParserResult {
  status: ParserStatus;
  issues: ParserIssue[];
  session: ParserSessionMetadata;
  sheets: RecognizedSheet[];
}
