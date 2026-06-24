export type {
  OverlayEditableEntityType,
  OverlayActionType,
  OverlayActionBase,
  OverlayRenameDimensionAction,
  OverlayRenameQuestionAction,
  OverlayMoveQuestionToDimensionAction,
  OverlayMarkDemographicAsSegmentableAction,
  OverlayMarkDemographicAsIgnoredAction,
  OverlayConfirmMetricMappingAction,
  OverlayConfirmSegmentMappingAction,
  OverlayConfirmQuestionDimensionMappingAction,
  OverlayResolveReviewDecisionAction,
  OverlayAddReviewNoteAction,
  OverlayAction,
  OverlayValidationError,
  OverlayValidationResult,
  OverlayState,
  ResolvedStructureView,
  ResolvedDimension,
  ResolvedQuestion,
  ResolvedDemographic,
  ResolvedMetric,
  ResolvedSegment,
  ResolvedReviewDecision
} from './types';

export {
  validateOverlayActionShape,
  isOverlayActionTypeAllowed,
  isOverlayTargetEntityTypeAllowed,
  isNonEmptyOverlayValue
} from './overlayEditingValidation';
