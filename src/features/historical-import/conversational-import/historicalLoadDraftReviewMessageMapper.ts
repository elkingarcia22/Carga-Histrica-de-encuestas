import { mapHistoricalLoadDraftToReview, type ReviewMapperOptions } from '../historical-load-draft-review/mapper';
import type { HistoricalLoadDraft } from '../historical-load-draft/types';
import type { ChatMessage, SyntheticMountNextAction } from './conversationalImportTypes';

export function mapHistoricalLoadDraftToReviewMessages(
  draft: HistoricalLoadDraft,
  messageId: string,
  timestamp: string,
  options?: ReviewMapperOptions
): ChatMessage[] {
  const review = mapHistoricalLoadDraftToReview(draft, options);
  const messages: ChatMessage[] = [];
  const visualBlocks: { icon?: string; title: string; description: string; status?: string }[] = [];

  visualBlocks.push({
    title: 'Estado de Revisión',
    description: review.executiveSummary,
    status: (review.reviewState === 'ready_for_human_review' || review.reviewState === 'approved_for_later_import_phase') ? 'success' : 'warning',
    icon: 'file'
  });

  if (review.sections.primary_mappings && review.mappingHighlights.length > 0) {
    visualBlocks.push({
      title: 'Homologaciones Principales',
      description: review.mappingHighlights.join('\n'),
      icon: 'database'
    });
  }

  if (review.sections.survey_only_entities && review.surveyOnlyEntities.length > 0) {
    visualBlocks.push({
      title: 'Entidades Survey-only',
      description: review.surveyOnlyEntities.join('\n'),
      icon: 'users'
    });
  }

  if (review.approvalReadiness.blockingRisksCount > 0) {
    visualBlocks.push({
      title: 'Riesgos Bloqueantes',
      description: `Se detectaron ${review.approvalReadiness.blockingRisksCount} riesgos. ${review.blockingRisks.join(', ')}`,
      status: 'error',
      icon: 'alert'
    });
  }

  if (review.approvalReadiness.unresolvedDecisionsCount > 0) {
    visualBlocks.push({
      title: 'Decisiones Pendientes',
      description: `Faltan ${review.approvalReadiness.unresolvedDecisionsCount} decisiones por resolver.`,
      status: 'warning',
      icon: 'alert'
    });
  }

  if (review.sections.participant_policy) {
    visualBlocks.push({
      title: 'Privacidad y Seguridad',
      description: [
        '✓ Procesamiento local.',
        '✓ No se muestran filas crudas.',
        '✓ No se muestra contrato completo ni resultados completos.',
        '✓ Sin almacenamiento, backend ni Claude.'
      ].join('\n'),
      status: 'success',
      icon: 'file'
    });
  }

  if (review.sections.audit_summary && review.auditSummary.length > 0) {
    visualBlocks.push({
      title: 'Auditoría Resumida',
      description: review.auditSummary.join('\n'),
      icon: 'file'
    });
  }

  const actionLabels: Record<string, string> = {
    return_to_draft_summary: 'Volver al resumen',
    resolve_next_pending_decision: 'Resolver siguiente decisión pendiente',
    review_blocking_risks: 'Revisar riesgos',
    mark_for_later_review: 'Marcar para revisión posterior',
    confirm_ready_for_future_import_phase: 'Confirmar como listo para fase futura'
  };

  const nextActions: SyntheticMountNextAction[] = review.availableActions.map(action => ({
    id: `action_${action}`,
    actionType: action,
    label: actionLabels[action] || action
  }));

  const blockedText = review.blockedActions.length > 0
    ? `\n\n**Acciones bloqueadas por seguridad:**\n${review.blockedActions.map(a => `- ${a}`).join('\n')}\n*Nota: No se importará nada en esta fase ni se aprueba automáticamente. "Aprobado" solo significa listo para una fase futura.*`
    : '';

  messages.push({
    id: messageId,
    role: "assistant",
    type: "analysis_summary_blocks",
    content: `**Revisión Final del Borrador**\n\nAquí tienes la revisión conversacional de la carga histórica para la encuesta ${review.sourceSurveyGroup}.${blockedText}`,
    visualBlocks,
    nextActions,
    timestamp,
  });

  return messages;
}
