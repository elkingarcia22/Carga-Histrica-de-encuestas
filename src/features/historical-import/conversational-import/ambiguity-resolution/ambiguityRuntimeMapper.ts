/**
 * Phase 11D-H49 · Ambiguity Runtime Mapper
 *
 * Pure, deterministic mapper that transforms workspace-level state
 * into a sanitized AmbiguityDetectionInput for the ambiguity detection
 * chain (H47).
 *
 * Rules:
 * - No `any`, no `as any`, no `any[]`.
 * - No Date, no Math.random.
 * - No localStorage, sessionStorage, IndexedDB.
 * - No fetch, no API calls.
 * - No side effects, no mutation of input.
 * - No PII, no raw rows, no open text, no workbook data dumps.
 * - IDs are deterministic (no counters from external state).
 * - Does not integrate into any runtime (H49 workspace integration
 *   is a separate concern).
 *
 * References:
 * - src/features/historical-import/conversational-import/ambiguity-resolution/ambiguityDetectionMapper.ts
 * - src/features/historical-import/conversational-import/conversationalWizardTypes.ts
 */

import type {
  AmbiguityDetectionInput,
  SurveyScopeSignal,
  SurveyNameSignal,
  SurveyTypeSignal,
  VisibilitySignal,
  EndDateSignal,
  PrivacyThresholdSignal,
  OutOfScopeRequestSignal,
} from './ambiguityDetectionMapper';

// ============================================================================
// 1. Workspace Ambiguity Context — Input contract
// ============================================================================

/**
 * Sanitized snapshot of the ConversationalImportWorkspace state, used
 * exclusively to produce an AmbiguityDetectionInput.
 *
 * All fields are pre-sanitized by the workspace before passing to this
 * mapper. No raw file contents, no PII, no open text from survey data.
 */
export interface WorkspaceAmbiguityContext {
  /** Sanitized file names of staged uploads (no paths, no contents). */
  readonly stagedFileNames: readonly string[];

  /** Currently selected survey scope, or null if not yet selected. */
  readonly selectedSurveyScope: string | null;

  /** Current wizard state ID (e.g. "awaiting_survey_scope_selection"). */
  readonly currentWizardState: string;

  /** Last user text input, trimmed. Empty string if none. */
  readonly userLastText: string;

  /** Inferred survey name, or empty string. */
  readonly surveyName: string;

  /** Whether the survey type has been explicitly confirmed by the user. */
  readonly surveyTypeConfirmed: boolean;

  /**
   * Inferred survey type string from workspace.
   * Expected: 'climate' | 'culture' | 'nps' | 'unknown' | ''.
   */
  readonly inferredSurveyType: string;

  /** Whether the visibility has been explicitly confirmed. */
  readonly visibilityConfirmed: boolean;

  /**
   * Inferred visibility string from workspace.
   * Expected: 'anonymous' | 'public' | 'unknown' | ''.
   */
  readonly inferredVisibility: string;

  /** Inferred survey end date, or null. */
  readonly surveyEndDate: string | null;

  /** Configured confidentiality threshold, or null. */
  readonly confidentialityThreshold: number | null;

  /** Whether a privacy risk has been flagged from file analysis. */
  readonly hasPrivacyRisk: boolean;
}

// ============================================================================
// 2. Scope signal derivation
// ============================================================================

/**
 * Derives survey scope signals from sanitized file names.
 *
 * Heuristic: looks for year patterns ("2024", "2025") in file names to
 * determine which survey cycles are present. This is deterministic and
 * uses only the file name string, not file contents.
 *
 * Returns an empty array when no files are staged.
 */
function deriveSurveyScopeSignals(
  fileNames: readonly string[],
  selectedScope: string | null,
): readonly SurveyScopeSignal[] {
  if (fileNames.length === 0) return [];

  const YEAR_2025_RE = /(?:^|\D)2025(?!\d)/;
  const YEAR_2024_RE = /(?:^|\D)2024(?!\d)/;
  const has2025 = fileNames.some((name) => YEAR_2025_RE.test(name));
  const has2024 = fileNames.some(
    (name) => YEAR_2024_RE.test(name) && !YEAR_2025_RE.test(name),
  );

  if (has2024 && has2025) {
    return [
      {
        sanitizedLabel: 'QS Clima 2025',
        confidence: 0.95,
        isSelected: selectedScope === 'qs_clima_2025',
      },
      {
        sanitizedLabel: 'QS Clima 2024',
        confidence: 0.9,
        isSelected: selectedScope === 'qs_clima_2024',
      },
      {
        sanitizedLabel: 'QS Clima 2024/2025 (multiciclo)',
        confidence: 0.7,
        isSelected: selectedScope === 'qs_clima_multicycle_2024_2025',
      },
    ];
  }

  if (has2025) {
    return [
      {
        sanitizedLabel: 'QS Clima 2025',
        confidence: 0.95,
        isSelected: selectedScope === 'qs_clima_2025' || selectedScope === null,
      },
    ];
  }

  if (has2024) {
    return [
      {
        sanitizedLabel: 'QS Clima 2024',
        confidence: 0.9,
        isSelected: selectedScope === 'qs_clima_2024' || selectedScope === null,
      },
    ];
  }

  return [
    {
      sanitizedLabel: 'Carga única',
      confidence: 0.5,
      isSelected: true,
    },
  ];
}

