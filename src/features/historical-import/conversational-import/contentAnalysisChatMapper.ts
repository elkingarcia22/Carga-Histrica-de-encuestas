import type { WorkbookInspectionMappingResult } from '../xlsx-content-analyzer/types';
import { classifyXlsxColumns } from '../xlsx-content-analyzer/columnClassificationRuntime';

export function mapContentAnalysisToChatSummary(
  mappingResult: WorkbookInspectionMappingResult,
  fileNames: string[]
): string {
  const { analysis, privacyBoundary, capabilities } = mappingResult;
  const filesString = fileNames.length > 0 ? `${fileNames.length} archivos del grupo Clima 2025` : 'Ninguno';

  const hasSheets = analysis.sheets.length > 0;

  // Fallback honesto: Si no tenemos metadata interna de hojas
  if (!hasSheets || (privacyBoundary.containsOnlyMetadata && !capabilities.canProfileColumns && !hasSheets)) {
    return `Análisis de estructura detectado

- Archivos considerados: ${filesString}
- Evidencia disponible: Solo nombres de archivos
- Hojas detectadas: No se leyeron hojas internas
- Columnas clasificadas: No
- Posibles preguntas o ítems: No evaluadas
- Posibles demográficos: No evaluados
- Posibles métricas o agregados: No evaluados
- Identificación de participantes: No determinada
- Decisiones pendientes: Preparar inspección local

Aún no tengo evidencia interna suficiente del XLSX.
Por ahora solo puedo explicar agrupación por archivo/ciclo y preparar la inspección.
Necesito una fase adicional de extracción local de metadata real del workbook antes de afirmar que leí hojas y columnas internas.`;
  }

  const sheetDetails = analysis.sheets.map(s => {
    const labels = s.headerDetection?.sampleColumnLabels || [];
    const labelsSummary = labels.length > 0 ? 'encabezados disponibles' : 'sin encabezados';
    return `${s.sheetName}: ${s.rowCount} filas, ${s.columnCount} columnas, ${labelsSummary}.`;
  }).join('\n  - ');

  let classifiedColsSummary = 'No (Sin labels)';
  let possibleQuestions = 'Pendiente de inspección profunda';
  let possibleDemographics = 'Pendiente de inspección profunda';
  let possibleMetrics = 'Pendiente de inspección profunda';
  let participantIdentification = 'No se detectaron identificadores directos en los encabezados disponibles.';

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

      const piiCandidates = classified.filter(c => c.role === 'participant_identifier_candidate');
      if (piiCandidates.length > 0) {
        const hasDirectPII = piiCandidates.some(c => c.detectedSignals.some(s => ['nombre', 'correo', 'email', 'teléfono', 'telefono', 'celular'].includes(s)));
        if (hasDirectPII) {
          participantIdentification = 'Identificada';
        } else {
          participantIdentification = 'Seudonimizada con ID';
        }
      }

      classifiedColsSummary = `Sí, ${classified.length} encabezados evaluados.`;
      possibleQuestions = questionCount > 0 ? `Parcial, ${questionCount} detectados / requiere revisión.` : 'No detectadas.';
      possibleDemographics = demoCount > 0 ? `${demoCount} detectados.` : 'No detectados.';
      possibleMetrics = metricCount > 0 ? `${metricCount} detectados.` : 'No detectados.';
    }
  }

  return `Análisis de estructura detectado

- Archivos considerados: ${filesString}.
- Evidencia disponible: Metadata interna segura del workbook.
- Hojas detectadas:
  - ${sheetDetails}
- Columnas clasificadas: ${classifiedColsSummary}
- Posibles preguntas o ítems: ${possibleQuestions}
- Posibles demográficos: ${possibleDemographics}
- Posibles métricas o agregados: ${possibleMetrics}
- Identificación de participantes: ${participantIdentification}
- Confirmaciones pendientes: revisar clasificación de preguntas, demográficos y métricas antes de preparar la carga.`;
}
