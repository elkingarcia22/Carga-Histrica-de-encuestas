import type { HomologationPrecheckResult } from '../homologation-precheck';

export function formatHomologationPrecheckMessage(result: HomologationPrecheckResult): string {
  const { entities, decisions } = result;

  const hasMetrics = entities.some(e => e.entityType === 'metric' && e.state === 'suggested_match');
  const metricsText = hasMetrics
    ? 'percepción negativa, neutra, positiva y total de respuestas.'
    : 'no se detectaron métricas estándar con la metadata segura actual.';

  const segmentsCount = entities.filter(e => e.entityType === 'segment' || e.entityType === 'source_file_role').length;
  const segmentsText = segmentsCount > 0
    ? `${segmentsCount} archivos o grupos detectados como cortes del ciclo seleccionado.`
    : '0 archivos o grupos detectados como cortes del ciclo seleccionado.';

  const hasParticipant = entities.some(e => e.entityType === 'participant_identifier' && e.state === 'suggested_match');
  const participantText = hasParticipant
    ? 'se detectaron posibles identificadores en los encabezados disponibles.'
    : 'no se detectaron identificadores directos en los encabezados disponibles.';

  const decisionsCount = decisions.length;
  const blockingDecisionsCount = decisions.filter(d => d.confidence === 'blocked').length;

  return `Pre-homologación detectada

- Ítems/preguntas: detectables por filas usando “Tipo de item” e “Item”; requieren validación antes de preparar el borrador.
- Dimensiones: detectables por filas tipo “Dimension”; requieren confirmación de homologación.
- Métricas detectadas: ${metricsText}
- Demográficos detectados: no se detectaron campos demográficos con la metadata segura disponible.
- Segmentos/cortes: ${segmentsText}
- Identificación de participantes: ${participantText}
- Escala de respuesta: requiere confirmación antes de preparar la carga.
- Decisiones pendientes: ${decisionsCount} decisiones; ${blockingDecisionsCount} bloqueantes.
- Siguiente paso recomendado: revisar homologación de ítems, dimensiones y segmentos antes de generar el borrador de carga.`;
}
