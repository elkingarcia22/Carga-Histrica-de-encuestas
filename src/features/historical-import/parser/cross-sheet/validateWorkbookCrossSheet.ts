import type {
  CrossSheetValidationInput,
  CrossSheetValidationResult,
  CrossSheetIssue,
  CrossSheetValidationSummary
} from "./crossSheetTypes";
import { CROSS_SHEET_RELATION_CONTRACT } from "./crossSheetContract";

export function validateWorkbookCrossSheet(
  input: CrossSheetValidationInput
): CrossSheetValidationResult {
  const issues: CrossSheetIssue[] = [];
  const { parserResult, schemaResult } = input;

  const pushIssue = (issue: Omit<CrossSheetIssue, "relationKind" | "entityKind" | "entityId"> & Partial<CrossSheetIssue>) => {
    issues.push({
      ...issue,
      relationKind: issue.relationKind,
      entityKind: issue.entityKind,
      entityId: issue.entityId
    });
  };

  if (
    parserResult.status !== "PARSED" &&
    parserResult.status !== "PARSED_WITH_WARNINGS"
  ) {
    pushIssue({
      code: "PARSER_RESULT_NOT_READY",
      severity: "ERROR",
      message: "Parser result is not in a valid state for cross-sheet validation."
    });
    return buildResult("CROSS_SHEET_VALIDATION_FAILED", issues);
  }

  if (
    schemaResult.status !== "SCHEMA_VALID" &&
    schemaResult.status !== "SCHEMA_VALID_WITH_WARNINGS"
  ) {
    pushIssue({
      code: "SCHEMA_RESULT_NOT_READY",
      severity: "ERROR",
      message: "Schema result is not in a valid state for cross-sheet validation."
    });
    return buildResult("CROSS_SHEET_VALIDATION_FAILED", issues);
  }

  const getSheet = (name: string) => parserResult.sheets.find(s => s.sheetName === name);
  const answersSheet = getSheet(CROSS_SHEET_RELATION_CONTRACT.answers.sheetName);
  const colabSheet = getSheet(CROSS_SHEET_RELATION_CONTRACT.colaboradores.sheetName);
  const dimSheet = getSheet(CROSS_SHEET_RELATION_CONTRACT.dimensions.sheetName);
  const hierSheet = getSheet(CROSS_SHEET_RELATION_CONTRACT.hierarchy.sheetName);

  if (!answersSheet || !colabSheet || !dimSheet || !hierSheet) {
    pushIssue({
      code: "CROSS_SHEET_VALIDATION_FAILED",
      severity: "ERROR",
      message: "Missing required sheets for cross validation."
    });
    return buildResult("CROSS_SHEET_VALIDATION_FAILED", issues);
  }

  // 1. answers <-> colaboradores
  const colabIds = new Set<string>();
  const seenColabIds = new Set<string>();

  for (const row of colabSheet.rawRows) {
    const colabId = row[CROSS_SHEET_RELATION_CONTRACT.colaboradores.collaboratorIdColumn];
    if (typeof colabId === "string") {
      if (colabIds.has(colabId)) {
        pushIssue({
          code: "DUPLICATE_RESPONDENT_ID",
          severity: "ERROR",
          message: `Duplicate collaborator id found in colaboradores: ${colabId}`,
          relationKind: "ANSWERS_TO_COLLABORATORS",
          entityKind: "COLLABORATOR",
          entityId: colabId
        });
      }
      colabIds.add(colabId);
      seenColabIds.add(colabId);
    }
  }

  const seenAnswersRespondents = new Set<string>();
  for (const row of answersSheet.rawRows) {
    const respondentId = row[CROSS_SHEET_RELATION_CONTRACT.answers.respondentIdColumn];
    if (typeof respondentId === "string") {
      if (seenAnswersRespondents.has(respondentId)) {
        pushIssue({
          code: "DUPLICATE_RESPONDENT_ID",
          severity: "ERROR",
          message: `Duplicate respondent id found in answers: ${respondentId}`,
          relationKind: "ANSWERS_TO_COLLABORATORS",
          entityKind: "ANSWER",
          entityId: respondentId
        });
      }
      seenAnswersRespondents.add(respondentId);

      if (!colabIds.has(respondentId)) {
        pushIssue({
          code: "ANSWER_RESPONDENT_NOT_FOUND",
          severity: "ERROR",
          message: `Respondent id ${respondentId} in answers not found in colaboradores.`,
          relationKind: "ANSWERS_TO_COLLABORATORS",
          entityKind: "ANSWER",
          entityId: respondentId
        });
      }
    }
  }

  // 2. answers <-> Dimensions
  const physicalQuestionColumns = answersSheet.headers
    .slice(CROSS_SHEET_RELATION_CONTRACT.answers.metadataColumnCount)
    .map(h => h.column);

  const dimensionQuestionIds = new Set<string>();
  for (const row of dimSheet.rawRows) {
    const sourceId = row[CROSS_SHEET_RELATION_CONTRACT.dimensions.sourceQuestionIdentifierColumn];
    if (typeof sourceId === "string") {
      if (dimensionQuestionIds.has(sourceId)) {
        pushIssue({
          code: "DUPLICATE_DIMENSION_ID",
          severity: "ERROR",
          message: `Duplicate source question identifier in Dimensions: ${sourceId}`,
          relationKind: "ANSWERS_TO_DIMENSIONS",
          entityKind: "DIMENSION",
          entityId: sourceId
        });
      }
      dimensionQuestionIds.add(sourceId);

      if (!physicalQuestionColumns.includes(sourceId)) {
        pushIssue({
          code: "DIMENSION_WITHOUT_ANSWER_COLUMN",
          severity: "ERROR",
          message: `Dimension question ${sourceId} does not have a corresponding physical column in answers.`,
          relationKind: "ANSWERS_TO_DIMENSIONS",
          entityKind: "DIMENSION",
          entityId: sourceId
        });
      }
    }
  }

  for (const qCol of physicalQuestionColumns) {
    if (!dimensionQuestionIds.has(qCol)) {
      pushIssue({
        code: "MISSING_DIMENSION_FOR_ANSWER_COLUMN",
        severity: "ERROR",
        message: `Answer column ${qCol} is missing a corresponding definition in Dimensions.`,
        relationKind: "ANSWERS_TO_DIMENSIONS",
        entityKind: "ANSWER",
        entityId: qCol
      });
    }
  }

  // 3. colaboradores <-> Jerarquía
  const hierarchyNodes = new Set<string>();
  const parentMap = new Map<string, string | null>();

  for (const row of hierSheet.rawRows) {
    const nodeId = row[CROSS_SHEET_RELATION_CONTRACT.hierarchy.nodeIdColumn];
    const parentId = row[CROSS_SHEET_RELATION_CONTRACT.hierarchy.parentNodeIdColumn];

    if (typeof nodeId === "string") {
      if (hierarchyNodes.has(nodeId)) {
        pushIssue({
          code: "DUPLICATE_HIERARCHY_NODE_ID",
          severity: "ERROR",
          message: `Duplicate hierarchy node id: ${nodeId}`,
          relationKind: "HIERARCHY_TO_HIERARCHY",
          entityKind: "HIERARCHY_NODE",
          entityId: nodeId
        });
      }
      hierarchyNodes.add(nodeId);
      parentMap.set(nodeId, typeof parentId === "string" ? parentId : null);
    }
  }

  for (const row of colabSheet.rawRows) {
    const hierarchyLeafId = row[CROSS_SHEET_RELATION_CONTRACT.colaboradores.hierarchyNodeIdColumn];
    const colabId = row[CROSS_SHEET_RELATION_CONTRACT.colaboradores.collaboratorIdColumn];
    
    if (typeof hierarchyLeafId === "string" && hierarchyLeafId.trim() !== "") {
      if (!hierarchyNodes.has(hierarchyLeafId)) {
        pushIssue({
          code: "COLLABORATOR_WITHOUT_HIERARCHY_NODE",
          severity: "ERROR",
          message: `Collaborator references unknown hierarchy node: ${hierarchyLeafId}`,
          relationKind: "COLLABORATORS_TO_HIERARCHY",
          entityKind: "COLLABORATOR",
          entityId: typeof colabId === "string" ? colabId : undefined
        });
      }
    }
  }

  // 4. Jerarquía self-reference (cycles and parents)
  for (const [nodeId, parentId] of parentMap.entries()) {
    if (parentId && parentId.trim() !== "") {
      if (!hierarchyNodes.has(parentId)) {
        pushIssue({
          code: "HIERARCHY_PARENT_NOT_FOUND",
          severity: "ERROR",
          message: `Hierarchy node ${nodeId} references unknown parent: ${parentId}`,
          relationKind: "HIERARCHY_TO_HIERARCHY",
          entityKind: "HIERARCHY_NODE",
          entityId: nodeId
        });
      } else {
        // Check for cycles
        let currentParent: string | null = parentId;
        const visited = new Set<string>();
        visited.add(nodeId);

        let cycleDetected = false;
        while (currentParent) {
          if (visited.has(currentParent)) {
            cycleDetected = true;
            break;
          }
          visited.add(currentParent);
          currentParent = parentMap.get(currentParent) || null;
        }

        if (cycleDetected) {
          pushIssue({
            code: "HIERARCHY_CYCLE_DETECTED",
            severity: "ERROR",
            message: `Hierarchy cycle detected involving node: ${nodeId}`,
            relationKind: "HIERARCHY_TO_HIERARCHY",
            entityKind: "HIERARCHY_NODE",
            entityId: nodeId
          });
        }
      }
    }
  }

  const hasErrors = issues.some(i => i.severity === "ERROR");
  const hasWarnings = issues.some(i => i.severity === "WARNING");

  let status: CrossSheetValidationResult["status"] = "CROSS_SHEET_VALID";
  if (hasErrors) {
    status = "CROSS_SHEET_INVALID";
  } else if (hasWarnings) {
    status = "CROSS_SHEET_VALID_WITH_WARNINGS";
  }

  return buildResult(status, issues);
}

function buildResult(
  status: CrossSheetValidationResult["status"],
  issues: CrossSheetIssue[]
): CrossSheetValidationResult {
  const summary: CrossSheetValidationSummary = {
    totalIssues: issues.length,
    errors: issues.filter(i => i.severity === "ERROR").length,
    warnings: issues.filter(i => i.severity === "WARNING").length,
    infos: issues.filter(i => i.severity === "INFO").length
  };

  return { status, issues, summary };
}
