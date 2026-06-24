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
  const normalizedLabel = label.trim().toLowerCase();
  if (!label || normalizedLabel === "") return "El texto no puede estar vacío.";
  if (/^\d+$/.test(normalizedLabel)) return "El texto no puede ser solo números.";
  if (/@|\.com|\.co|cc|cédula|cedula|documento|dni|teléfono|telefono|celular/i.test(normalizedLabel)) return "El texto no puede contener datos personales o PII.";

  // Basic offensive/discriminatory detection for QA purposes
  const blockedWords = ["insulto", "puta", "mierda", "estupido", "idiota", "imbecil", "negro", "marica", "machista", "racista", "sexista", "xenofobia", "despectivo", "ofensivo", "discriminatorio"];
  if (blockedWords.some(w => normalizedLabel.includes(w))) {
    return "Ese texto no es válido para una etiqueta visible. Usa un nombre descriptivo, profesional y sin datos personales, respuestas individuales ni lenguaje ofensivo o discriminatorio.";
  }

  if (label.length > 150) return "El texto es demasiado largo para una etiqueta.";
  return null;
}
