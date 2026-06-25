export type ConversationalImportWizardStateId =
  | 'idle'
  | 'files_uploaded'
  | 'detecting_survey_scope'
  | 'awaiting_survey_scope_selection'
  | 'asking_general_configuration'
  | 'confirming_survey_name'
  | 'confirming_survey_type'
  | 'confirming_visibility'
  | 'confirming_confidentiality_threshold'
  | 'confirming_main_file'
  | 'confirming_associated_files'
  | 'reviewing_structure_match'
  | 'reviewing_questions_and_scales'
  | 'reviewing_demographics'
  | 'reviewing_participants_or_responses'
  | 'reviewing_dimensions'
  | 'reviewing_question_dimension_mapping'
  | 'reviewing_segments'
  | 'reviewing_privacy'
  | 'resolving_ambiguity'
  | 'structure_approved'
  | 'reviewing_detected_results'
  | 'draft_preview_ready'
  | 'awaiting_import_confirmation'
  | 'sandbox_import_completed'
  | 'import_cancelled';

export type ConversationalSurveyScope =
  | 'qs_clima_2025'
  | 'qs_clima_2024'
  | 'qs_clima_multicycle_2024_2025'
  | 'unknown';

export type ConversationalSurveyVisibility =
  | 'public'
  | 'anonymous'
  | 'private'
  | 'unknown';

export type ConversationalSurveyType =
  | 'climate'
  | 'engagement'
  | 'enps'
  | 'mixed'
  | 'unknown';

export type ConversationalConfidentialityThreshold = number;

export type ConversationalGeneralConfiguration = {
  surveyName: string;
  surveyType: ConversationalSurveyType;
  visibility: ConversationalSurveyVisibility;
  confidentialityThreshold: ConversationalConfidentialityThreshold;
  mainFileId: string | null;
  associatedFileIds: string[];
  reviewState: 'pending' | 'in_progress' | 'completed';
};

export type ConversationalMatchReviewSection =
  | 'questions_and_scales'
  | 'demographics'
  | 'participants_or_responses'
  | 'dimensions'
  | 'question_dimension_mapping'
  | 'segments'
  | 'privacy';

export type ConversationalMatchReviewSummary = {
  section: ConversationalMatchReviewSection;
  detectedCount: number;
  alignedCount: number;
  newCount: number;
  needsReviewCount: number;
  notInterpretableCount: number;
  status: 'aligned' | 'needs_review' | 'blocked' | 'pending';
  recommendation?: string;
};

export type ConversationalAmbiguityType =
  | 'unknown_question_type'
  | 'unknown_scale'
  | 'missing_dimension_mapping'
  | 'unknown_demographic'
  | 'unsupported_column'
  | 'privacy_risk'
  | 'duplicate_label'
  | 'unknown_segment';

export type ConversationalAmbiguityStatus =
  | 'pending'
  | 'resolved'
  | 'dismissed'
  | 'blocked';

export type ConversationalAmbiguityResolutionOption = {
  id: string;
  label: string;
  description: string;
  resultingAction: string;
};

export type ConversationalAmbiguity = {
  id: string;
  type: ConversationalAmbiguityType;
  status: ConversationalAmbiguityStatus;
  description: string;
  options: ConversationalAmbiguityResolutionOption[];
  selectedOptionId?: string;
};

export type ConversationalWizardDecisionType =
  | 'select_survey_scope'
  | 'confirm_survey_name'
  | 'confirm_survey_type'
  | 'confirm_visibility'
  | 'confirm_confidentiality_threshold'
  | 'confirm_main_file'
  | 'confirm_associated_files'
  | 'approve_structure'
  | 'adjust_structure_label'
  | 'resolve_ambiguity'
  | 'approve_results_review'
  | 'confirm_sandbox_import'
  | 'cancel_import';

export type ConversationalWizardDecision = {
  id: string;
  type: ConversationalWizardDecisionType;
  stateId: ConversationalImportWizardStateId;
  label: string;
  value: string;
  source: 'user_text' | 'system_suggestion' | 'fixture_default' | 'overlay_adjustment';
};

export type ConversationalWizardReadiness = {
  structureReady: boolean;
  resultsReady: boolean;
  draftPreviewReady: boolean;
  sandboxImportReady: boolean;
  blockers: string[];
  warnings: string[];
};

export type ConversationalSandboxImportState = {
  enabled: boolean;
  confirmedByUser: boolean;
  completed: boolean;
  mockResultLink: string;
  mockResultLinkLabel: string;
};

export type ConversationalImportWizardState = {
  stateId: ConversationalImportWizardStateId;
  selectedScope: ConversationalSurveyScope;
  generalConfiguration: ConversationalGeneralConfiguration;
  matchReviewSummaries: ConversationalMatchReviewSummary[];
  ambiguities: ConversationalAmbiguity[];
  decisions: ConversationalWizardDecision[];
  readiness: ConversationalWizardReadiness;
  sandboxImport: ConversationalSandboxImportState;
  activeSection: ConversationalMatchReviewSection | null;
  activeAmbiguityId: string | null;
  cancelled: boolean;
};
