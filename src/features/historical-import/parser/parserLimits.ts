import type { RequiredSheetName } from "./parserTypes";

export const MAX_SIMULTANEOUS_WORKBOOKS = 2;
export const ALLOWED_EXTENSION = ".xlsx";
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_WORKSHEETS = 10;
export const MAX_ROWS_PER_SHEET = 50000;
export const MAX_COLUMNS_PER_SHEET = 100;
export const MAX_OPEN_TEXT_LENGTH = 5000;

export const REQUIRED_SHEETS: RequiredSheetName[] = [
  "answers",
  "Dimensions",
  "colaboradores",
  "Jerarquía"
];
