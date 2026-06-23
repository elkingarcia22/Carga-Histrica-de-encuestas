import type { ParsedWorkbookPreview } from "../local-parser/types";
import type { RequiredUserDecision, AnalysisWarning } from "../survey-file-analysis/types";
import type { ContractAssemblyResult } from "../contract-assembler/types";
import { mapWarningToExplanation } from "./warningExplanationMapper";
import { formatAsBulletList } from "./chatBulletPresentationMapper";

export function mapParserPreviewToMessage(preview: ParsedWorkbookPreview): string {
  if (preview.errors && preview.errors.length > 0) {
    return `No pude analizar la estructura del archivo.\nRazón: ${preview.errors[0]?.message || "unknown"}`;
  }

  const items: string[] = [];
  items.push(`Archivo: ${preview.fileName}`);
  if (preview.selectedSheetName) {
    items.push(`Hoja principal detectada: ${preview.selectedSheetName}`);
  }
  const sheet = preview.sheets[0];
  if (sheet?.headerDetection?.headerRowIndex !== undefined) {
    items.push(`Fila de encabezado detectada: ${sheet.headerDetection.headerRowIndex + 1}`);
  }
  if (sheet?.columns?.length > 0) {
    items.push(`Columnas detectadas: ${sheet.columns.length}`);
  }

  return formatAsBulletList(items, '📄');
}

export function mapContractToSummaryBlock(contractResult: ContractAssemblyResult) {
  if (!contractResult.draftContract) {
    return { content: "No hay contrato", visualBlocks: [] };
  }
  const contract = contractResult.draftContract;
  const { files, sheets, columns, questions, demographics, warnings } = contract;

  const summaryItems = [
    `Archivo: ${files[0]?.fileName || "Desconocido"}`,
    `Hoja principal detectada: ${sheets[0]?.sheetName || "Desconocida"}`,
    `Fila de encabezado detectada: ${columns && columns.length > 0 ? "Sí" : "No encontrada"}`,
    `Columnas detectadas: ${columns?.length || 0}`,
    `Preguntas candidatas: ${questions?.length || 0}`,
    `Demográficos candidatos: ${demographics?.length || 0}`,
    `Riesgos detectados: ${warnings?.length || 0}`
  ];

  const content = formatAsBulletList(summaryItems, '🔍');

  const priorityOrder: Record<string, number> = {
    pii_risk: 1,
    multiple_sheets: 2,
    low_header_confidence: 3,
    unknown_demographic: 4,
    unmatched_question: 5,
  };

  const sortedWarnings = [...(warnings || [])].sort((a, b) => {
    const aId = a.id;
    const bId = b.id;
    const pA = priorityOrder[aId] || 99;
    const pB = priorityOrder[bId] || 99;
    return pA - pB;
  });

  const visualBlocks = sortedWarnings.slice(0, 3).map((issue: AnalysisWarning) => {
    const explanation = mapWarningToExplanation(issue.id);
    return {
      icon: explanation.severity === "critical" || explanation.severity === "high" ? "alert" : "warning",
      title: explanation.detectedIssue,
      description: explanation.whyItMatters
    };
  });

  return {
    content,
    visualBlocks
  };
}

export function mapFirstDecisionToNextActions(decisions: RequiredUserDecision[]) {
  if (decisions.length === 0) return [];

  return [
    {
      id: "resolve",
      label: "Resolver",
      actionType: "decision_action"
    }
  ];
}
