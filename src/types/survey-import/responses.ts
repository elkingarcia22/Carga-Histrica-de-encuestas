/**
 * responses.ts
 *
 * Defines the conceptual representation of an individual response.
 * Note: Paginating or chunking may be required in the future for large datasets.
 */

import type { ParticipantId, SurveyQuestionId } from './common';

export type ResponseValueType =
  | 'numeric'
  | 'text'
  | 'single-choice'
  | 'multiple-choice'
  | 'no-response';

export interface RawResponse {
  readonly participantId: ParticipantId;
  readonly questionId: SurveyQuestionId;
  
  readonly valueType: ResponseValueType;
  
  readonly numericValue?: number;
  readonly textValue?: string;
  readonly choiceValues?: readonly string[]; // Original choice strings
}
