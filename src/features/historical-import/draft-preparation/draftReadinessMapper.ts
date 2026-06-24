import type {
  HistoricalLoadDraftCycle,
  HistoricalLoadDraftDimension,
  HistoricalLoadDraftQuestion,
  HistoricalLoadDraftQuestionMapping,
  HistoricalLoadDraftMetric,
  HistoricalLoadDraftDemographic,
  HistoricalLoadDraftSegment,
  HistoricalLoadDraftReviewDecision,
  HistoricalLoadDraftPrivacyBoundary,
  HistoricalLoadDraftReadiness,
  HistoricalLoadDraftReadinessBlocker,
  HistoricalLoadDraftStatus
} from './types';
import type { OverlayAction } from '../overlay-editing/types';

export interface DraftReadinessInput {
  sourceCycles: HistoricalLoadDraftCycle[];
  sourceDimensions: HistoricalLoadDraftDimension[];
  sourceQuestions: HistoricalLoadDraftQuestion[];
  sourceQuestionMappings: HistoricalLoadDraftQuestionMapping[];
  sourceMetrics: HistoricalLoadDraftMetric[];
  sourceDemographics: HistoricalLoadDraftDemographic[];
  sourceSegments: HistoricalLoadDraftSegment[];
  reviewDecisions: HistoricalLoadDraftReviewDecision[];
  privacyBoundary: HistoricalLoadDraftPrivacyBoundary;
  overlayActions?: OverlayAction[];
}

export type DraftReadinessWarning =
  | 'pending_high_review_decisions'
  | 'pending_medium_review_decisions'
  | 'unconfirmed_demographics'
  | 'local_overlay_adjustments_present'
  | 'medium_privacy_risk'
  | 'critical_external_connection_detected';

export function getDraftReadinessBlockers(input: DraftReadinessInput): HistoricalLoadDraftReadinessBlocker[] {
  const blockers: HistoricalLoadDraftReadinessBlocker[] = [];

  if (input.sourceCycles.length === 0) blockers.push('missing_cycles');
  if (input.sourceDimensions.length === 0) blockers.push('missing_dimensions');
  if (input.sourceQuestions.length === 0) blockers.push('missing_questions');
  
  const mappedQuestionIds = new Set(input.sourceQuestionMappings.map(m => m.questionId));
  const hasUnmappedQuestions = input.sourceQuestions.some(q => !mappedQuestionIds.has(q.id));
  if (hasUnmappedQuestions) {
    blockers.push('missing_question_dimension_mapping');
  }

  if (input.sourceMetrics.length === 0) blockers.push('missing_metrics');

  if (input.privacyBoundary.privacyRiskLevel === 'blocked') blockers.push('privacy_boundary_blocked');
  if (input.privacyBoundary.piiIncluded) blockers.push('pii_detected');
  if (input.privacyBoundary.rawRowsIncluded) blockers.push('raw_rows_detected');
  
  if (
    input.privacyBoundary.apiConnected || 
    input.privacyBoundary.storageConnected || 
    input.privacyBoundary.claudeConnected
  ) {
    blockers.push('privacy_boundary_blocked');
  }

  const hasUnresolvedBlocking = input.reviewDecisions.some(
    d => d.severity === 'blocking' && d.status === 'pending'
  );
  if (hasUnresolvedBlocking) {
    blockers.push('unresolved_blocking_decisions');
  }

  return Array.from(new Set(blockers));
}

export function getDraftReadinessWarnings(input: DraftReadinessInput): string[] {
  const warnings: string[] = [];

  const hasPendingHigh = input.reviewDecisions.some(d => d.severity === 'high' && d.status === 'pending');
  if (hasPendingHigh) warnings.push('pending_high_review_decisions');

  const hasPendingMedium = input.reviewDecisions.some(d => d.severity === 'medium' && d.status === 'pending');
  if (hasPendingMedium) warnings.push('pending_medium_review_decisions');

  const hasUnconfirmedDemographics = input.sourceDemographics.some(d => d.reviewState === 'pending');
  if (hasUnconfirmedDemographics) warnings.push('unconfirmed_demographics');

  if (input.overlayActions && input.overlayActions.length > 0) {
    warnings.push('local_overlay_adjustments_present');
  }

  if (input.privacyBoundary.privacyRiskLevel === 'medium') {
    warnings.push('medium_privacy_risk');
  }

  return warnings;
}

export function summarizeDraftReadiness(blockers: HistoricalLoadDraftReadinessBlocker[], warnings: string[]): string {
  if (blockers.length > 0) {
    return 'La estructura todavía requiere revisión antes de preparar un borrador local.';
  }
  if (warnings.length > 0) {
    return 'La estructura tiene advertencias pendientes, pero está lista para preparar un borrador local.';
  }
  return 'La estructura está lista para preparar un borrador local.';
}

export function evaluateDraftReadiness(input: DraftReadinessInput): HistoricalLoadDraftReadiness {
  const blockers = getDraftReadinessBlockers(input);
  const warnings = getDraftReadinessWarnings(input);

  const canPrepareDraft = blockers.length === 0;
  // canProceedToFutureImport no ejecuta importación ni persistencia; solo indica elegibilidad futura.
  const canProceedToFutureImport = canPrepareDraft;

  let status: HistoricalLoadDraftReadiness['status'] = 'ready';
  if (blockers.length > 0) {
    status = 'blocked';
  } else if (warnings.length > 0) {
    status = 'not_ready';
  }

  const summary = summarizeDraftReadiness(blockers, warnings);

  return {
    status,
    canPrepareDraft,
    canProceedToFutureImport,
    blockers,
    warnings,
    summary,
  };
}

export function deriveDraftStatus(readiness: HistoricalLoadDraftReadiness): HistoricalLoadDraftStatus {
  if (
    readiness.blockers.includes('privacy_boundary_blocked') || 
    readiness.blockers.includes('pii_detected') || 
    readiness.blockers.includes('raw_rows_detected')
  ) {
    return 'blocked_by_privacy';
  }
  
  if (readiness.blockers.includes('missing_question_dimension_mapping')) {
    return 'blocked_by_missing_mapping';
  }

  if (readiness.blockers.length > 0) {
    return 'not_started';
  }

  if (readiness.warnings.length > 0) {
    return 'needs_review';
  }

  return 'ready_to_prepare';
}
