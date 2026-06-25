import type { DemoFixtureDataset } from "../demo-fixture/types";
import { qsClimaDemoMetadata } from "../demo-fixture/qsClimaFixture";
import type { ConversationalSurveyScope } from "./conversationalWizardTypes";

/**
 * Generates a clean markdown string reviewing the demo fixture structure,
 * to be displayed as an assistant message without raw JSON.
 */
export function mapDemoFixtureToStructureReviewMessage(
  fixture: DemoFixtureDataset,
  overlayState: Record<string, string> = {},
  scope: ConversationalSurveyScope = "qs_clima_multicycle_2024_2025"
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

  let msg = "";
  if (scope === "qs_clima_2025") {
    msg += `Perfecto. Procesaré QS Clima 2025 como encuesta seleccionada.\n\n`;
    msg += `🧩 **Revisión de estructura detectada**\n\n`;
    msg += `Detecté automáticamente los archivos de QS Clima 2025.\n`;
    msg += `Tomé como referencia principal el archivo Resultdos Clima total QS 2025.xlsx.\n`;
    msg += `Los demás archivos 2025 detectados corresponden a cortes por gerencia del mismo levantamiento.\n\n`;
  } else if (scope === "qs_clima_2024") {
    msg += `Perfecto. Procesaré QS Clima 2024 como encuesta seleccionada.\n\n`;
    msg += `🧩 **Revisión de estructura detectada**\n\n`;
    msg += `Detecté QS Clima 2024 como encuesta seleccionada.\n`;
    msg += `Este archivo tiene estructura de respuestas por columnas y requiere cuidado por IDs seudonimizados.\n\n`;
  } else {
    msg += `Perfecto. Procesaré la carga histórica multicíclo QS Clima 2024/2025.\n\n`;
    msg += `🧩 **Revisión de estructura detectada**\n\n`;
    msg += `Carga histórica multicíclo QS Clima 2024/2025\n\n`;
  }

  if (scope === "qs_clima_2025") {
    msg += `📊 **Resumen**\n`;
    msg += `- Encuesta seleccionada: QS Clima 2025\n`;
    msg += `- Archivo principal: Resultdos Clima total QS 2025.xlsx\n`;
    msg += `- Archivos 2025 relacionados: 8\n`;
    msg += `- Hojas detectadas: Clima, Engagement, eNPS\n`;
    msg += `- Dimensiones detectadas: 10\n`;
    msg += `- Preguntas/ítems detectados: 37\n`;
    msg += `- Demográficos detectados: 7\n`;
    msg += `- Métricas detectadas: 10\n`;
    msg += `- Segmentos/cortes 2025 detectados: 9\n`;
    msg += `- Participación / respuestas agregadas detectadas: ${qsClimaDemoMetadata?.aggregatedParticipationCount || 'pendiente de confirmación'}\n\n`;
  } else {
    msg += `📊 **Resumen**\n`;
    msg += `- Ciclos detectados: ${cyclesCount} (QS Clima 2024 y QS Clima 2025)\n`;
    msg += `- Archivos relacionados: ${filesCount}\n`;
    msg += `- Dimensiones detectadas: ${dimensionsCount}\n`;
    msg += `- Preguntas/ítems detectados: ${questionsCount}\n`;
    msg += `- Demográficos detectados: ${demographicsCount}\n`;
    msg += `- Métricas detectadas: ${metricsCount}\n`;
    msg += `- Segmentos/cortes detectados: ${segmentsCount}\n\n`;
  }

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

  if (scope !== "qs_clima_2025") {
    msg += `\n👥 **Participación / respuestas**\n`;
    if (qsClimaDemoMetadata && qsClimaDemoMetadata.aggregatedParticipationCount) {
      const count = qsClimaDemoMetadata.aggregatedParticipationCount;
      if (scope === "qs_clima_2024" || scope === "qs_clima_multicycle_2024_2025") {
        msg += `- Participantes/respuestas seudonimizadas detectadas: ${count}\n`;
      } else {
        msg += `- Respuestas agregadas detectadas: ${count}\n`;
      }
    } else {
      msg += `- Participantes o respuestas detectadas: pendiente de confirmación\n`;
    }
    msg += `- Fuente: conteo agregado seguro del fixture demo.\n`;
    msg += `- Privacidad: no se muestran personas, IDs, respuestas individuales ni comentarios abiertos.\n`;
  }

  if (pendingDecisions.length > 0) {
    msg += `\n⚠️ **Decisiones pendientes principales:**\n`;
    pendingDecisions.slice(0, 3).forEach(d => {
      msg += `- ${d.title}\n`;
    });
  }

  msg += `\n➡️ **¿Qué quieres hacer ahora?**\n\n`;
  msg += `1. Aprobar esta estructura y revisar los resultados detectados\n`;
  msg += `2. Ajustar nombres de dimensiones o preguntas\n`;
  msg += `3. Ver archivos usados para esta encuesta\n`;
  msg += `4. Cancelar importación\n\n`;
  msg += `Puedes responder con el número o con el nombre de la opción.`;

  return msg;
}
