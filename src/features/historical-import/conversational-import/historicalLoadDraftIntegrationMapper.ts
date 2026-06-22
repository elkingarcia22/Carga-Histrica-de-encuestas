import { buildHistoricalLoadDraft } from '../historical-load-draft/builder';
import type { BuildHistoricalLoadDraftInput, HistoricalLoadDraft } from '../historical-load-draft/types';
import type { ChatMessage } from './conversationalImportTypes';
import type { SurveyFileAnalysisContract, AnalysisWarning } from '../survey-file-analysis/types';

export function runHistoricalLoadDraftIntegration(
  draftContract: SurveyFileAnalysisContract,
  files: File[],
  resolvedDecisionIds: string[]
): HistoricalLoadDraft {
  const unresolvedDecisions = draftContract.requiredUserDecisions?.filter(
    (d) => !resolvedDecisionIds.includes(d.id)
  ) || [];

  const resolvedDecisions = draftContract.requiredUserDecisions?.filter(
    (d) => resolvedDecisionIds.includes(d.id)
  ) || [];

  const input: BuildHistoricalLoadDraftInput = {
    sourceSurveyGroup: { name: 'Encuesta Base' },
    sourceFiles: files.map(f => ({ name: f.name, size: f.size })),
    surveyIdentity: draftContract.detectedSurveys && draftContract.detectedSurveys.length > 0 ? draftContract.detectedSurveys[0] : {},
    historicalCycle: { id: 'current-cycle', label: 'Ciclo Actual' },
    assembledContractSummary: {},
    matchingCandidates: [],
    resolvedDecisions,
    unresolvedDecisions,
    warnings: draftContract.warnings?.filter((i: AnalysisWarning) => i.severity === 'critical') || [],
    auditEvents: [],
    participantPolicy: 'needs_privacy_review',
  };

  return buildHistoricalLoadDraft(input);
}

export function mapHistoricalLoadDraftToSummary(draft: HistoricalLoadDraft, messageId: string, timestamp: string): ChatMessage[] {
  const messages: ChatMessage[] = [];

  let statusText = 'Borrador con estado desconocido';
  switch (draft.status) {
    case 'drafting': statusText = 'Preparando borrador de carga histórica'; break;
    case 'needs_decisions': statusText = 'Faltan decisiones para completar el borrador'; break;
    case 'ready_for_review': statusText = 'Borrador listo para revisión'; break;
    case 'blocked_by_risk': statusText = 'Borrador bloqueado por riesgo pendiente'; break;
    case 'approved_for_later_import': statusText = 'Aprobado para una fase futura de importación'; break;
  }

  let title = 'Borrador de carga histórica preparado';
  if (draft.status === 'needs_decisions') title = 'Borrador con decisiones pendientes';
  if (draft.status === 'blocked_by_risk') title = 'Borrador bloqueado por riesgos pendientes';

  const visualBlocks = [
    {
      title: 'Estado del borrador',
      description: statusText,
      status: draft.status === 'ready_for_review' ? 'success' : 'warning',
    },
    {
      title: 'Resumen de estructura',
      description: `${draft.readinessSummary.mappedQuestionsCount} preguntas homologadas, ${draft.readinessSummary.mappedDemographicsCount} demográficos.`,
    },
    {
      title: 'Política de privacidad',
      description: draft.readinessSummary.piiPolicyStatus === 'needs_privacy_review' ? 'Requiere revisión' : draft.readinessSummary.piiPolicyStatus,
    }
  ];

  if (draft.readinessSummary.unresolvedDecisionsCount > 0) {
    visualBlocks.push({
      title: 'Decisiones pendientes',
      description: `Faltan ${draft.readinessSummary.unresolvedDecisionsCount} decisiones por resolver.`,
      status: 'warning',
    });
  }

  if (draft.readinessSummary.blockingRisksCount > 0) {
    visualBlocks.push({
      title: 'Riesgos detectados',
      description: `Existen ${draft.readinessSummary.blockingRisksCount} riesgos bloqueantes.`,
      status: 'error',
    });
  }

  messages.push({
    id: messageId,
    role: "assistant",
    type: "analysis_summary_blocks",
    content: `**${title}**\n\nAquí tienes el resumen del borrador de carga histórica. Este documento consolida las homologaciones y configuración detectada.`,
    visualBlocks,
    timestamp,
  });

  return messages;
}
