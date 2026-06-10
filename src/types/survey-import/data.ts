/**
 * data.ts
 *
 * Defines the discriminated unions for mode-specific import data.
 */

import type { CanonicalQuestion } from './questions';
import type { CanonicalDemographic } from './demographics';
import type { CanonicalParticipant } from './participants';
import type { CanonicalSegment } from './segments';
import type { RawResponse } from './responses';
import type { AggregatedResult } from './analytics';

export interface RawImportData {
  readonly mode: 'raw-individual';
  readonly questions: readonly CanonicalQuestion[];
  readonly demographics: readonly CanonicalDemographic[];
  readonly participants: readonly CanonicalParticipant[];
  readonly responses: readonly RawResponse[];
}

export interface AggregatedImportData {
  readonly mode: 'aggregated-comparison';
  readonly questions: readonly CanonicalQuestion[];
  readonly demographics: readonly CanonicalDemographic[];
  readonly segments: readonly CanonicalSegment[];
  readonly aggregatedResults: readonly AggregatedResult[];
}

export interface UnknownImportData {
  readonly mode: 'unknown';
  // Contains no domain entities until a mode is determined
}

export type ImportModeData = RawImportData | AggregatedImportData | UnknownImportData;
