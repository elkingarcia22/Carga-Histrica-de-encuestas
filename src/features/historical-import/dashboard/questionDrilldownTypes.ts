export type DrilldownSelectionState =
  | { type: 'NO_QUESTION_SELECTED' }
  | { type: 'LOADING_MOCK' }
  | { type: 'ERROR'; message: string }
  | { type: 'COMPARABLE_SELECTED'; questionId: string }
  | { type: 'BASE_ONLY_SELECTED'; questionId: string }
  | { type: 'COMPARISON_ONLY_SELECTED'; questionId: string };
