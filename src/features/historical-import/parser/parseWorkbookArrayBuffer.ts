import type {
  ParserInput,
  ParserResult,
  ParserStatus,
  ParserIssue,
  RecognizedSheet,
  RequiredSheetName,
  RawWorkbookRow,
  SheetHeader,
  RawCellValue
} from "./parserTypes";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSION,
  MAX_WORKSHEETS,
  REQUIRED_SHEETS
} from "./parserLimits";
import readXlsxFile from "read-excel-file/universal";

export async function parseWorkbookArrayBuffer(
  input: ParserInput
): Promise<ParserResult> {
  const startTime = Date.now();
  const issues: ParserIssue[] = [];
  let status: ParserStatus = "PARSED";
  const sheets: RecognizedSheet[] = [];

  const addIssue = (
    code: ParserIssue["code"],
    severity: ParserIssue["severity"],
    message: string
  ) => {
    issues.push({ code, severity, message });
  };

  const createResult = (
    finalStatus: ParserStatus
  ): ParserResult => {
    const endTime = Date.now();
    return {
      status: finalStatus,
      issues,
      session: {
        startTime,
        endTime,
        durationMs: endTime - startTime
      },
      sheets
    };
  };

  // Admission Rules
  if (!input.metadata.fileName.toLowerCase().endsWith(ALLOWED_EXTENSION)) {
    addIssue(
      "UNSUPPORTED_FILE_EXTENSION",
      "ERROR",
      `File must end with ${ALLOWED_EXTENSION}`
    );
    return createResult("REJECTED");
  }

  if (input.metadata.declaredSize <= 0) {
    addIssue("EMPTY_FILE", "ERROR", "Declared file size must be > 0");
    return createResult("REJECTED");
  }

  if (input.metadata.declaredSize > MAX_FILE_SIZE_BYTES) {
    addIssue(
      "FILE_TOO_LARGE",
      "ERROR",
      `Declared file size exceeds ${MAX_FILE_SIZE_BYTES} bytes`
    );
    return createResult("REJECTED");
  }

  if (input.buffer.byteLength <= 0) {
    addIssue("EMPTY_BUFFER", "ERROR", "ArrayBuffer byteLength must be > 0");
    return createResult("REJECTED");
  }

  if (input.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    addIssue(
      "BUFFER_TOO_LARGE",
      "ERROR",
      `ArrayBuffer byteLength exceeds ${MAX_FILE_SIZE_BYTES} bytes`
    );
    return createResult("REJECTED");
  }

  let allSheets: Array<{ sheet: string, data: unknown[][] }>;
  try {
    allSheets = await readXlsxFile(input.buffer) as Array<{ sheet: string, data: unknown[][] }>;
  } catch (err: unknown) {
    addIssue("CORRUPT_WORKBOOK", "ERROR", "Failed to parse workbook: " + (err instanceof Error ? err.message : String(err)));
    return createResult("FAILED");
  }

  const sheetNames = allSheets.map(s => s.sheet);

  if (sheetNames.length > MAX_WORKSHEETS) {
    addIssue(
      "TOO_MANY_WORKSHEETS",
      "ERROR",
      `Workbook contains more than ${MAX_WORKSHEETS} sheets`
    );
    return createResult("FAILED");
  }

  const expectedOrderNames = REQUIRED_SHEETS;
  let orderIndex = 0;
  let hasOrderWarning = false;

  const foundSheets = new Set<string>();

  for (let i = 0; i < sheetNames.length; i++) {
    const sName = sheetNames[i];
    foundSheets.add(sName);
  }

  for (const reqSheet of REQUIRED_SHEETS) {
    if (!foundSheets.has(reqSheet)) {
      addIssue("MISSING_REQUIRED_SHEET", "ERROR", `Missing required sheet: ${reqSheet}`);
      status = "FAILED";
    }
  }

  if (status === "FAILED") {
    return createResult(status);
  }

  // Check order and unexpected sheets
  for (let i = 0; i < sheetNames.length; i++) {
    const sName = sheetNames[i];
    if (REQUIRED_SHEETS.includes(sName as RequiredSheetName)) {
      if (!hasOrderWarning && sName !== expectedOrderNames[orderIndex]) {
        addIssue(
          "WRONG_REQUIRED_SHEET_ORDER",
          "WARNING",
          "Required sheets are not in the expected order"
        );
        hasOrderWarning = true;
        status = "PARSED_WITH_WARNINGS";
      }
      orderIndex++;
    } else {
      addIssue("UNEXPECTED_SHEET", "WARNING", `Unexpected sheet found: ${sName}`);
      status = "PARSED_WITH_WARNINGS";
    }
  }

  for (let i = 0; i < allSheets.length; i++) {
    const sheetObj = allSheets[i];
    const sheetName = sheetObj.sheet;
    const rows = sheetObj.data;

    if (!REQUIRED_SHEETS.includes(sheetName as RequiredSheetName)) {
      continue;
    }

    if (!rows || rows.length === 0) {
      addIssue("EMPTY_REQUIRED_SHEET", "ERROR", `Required sheet is empty: ${sheetName}`);
      status = "FAILED";
      continue;
    }

    const rawHeaderRow = rows[0];
    const observedColumnCount = rawHeaderRow.length;

    const headers: SheetHeader[] = [];
    for (let c = 0; c < rawHeaderRow.length; c++) {
      const cellVal = rawHeaderRow[c];
      headers.push({
        column: cellVal === null || cellVal === undefined ? "" : String(cellVal)
      });
    }

    const dataRowCount = Math.max(0, rows.length - 1);

    const rawRows: RawWorkbookRow[] = [];
    for (let r = 1; r < rows.length; r++) {
      const rawRowArray = rows[r];
      const rowRecord: RawWorkbookRow = {};
      
      const maxCol = Math.max(observedColumnCount, rawRowArray.length);
      for (let c = 0; c < maxCol; c++) {
        const header = headers[c]?.column || `__col_${c}`;
        const val = rawRowArray[c];
        rowRecord[header] = val as RawCellValue;
      }
      rawRows.push(rowRecord);
    }

    sheets.push({
      sheetName,
      sheetIndex: i + 1,
      rowCount: rows.length,
      dataRowCount,
      observedColumnCount,
      headers,
      rawRows
    });
  }

  if (status === "FAILED") {
    return createResult("FAILED");
  }

  return createResult(status);
}
