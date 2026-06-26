/**
 * Phase 11D-H46 · Ambiguity Resolution — Public Exports
 *
 * Exports only the public type contracts needed by future phases:
 * - H47 · Ambiguity Detection Mapper
 * - H48 · Ambiguity Conversation Mapper
 * - H49 · Ambiguity Runtime Integration
 *
 * Rules:
 * - No runtime logic exported.
 * - No helper functions exported.
 * - No fixtures exported.
 * - No internal implementation details exposed.
 */
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
