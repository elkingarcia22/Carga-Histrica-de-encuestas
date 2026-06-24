import { qsClimaDemoFixture } from "../demo-fixture/qsClimaFixture";

export function getDimensionsList(overlayState: Record<string, string>): string {
  return qsClimaDemoFixture.sourceLayer.dimensions
    .map((d, index) => {
      const label = overlayState[d.id] || d.displayLabel;
      return `${index + 1}. ${label}`;
    })
    .join("\n");
}

export function getQuestionsListForDimension(dimId: string, overlayState: Record<string, string>): string {
  const mappings = qsClimaDemoFixture.sourceLayer.mappings.filter(m => m.detectedDimensionId === dimId);
  const qIds = mappings.map(m => m.questionId);
  return qsClimaDemoFixture.sourceLayer.questions
    .filter(q => qIds.includes(q.id))
    .map((q, index) => {
      const label = overlayState[q.id] || q.displayLabel;
      return `${index + 1}. ${label}`;
    })
    .join("\n");
}

export function validateNewLabel(label: string): string | null {
  if (!label || label.trim() === "") return "El texto no puede estar vacío.";
  if (/^\d+$/.test(label.trim())) return "El texto no puede ser solo números.";
  if (/@|\.com|\.co|cc:|email|teléfono|documento/i.test(label)) return "El texto no puede contener datos personales o PII.";
  if (label.length > 150) return "El texto es demasiado largo para una etiqueta.";
  return null;
}
