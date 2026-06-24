import type { StructureInventoryResult } from '../structure-inventory';

export function mapStructureInventoryToChat(result: StructureInventoryResult): string {
  const { summary, capabilities, dimensions, questions } = result;

  let text = `Inventario de estructura\n\n`;
  text += `- Dimensiones detectadas: ${summary.dimensionsCount}.\n`;
  text += `- Preguntas/ítems detectados: ${summary.questionsCount}.\n`;
  text += `- Demográficos detectados: ${summary.demographicsCount}.\n`;
  text += `- Métricas detectadas: ${summary.metricsCount}.\n`;
  text += `- Segmentos/cortes detectados: ${summary.segmentsCount}.\n`;
  text += `- Detalle disponible: ${summary.inventoryDetailAvailable ? 'sí' : 'no'}.\n`;

  const fallbackReason = capabilities.fallbackReason || 'Inventario preliminar.';
  text += `- Estado del inventario: ${fallbackReason}\n`;
  text += `- Siguiente paso recomendado: ${summary.recommendedNextStep}\n\n`;

  if (summary.inventoryDetailAvailable && dimensions.length > 0) {
    text += `Detalle disponible\n\n`;
    for (const dim of dimensions) {
      text += `- ${dim.label}\n`;
      const dimQuestions = questions.filter(q => q.dimensionId === dim.id);
      for (const q of dimQuestions) {
        text += `  - ${q.label}\n`;
      }
    }
  } else if (summary.inventoryDetailAvailable && questions.length > 0) {
    // Some questions might not have dimensions yet
    text += `Detalle disponible\n\n`;
    for (const q of questions) {
      text += `- ${q.label}\n`;
    }
  } else {
    text += `Aún falta inventario estructural seguro para listar dimensiones y preguntas una por una.`;
  }

  return text.trim();
}
