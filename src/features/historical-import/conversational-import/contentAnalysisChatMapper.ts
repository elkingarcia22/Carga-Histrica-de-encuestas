import type { WorkbookInspectionMappingResult } from '../xlsx-content-analyzer/types';

export function mapContentAnalysisToChatSummary(
  mappingResult: WorkbookInspectionMappingResult,
  fileNames: string[]
): string {
  const { analysis, privacyBoundary, capabilities } = mappingResult;
  const filesString = fileNames.length > 0 ? fileNames.join(', ') : 'Ninguno';

  if (privacyBoundary.containsOnlyMetadata && !capabilities.canProfileColumns) {
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

  const sheetNames = analysis.sheets.length > 0
    ? analysis.sheets.map(s => s.sheetName).join(', ')
    : 'Ninguna';

  const classifiedCols = analysis.sheets.some(
    s => s.headerDetection && s.headerDetection.sampleColumnLabels.length > 0
  ) ? 'Sí' : 'No';

  return `Análisis de estructura detectado

- Archivos considerados: ${filesString}
- Evidencia disponible: Metadata interna segura
- Hojas detectadas: ${sheetNames}
- Columnas clasificadas: ${classifiedCols}
- Posibles preguntas: Pendiente de inspección profunda
- Posibles demográficos: Pendiente de inspección profunda
- Posibles métricas o agregados: Pendiente de inspección profunda
- Riesgos de privacidad: Seguro (procesamiento local sin PII)
- Decisiones pendientes: ${analysis.decisions.length} decisiones`;
}
