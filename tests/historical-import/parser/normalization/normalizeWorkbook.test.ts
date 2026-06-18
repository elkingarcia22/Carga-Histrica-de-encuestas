import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { parseWorkbookArrayBuffer } from "../../../../src/features/historical-import/parser/parseWorkbookArrayBuffer";
import { validateWorkbookSchema } from "../../../../src/features/historical-import/parser/schema/validateWorkbookSchema";
import { validateWorkbookCrossSheet } from "../../../../src/features/historical-import/parser/cross-sheet/validateWorkbookCrossSheet";
import { normalizeWorkbook } from "../../../../src/features/historical-import/parser/normalization/normalizeWorkbook";
import type { ParserResult } from "../../../../src/features/historical-import/parser/parserTypes";
import type { SchemaValidationResult } from "../../../../src/features/historical-import/parser/schema/schemaTypes";
import type { CrossSheetValidationResult } from "../../../../src/features/historical-import/parser/cross-sheet/crossSheetTypes";

describe("normalizeWorkbook", () => {
  let baseParserResult: ParserResult;
  let baseSchemaResult: SchemaValidationResult;
  let baseCrossSheetResult: CrossSheetValidationResult;

  let compParserResult: ParserResult;
  let compSchemaResult: SchemaValidationResult;
  let compCrossSheetResult: CrossSheetValidationResult;

  beforeAll(async () => {
    const basePath = path.join(__dirname, "../../../../fixtures/historical-import/synthetic-survey-base.xlsx");
    const compPath = path.join(__dirname, "../../../../fixtures/historical-import/synthetic-survey-comparison.xlsx");

    const baseData = fs.readFileSync(basePath);
    const compData = fs.readFileSync(compPath);

    baseParserResult = await parseWorkbookArrayBuffer({
      buffer: baseData.buffer.slice(baseData.byteOffset, baseData.byteOffset + baseData.byteLength),
      metadata: { fileName: "synthetic-survey-base.xlsx", declaredSize: baseData.byteLength }
    });
    baseSchemaResult = validateWorkbookSchema({
      parserResult: baseParserResult,
      expectedSchemaKind: "base"
    });
    baseCrossSheetResult = validateWorkbookCrossSheet({
      parserResult: baseParserResult,
      schemaResult: baseSchemaResult,
      schemaKind: "base"
    });

    compParserResult = await parseWorkbookArrayBuffer({
      buffer: compData.buffer.slice(compData.byteOffset, compData.byteOffset + compData.byteLength),
      metadata: { fileName: "synthetic-survey-comparison.xlsx", declaredSize: compData.byteLength }
    });
    compSchemaResult = validateWorkbookSchema({
      parserResult: compParserResult,
      expectedSchemaKind: "comparison"
    });
    compCrossSheetResult = validateWorkbookCrossSheet({
      parserResult: compParserResult,
      schemaResult: compSchemaResult,
      schemaKind: "comparison"
    });
  });

  describe("Positive tests", () => {
    it("should normalize base golden fixture successfully", () => {
      // Create a copy to check immutability
      const originalParserResultStr = JSON.stringify(baseParserResult);
      const originalSchemaResultStr = JSON.stringify(baseSchemaResult);
      const originalCrossSheetResultStr = JSON.stringify(baseCrossSheetResult);

      const result = normalizeWorkbook({
        parserResult: baseParserResult,
        schemaResult: baseSchemaResult,
        crossSheetResult: baseCrossSheetResult,
        schemaKind: "base",
        sourceFileName: "synthetic-survey-base.xlsx"
      });

      expect(JSON.stringify(baseParserResult)).toBe(originalParserResultStr);
      expect(JSON.stringify(baseSchemaResult)).toBe(originalSchemaResultStr);
      expect(JSON.stringify(baseCrossSheetResult)).toBe(originalCrossSheetResultStr);

      expect(result.status).toBe("NORMALIZED");
      expect(result.workbook).not.toBeNull();

      if (result.workbook) {
        expect(result.workbook.questions).toHaveLength(17);
        expect(result.workbook.respondents).toHaveLength(24);
        expect(result.workbook.hierarchyNodes).toHaveLength(9);
        expect(result.workbook.responses).toHaveLength(18);

        let totalAnswerValues = 0;
        let hasBlanks = false;
        result.workbook.responses.forEach(r => {
          totalAnswerValues += r.answers.length;
          if (r.answers.some(a => a.valueKind === "BLANK")) {
            hasBlanks = true;
          }
        });

        expect(totalAnswerValues).toBe(18 * 17); // 306
        expect(hasBlanks).toBe(true); // Blank values preserved

        expect(result.workbook.sheetSummary.questions).toBe(17);
        expect(result.workbook.sheetSummary.respondents).toBe(24);
        expect(result.workbook.sheetSummary.hierarchyNodes).toBe(9);
        expect(result.workbook.sheetSummary.responses).toBe(18);
        expect(result.workbook.sheetSummary.totalAnswerValues).toBe(306);
      }
    });

    it("should normalize comparison golden fixture successfully", () => {
      const result = normalizeWorkbook({
        parserResult: compParserResult,
        schemaResult: compSchemaResult,
        crossSheetResult: compCrossSheetResult,
        schemaKind: "comparison"
      });

      expect(result.status).toBe("NORMALIZED");
      expect(result.workbook).not.toBeNull();

      if (result.workbook) {
        expect(result.workbook.questions).toHaveLength(17);
        expect(result.workbook.respondents).toHaveLength(28);
        expect(result.workbook.hierarchyNodes).toHaveLength(11);
        expect(result.workbook.responses).toHaveLength(22);

        let totalAnswerValues = 0;
        let hasBlanks = false;
        result.workbook.responses.forEach(r => {
          totalAnswerValues += r.answers.length;
          if (r.answers.some(a => a.valueKind === "BLANK")) {
            hasBlanks = true;
          }
        });

        expect(totalAnswerValues).toBe(22 * 17); // 374
        expect(hasBlanks).toBe(true); // Blank values preserved
      }
    });
  });

  describe("Negative mutation tests", () => {
    let clonedParserResult: ParserResult;
    let clonedSchemaResult: SchemaValidationResult;
    let clonedCrossSheetResult: CrossSheetValidationResult;

    beforeEach(() => {
      clonedParserResult = structuredClone(baseParserResult);
      clonedSchemaResult = structuredClone(baseSchemaResult);
      clonedCrossSheetResult = structuredClone(baseCrossSheetResult);
    });

    it("should reject if parser result is rejected", () => {
      clonedParserResult.status = "REJECTED";
      const result = normalizeWorkbook({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult,
        crossSheetResult: clonedCrossSheetResult,
        schemaKind: "base"
      });

      expect(result.status).toBe("NORMALIZATION_REJECTED");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "PARSER_RESULT_NOT_READY"
          })
        ])
      );
    });

    it("should reject if schema result is invalid", () => {
      clonedSchemaResult.status = "SCHEMA_INVALID";
      const result = normalizeWorkbook({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult,
        crossSheetResult: clonedCrossSheetResult,
        schemaKind: "base"
      });

      expect(result.status).toBe("NORMALIZATION_REJECTED");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "SCHEMA_RESULT_NOT_READY"
          })
        ])
      );
    });

    it("should reject if cross-sheet result is invalid", () => {
      clonedCrossSheetResult.status = "CROSS_SHEET_INVALID";
      const result = normalizeWorkbook({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult,
        crossSheetResult: clonedCrossSheetResult,
        schemaKind: "base"
      });

      expect(result.status).toBe("NORMALIZATION_REJECTED");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "CROSS_SHEET_RESULT_NOT_READY"
          })
        ])
      );
    });

    it("should fail if required canonical sheet is missing", () => {
      // Remove Dimensions sheet
      clonedParserResult.sheets = clonedParserResult.sheets.filter(s => s.sheetName !== "Dimensions");

      const result = normalizeWorkbook({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult,
        crossSheetResult: clonedCrossSheetResult,
        schemaKind: "base"
      });

      expect(result.status).toBe("NORMALIZATION_FAILED");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "MISSING_CANONICAL_SHEET"
          })
        ])
      );
    });

    it("should warn on invalid question type for normalization", () => {
      const dimSheet = clonedParserResult.sheets.find(s => s.sheetName === "Dimensions");
      if (dimSheet && dimSheet.rawRows.length > 0) {
        dimSheet.rawRows[0]["question_type"] = "WEIRD_TYPE";
      }

      const result = normalizeWorkbook({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult,
        crossSheetResult: clonedCrossSheetResult,
        schemaKind: "base"
      });

      expect(result.status).toBe("NORMALIZED_WITH_WARNINGS");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "INVALID_QUESTION_TYPE_FOR_NORMALIZATION",
            severity: "WARNING"
          })
        ])
      );
    });

    it("should warn on unsupported cell value", () => {
      const answersSheet = clonedParserResult.sheets.find(s => s.sheetName === "answers");
      if (answersSheet && answersSheet.rawRows.length > 0) {
        const physicalQuestionColumns = answersSheet.headers
          .slice(14)
          .map(h => h.column);
        if (physicalQuestionColumns.length > 0) {
          // Object is not string, number, boolean, date, null, undefined
          answersSheet.rawRows[0][physicalQuestionColumns[0]] = { foo: "bar" } as never;
        }
      }

      const result = normalizeWorkbook({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult,
        crossSheetResult: clonedCrossSheetResult,
        schemaKind: "base"
      });

      expect(result.status).toBe("NORMALIZED_WITH_WARNINGS");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "UNSUPPORTED_CELL_VALUE",
            severity: "WARNING"
          })
        ])
      );
    });
  });
});
