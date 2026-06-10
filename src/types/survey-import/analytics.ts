/**
 * analytics.ts
 *
 * Defines analytical capabilities and aggregated results contracts.
 */

import type { Percentage, Count, SurveyQuestionId, SegmentId } from './common';
import type { DetectionEvidence } from './detection';

export type AnalyticCapabilityType =
  | 'participation'
  | 'favorability'
  | 'questions'
  | 'responses'
  | 'comments'
  | 'nps'
  | 'demographics'
  | 'heatmap'
  | 'ai-analysis'
  | 'dimensions'
  | 'response-distribution'
  | 'area-comparison'
  | 'demographic-comparison'
  | 'trends';

export type CapabilityStatus = 'available' | 'partial' | 'unavailable';

export interface AnalyticCapability {
  readonly type: AnalyticCapabilityType;
  readonly status: CapabilityStatus;
  readonly reason?: string;
  readonly evidences: readonly DetectionEvidence[];
  readonly missingRequirements: readonly string[];
  readonly limitations: readonly string[];
}

export interface SentimentDistribution {
  readonly positivePercentage?: Percentage;
  readonly neutralPercentage?: Percentage;
  readonly negativePercentage?: Percentage;
  readonly noResponsePercentage?: Percentage;
  
  readonly positiveCount?: Count;
  readonly neutralCount?: Count;
  readonly negativeCount?: Count;
  readonly noResponseCount?: Count;
}

export interface AggregatedResult {
  readonly questionId?: SurveyQuestionId;
  readonly segmentId?: SegmentId;
  readonly dimension?: string;
  
  readonly overallScore?: number;
  readonly distribution?: SentimentDistribution;
  
  readonly totalResponses: Count;
  readonly participationRate?: Percentage;
  readonly period?: string;
}
