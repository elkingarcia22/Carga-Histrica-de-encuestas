import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { parseWorkbookArrayBuffer } from "../../../../src/features/historical-import/parser/parseWorkbookArrayBuffer";
import { validateWorkbookSchema } from "../../../../src/features/historical-import/parser/schema/validateWorkbookSchema";
import { validateWorkbookCrossSheet } from "../../../../src/features/historical-import/parser/cross-sheet/validateWorkbookCrossSheet";
import type { ParserResult } from "../../../../src/features/historical-import/parser/parserTypes";
import type { SchemaValidationResult } from "../../../../src/features/historical-import/parser/schema/schemaTypes";
import type { CrossSheetValidationInput } from "../../../../src/features/historical-import/parser/cross-sheet/crossSheetTypes";

describe("validateWorkbookCrossSheet", () => {
  let baseBuffer: ArrayBuffer;
  let compBuffer: ArrayBuffer;

  let baseParserResult: ParserResult;
  let baseSchemaResult: SchemaValidationResult;

  let compParserResult: ParserResult;
  let compSchemaResult: SchemaValidationResult;

  beforeAll(async () => {
    const basePath = path.join(__dirname, "../../../../fixtures/historical-import/synthetic-survey-base.xlsx");
    const compPath = path.join(__dirname, "../../../../fixtures/historical-import/synthetic-survey-comparison.xlsx");

    const baseData = fs.readFileSync(basePath);
    baseBuffer = baseData.buffer.slice(baseData.byteOffset, baseData.byteOffset + baseData.byteLength);

    const compData = fs.readFileSync(compPath);
    compBuffer = compData.buffer.slice(compData.byteOffset, compData.byteOffset + compData.byteLength);

    baseParserResult = await parseWorkbookArrayBuffer({
      buffer: baseBuffer,
      metadata: { fileName: "synthetic-survey-base.xlsx", declaredSize: baseBuffer.byteLength }
    });

    compParserResult = await parseWorkbookArrayBuffer({
      buffer: compBuffer,
      metadata: { fileName: "synthetic-survey-comparison.xlsx", declaredSize: compBuffer.byteLength }
    });

    baseSchemaResult = validateWorkbookSchema({
      parserResult: baseParserResult,
      expectedSchemaKind: "base"
    });

    compSchemaResult = validateWorkbookSchema({
      parserResult: compParserResult,
      expectedSchemaKind: "comparison"
    });
  });

  it("should validate base golden fixture cross-sheet successfully", () => {
    const input: CrossSheetValidationInput = {
      parserResult: baseParserResult,
      schemaResult: baseSchemaResult,
      schemaKind: "base"
    };

    const result = validateWorkbookCrossSheet(input);
    expect(result.status).toBe("CROSS_SHEET_VALID");
    expect(result.summary.errors).toBe(0);
  });

  it("should validate comparison golden fixture cross-sheet successfully", () => {
    const input: CrossSheetValidationInput = {
      parserResult: compParserResult,
      schemaResult: compSchemaResult,
      schemaKind: "comparison"
    };

    const result = validateWorkbookCrossSheet(input);
    expect(result.status).toBe("CROSS_SHEET_VALID");
    expect(result.summary.errors).toBe(0);
  });

  describe("mutation tests", () => {
    let clonedParserResult: ParserResult;
    let clonedSchemaResult: SchemaValidationResult;

    beforeEach(() => {
      clonedParserResult = structuredClone(baseParserResult);
      clonedSchemaResult = structuredClone(baseSchemaResult);
    });

    it("should fail if answer respondent id is missing from colaboradores", () => {
      const answersSheet = clonedParserResult.sheets.find(s => s.sheetName === "answers");
      if (answersSheet && answersSheet.rawRows.length > 0) {
        answersSheet.rawRows[0]["respondent_id"] = "UNKNOWN_COLAB_ID";
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "ANSWER_RESPONDENT_NOT_FOUND",
            entityId: "UNKNOWN_COLAB_ID"
          })
        ])
      );
    });

    it("should fail if dimension is removed while answer column remains", () => {
      const dimSheet = clonedParserResult.sheets.find(s => s.sheetName === "Dimensions");
      if (dimSheet && dimSheet.rawRows.length > 0) {
        dimSheet.rawRows.pop(); // remove one dimension
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "MISSING_DIMENSION_FOR_ANSWER_COLUMN"
          })
        ])
      );
    });

    it("should fail if dimension is added without answer column", () => {
      const dimSheet = clonedParserResult.sheets.find(s => s.sheetName === "Dimensions");
      if (dimSheet) {
        dimSheet.rawRows.push({
          source_question_identifier: "NEW_DIM_NO_COL",
          canonical_question_id: "Q-NEW-999"
        });
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "DIMENSION_WITHOUT_ANSWER_COLUMN",
            entityId: "NEW_DIM_NO_COL"
          })
        ])
      );
    });

    it("should fail if there is a duplicate dimension id", () => {
      const dimSheet = clonedParserResult.sheets.find(s => s.sheetName === "Dimensions");
      if (dimSheet && dimSheet.rawRows.length > 0) {
        // duplicate first one
        dimSheet.rawRows.push({ ...dimSheet.rawRows[0] });
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "DUPLICATE_DIMENSION_ID"
          })
        ])
      );
    });

    it("should fail if there is a duplicate respondent id in colaboradores", () => {
      const colabSheet = clonedParserResult.sheets.find(s => s.sheetName === "colaboradores");
      if (colabSheet && colabSheet.rawRows.length > 0) {
        colabSheet.rawRows.push({ ...colabSheet.rawRows[0] });
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "DUPLICATE_RESPONDENT_ID",
            relationKind: "ANSWERS_TO_COLLABORATORS",
            entityKind: "COLLABORATOR"
          })
        ])
      );
    });

    it("should fail if collaborator hierarchy node is missing", () => {
      const colabSheet = clonedParserResult.sheets.find(s => s.sheetName === "colaboradores");
      if (colabSheet && colabSheet.rawRows.length > 0) {
        colabSheet.rawRows[0]["hierarchy_leaf_id"] = "H-UNKNOWN-LEAF";
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "COLLABORATOR_WITHOUT_HIERARCHY_NODE"
          })
        ])
      );
    });

    it("should fail if hierarchy parent is missing", () => {
      const hierSheet = clonedParserResult.sheets.find(s => s.sheetName === "Jerarquía");
      if (hierSheet && hierSheet.rawRows.length > 1) {
        hierSheet.rawRows[1]["parent_node_id"] = "H-UNKNOWN-PARENT";
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "HIERARCHY_PARENT_NOT_FOUND"
          })
        ])
      );
    });

    it("should fail if there is a duplicate hierarchy node id", () => {
      const hierSheet = clonedParserResult.sheets.find(s => s.sheetName === "Jerarquía");
      if (hierSheet && hierSheet.rawRows.length > 0) {
        hierSheet.rawRows.push({ ...hierSheet.rawRows[0] });
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "DUPLICATE_HIERARCHY_NODE_ID"
          })
        ])
      );
    });

    it("should detect hierarchy cycle", () => {
      const hierSheet = clonedParserResult.sheets.find(s => s.sheetName === "Jerarquía");
      if (hierSheet && hierSheet.rawRows.length > 1) {
        // Create a cycle: node 1's parent is node 2, node 2's parent is node 1
        const node1Id = hierSheet.rawRows[1]["hierarchy_node_id"] as string;
        const node2Id = hierSheet.rawRows[2] ? (hierSheet.rawRows[2]["hierarchy_node_id"] as string) : null;
        
        if (node2Id) {
          hierSheet.rawRows[1]["parent_node_id"] = node2Id;
          hierSheet.rawRows[2]["parent_node_id"] = node1Id;
        }
      }

      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_INVALID");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "HIERARCHY_CYCLE_DETECTED"
          })
        ])
      );
    });

    it("should reject validation if parser result is rejected", () => {
      clonedParserResult.status = "REJECTED";
      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_VALIDATION_FAILED");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "PARSER_RESULT_NOT_READY"
          })
        ])
      );
    });

    it("should reject validation if schema result is invalid", () => {
      clonedSchemaResult.status = "SCHEMA_INVALID";
      const result = validateWorkbookCrossSheet({
        parserResult: clonedParserResult,
        schemaResult: clonedSchemaResult
      });

      expect(result.status).toBe("CROSS_SHEET_VALIDATION_FAILED");
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "SCHEMA_RESULT_NOT_READY"
          })
        ])
      );
    });
  });
});
