export type OverlayEditableEntityType =
  | 'dimension'
  | 'question'
  | 'question_dimension_mapping'
  | 'metric'
  | 'demographic'
  | 'segment'
  | 'review_decision'
  | 'dataset_note';

export type OverlayActionType =
  | 'rename_dimension_label'
  | 'rename_question_label'
  | 'move_question_to_dimension'
  | 'mark_demographic_as_segmentable'
  | 'mark_demographic_as_ignored'
  | 'confirm_metric_mapping'
  | 'confirm_segment_mapping'
  | 'confirm_question_dimension_mapping'
  | 'resolve_review_decision'
  | 'add_review_note';

export interface OverlayActionBase {
  id: string; // Static/deterministic for prototype, no crypto.randomUUID
  actionType: OverlayActionType;
  targetEntityType: OverlayEditableEntityType;
  targetEntityId: string;
  reason: string;
  sourceTrace: string; // E.g., 'user_action' or 'system_inference'
  reviewState: 'pending' | 'approved' | 'rejected';
  createdBy?: 'demo_user' | 'system_review';
  createdAtLabel?: string; // Static label instead of dynamic Date
}

export interface OverlayRenameDimensionAction extends OverlayActionBase {
  actionType: 'rename_dimension_label';
  targetEntityType: 'dimension';
  previousLabel: string;
  nextLabel: string;
}

export interface OverlayRenameQuestionAction extends OverlayActionBase {
  actionType: 'rename_question_label';
  targetEntityType: 'question';
  previousLabel: string;
  nextLabel: string;
}

export interface OverlayMoveQuestionToDimensionAction extends OverlayActionBase {
  actionType: 'move_question_to_dimension';
  targetEntityType: 'question';
  previousDimensionId: string | null;
  nextDimensionId: string;
}

export interface OverlayMarkDemographicAsSegmentableAction extends OverlayActionBase {
  actionType: 'mark_demographic_as_segmentable';
  targetEntityType: 'demographic';
  previousValue: boolean;
  nextValue: boolean;
}

export interface OverlayMarkDemographicAsIgnoredAction extends OverlayActionBase {
  actionType: 'mark_demographic_as_ignored';
  targetEntityType: 'demographic';
  previousValue: boolean;
  nextValue: boolean;
}

export interface OverlayConfirmMetricMappingAction extends OverlayActionBase {
  actionType: 'confirm_metric_mapping';
  targetEntityType: 'metric';
  previousState: 'unconfirmed' | 'confirmed';
  nextState: 'confirmed';
}

export interface OverlayConfirmSegmentMappingAction extends OverlayActionBase {
  actionType: 'confirm_segment_mapping';
  targetEntityType: 'segment';
  previousState: 'unconfirmed' | 'confirmed';
  nextState: 'confirmed';
}

export interface OverlayConfirmQuestionDimensionMappingAction extends OverlayActionBase {
  actionType: 'confirm_question_dimension_mapping';
  targetEntityType: 'question_dimension_mapping';
  previousState: 'unconfirmed' | 'confirmed';
  nextState: 'confirmed';
}

export interface OverlayResolveReviewDecisionAction extends OverlayActionBase {
  actionType: 'resolve_review_decision';
  targetEntityType: 'review_decision';
  previousState: 'unresolved' | 'resolved';
  nextState: 'resolved';
}

export interface OverlayAddReviewNoteAction extends OverlayActionBase {
  actionType: 'add_review_note';
  targetEntityType: 'dataset_note';
  note: string;
}

export type OverlayAction =
  | OverlayRenameDimensionAction
  | OverlayRenameQuestionAction
  | OverlayMoveQuestionToDimensionAction
  | OverlayMarkDemographicAsSegmentableAction
  | OverlayMarkDemographicAsIgnoredAction
  | OverlayConfirmMetricMappingAction
  | OverlayConfirmSegmentMappingAction
  | OverlayConfirmQuestionDimensionMappingAction
  | OverlayResolveReviewDecisionAction
  | OverlayAddReviewNoteAction;

export interface OverlayValidationError {
  code:
    | 'invalid_action_type'
    | 'invalid_target_entity_type'
    | 'empty_target_entity_id'
    | 'empty_next_value'
    | 'empty_reason'
    | 'forbidden_source_mutation'
    | 'contains_pii_like_value'
    | 'contains_raw_row_like_value'
    | 'contains_response_value_like_value';
  message: string;
}

export interface OverlayValidationResult {
  isValid: boolean;
  errors: OverlayValidationError[];
}

export interface OverlayState {
  actions: OverlayAction[];
  hasPendingChanges: boolean;
  isApplying: boolean;
  lastAppliedActionId: string | null;
}

// Resolved View Types (Conceptual computed view)
export interface ResolvedDimension {
  id: string;
  originalLabel: string;
  currentLabel: string;
  isModified: boolean;
}

export interface ResolvedQuestion {
  id: string;
  originalLabel: string;
  currentLabel: string;
  originalDimensionId: string | null;
  currentDimensionId: string | null;
  isModified: boolean;
}

export interface ResolvedDemographic {
  id: string;
  label: string;
  isSegmentable: boolean;
  isIgnored: boolean;
  isModified: boolean;
}

export interface ResolvedMetric {
  id: string;
  label: string;
  isConfirmed: boolean;
}

export interface ResolvedSegment {
  id: string;
  label: string;
  isConfirmed: boolean;
}

export interface ResolvedReviewDecision {
  id: string;
  description: string;
  isResolved: boolean;
}

export interface ResolvedStructureView {
  dimensions: ResolvedDimension[];
  questions: ResolvedQuestion[];
  demographics: ResolvedDemographic[];
  metrics: ResolvedMetric[];
  segments: ResolvedSegment[];
  decisions: ResolvedReviewDecision[];
  notes: string[];
}
