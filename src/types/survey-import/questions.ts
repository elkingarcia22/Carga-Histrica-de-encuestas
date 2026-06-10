/**
 * questions.ts
 *
 * Defines the canonical representation of questions and scales.
 */

import type { SurveyQuestionId, ConfidenceScore, MatchStatus, ReviewStatus } from './common';
import type { DetectionEvidence } from './detection';
import type { IssueId } from './common';

export type QuestionType =
  | 'likert'
  | 'nps'
  | 'open-text'
  | 'single-choice'
  | 'multiple-choice'
  | 'dropdown'
  | 'stars'
  | 'emotion'
  | 'linear'
  | 'unknown';

// --- Scales ---

export interface ScaleBase {
  readonly kind: string;
  readonly originalRange?: [number, number];
  readonly canonicalRange?: [number, number];
  /** Safe summary of the transformation applied, e.g., "Inverted and normalized to 0-100" */
  readonly suggestedTransformationRule?: string;
  readonly transformationRequiresReview: boolean;
  readonly confirmationStatus: ReviewStatus;
}

export interface LikertScale extends ScaleBase {
  readonly kind: 'likert';
  readonly points: number;
}

export interface NpsScale extends ScaleBase {
  readonly kind: 'nps';
}

export interface LinearScale extends ScaleBase {
  readonly kind: 'linear';
}

export interface StarsScale extends ScaleBase {
  readonly kind: 'stars';
  readonly maxStars: number;
}

export interface EmotionScale extends ScaleBase {
  readonly kind: 'emotion';
}

export interface CategoricalScale extends ScaleBase {
  readonly kind: 'categorical';
  readonly options: readonly string[];
}

export interface NoScale extends ScaleBase {
  readonly kind: 'no-scale';
}

export type QuestionScale =
  | LikertScale
  | NpsScale
  | LinearScale
  | StarsScale
  | EmotionScale
  | CategoricalScale
  | NoScale;

export type QuestionAction = 'import' | 'ignore' | 'block';

// --- Canonical Question ---

export interface CanonicalQuestion {
  readonly internalId: SurveyQuestionId;
  readonly externalId?: string;
  
  readonly normalizedText: string;
  readonly originalText: string; // Kept only for review purposes
  
  readonly questionType: QuestionType;
  readonly scale: QuestionScale;
  readonly dimensionOrSection?: string;
  
  /** The suggested existing UBITS question ID to map to */
  readonly suggestedUbitsMatchId?: string;
  readonly matchConfidence: ConfidenceScore;
  readonly matchEvidences: readonly DetectionEvidence[];
  
  readonly matchStatus: MatchStatus;
  readonly reviewStatus: ReviewStatus;
  
  readonly relatedIssueIds: readonly IssueId[];
  readonly action: QuestionAction;
}
