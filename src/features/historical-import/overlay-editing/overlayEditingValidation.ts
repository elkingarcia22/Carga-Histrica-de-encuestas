import type {
  OverlayAction,
  OverlayActionType,
  OverlayEditableEntityType,
  OverlayValidationResult,
  OverlayValidationError
} from './types';

const ALLOWED_ACTION_TYPES: OverlayActionType[] = [
  'rename_dimension_label',
  'rename_question_label',
  'move_question_to_dimension',
  'mark_demographic_as_segmentable',
  'mark_demographic_as_ignored',
  'confirm_metric_mapping',
  'confirm_segment_mapping',
  'confirm_question_dimension_mapping',
  'resolve_review_decision',
  'add_review_note'
];

const ALLOWED_ENTITY_TYPES: OverlayEditableEntityType[] = [
  'dimension',
  'question',
  'question_dimension_mapping',
  'metric',
  'demographic',
  'segment',
  'review_decision',
  'dataset_note'
];

const PII_GUARD_PATTERNS = [
  'email',
  'correo',
  'cedula',
  'cédula',
  'documento',
  'telefono',
  'teléfono',
  'nombre completo',
  'employee_id',
  'colaborador_id'
];

export function isOverlayActionTypeAllowed(type: string): type is OverlayActionType {
  return ALLOWED_ACTION_TYPES.includes(type as OverlayActionType);
}

export function isOverlayTargetEntityTypeAllowed(type: string): type is OverlayEditableEntityType {
  return ALLOWED_ENTITY_TYPES.includes(type as OverlayEditableEntityType);
}

export function isNonEmptyOverlayValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function containsPiiLikeValue(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const lowerText = value.toLowerCase();
  return PII_GUARD_PATTERNS.some(pattern => lowerText.includes(pattern));
}

export function validateOverlayActionShape(action: Partial<OverlayAction>): OverlayValidationResult {
  const errors: OverlayValidationError[] = [];

  if (!action.actionType || !isOverlayActionTypeAllowed(action.actionType)) {
    errors.push({
      code: 'invalid_action_type',
      message: `Invalid or missing actionType: ${action.actionType}`
    });
  }

  if (!action.targetEntityType || !isOverlayTargetEntityTypeAllowed(action.targetEntityType)) {
    errors.push({
      code: 'invalid_target_entity_type',
      message: `Invalid or missing targetEntityType: ${action.targetEntityType}`
    });
  }

  if (!action.targetEntityId || !isNonEmptyOverlayValue(action.targetEntityId)) {
    errors.push({
      code: 'empty_target_entity_id',
      message: 'targetEntityId cannot be empty'
    });
  }

  if (!action.reason || !isNonEmptyOverlayValue(action.reason)) {
    errors.push({
      code: 'empty_reason',
      message: 'reason cannot be empty'
    });
  }

  // Basic shape validation based on type
  if (action.actionType === 'rename_dimension_label' || action.actionType === 'rename_question_label') {
    const nextLabel = 'nextLabel' in action ? (action as Record<string, unknown>).nextLabel : undefined;
    if (!isNonEmptyOverlayValue(nextLabel)) {
      errors.push({ code: 'empty_next_value', message: 'nextLabel cannot be empty' });
    }
    if (typeof nextLabel === 'string' && containsPiiLikeValue(nextLabel)) {
      errors.push({ code: 'contains_pii_like_value', message: 'nextLabel contains suspicious PII-like string' });
    }
  }

  if (action.actionType === 'add_review_note') {
    const note = 'note' in action ? (action as Record<string, unknown>).note : undefined;
    if (!isNonEmptyOverlayValue(note)) {
      errors.push({ code: 'empty_next_value', message: 'note cannot be empty' });
    }
    if (typeof note === 'string' && containsPiiLikeValue(note)) {
      errors.push({ code: 'contains_pii_like_value', message: 'note contains suspicious PII-like string' });
    }
  }

  if (action.reason && containsPiiLikeValue(action.reason)) {
     errors.push({ code: 'contains_pii_like_value', message: 'reason contains suspicious PII-like string' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
