import type { DemoFixtureDataset } from "../demo-fixture/types";

/**
 * Generates a clean markdown string reviewing the demo fixture structure,
 * to be displayed as an assistant message without raw JSON.
 */
export function mapDemoFixtureToStructureReviewMessage(
  fixture: DemoFixtureDataset,
  overlayState: Record<string, string> = {},
  scope: "2025" | "2024" | "multicycle" = "multicycle"
): string {
  const { sourceLayer, surveyCycles, privacyBoundary } = fixture;

  const filesCount = sourceLayer.files.length;
  const cyclesCount = surveyCycles.length;

  const dimensionsCount = sourceLayer.dimensions.length;
  const questionsCount = sourceLayer.questions.length;
  const demographicsCount = sourceLayer.demographics.length;
  const metricsCount = sourceLayer.metrics.length;
  const segmentsCount = sourceLayer.segments.length;

  const topDimensions = sourceLayer.dimensions.slice(0, 6);

  const dimQuestions = topDimensions.map(dim => {
    // Find mappings for this dim
    const mappings = sourceLayer.mappings.filter(m => m.detectedDimensionId === dim.id);
    const qIds = mappings.map(m => m.questionId);
    // Find questions
    const qTitles = sourceLayer.questions
      .filter(q => qIds.includes(q.id))
      .slice(0, 4)
      .map(q => {
        const localLabel = overlayState[q.id];
        return localLabel ? `${localLabel} [Ajuste local]` : q.displayLabel;
      });

    const dimLocalLabel = overlayState[dim.id];
    const finalDimName = dimLocalLabel ? `${dimLocalLabel} [Ajuste local]` : dim.displayLabel;

    return {
      dimName: finalDimName,
      questions: qTitles
    };
  });

  const demographicsList = sourceLayer.demographics.map(d => d.displayLabel).join(', ');
  const metricsList = sourceLayer.metrics.slice(0, 8).map(m => m.displayLabel).join(', ');
  const pendingDecisions = sourceLayer.decisions.filter(d => d.reviewState === 'pending');

  let msg = `🧩 **Revisión de estructura detectada**\n\n`;
  if (scope === "2025") {
    msg += `Detecté automáticamente los archivos QS Clima 2024/2025 cargados.\n`;
    msg += `Encontré una estructura demo lista para revisar. El demo muestra el set QS Clima con foco en 2025.\n\n`;
  } else if (scope === "2024") {
    msg += `Detecté automáticamente los archivos QS Clima 2024/2025 cargados.\n`;
    msg += `Encontré una estructura demo lista para revisar con foco en 2024 y privacidad media por ID seudonimizado.\n\n`;
  } else {
    msg += `Detecté automáticamente los archivos QS Clima 2024/2025 cargados.\n`;
    msg += `Encontré una estructura demo lista para revisar antes de preparar el borrador de carga histórica multicíclo completa.\n\n`;
  }

  msg += `📊 **Resumen**\n`;
  msg += `- Ciclos detectados: ${cyclesCount} (QS Clima 2024 y QS Clima 2025)\n`;
  msg += `- Archivos relacionados: ${filesCount}\n`;
  msg += `- Dimensiones detectadas: ${dimensionsCount}\n`;
  msg += `- Preguntas/ítems detectados: ${questionsCount}\n`;
  msg += `- Demográficos detectados: ${demographicsCount}\n`;
  msg += `- Métricas detectadas: ${metricsCount}\n`;
  msg += `- Segmentos/cortes detectados: ${segmentsCount}\n\n`;

  msg += `📚 **Dimensiones y preguntas (Muestra)**\n`;
  dimQuestions.forEach(dq => {
    msg += `**${dq.dimName}**\n`;
    dq.questions.forEach(q => {
      msg += `- ${q}\n`;
    });
    msg += `\n`;
  });

  msg += `👥 **Demográficos seguros**\n`;
  msg += `${demographicsList}\n\n`;

  msg += `📈 **Métricas agregadas**\n`;
  msg += `${metricsList}\n\n`;

  msg += `🛡️ **Privacidad y Riesgo**\n`;
  if (privacyBoundary.rawRowsIncluded) {
    msg += `- Nivel de riesgo: Medio (se identificaron respuestas crudas, pero no texto abierto).\n`;
  } else {
    msg += `- Nivel de riesgo: Bajo (solo datos agregados, sin identificadores directos).\n`;
  }

  if (pendingDecisions.length > 0) {
    msg += `\n⚠️ **Decisiones pendientes principales:**\n`;
    pendingDecisions.slice(0, 3).forEach(d => {
      msg += `- ${d.title}\n`;
    });
  }

  msg += `\n➡️ **Siguiente paso:**\n`;
  msg += `¿Qué quieres revisar primero?\n\n`;
  msg += `Puedes responder con:\n`;
  msg += `- dimensiones\n`;
  msg += `- preguntas\n`;
  msg += `- demográficos\n`;
  msg += `- métricas\n`;
  msg += `- segmentos\n`;
  msg += `- decisiones pendientes\n`;
  msg += `- preview\n`;
  msg += `- cancelar importación`;

  return msg;
}
