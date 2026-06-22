import type { ParsedWorkbookPreview } from "../local-parser/types";
import type { RequiredUserDecision, AnalysisWarning } from "../survey-file-analysis/types";
import type { ContractAssemblyResult } from "../contract-assembler/types";

export function mapParserPreviewToMessage(preview: ParsedWorkbookPreview): string {
  if (preview.errors && preview.errors.length > 0) {
    return `No pude analizar la estructura del archivo.\nRazón: ${preview.errors[0]?.message || "unknown"}`;
  }

  let msg = `Archivo: ${preview.fileName}\n`;
  if (preview.selectedSheetName) {
    msg += `Hoja principal detectada: ${preview.selectedSheetName}\n`;
  }
  const sheet = preview.sheets[0];
  if (sheet?.headerDetection?.headerRowIndex !== undefined) {
    msg += `Fila de encabezado detectada: ${sheet.headerDetection.headerRowIndex + 1}\n`;
  }
  if (sheet?.columns?.length > 0) {
    msg += `Columnas detectadas: ${sheet.columns.length}\n`;
  }

  return msg.trim();
}

export function mapContractToSummaryBlock(contractResult: ContractAssemblyResult) {
  if (!contractResult.draftContract) {
    return { content: "No hay contrato", visualBlocks: [] };
  }
  const contract = contractResult.draftContract;
  const { files, sheets, columns, questions, demographics, warnings } = contract;

  let content = `Archivo: ${files[0]?.fileName || "Desconocido"}\n`;
  content += `Hoja principal detectada: ${sheets[0]?.sheetName || "Desconocida"}\n`;
  content += `Fila de encabezado detectada: ${columns && columns.length > 0 ? "Sí" : "No encontrada"}\n`;
  content += `Columnas detectadas: ${columns?.length || 0}\n`;
  content += `Preguntas candidatas: ${questions?.length || 0}\n`;
  content += `Demográficos candidatos: ${demographics?.length || 0}\n`;
  content += `Riesgos detectados: ${warnings?.length || 0}`;

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

  const visualBlocks = sortedWarnings.slice(0, 3).map((issue: AnalysisWarning) => ({
    icon: issue.severity === "critical" ? "alert" : "warning",
    title: issue.id,
    description: issue.message
  }));

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
