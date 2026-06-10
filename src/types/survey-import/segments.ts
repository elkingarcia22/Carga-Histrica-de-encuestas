/**
 * segments.ts
 *
 * Defines the canonical representation of segments for aggregated-comparison mode.
 */

import type { SegmentId, DemographicId, ConfidenceScore, MatchStatus, ReviewStatus, Count, Percentage } from './common';
import type { IssueId } from './common';

export type SegmentType =
  | 'organization'
  | 'area'
  | 'department'
  | 'management'
  | 'demographic'
  | 'overall'
  | 'unknown';

export interface CanonicalSegment {
  readonly internalId: SegmentId;
  readonly type: SegmentType;
  readonly name: string;
  readonly code?: string;
  
  /** If the segment is based on a demographic, link it here */
  readonly relatedDemographicId?: DemographicId;
  /** The specific value of the demographic for this segment */
  readonly demographicValue?: string;
  
  readonly sampleSize: Count;
  readonly participationRate?: Percentage;
  readonly period?: string;
  
  readonly suggestedUbitsMatchId?: string;
  readonly matchConfidence: ConfidenceScore;
  
  readonly matchStatus: MatchStatus;
  readonly reviewStatus: ReviewStatus;
  readonly relatedIssueIds: readonly IssueId[];
}
