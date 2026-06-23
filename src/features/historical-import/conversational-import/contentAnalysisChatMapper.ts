import type { WorkbookInspectionMappingResult } from '../xlsx-content-analyzer/types';
import { classifyXlsxColumns } from '../xlsx-content-analyzer/columnClassificationRuntime';

export function mapContentAnalysisToChatSummary(
  mappingResult: WorkbookInspectionMappingResult,
  fileNames: string[],
  hasBlockingDecisions: boolean = true
): string {
  const { analysis, privacyBoundary, capabilities } = mappingResult;
  const filesString = fileNames.length > 0 ? `${fileNames.length} archivos del grupo Clima 2025` : 'Ninguno';

  const hasSheets = analysis.sheets && analysis.sheets.length > 0;

  // Fallback honesto: Si no tenemos metadata interna de hojas
  if (!hasSheets || (privacyBoundary.containsOnlyMetadata && !capabilities.canProfileColumns && !hasSheets)) {
    return `Análisis de estructura detectado

- Archivos considerados: ${filesString}
- Evidencia disponible: Solo nombres de archivos
- Hojas detectadas: No se leyeron hojas internas
- Columnas clasificadas: No
- Preguntas/ítems: No evaluadas
- Dimensiones: No evaluadas
- Métricas: No evaluadas
- Identificación de participantes: No determinada
- Qué falta confirmar: Preparar inspección local

Aún no tengo evidencia interna suficiente del XLSX.
Por ahora solo puedo explicar agrupación por archivo/ciclo y preparar la inspección.
Necesito una fase adicional de extracción local de metadata real del workbook antes de afirmar que leí hojas y columnas internas.`;
  }

  const sheetDetails = analysis.sheets.map(s => {
    let layoutString = 'layout desconocido';
    if (s.layout === 'aggregated_items_by_rows') layoutString = 'reporte agregado con ítems en filas';
    if (s.layout === 'raw_responses_by_columns') layoutString = 'respuestas crudas por columnas';
    if (s.layout === 'segment_summary') layoutString = 'resumen por segmento';
    if (s.layout === 'question_catalog') layoutString = 'catálogo de preguntas';
    if (s.layout === 'metadata') layoutString = 'hoja de metadata/instrucciones';

    return `${String(s.sheetName)}: ${Number(s.rowCount)} filas, ${Number(s.columnCount)} columnas, ${layoutString}.`;
  }).join('\n  - ');

  let layoutDetectado = 'Desconocido';
  let posiblesPreguntas = 'Pendiente de lectura segura';
  let posiblesDimensiones = 'Pendiente de lectura segura';
  let posiblesMetricas = 'Pendiente de lectura segura';
  let identificacionParticipantes = 'No se detectaron identificadores directos en los encabezados disponibles.';

  const isAggregatedByRows = analysis.sheets.some(s => s.layout === 'aggregated_items_by_rows');
  const isSegmentSummary = analysis.sheets.some(s => s.layout === 'segment_summary');
  const isRawResponses = analysis.sheets.some(s => s.layout === 'raw_responses_by_columns');

  if (isAggregatedByRows) {
    layoutDetectado = 'reporte agregado por segmentos';
    posiblesPreguntas = 'detectables por filas usando “Tipo de item” e “Item”; conteo pendiente si no hay lectura segura de filas de ítems.';
    posiblesDimensiones = 'detectables por filas tipo “Dimension”.';
    posiblesMetricas = 'columnas de percepción negativa, neutra, positiva y total de respuestas.';
  } else if (isSegmentSummary) {
    layoutDetectado = 'resumen de respuestas por segmento';
    posiblesPreguntas = 'dependiente del catálogo central.';
    posiblesDimensiones = 'dependiente del catálogo central.';
    posiblesMetricas = 'tasas de finalización y monitores de participación.';
  } else if (isRawResponses) {
    layoutDetectado = 'respuestas individuales crudas por columnas';
    if (capabilities.canProfileColumns) {
      const allLabels = analysis.sheets.flatMap(s => {
        const labels = s.headerDetection?.sampleColumnLabels || [];
        return labels.map(label => ({
          columnLabel: String(label),
          sampleCellPatterns: [],
          detectedTextSignals: s.headerDetection?.detectedSignals || [],
          detectedNumericSignals: [],
          sheetRole: s.suggestedRole
        }));
      });

      if (allLabels.length > 0) {
        const classified = classifyXlsxColumns(allLabels);
        const piiCandidates = classified.filter(c => c.role === 'participant_identifier_candidate');
        if (piiCandidates.length > 0) {
          const hasDirectPII = piiCandidates.some(c => c.detectedSignals.some(sig => ['nombre', 'correo', 'email', 'teléfono', 'telefono', 'celular'].includes(sig)));
          if (hasDirectPII) {
            identificacionParticipantes = 'Identificada';
          } else {
            identificacionParticipantes = 'Seudonimizada con ID';
          }
        }
      }
    }
  }

  const extraText = hasBlockingDecisions
    ? ''
    : '\n\nNo detecté bloqueos críticos; quedan validaciones de homologación antes de preparar el borrador.';

  return `Análisis de estructura detectado

- Archivos considerados: ${filesString}.
- Evidencia disponible: Metadata interna segura del workbook.
- Hojas detectadas:
  - ${sheetDetails}
- Layout detectado: ${layoutDetectado}.
- Preguntas/ítems: ${posiblesPreguntas}
- Dimensiones: ${posiblesDimensiones}
- Métricas: ${posiblesMetricas}
- Identificación de participantes: ${identificacionParticipantes}
- Qué falta confirmar: validar reglas de homologación de ítems y segmentos antes de preparar la carga.${extraText}`;
}
