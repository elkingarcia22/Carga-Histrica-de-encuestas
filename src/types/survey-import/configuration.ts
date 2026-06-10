/**
 * configuration.ts
 *
 * Defines the configuration for the survey being imported.
 */

import type { ImportMode, ReviewStatus, IsoTimestamp } from './common';

export type SurveyType =
  | 'climate'
  | 'culture'
  | 'enps'
  | 'ai-adoption'
  | 'evaluation'
  | 'other';

export type SurveyVisibility =
  | 'public'
  | 'anonymous'
  | 'aggregated-only';

export interface SurveyConfiguration {
  readonly name: string;
  readonly surveyType: SurveyType;
  /** Suggested survey type may differ from user-confirmed type */
  readonly suggestedSurveyType?: SurveyType;
  
  readonly period?: string;
  readonly startDate?: IsoTimestamp;
  readonly endDate?: IsoTimestamp;
  
  readonly visibility: SurveyVisibility;
  readonly suggestedVisibility?: SurveyVisibility;
  
  /** Number of participants required to show aggregated data */
  readonly confidentialityThreshold: number;
  
  /** Safe summary of the source, e.g., "Imported from Excel file" */
  readonly sourceSummary: string;
  
  readonly confirmedMode?: ImportMode;
  readonly reviewStatus: ReviewStatus;
}
