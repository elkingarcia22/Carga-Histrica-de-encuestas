import type { WorkbookInspectionMappingResult } from '../xlsx-content-analyzer/types';
import { classifyXlsxColumns } from '../xlsx-content-analyzer/columnClassificationRuntime';

export function mapContentAnalysisToChatSummary(
  mappingResult: WorkbookInspectionMappingResult,
  fileNames: string[]
): string {
  const { analysis, privacyBoundary, capabilities } = mappingResult;

  const totalFiles = fileNames.length;
  const mainFile = fileNames[0] || 'Desconocido';
  const groupName = mainFile.replace('.xlsx', '').replace('.csv', '');

  const hasSheets = analysis.sheets && analysis.sheets.length > 0;

  // Fallback honesto
  if (!hasSheets || (privacyBoundary.containsOnlyMetadata && !capabilities.canProfileColumns && !hasSheets)) {
    return `**Resumen de la encuesta seleccionada**
- Se seleccionó el grupo **${groupName}**.
- Encontré **${totalFiles} archivo(s)** relacionado(s) con este ciclo.
- El archivo principal sugerido es **${mainFile}**.
${totalFiles > 1 ? `- Los demás archivos parecen corresponder a **cortes por gerencia o área** del mismo levantamiento.` : ''}

**Lo que identifiqué**
1. **Estructura general**
   - No se detectaron hojas internas legibles con la evidencia actual.
   - Aún no tengo evidencia interna suficiente del archivo.

2. **Contenido potencial**
   - Preguntas/ítems: No evaluadas.
   - Dimensiones: No evaluadas.
   - Métricas: No evaluadas.

3. **Privacidad / identificación de participantes**
   - Identificación de participantes no determinada.`;
  }

  const sheetNames = analysis.sheets.map(s => s.sheetName).filter(Boolean).join(', ');

  const isAggregatedByRows = analysis.sheets.some(s => s.layout === 'aggregated_items_by_rows');
  const isSegmentSummary = analysis.sheets.some(s => s.layout === 'segment_summary');
  const isRawResponses = analysis.sheets.some(s => s.layout === 'raw_responses_by_columns');

  let layoutDetectado = '**formato no estándar**';
  if (isAggregatedByRows) layoutDetectado = '**reporte agregado**, no a respuestas fila por fila de participantes';
  else if (isSegmentSummary) layoutDetectado = '**resumen de respuestas por segmento**';
  else if (isRawResponses) layoutDetectado = '**respuestas individuales crudas por columnas**';

  const posiblesPreguntas = 'Hay señales de ítems/preguntas.';
  const posiblesDimensiones = 'Hay señales de dimensiones.';
  const posiblesMetricas = 'Hay métricas agregadas del reporte.';
  let identificacionParticipantes = 'Con los encabezados disponibles no se detectan identificadores directos visibles.';

  if (isRawResponses && capabilities.canProfileColumns) {
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
            identificacionParticipantes = 'Se identificaron posibles datos directos de participantes.';
          } else {
            identificacionParticipantes = 'Se detectaron identificadores seudonimizados (ej. ID).';
          }
        }
      }
  }

  return `**Resumen de la encuesta seleccionada**
- Se seleccionó el grupo **${groupName}**.
- Encontré **${totalFiles} archivo(s)** relacionado(s) con este ciclo.
- El archivo principal sugerido es **${mainFile}**.
${totalFiles > 1 ? `- Los demás archivos parecen corresponder a **cortes por gerencia o área** del mismo levantamiento.` : ''}

**Lo que identifiqué**
1. **Estructura general**
   - Se detectaron hojas como ${sheetNames || 'Desconocidas'}.
   - La estructura parece corresponder a un ${layoutDetectado}.

2. **Contenido potencial**
   - ${posiblesPreguntas}
   - ${posiblesDimensiones}
   - ${posiblesMetricas}
   - La identificación de demográficos todavía requiere validación más precisa.

3. **Privacidad / identificación de participantes**
   - ${identificacionParticipantes}
   - Aun así, la clasificación de identificadores debe confirmarse antes de preparar el borrador.`;
}
