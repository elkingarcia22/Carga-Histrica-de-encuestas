import { describe, it, expect } from "vitest";
import { validateWorkbookSchema } from "../../../../src/features/historical-import/parser/schema/validateWorkbookSchema";
import { parseWorkbookArrayBuffer } from "../../../../src/features/historical-import/parser/parseWorkbookArrayBuffer";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ParserResult } from "../../../../src/features/historical-import/parser/parserTypes";

describe("validateWorkbookSchema", () => {
  const getFixtureBuffer = (fileName: string): ArrayBuffer => {
    const filePath = path.join(__dirname, "../../../../fixtures/historical-import", fileName);
    const buffer = fs.readFileSync(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  };

  const getBaseParserResult = async (): Promise<ParserResult> => {
    const buffer = getFixtureBuffer("synthetic-survey-base.xlsx");
    return await parseWorkbookArrayBuffer({
      buffer,
      metadata: { fileName: "synthetic-survey-base.xlsx", declaredSize: buffer.byteLength }
    });
  };

  const getComparisonParserResult = async (): Promise<ParserResult> => {
    const buffer = getFixtureBuffer("synthetic-survey-comparison.xlsx");
    return await parseWorkbookArrayBuffer({
      buffer,
      metadata: { fileName: "synthetic-survey-comparison.xlsx", declaredSize: buffer.byteLength }
    });
  };

  describe("Positive Golden Tests", () => {
    it("validates base workbook schema correctly", async () => {
      const parserResult = await getBaseParserResult();
      expect(["PARSED", "PARSED_WITH_WARNINGS"]).toContain(parserResult.status);

      const validation = validateWorkbookSchema({
        parserResult,
        expectedSchemaKind: "base"
      });

      expect(validation.status).toBe("SCHEMA_VALID");
      expect(validation.issues).toHaveLength(0);

      const answersSheet = parserResult.sheets.find(s => s.sheetName === "answers");
      const dimSheet = parserResult.sheets.find(s => s.sheetName === "Dimensions");
      const colSheet = parserResult.sheets.find(s => s.sheetName === "colaboradores");
      const hSheet = parserResult.sheets.find(s => s.sheetName === "Jerarquía");

      expect(answersSheet?.dataRowCount).toBe(18);
      expect(answersSheet?.observedColumnCount).toBe(31);
      expect(dimSheet?.dataRowCount).toBe(17);
      expect(colSheet?.dataRowCount).toBe(24);
      expect(hSheet?.dataRowCount).toBe(9);
    });

    it("validates comparison workbook schema correctly", async () => {
      const parserResult = await getComparisonParserResult();
      expect(["PARSED", "PARSED_WITH_WARNINGS"]).toContain(parserResult.status);

      const validation = validateWorkbookSchema({
        parserResult,
        expectedSchemaKind: "comparison"
      });

      expect(validation.status).toBe("SCHEMA_VALID");
      expect(validation.issues).toHaveLength(0);

      const answersSheet = parserResult.sheets.find(s => s.sheetName === "answers");
      const dimSheet = parserResult.sheets.find(s => s.sheetName === "Dimensions");
      const colSheet = parserResult.sheets.find(s => s.sheetName === "colaboradores");
      const hSheet = parserResult.sheets.find(s => s.sheetName === "Jerarquía");

      expect(answersSheet?.dataRowCount).toBe(22);
      expect(answersSheet?.observedColumnCount).toBe(31);
      expect(dimSheet?.dataRowCount).toBe(17);
      expect(colSheet?.dataRowCount).toBe(28);
      expect(hSheet?.dataRowCount).toBe(11);
    });
  });

  describe("Negative Tests (In-Memory Mutations)", () => {
    const cloneParserResult = (result: ParserResult): ParserResult => {
      // JSON clone is safe here because RawCellValue does not contain functions and Date objects are represented as strings/numbers in our test or can be handled
      // Actually dates might be lost if we just JSON clone, let's do a slightly more careful clone.
      // Wait, Dates might be there. Let's map properly.
      return {
        ...result,
        issues: [...result.issues],
        session: { ...result.session },
        sheets: result.sheets.map(s => ({
          ...s,
          headers: [...s.headers.map(h => ({ ...h }))],
          rawRows: [...s.rawRows.map(r => ({ ...r }))]
        }))
      };
    };

    it("rejects when parser result is not parsed", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      cloned.status = "REJECTED";

      const validation = validateWorkbookSchema({ parserResult: cloned });
      expect(validation.status).toBe("SCHEMA_VALIDATION_FAILED");
      expect(validation.issues[0].code).toBe("SCHEMA_VALIDATION_FAILED");
    });

    it("detects missing required sheet", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      cloned.sheets = cloned.sheets.filter(s => s.sheetName !== "answers");

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_INVALID");
      expect(validation.issues.some(i => i.code === "MISSING_REQUIRED_SHEET_FOR_SCHEMA" && i.sheet === "answers")).toBe(true);
    });

    it("detects missing required header", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      const dimensions = cloned.sheets.find(s => s.sheetName === "Dimensions")!;
      // Remove canonical_question_id
      dimensions.headers = dimensions.headers.filter(h => h.column !== "canonical_question_id");

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_INVALID");
      expect(validation.issues.some(i => i.code === "MISSING_REQUIRED_HEADER" && i.column === "canonical_question_id")).toBe(true);
    });

    it("detects unexpected header", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      const jerarquia = cloned.sheets.find(s => s.sheetName === "Jerarquía")!;
      jerarquia.headers.push({ column: "unexpected_col" });

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_VALID_WITH_WARNINGS");
      expect(validation.issues.some(i => i.code === "UNEXPECTED_HEADER" && i.column === "unexpected_col")).toBe(true);
    });

    it("detects duplicate header", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      const answers = cloned.sheets.find(s => s.sheetName === "answers")!;
      answers.headers.push({ column: "response_id" });

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_INVALID");
      expect(validation.issues.some(i => i.code === "DUPLICATE_HEADER" && i.column === "response_id")).toBe(true);
    });

    it("detects wrong column count", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      const answers = cloned.sheets.find(s => s.sheetName === "answers")!;
      answers.observedColumnCount = 30; // Contract expects 31

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_INVALID");
      expect(validation.issues.some(i => i.code === "WRONG_COLUMN_COUNT" && i.sheet === "answers")).toBe(true);
    });

    it("detects wrong row count", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      const answers = cloned.sheets.find(s => s.sheetName === "answers")!;
      answers.dataRowCount = 10; // Contract expects 18 for base

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_INVALID");
      expect(validation.issues.some(i => i.code === "WRONG_ROW_COUNT" && i.sheet === "answers")).toBe(true);
    });

    it("detects unknown question type", async () => {
      const parserResult = await getBaseParserResult();
      const cloned = cloneParserResult(parserResult);
      const dimensions = cloned.sheets.find(s => s.sheetName === "Dimensions")!;
      dimensions.rawRows[0]["question_type"] = "INVALID_TYPE";

      const validation = validateWorkbookSchema({ parserResult: cloned, expectedSchemaKind: "base" });
      expect(validation.status).toBe("SCHEMA_INVALID");
      expect(validation.issues.some(i => i.code === "UNKNOWN_QUESTION_TYPE" && i.sheet === "Dimensions")).toBe(true);
    });
  });
});
