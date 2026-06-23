/**
 * HISTORICAL_LOAD_DRAFT_REVIEW_STATES_SCAFFOLDED = YES
 */
export type HistoricalLoadDraftReviewState =
  | 'not_ready'
  | 'needs_decisions'
  | 'blocked_by_risk'
  | 'ready_for_human_review'
  | 'approved_for_later_import_phase';

/**
 * REVIEW_INFORMATION_ARCHITECTURE_TYPES_SCAFFOLDED = YES
 */
export interface ReviewInformationArchitecture {
  executive_summary: boolean;
  draft_state: boolean;
  source_files: boolean;
  survey_group: boolean;
  historical_cycle: boolean;
  primary_mappings: boolean;
  survey_only_entities: boolean;
  participant_policy: boolean;
  blocking_risks: boolean;
  pending_decisions: boolean;
  audit_summary: boolean;
  available_actions: boolean;
}

/**
 * REVIEW_ACTION_TYPES_SCAFFOLDED = YES
 */
export type AllowedReviewAction =
  | 'resolve_next_pending_decision'
  | 'review_blocking_risks'
  | 'mark_for_later_review'
  | 'confirm_ready_for_future_import_phase'
  | 'return_to_draft_summary';

export type BlockedReviewAction =
  | 'import_now'
  | 'create_global_data'
  | 'update_catalog'
  | 'send_to_production'
  | 'generate_comparison'
  | 'go_to_dashboard'
  | 'connect_claude'
  | 'save_to_backend';

/**
 * REVIEW_APPROVAL_READINESS_SCAFFOLDED = YES
 */
export interface ReviewApprovalReadiness {
  unresolvedDecisionsCount: number;
  blockingRisksCount: number;
  piiPolicyReviewed: boolean;
  surveyOnlyEntitiesAcknowledged: boolean;
  humanConfirmationReceived: boolean;
  canApproveForLaterImportPhase: boolean; // solo puede ser true si no hay decisiones pendientes, no hay riesgos bloqueantes, PII fue revisado, survey-only fue reconocido y hay confirmación humana.
  blockingReasons: string[];
}

/**
 * REVIEW_PRIVACY_FLAGS_SCAFFOLDED = YES
 */
export interface ReviewPrivacyFlags {
  rawRowsRendered: false;
  fullContractDumpRendered: false;
  fullMatchingResultRendered: false;
  fullHistoricalLoadDraftRendered: false;
  emailsOrDocumentsVisible: false;
  storageEnabled: false;
  backendEnabled: false;
  claudeEnabled: false;
  localOnlyProcessing: true;
}

/**
 * HISTORICAL_LOAD_DRAFT_REVIEW_CAPABILITIES_SCAFFOLDED = YES
 */
export interface HistoricalLoadDraftReviewCapabilities {
  isTypeScaffoldingOnly: boolean;
  mapperImplemented: boolean;
  uiIntegrated: boolean;
  runtimeIntegrated: boolean;
  storageEnabled: boolean;
  backendEnabled: boolean;
  claudeEnabled: boolean;
  createsGlobalData: boolean;
  finalImportEnabled: boolean;
  comparisonOutputEnabled: boolean;
  automaticApprovalEnabled: boolean;
}

/**
 * HISTORICAL_LOAD_DRAFT_REVIEW_MAIN_TYPE_SCAFFOLDED = YES
 */
export interface HistoricalLoadDraftReviewModel {
  reviewId: string;
  reviewState: HistoricalLoadDraftReviewState;
  draftStatus: string;
  executiveSummary: string;
  sourceSurveyGroup: string;
  sourceFiles: string[];
  historicalCycle: string;
  mappingHighlights: string[];
  surveyOnlyEntities: string[];
  participantPolicy: string;
  blockingRisks: string[];
  pendingDecisions: string[];
  auditSummary: string[];
  availableActions: AllowedReviewAction[];
  blockedActions: BlockedReviewAction[];
  approvalReadiness: ReviewApprovalReadiness;
  capabilities: HistoricalLoadDraftReviewCapabilities;
}
