/**
 * Phase 11D-H46/H47 · Ambiguity Resolution — Public Exports
 *
 * Exports the public type contracts needed by future phases:
 * - H47 · Ambiguity Detection Mapper (this phase)
 * - H48 · Ambiguity Conversation Mapper
 * - H49 · Ambiguity Runtime Integration
 *
 * Rules:
 * - No runtime side effects exported.
 * - No helper functions exported (internal to mapper).
 * - No fixtures exported.
 * - No internal implementation details exposed.
 */

// H46 type contracts
export type {
  AmbiguityType,
  AmbiguitySeverity,
  AmbiguityResolutionFlowState,
  AmbiguityResolutionOption,
  AmbiguityExpectedInputKind,
  AmbiguityExpectedInput,
  AmbiguityPrivacyFlags,
  ActiveAmbiguity,
  AmbiguityResolutionReceived,
  AmbiguityResolutionSnapshot,
} from './ambiguityResolutionTypes';

// H47 input contract types
export type {
  AmbiguityDetectionInput,
  SurveyScopeSignal,
  SurveyNameSignal,
  SurveyTypeSignal,
  VisibilitySignal,
  EndDateSignal,
  FileSignal,
  AssociatedFileSignal,
  QuestionScaleSignal,
  DemographicMappingSignal,
  DimensionMappingSignal,
  SegmentCutSignal,
  PrivacyThresholdSignal,
  DuplicateOrConflictSignal,
  OutOfScopeRequestSignal,
} from './ambiguityDetectionMapper';

// H47 mapper function
export { detectHistoricalImportAmbiguities } from './ambiguityDetectionMapper';
