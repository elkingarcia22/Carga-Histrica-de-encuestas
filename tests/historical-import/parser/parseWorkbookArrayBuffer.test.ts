import { describe, it, expect } from "vitest";
import { parseWorkbookArrayBuffer } from "../../../src/features/historical-import/parser/parseWorkbookArrayBuffer";
import { MAX_FILE_SIZE_BYTES } from "../../../src/features/historical-import/parser/parserLimits";
import * as fs from "node:fs";
import * as path from "node:path";

describe("parseWorkbookArrayBuffer", () => {
  const getFixtureBuffer = (fileName: string): ArrayBuffer => {
    const filePath = path.join(__dirname, "../../../fixtures/historical-import", fileName);
    const buffer = fs.readFileSync(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  };

  describe("Admission Rules", () => {
    it("rejects unsupported file extensions", async () => {
      const buffer = new ArrayBuffer(10);
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "test.csv", declaredSize: 10 }
      });
      expect(result.status).toBe("REJECTED");
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "UNSUPPORTED_FILE_EXTENSION" })
      );
    });

    it("rejects empty declared file size", async () => {
      const buffer = new ArrayBuffer(10);
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "test.xlsx", declaredSize: 0 }
      });
      expect(result.status).toBe("REJECTED");
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "EMPTY_FILE" })
      );
    });

    it("rejects declared file size too large", async () => {
      const buffer = new ArrayBuffer(10);
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "test.xlsx", declaredSize: MAX_FILE_SIZE_BYTES + 1 }
      });
      expect(result.status).toBe("REJECTED");
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "FILE_TOO_LARGE" })
      );
    });

    it("rejects empty ArrayBuffer", async () => {
      const buffer = new ArrayBuffer(0);
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "test.xlsx", declaredSize: 10 }
      });
      expect(result.status).toBe("REJECTED");
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "EMPTY_BUFFER" })
      );
    });

    it("rejects ArrayBuffer too large", async () => {
      const buffer = new ArrayBuffer(MAX_FILE_SIZE_BYTES + 1);
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "test.xlsx", declaredSize: 10 }
      });
      expect(result.status).toBe("REJECTED");
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "BUFFER_TOO_LARGE" })
      );
    });
  });

  describe("Corrupt Workbook", () => {
    it("handles corrupt workbook buffers", async () => {
      const buffer = new ArrayBuffer(100);
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "corrupt.xlsx", declaredSize: 100 }
      });
      // The library might throw when reading sheet names
      expect(["REJECTED", "FAILED"]).toContain(result.status);
      expect(result.issues.some(i => i.code === "CORRUPT_WORKBOOK" || i.code === "WORKBOOK_PARSE_FAILED")).toBe(true);
    });
  });

  describe("Golden Base Workbook", () => {
    it("parses correctly with expected rows and sheets", async () => {
      const buffer = getFixtureBuffer("synthetic-survey-base.xlsx");
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "synthetic-survey-base.xlsx", declaredSize: buffer.byteLength }
      });

       expect(["PARSED", "PARSED_WITH_WARNINGS"]).toContain(result.status);
      expect(result.sheets.length).toBeGreaterThanOrEqual(4);

      const answersSheet = result.sheets.find(s => s.sheetName === "answers");
      expect(answersSheet).toBeDefined();
      expect(answersSheet?.dataRowCount).toBe(18);
      expect(answersSheet?.observedColumnCount).toBe(31);

      const dimensionsSheet = result.sheets.find(s => s.sheetName === "Dimensions");
      expect(dimensionsSheet).toBeDefined();
      expect(dimensionsSheet?.dataRowCount).toBe(17);

      const colaboradoresSheet = result.sheets.find(s => s.sheetName === "colaboradores");
      expect(colaboradoresSheet).toBeDefined();
      expect(colaboradoresSheet?.dataRowCount).toBe(24);

      const jerarquiaSheet = result.sheets.find(s => s.sheetName === "Jerarquía");
      expect(jerarquiaSheet).toBeDefined();
      expect(jerarquiaSheet?.dataRowCount).toBe(9);
    });
  });

  describe("Golden Comparison Workbook", () => {
    it("parses correctly with expected rows and sheets", async () => {
      const buffer = getFixtureBuffer("synthetic-survey-comparison.xlsx");
      const result = await parseWorkbookArrayBuffer({
        buffer,
        metadata: { fileName: "synthetic-survey-comparison.xlsx", declaredSize: buffer.byteLength }
      });

       expect(["PARSED", "PARSED_WITH_WARNINGS"]).toContain(result.status);
      expect(result.sheets.length).toBeGreaterThanOrEqual(4);

      const answersSheet = result.sheets.find(s => s.sheetName === "answers");
      expect(answersSheet).toBeDefined();
      expect(answersSheet?.dataRowCount).toBe(22);
      expect(answersSheet?.observedColumnCount).toBe(31);

      const dimensionsSheet = result.sheets.find(s => s.sheetName === "Dimensions");
      expect(dimensionsSheet).toBeDefined();
      expect(dimensionsSheet?.dataRowCount).toBe(17);

      const colaboradoresSheet = result.sheets.find(s => s.sheetName === "colaboradores");
      expect(colaboradoresSheet).toBeDefined();
      expect(colaboradoresSheet?.dataRowCount).toBe(28);

      const jerarquiaSheet = result.sheets.find(s => s.sheetName === "Jerarquía");
      expect(jerarquiaSheet).toBeDefined();
      expect(jerarquiaSheet?.dataRowCount).toBe(11);
    });
  });

  describe("Blank-cell semantics", () => {
    it("preserves null for blank values instead of empty strings", async () => {
      const baseBuffer = getFixtureBuffer("synthetic-survey-base.xlsx");
      const baseResult = await parseWorkbookArrayBuffer({
        buffer: baseBuffer,
        metadata: { fileName: "synthetic-survey-base.xlsx", declaredSize: baseBuffer.byteLength }
      });

      const baseAnswers = baseResult.sheets.find(s => s.sheetName === "answers");
      expect(baseAnswers).toBeDefined();

      let rawPhysicalBlankCountBase = 0;
      for (const row of baseAnswers!.rawRows) {
        if (row["Q-COL-004"] === null || row["Q-COL-004"] === undefined) {
          rawPhysicalBlankCountBase++;
        }
        expect(row["Q-COL-004"]).not.toBe("");
      }
      // SYN4C1 validates raw parser physical blanks only. Participation-aware blank semantics belong to SYN4C2.
      expect(rawPhysicalBlankCountBase).toBe(4); // 2 intentional + 2 from non-participants

      const compBuffer = getFixtureBuffer("synthetic-survey-comparison.xlsx");
      const compResult = await parseWorkbookArrayBuffer({
        buffer: compBuffer,
        metadata: { fileName: "synthetic-survey-comparison.xlsx", declaredSize: compBuffer.byteLength }
      });

      const compAnswers = compResult.sheets.find(s => s.sheetName === "answers");
      expect(compAnswers).toBeDefined();

      let rawPhysicalBlankCountComparison = 0;
      for (const row of compAnswers!.rawRows) {
        if (row["Q-COL-004"] === null || row["Q-COL-004"] === undefined) {
          rawPhysicalBlankCountComparison++;
        }
        expect(row["Q-COL-004"]).not.toBe("");
      }
      // SYN4C1 validates raw parser physical blanks only. Participation-aware blank semantics belong to SYN4C2.
      expect(rawPhysicalBlankCountComparison).toBe(3); // 1 intentional + 2 from non-participants
    });
  });
});
