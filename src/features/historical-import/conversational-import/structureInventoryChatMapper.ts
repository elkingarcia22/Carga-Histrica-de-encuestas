import type { StructureInventoryResult } from '../structure-inventory';

export function mapStructureInventoryToChat(result: StructureInventoryResult): string {
  const { summary, dimensions, questions } = result;

  if (summary.inventoryDetailAvailable && (dimensions.length > 0 || questions.length > 0)) {
    let text = `**Qué falta por revisar**
- Confirmar la estructura detallada del inventario.

**Inventario detallado disponible**\n`;
    for (const dim of dimensions) {
      text += `- **${dim.label}**\n`;
      const dimQuestions = questions.filter(q => q.dimensionId === dim.id);
      for (const q of dimQuestions) {
        text += `  - ${q.label}\n`;
      }
    }
    for (const q of questions.filter(q => !q.dimensionId)) {
        text += `- **Sin dimensión**: ${q.label}\n`;
    }
    return text.trim();
  }

  return `**Qué falta por revisar**
- Confirmar cómo se interpretan las dimensiones.
- Confirmar cómo se interpretan los ítems/preguntas.
- Confirmar si los archivos de gerencia deben quedar como cortes del mismo ciclo.
- Confirmar si existen demográficos utilizables para segmentación.

**Siguiente paso**
- Todavía no tengo suficiente detalle estructural para listar dimensiones y preguntas una por una.
- Antes de preparar el borrador, necesito una revisión más precisa de la estructura detectada.
- Cuando el detalle sea suficiente, podré mostrar la lista completa de dimensiones, preguntas y campos de segmentación.`;
}
