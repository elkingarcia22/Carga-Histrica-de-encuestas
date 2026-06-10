/**
 * demographics.ts
 *
 * Defines the canonical representation of demographic fields and equivalences.
 */

import type { DemographicId, ConfidenceScore, ReviewStatus, MatchStatus } from './common';
import type { IssueId } from './common';

export type DemographicType =
  | 'categorical'
  | 'hierarchical'
  | 'numeric-range'
  | 'date-derived'
  | 'unknown';

export type DemographicAction = 'associate' | 'create' | 'ignore' | 'block';

export interface DemographicValueEquivalence {
  readonly originalValue: string;
  readonly normalizedValue: string;
  readonly suggestedUbitsValueId?: string;
  readonly confidence: ConfidenceScore;
  readonly reviewStatus: ReviewStatus;
}

export interface CanonicalDemographic {
  readonly internalId: DemographicId;
  readonly originalName: string;
  readonly normalizedName: string;
  readonly type: DemographicType;
  
  readonly originalValues: readonly string[];
  readonly normalizedValues: readonly string[];
  
  readonly suggestedUbitsMatchId?: string;
  readonly matchConfidence: ConfidenceScore;
  
  readonly valueEquivalences: readonly DemographicValueEquivalence[];
  
  readonly matchStatus: MatchStatus;
  readonly reviewStatus: ReviewStatus;
  
  readonly action: DemographicAction;
  readonly relatedIssueIds: readonly IssueId[];
}