// ============================================================================
// 3. Signal builders
// ============================================================================

/**
 * Builds a safe survey name signal.
 * When no name is available, defaults to confirmed=true to avoid
 * triggering SurveyNameAmbiguity without explicit evidence.
 */
function buildSurveyNameSignal(surveyName: string): SurveyNameSignal {
  const trimmed = surveyName.trim();
  return {
    sanitizedInferredName: trimmed,
    confidence: trimmed ? 0.8 : 0,
    isConfirmed: true,
  };
}

/**
 * Narrow the inferred survey type to the valid union, defaulting to
 * 'climate' when the value is unrecognized. This keeps the detection
 * mapper from triggering SurveyTypeAmbiguity without explicit evidence.
 */
function narrowSurveyType(value: string): 'climate' | 'culture' | 'nps' | 'unknown' {
  if (value === 'climate' || value === 'culture' || value === 'nps') return value;
  return 'climate';
}

/**
 * Builds a safe survey type signal.
 * Defaults to 'climate' confirmed to avoid triggering SurveyTypeAmbiguity
 * without explicit workspace evidence.
 */
function buildSurveyTypeSignal(
  surveyTypeConfirmed: boolean,
  inferredSurveyType: string,
): SurveyTypeSignal {
  const type = narrowSurveyType(inferredSurveyType);
  return {
    inferredType: type,
    confidence: 0.9,
    isConfirmed: surveyTypeConfirmed || type !== 'unknown',
  };
}

/**
 * Narrow the inferred visibility to the valid union, defaulting to
 * 'anonymous' when unrecognized.
 */
function narrowVisibility(
  value: string,
): 'anonymous' | 'public' | 'unknown' {
  if (value === 'anonymous' || value === 'public') return value;
  return 'anonymous';
}

/**
 * Builds a safe visibility signal. Defaults to 'anonymous' confirmed.
 */
function buildVisibilitySignal(
  visibilityConfirmed: boolean,
  inferredVisibility: string,
): VisibilitySignal {
  const vis = narrowVisibility(inferredVisibility);
  return {
    inferredVisibility: vis,
    isConfirmed: visibilityConfirmed || vis !== 'unknown',
  };
}

/**
 * Builds an end date signal from the workspace state.
 * Defaults to confirmed when no date is available to avoid triggering
 * EndDateAmbiguity without explicit evidence.
 */
function buildEndDateSignal(
  surveyEndDate: string | null,
): EndDateSignal {
  const hasDate = surveyEndDate !== null && surveyEndDate.trim() !== '';
  return {
    hasInferredDate: hasDate,
    confidence: hasDate ? 0.7 : 0,
    isConfirmed: hasDate,
  };
}

/**
 * Builds a privacy threshold signal.
 */
function buildPrivacyThresholdSignal(
  hasPrivacyRisk: boolean,
  confidentialityThreshold: number | null,
): PrivacyThresholdSignal {
  const isConfigured =
    confidentialityThreshold !== null && confidentialityThreshold > 0;
  return {
    privacyRisk: hasPrivacyRisk,
    thresholdConfirmed: !hasPrivacyRisk || isConfigured,
  };
}

// ============================================================================
// 4. Public mapper function
// ============================================================================

/**
 * Maps a sanitized workspace state snapshot into an AmbiguityDetectionInput
 * consumable by the ambiguity detection chain (H47).
 *
 * Rules:
 * - Pure and deterministic: same input always produces same output.
 * - No side effects.
 * - Does not mutate the input.
 * - No `any`, no `as any`, no Date, no Math.random.
 * - No PII, no raw rows, no workbook data.
 * - Default signals are tuned to NOT trigger ambiguity detection unless
 *   the workspace provides explicit evidence for a given ambiguity category.
 *
 * @param context - Sanitized workspace state snapshot.
 * @returns A sanitized AmbiguityDetectionInput.
 */
export function mapWorkspaceToAmbiguityDetectionInput(
  context: WorkspaceAmbiguityContext,
): AmbiguityDetectionInput {
  const detectedSurveyScopes = deriveSurveyScopeSignals(
    context.stagedFileNames,
    context.selectedSurveyScope,
  );

  const surveyNameSignal = buildSurveyNameSignal(context.surveyName);
  const surveyTypeSignal = buildSurveyTypeSignal(
    context.surveyTypeConfirmed,
    context.inferredSurveyType,
  );
  const visibilitySignal = buildVisibilitySignal(
    context.visibilityConfirmed,
    context.inferredVisibility,
  );
  const endDateSignal = buildEndDateSignal(context.surveyEndDate);
  const privacyThresholdSignal = buildPrivacyThresholdSignal(
    context.hasPrivacyRisk,
    context.confidentialityThreshold,
  );

  const outOfScopeRequestSignal: OutOfScopeRequestSignal = {
    hasOutOfScopeRequest: false,
    sanitizedRequestDescription: '',
  };

  return {
    detectedSurveyScopes,
    surveyNameSignal,
    surveyTypeSignal,
    visibilitySignal,
    endDateSignal,
    fileSignals: [],
    associatedFileSignals: [],
    questionScaleSignals: [],
    demographicMappingSignals: [],
    dimensionMappingSignals: [],
    segmentCutSignals: [],
    privacyThresholdSignal,
    duplicateOrConflictSignals: [],
    outOfScopeRequestSignal,
    currentStep: context.currentWizardState,
  };
}
