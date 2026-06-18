import type {
  NormalizationInput,
  NormalizationResult,
  NormalizationIssue,
  CanonicalWorkbook,
  CanonicalQuestion,
  CanonicalRespondent,
  CanonicalHierarchyNode,
  CanonicalSurveyResponse,
  CanonicalAnswerValue,
  CanonicalQuestionType,
  CanonicalAnswerPrimitive
} from "./normalizationTypes";
import { NormalizationContract } from "./normalizationContract";

export function normalizeWorkbook(input: NormalizationInput): NormalizationResult {
  const issues: NormalizationIssue[] = [];

  const pushIssue = (issue: NormalizationIssue) => {
    issues.push(issue);
  };

  if (!NormalizationContract.validateInput(input)) {
    if (
      input.parserResult.status !== "PARSED" &&
      input.parserResult.status !== "PARSED_WITH_WARNINGS"
    ) {
      pushIssue({
        code: "PARSER_RESULT_NOT_READY",
        severity: "ERROR",
        message: "Parser result is not valid."
      });
    }
    if (
      input.schemaResult.status !== "SCHEMA_VALID" &&
      input.schemaResult.status !== "SCHEMA_VALID_WITH_WARNINGS"
    ) {
      pushIssue({
        code: "SCHEMA_RESULT_NOT_READY",
        severity: "ERROR",
        message: "Schema result is not valid."
      });
    }
    if (
      input.crossSheetResult.status !== "CROSS_SHEET_VALID" &&
      input.crossSheetResult.status !== "CROSS_SHEET_VALID_WITH_WARNINGS"
    ) {
      pushIssue({
        code: "CROSS_SHEET_RESULT_NOT_READY",
        severity: "ERROR",
        message: "Cross-sheet result is not valid."
      });
    }

    return {
      status: "NORMALIZATION_REJECTED",
      issues,
      workbook: null
    };
  }

  const getSheet = (name: string) => input.parserResult.sheets.find(s => s.sheetName === name);

  const dimSheet = getSheet("Dimensions");
  const colabSheet = getSheet("colaboradores");
  const hierSheet = getSheet("Jerarquía");
  const answersSheet = getSheet("answers");

  if (!dimSheet || !colabSheet || !hierSheet || !answersSheet) {
    pushIssue({
      code: "MISSING_CANONICAL_SHEET",
      severity: "ERROR",
      message: "One or more required canonical sheets are missing."
    });
    return {
      status: "NORMALIZATION_FAILED",
      issues,
      workbook: null
    };
  }

  const questions: CanonicalQuestion[] = [];
  const validQuestionIds = new Set<string>();
  const questionTypeMap = new Map<string, CanonicalQuestionType>();

  for (let i = 0; i < dimSheet.rawRows.length; i++) {
    const row = dimSheet.rawRows[i];
    const sourceId = String(row["source_question_identifier"]);
    const qId = String(row["canonical_question_id"]);
    const qText = String(row["question_label"]);
    const qTypeStr = String(row["question_type"]);

    let qType: CanonicalQuestionType = "UNKNOWN";
    if (["LIKERT", "ENPS", "OPEN_TEXT", "LIKERT_1_TO_5", "ENPS_EXPORTED_1_TO_11"].includes(qTypeStr)) {
      qType = qTypeStr as CanonicalQuestionType;
    } else {
      pushIssue({
        code: "INVALID_QUESTION_TYPE_FOR_NORMALIZATION",
        severity: "WARNING",
        message: `Unknown question type '${qTypeStr}' for question ${qId}`
      });
    }

    questions.push({
      questionId: qId,
      sourceQuestionIdentifier: sourceId,
      questionText: qText,
      questionType: qType,
      physicalColumnKey: sourceId,
      sourceSheetName: "Dimensions",
      sourceColumnIndex: undefined
    });
    validQuestionIds.add(sourceId);
    questionTypeMap.set(sourceId, qType);
  }

  const hierarchyNodes: CanonicalHierarchyNode[] = [];
  for (let i = 0; i < hierSheet.rawRows.length; i++) {
    const row = hierSheet.rawRows[i];
    const nodeId = String(row["hierarchy_node_id"]);
    const parentNodeIdRaw = row["parent_node_id"];
    const nodeName = String(row["hierarchy_node_label"]);

    let parentNodeId: string | undefined = undefined;
    if (typeof parentNodeIdRaw === "string" && parentNodeIdRaw.trim() !== "") {
      parentNodeId = parentNodeIdRaw;
    }

    hierarchyNodes.push({
      nodeId,
      parentNodeId,
      nodeName,
      sourceRowIndex: i
    });
  }

  const respondents: CanonicalRespondent[] = [];
  for (let i = 0; i < colabSheet.rawRows.length; i++) {
    const row = colabSheet.rawRows[i];
    const collaboratorId = String(row["collaborator_id"]);
    const hierarchyLeafIdRaw = row["hierarchy_leaf_id"];

    let hierarchyLeafId: string | undefined = undefined;
    if (typeof hierarchyLeafIdRaw === "string" && hierarchyLeafIdRaw.trim() !== "") {
      hierarchyLeafId = hierarchyLeafIdRaw;
    }

    const attributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      if (key !== "collaborator_id" && key !== "hierarchy_leaf_id" && value !== undefined && value !== null) {
        attributes[key] = String(value);
      }
    }

    respondents.push({
      respondentId: collaboratorId,
      collaboratorId,
      hierarchyLeafId,
      attributes,
      sourceRowIndex: i
    });
  }

  const responses: CanonicalSurveyResponse[] = [];
  const physicalQuestionColumns = answersSheet.headers
    .slice(14)
    .map(h => h.column)
    .filter(col => validQuestionIds.has(col));

  for (let i = 0; i < answersSheet.rawRows.length; i++) {
    const row = answersSheet.rawRows[i];
    const responseId = String(row["response_id"]);
    const respondentId = String(row["respondent_id"]);

    const answers: CanonicalAnswerValue[] = [];
    for (const qCol of physicalQuestionColumns) {
      const rawValue = row[qCol];
      let valueKind: CanonicalAnswerPrimitive = "UNSUPPORTED";

      if (rawValue === null || rawValue === undefined || rawValue === "") {
        valueKind = "BLANK";
      } else if (typeof rawValue === "number") {
        valueKind = "NUMBER";
      } else if (typeof rawValue === "string") {
        valueKind = "STRING";
      } else if (typeof rawValue === "boolean") {
        valueKind = "BOOLEAN";
      } else if (rawValue instanceof Date) {
        valueKind = "DATE";
      } else {
        pushIssue({
          code: "UNSUPPORTED_CELL_VALUE",
          severity: "WARNING",
          message: `Unsupported cell value type for answer column ${qCol}`
        });
      }

      answers.push({
        rawValue,
        valueKind,
        questionId: qCol,
        respondentId,
        sourceRowIndex: i
      });
    }

    responses.push({
      responseId,
      respondentId,
      sourceRowIndex: i,
      answers
    });
  }

  const hasErrors = issues.some(i => i.severity === "ERROR");
  const hasWarnings = issues.some(i => i.severity === "WARNING");

  let status: NormalizationResult["status"] = "NORMALIZED";
  if (hasErrors) {
    status = "NORMALIZATION_FAILED";
  } else if (hasWarnings) {
    status = "NORMALIZED_WITH_WARNINGS";
  }

  const normalizedAt = new Date("2026-06-18T10:36:21.000Z").toISOString(); // deterministic placeholder

  const workbook: CanonicalWorkbook = {
    metadata: {
      workbookId: "WB-" + Math.random().toString(36).substr(2, 9),
      workbookKind: input.schemaKind,
      sourceFileName: input.sourceFileName || "unknown",
      normalizedAt
    },
    questions,
    respondents,
    hierarchyNodes,
    responses,
    sheetSummary: {
      questions: questions.length,
      respondents: respondents.length,
      hierarchyNodes: hierarchyNodes.length,
      responses: responses.length,
      totalAnswerValues: responses.reduce((acc, r) => acc + r.answers.length, 0)
    },
    issueSummary: {
      INFO: issues.filter(i => i.severity === "INFO").length,
      WARNING: issues.filter(i => i.severity === "WARNING").length,
      ERROR: issues.filter(i => i.severity === "ERROR").length
    }
  };

  if (hasErrors) {
    return {
      status,
      issues,
      workbook: null
    };
  }

  return {
    status,
    issues,
    workbook
  };
}
