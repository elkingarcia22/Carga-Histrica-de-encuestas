/**
 * participants.ts
 *
 * Defines the canonical representation of participants for raw-individual mode.
 */

import type { ParticipantId, DemographicId, ConfidenceScore, MatchStatus, ReviewStatus } from './common';
import type { IssueId } from './common';

export type IdentityType =
  | 'ubits-user'
  | 'external-participant'
  | 'anonymous-participant'
  | 'unresolved';

export type PrivacyState = 'visible' | 'anonymized' | 'redacted';

export interface DemographicAssociation {
  readonly demographicId: DemographicId;
  readonly value: string; // The normalized value
}

export interface CanonicalParticipant {
  readonly internalId: ParticipantId;
  readonly externalId?: string;
  readonly username?: string;
  readonly email?: string;
  /** Safe representation for UI, can be redacted if PII is protected */
  readonly visibleName?: string;
  
  readonly identityType: IdentityType;
  readonly suggestedUbitsMatchId?: string;
  readonly matchConfidence: ConfidenceScore;
  
  readonly matchStatus: MatchStatus;
  readonly isDuplicate: boolean;
  
  readonly demographics: readonly DemographicAssociation[];
  readonly privacyState: PrivacyState;
  
  readonly relatedIssueIds: readonly IssueId[];
  readonly reviewStatus: ReviewStatus;
}
