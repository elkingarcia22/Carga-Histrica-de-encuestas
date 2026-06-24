import type { HomologationPrecheckResult } from '../homologation-precheck';

export function formatHomologationPrecheckMessage(result: HomologationPrecheckResult): string {
  const { summary } = result;

  return `Pre-homologación detectada

- Ítems/preguntas: ${summary.itemsStatus}.
- Dimensiones: ${summary.dimensionsStatus}.
- Métricas: ${summary.metricsStatus}.
- Segmentos: ${summary.segmentsStatus}.
- Identificación de participantes: ${summary.participantIdentificationStatus}.
- Escala de respuesta: ${summary.responseScaleStatus}.
- Decisiones requeridas: ${summary.decisionsCount} decisiones; ${summary.blockingDecisionsCount} bloqueantes.
- Siguiente paso recomendado: ${summary.recommendedNextStep}.`;
}
