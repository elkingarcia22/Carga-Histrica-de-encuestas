import type {
  SafeWorkbookInspectionInput,
  WorkbookInspectionMappingResult,
  SafeSheetInspectionInput,
  XlsxSheetRole,
  XlsxContentAnalysisConfidence,
  XlsxSheetInspection,
  XlsxContentAnalysisResult,
  XlsxHumanDecisionCandidate,
  XlsxUxOutputSection,
  XlsxHeaderDetection
} from './types';

function determineSheetRole(sheet: SafeSheetInspectionInput): { role: XlsxSheetRole; confidence: XlsxContentAnalysisConfidence; reason: string } {
  const name = sheet.sheetName.toLowerCase();
  const textSignals = sheet.detectedTextSignals.map(s => s.toLowerCase());

  if (textSignals.includes('área') || textSignals.includes('gerencia') || textSignals.includes('cargo') || textSignals.includes('sede') || textSignals.includes('edad') || textSignals.includes('género')) {
    return { role: 'demographics', confidence: 'medium', reason: 'Contiene etiquetas demográficas.' };
  }

  if (name.includes('metadata') || name.includes('instrucciones') || name.includes('portada')) {
    return { role: 'metadata', confidence: 'high', reason: 'Nombre de hoja sugiere metadata o instrucciones.' };
  }

  if (textSignals.some(s => s.includes('pregunta') || s.includes('código'))) {
    return { role: 'question_catalog', confidence: 'medium', reason: 'Contiene señales de catálogo de preguntas.' };
  }

  if (textSignals.some(s => s.includes('porcentaje') || s.includes('promedio') || s.includes('total'))) {
    return { role: 'aggregated_results', confidence: 'medium', reason: 'Contiene métricas agregadas.' };
  }

  if (textSignals.some(s => s.includes('respuesta') || s.includes('participante'))) {
    return { role: 'raw_responses', confidence: 'medium', reason: 'Contiene señales de respuestas individuales.' };
  }

  if (name.includes('gerencia') || name.includes('area') || name.includes('segmento')) {
    return { role: 'segment_summary', confidence: 'low', reason: 'Nombre de hoja sugiere resumen de segmento.' };
  }

  return { role: 'unknown', confidence: 'low', reason: 'No hay señales suficientes para clasificar.' };
}

function determineHeader(sheet: SafeSheetInspectionInput): XlsxHeaderDetection {
  const labels = sheet.sampleColumnLabels || [];
  
  if (labels.length > 0) {
    return {
      headerRowIndex: 0,
      confidence: 'medium',
      sampleColumnLabels: labels,
      classificationReason: 'Etiquetas de columnas detectadas en la inspección de la hoja.',
      detectedSignals: sheet.detectedTextSignals.slice(0, 5)
    };
  }

  return {
    headerRowIndex: -1,
    confidence: 'low',
    sampleColumnLabels: [],
    classificationReason: 'No se detectaron etiquetas de columnas.',
    detectedSignals: []
  };
}

export function mapWorkbookInspectionInputToAnalysis(input: SafeWorkbookInspectionInput): WorkbookInspectionMappingResult {
  const sheets: XlsxSheetInspection[] = input.sheets.map(sheet => {
    const { role, confidence, reason } = determineSheetRole(sheet);
    const header = determineHeader(sheet);
    
    return {
      sheetName: sheet.sheetName,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      suggestedRole: role,
      confidence: confidence,
      classificationReason: reason,
      headerDetection: header
    };
  });

  const decisions: XlsxHumanDecisionCandidate[] = [];
  const uxOutput: XlsxUxOutputSection[] = [];

  let overallConfidence: XlsxContentAnalysisConfidence = 'low';
  if (sheets.length > 0 && sheets.some(s => s.confidence === 'high' || s.confidence === 'medium')) {
    overallConfidence = 'medium';
  }
  
  const needsHumanReview = sheets.some(s => s.confidence === 'low' || s.confidence === 'blocked') || sheets.length === 0;

  const analysis: XlsxContentAnalysisResult = {
    confidence: overallConfidence,
    workbookInspection: {
      sheetCount: sheets.length,
      totalVisibleCells: input.sheets.reduce((acc, sheet) => acc + sheet.nonEmptyCellCount, 0),
      sampleCellPatterns: Array.from(new Set(input.sheets.flatMap(s => s.sampleCellPatterns)))
    },
    sheets,
    decisions,
    uxOutput
  };

  return {
    analysis,
    privacyBoundary: {
      privacyAssured: true,
      classificationReason: 'Inspección de metadata segura. No incluye filas crudas, archivo completo ni datos privados.',
      rawRowsIncluded: false,
      fullWorkbookIncluded: false,
      rawJsonIncluded: false,
      containsOnlyMetadata: true,
      localOnly: true
    },
    capabilities: {
      canAnalyze: true,
      classificationReason: 'Mapper puro ejecutado sobre metadata.',
      canInspectWorkbookMetadata: true,
      canClassifySheets: true,
      canProfileColumns: false,
      canDetectQuestions: false,
      canDetectDemographics: false,
      canDetectResponseScales: false,
      requiresColumnClassificationPhase: true,
      requiresHumanReview: needsHumanReview
    }
  };
}
