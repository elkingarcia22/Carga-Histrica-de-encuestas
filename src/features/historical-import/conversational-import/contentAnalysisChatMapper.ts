import type { WorkbookInspectionMappingResult } from '../xlsx-content-analyzer/types';
import { classifyXlsxColumns } from '../xlsx-content-analyzer/columnClassificationRuntime';

export function mapContentAnalysisToChatSummary(
  mappingResult: WorkbookInspectionMappingResult,
  fileNames: string[]
): string {
  const { analysis, privacyBoundary, capabilities } = mappingResult;
  const filesString = fileNames.length > 0 ? fileNames.join(', ') : 'Ninguno';

  const hasSheets = analysis.sheets.length > 0;

  // Fallback honesto: Si no tenemos metadata interna de hojas
  if (!hasSheets || (privacyBoundary.containsOnlyMetadata && !capabilities.canProfileColumns && !hasSheets)) {
    return `Análisis de estructura detectado

- Archivos considerados: ${filesString}
- Evidencia disponible: Solo nombres de archivos
- Hojas detectadas: No se leyeron hojas internas
- Columnas clasificadas: No
- Posibles preguntas: No evaluadas
- Posibles demográficos: No evaluados
- Posibles métricas o agregados: No evaluados
- Riesgos de privacidad: Seguro (no se leyeron filas)
- Decisiones pendientes: Preparar inspección local

Aún no tengo evidencia interna suficiente del XLSX.
Por ahora solo puedo explicar agrupación por archivo/ciclo y preparar la inspección.
Necesito una fase adicional de extracción local de metadata real del workbook antes de afirmar que leí hojas y columnas internas.`;
  }

  const sheetDetails = analysis.sheets.map(s => {
    const labels = s.headerDetection?.sampleColumnLabels || [];
    const labelsSummary = labels.length > 0 ? `[${labels.slice(0, 3).join(', ')}${labels.length > 3 ? '...' : ''}]` : 'Sin encabezados';
    return `${s.sheetName} (${s.rowCount} filas, ${s.columnCount} cols, ${labelsSummary})`;
  }).join('\\n  - ');

  let classifiedColsSummary = 'No (Sin labels)';
  let possibleQuestions = 'Pendiente de inspección profunda';
  let possibleDemographics = 'Pendiente de inspección profunda';
  let possibleMetrics = 'Pendiente de inspección profunda';

  if (capabilities.canProfileColumns) {
    const allLabels = analysis.sheets.flatMap(s => {
      const labels = s.headerDetection?.sampleColumnLabels || [];
      return labels.map(label => ({
        columnLabel: label,
        sampleCellPatterns: [],
        detectedTextSignals: s.headerDetection?.detectedSignals || [],
        detectedNumericSignals: [],
        sheetRole: s.suggestedRole
      }));
    });

    if (allLabels.length > 0) {
      const classified = classifyXlsxColumns(allLabels);
      const questionCount = classified.filter(c => c.role === 'question_candidate').length;
      const demoCount = classified.filter(c => c.role === 'demographic_candidate' || c.role === 'segment_label').length;
      const metricCount = classified.filter(c => c.role === 'metric_or_aggregate').length;

      classifiedColsSummary = `Sí (${classified.length} procesadas)`;
      possibleQuestions = questionCount > 0 ? `Sí (${questionCount} detectadas)` : 'No detectadas';
      possibleDemographics = demoCount > 0 ? `Sí (${demoCount} detectados)` : 'No detectados';
      possibleMetrics = metricCount > 0 ? `Sí (${metricCount} detectados)` : 'No detectadas';
    }
  }

  return `Análisis de estructura detectado

- Archivos considerados: ${filesString}
- Evidencia disponible: Metadata interna segura del workbook
- Hojas detectadas:
  - ${sheetDetails}
- Columnas clasificadas: ${classifiedColsSummary}
- Posibles preguntas: ${possibleQuestions}
- Posibles demográficos: ${possibleDemographics}
- Posibles métricas o agregados: ${possibleMetrics}
- Riesgos de privacidad: Seguro (procesamiento local sin PII)
- Decisiones pendientes: ${analysis.decisions.length} decisiones`;
}
