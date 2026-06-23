import { mapHistoricalLoadDraftToReview, type ReviewMapperOptions } from '../historical-load-draft-review/mapper';
import type { HistoricalLoadDraft } from '../historical-load-draft/types';
import type { ChatMessage, SyntheticMountNextAction } from './conversationalImportTypes';
import { formatRiskBullets, formatFindingBullets, formatActionBullets, formatAsBulletList } from './chatBulletPresentationMapper';

export function mapHistoricalLoadDraftToReviewMessages(
  draft: HistoricalLoadDraft,
  messageId: string,
  timestamp: string,
  options?: ReviewMapperOptions
): ChatMessage[] {
  const review = mapHistoricalLoadDraftToReview(draft, options);
  const messages: ChatMessage[] = [];
  const visualBlocks: { icon?: string; title: string; description: string; status?: string }[] = [];

  let translatedSummary = review.executiveSummary;
  if (review.reviewState === 'ready_for_human_review') {
    translatedSummary = `El borrador para la encuesta ${review.sourceSurveyGroup} está listo para revisión humana. Las decisiones están resueltas y no hay riesgos bloqueantes.`;
  } else if (review.reviewState === 'needs_decisions') {
    translatedSummary = `Faltan ${review.approvalReadiness.unresolvedDecisionsCount} decisiones por resolver antes de aprobar la encuesta ${review.sourceSurveyGroup}.`;
  } else if (review.reviewState === 'blocked_by_risk') {
    translatedSummary = `Hay ${review.approvalReadiness.blockingRisksCount} riesgos bloqueantes en la encuesta ${review.sourceSurveyGroup}.`;
  } else if (review.reviewState === 'approved_for_later_import_phase') {
    translatedSummary = `El borrador de la encuesta ${review.sourceSurveyGroup} está aprobado y listo para la fase de importación.`;
  } else if (review.reviewState === 'not_ready') {
    translatedSummary = `El borrador no está listo para revisión.`;
  }

  visualBlocks.push({
    title: 'Estado de Revisión',
    description: translatedSummary,
    status: (review.reviewState === 'ready_for_human_review' || review.reviewState === 'approved_for_later_import_phase') ? 'success' : 'warning',
    icon: 'file'
  });

  if (review.sections.primary_mappings && review.mappingHighlights.length > 0) {
    visualBlocks.push({
      title: 'Homologaciones Principales',
      description: formatFindingBullets(
        review.mappingHighlights.map(h => h
          .replace('demographics mapped', 'demográficos homologados')
          .replace('survey-only values identified', 'valores exclusivos de la encuesta detectados')
          .replace('questions mapped', 'preguntas homologadas')
          .replace('new historical questions identified', 'nuevas preguntas históricas detectadas')
          .replace('dimensions mapped', 'dimensiones homologadas')
          .replace('Scale compatibility:', 'Compatibilidad de escala:')
        )
      ),
      icon: 'database'
    });
  }

  if (review.sections.survey_only_entities && review.surveyOnlyEntities.length > 0) {
    visualBlocks.push({
      title: 'Entidades Locales (Solo Encuesta)',
      description: formatFindingBullets([
        `Se detectaron ${review.surveyOnlyEntities[0]?.match(/\d+/)?.[0] || 'múltiples'} entidades locales.`,
        'Estas entidades son exclusivas para esta carga histórica y NO crearán entradas globales.',
        'Se requiere confirmación humana para las entidades exclusivas antes de aprobar.'
      ]),
      icon: 'users'
    });
  }

  if (review.approvalReadiness.blockingRisksCount > 0) {
    visualBlocks.push({
      title: 'Riesgos Bloqueantes',
      description: `Se detectaron ${review.approvalReadiness.blockingRisksCount} riesgos:\n${formatRiskBullets(
        review.blockingRisks.map(r => r.replace('unresolved decisions', 'decisiones pendientes'))
      )}`,
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
      description: formatAsBulletList([
        'Procesamiento local.',
        'No se muestran filas crudas.',
        'No se muestra contrato completo ni resultados completos.',
        'Sin almacenamiento, backend ni IA externa.'
      ], '✓'),
      status: 'success',
      icon: 'file'
    });
  }

  if (review.sections.audit_summary && review.auditSummary.length > 0) {
    visualBlocks.push({
      title: 'Auditoría Resumida',
      description: formatAsBulletList(
        review.auditSummary.map(a => a
          .replace('Considered', 'Se consideraron')
          .replace('files for processing', 'archivos para procesar')
          .replace('Selected Survey Group:', 'Grupo de encuesta seleccionado:')
          .replace('Resolved decisions:', 'Decisiones resueltas:')
          .replace('Pending risks:', 'Riesgos pendientes:')
          .replace('PII Policy determined as:', 'Política de PII determinada como:')
          .replace('Survey-only entities identified:', 'Entidades exclusivas identificadas:')
        ),
        '•'
      ),
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
    ? `\n\n**Acciones bloqueadas por seguridad:**\n${formatActionBullets(
        review.blockedActions.map(a => a
          .replace('import_now', 'Importar ahora')
          .replace('create_global_data', 'Crear datos globales')
          .replace('update_catalog', 'Actualizar catálogo')
          .replace('send_to_production', 'Enviar a producción')
          .replace('generate_comparison', 'Generar comparativa')
          .replace('go_to_dashboard', 'Ir al dashboard')
          .replace('connect_claude', 'Conectar con IA Claude')
          .replace('save_to_backend', 'Guardar en base de datos')
        )
      )}\n*Nota: No se importará nada en esta fase ni se aprueba automáticamente. "Aprobado" solo significa listo para una fase futura.*`
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
