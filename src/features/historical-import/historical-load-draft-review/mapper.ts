import type { HistoricalLoadDraft } from '../historical-load-draft/types';
import type {
  AllowedReviewAction,
  BlockedReviewAction,
  HistoricalLoadDraftReviewCapabilities,
  HistoricalLoadDraftReviewModel,
  HistoricalLoadDraftReviewState,
  ReviewApprovalReadiness,
  ReviewInformationArchitecture,
  ReviewPrivacyFlags
} from './types';

// REVIEW_MAPPER_INPUT_TYPED = YES
export interface ReviewMapperOptions {
  humanConfirmationReceived?: boolean;
  piiPolicyReviewed?: boolean;
  surveyOnlyEntitiesAcknowledged?: boolean;
}

// REVIEW_MAPPER_OUTPUT_TYPED = YES
export interface HistoricalLoadDraftReviewMappedResult extends HistoricalLoadDraftReviewModel {
  sections: ReviewInformationArchitecture;
  privacyFlags: ReviewPrivacyFlags;
}

// HISTORICAL_LOAD_DRAFT_REVIEW_MAPPER_IMPLEMENTED = YES
// REVIEW_MAPPER_IMPLEMENTED = YES
export function mapHistoricalLoadDraftToReview(
  draft: HistoricalLoadDraft,
  options?: ReviewMapperOptions
): HistoricalLoadDraftReviewMappedResult {

  // REVIEW_STATE_DERIVED = YES
  let reviewState: HistoricalLoadDraftReviewState = 'not_ready';

  if (draft.readinessSummary.unresolvedDecisionsCount > 0) {
    reviewState = 'needs_decisions';
  } else if (draft.readinessSummary.blockingRisksCount > 0) {
    reviewState = 'blocked_by_risk';
  } else if (draft.status === 'ready_for_review') {
    reviewState = 'ready_for_human_review';
  } else if (draft.status === 'approved_for_later_import') {
    reviewState = 'approved_for_later_import_phase';
  }

  // REVIEW_EXECUTIVE_SUMMARY_BUILT = YES
  let executiveSummary = `This review presents the historical load draft for survey group ${draft.readinessSummary.selectedSurveyGroupName}. `;
  if (reviewState === 'ready_for_human_review') {
    executiveSummary += 'The draft is ready for human review. All decisions are resolved and no blocking risks are present.';
  } else if (reviewState === 'needs_decisions') {
    executiveSummary += `There are ${draft.readinessSummary.unresolvedDecisionsCount} decisions pending resolution before approval.`;
  } else if (reviewState === 'blocked_by_risk') {
    executiveSummary += `There are ${draft.readinessSummary.blockingRisksCount} blocking risks preventing approval.`;
  } else if (reviewState === 'approved_for_later_import_phase') {
    executiveSummary += 'The draft has been approved and is ready for the future import phase.';
  } else {
    executiveSummary += 'The draft is not yet ready for review.';
  }

  // REVIEW_INFORMATION_SECTIONS_BUILT = YES
  const sections: ReviewInformationArchitecture = {
    executive_summary: true,
    draft_state: true,
    source_files: true,
    survey_group: true,
    historical_cycle: true,
    primary_mappings: true,
    survey_only_entities: true,
    participant_policy: true,
    blocking_risks: true,
    pending_decisions: true,
    audit_summary: true,
    available_actions: true
  };

  // REVIEW_MAPPING_HIGHLIGHTS_BUILT = YES
  const mappingHighlights: string[] = [
    `${draft.readinessSummary.mappedDemographicsCount} demographics mapped`,
    `${draft.readinessSummary.surveyOnlyValuesCount} survey-only values identified`,
    `${draft.readinessSummary.mappedQuestionsCount} questions mapped`,
    `${draft.readinessSummary.newHistoricalQuestionsCount} new historical questions identified`,
    `${draft.readinessSummary.matchedDimensionsCount} dimensions mapped`,
    `Scale compatibility: ${draft.readinessSummary.scaleCompatibilityStatus}`
  ];

  // REVIEW_SURVEY_ONLY_ENTITIES_BUILT = YES
  const surveyOnlyEntities: string[] = [
    `Found ${draft.readinessSummary.surveyOnlyValuesCount} survey-only entities.`,
    'Survey-only entities are strictly local to this historical load and will NOT create global catalog entries.',
    'Human acknowledgment is required for survey-only entities before future approval.'
  ];

  // NO_AUTOMATIC_APPROVAL = YES
  const humanConfirmationReceived = options?.humanConfirmationReceived ?? false;
  const piiPolicyReviewed = options?.piiPolicyReviewed ?? false;
  const surveyOnlyEntitiesAcknowledged = options?.surveyOnlyEntitiesAcknowledged ?? false;

  const unresolvedDecisionsCount = draft.readinessSummary.unresolvedDecisionsCount;
  const blockingRisksCount = draft.readinessSummary.blockingRisksCount;

  const canApproveForLaterImportPhase =
    unresolvedDecisionsCount === 0 &&
    blockingRisksCount === 0 &&
    piiPolicyReviewed &&
    surveyOnlyEntitiesAcknowledged &&
    humanConfirmationReceived;

  const blockingReasons: string[] = [];
  if (unresolvedDecisionsCount > 0) blockingReasons.push('Pending decisions remain');
  if (blockingRisksCount > 0) blockingReasons.push('Blocking risks present');
  if (!piiPolicyReviewed) blockingReasons.push('PII Policy not reviewed');
  if (!surveyOnlyEntitiesAcknowledged) blockingReasons.push('Survey-only entities not acknowledged');
  if (!humanConfirmationReceived) blockingReasons.push('Human confirmation not received');

  // REVIEW_APPROVAL_READINESS_BUILT = YES
  const approvalReadiness: ReviewApprovalReadiness = {
    unresolvedDecisionsCount,
    blockingRisksCount,
    piiPolicyReviewed,
    surveyOnlyEntitiesAcknowledged,
    humanConfirmationReceived,
    canApproveForLaterImportPhase,
    blockingReasons
  };

  // REVIEW_ACTIONS_MAPPED = YES
  const availableActions: AllowedReviewAction[] = ['return_to_draft_summary'];
  if (unresolvedDecisionsCount > 0) {
    availableActions.push('resolve_next_pending_decision');
  }
  if (blockingRisksCount > 0) {
    availableActions.push('review_blocking_risks');
  }
  if (canApproveForLaterImportPhase) {
    availableActions.push('confirm_ready_for_future_import_phase');
  }
  if (reviewState !== 'approved_for_later_import_phase') {
    availableActions.push('mark_for_later_review');
  }

  const blockedActions: BlockedReviewAction[] = [
    'import_now',
    'create_global_data',
    'update_catalog',
    'send_to_production',
    'generate_comparison',
    'go_to_dashboard',
    'connect_claude',
    'save_to_backend'
  ];

  // REVIEW_PRIVACY_FLAGS_MAPPED = YES
  const privacyFlags: ReviewPrivacyFlags = {
    rawRowsRendered: false,
    fullContractDumpRendered: false,
    fullMatchingResultRendered: false,
    fullHistoricalLoadDraftRendered: false,
    emailsOrDocumentsVisible: false,
    storageEnabled: false,
    backendEnabled: false,
    claudeEnabled: false,
    localOnlyProcessing: true
  };

  // REVIEW_AUDIT_SUMMARY_BUILT = YES
  const auditSummary: string[] = [
    `Considered ${draft.readinessSummary.totalFiles} files for processing.`,
    `Selected Survey Group: ${draft.readinessSummary.selectedSurveyGroupName}.`,
    `Resolved decisions: ${Array.isArray(draft.resolvedDecisions) ? draft.resolvedDecisions.length : 0}.`,
    `Pending risks: ${draft.readinessSummary.blockingRisksCount}.`,
    `PII Policy determined as: ${draft.readinessSummary.piiPolicyStatus}.`,
    `Survey-only entities identified: ${draft.readinessSummary.surveyOnlyValuesCount}.`
  ];

  // REVIEW_CAPABILITIES_UPDATED = YES
  const capabilities: HistoricalLoadDraftReviewCapabilities = {
    isTypeScaffoldingOnly: false,
    mapperImplemented: true,
    uiIntegrated: false,
    runtimeIntegrated: false,
    storageEnabled: false,
    backendEnabled: false,
    claudeEnabled: false,
    createsGlobalData: false,
    finalImportEnabled: false,
    comparisonOutputEnabled: false,
    automaticApprovalEnabled: false
  };

  const participantPolicy = String(draft.participantPolicy);
  const sourceSurveyGroup = String(draft.sourceSurveyGroup || '');
  const historicalCycle = String(draft.historicalCycle || '');
  const sourceFiles = Array.isArray(draft.sourceFiles) ? draft.sourceFiles.map(String) : [];

  const blockingRisks = Array.isArray(draft.warnings) ? draft.warnings.map(String) : [];
  const pendingDecisions = Array.isArray(draft.unresolvedDecisions) ? draft.unresolvedDecisions.map(String) : [];

  return {
    reviewId: draft.draftId,
    reviewState,
    draftStatus: draft.status,
    executiveSummary,
    sourceSurveyGroup,
    sourceFiles,
    historicalCycle,
    mappingHighlights,
    surveyOnlyEntities,
    participantPolicy,
    blockingRisks,
    pendingDecisions,
    auditSummary,
    availableActions,
    blockedActions,
    approvalReadiness,
    capabilities,
    sections,
    privacyFlags
  };
}
