/**
 * Phase 11D-H55 · Resolution Application Mapper — Unit Tests
 *
 * Rules:
 * - Synthetic data only. No real client data. No PII. No raw rows.
 * - No open text from survey respondents.
 * - No workbook data dumps.
 * - No Date, no Math.random.
 * - No side effects.
 * - Deterministic assertions.
 */

import { describe, it, expect } from 'vitest';
import { mapTextToAmbiguityResolutionApplicationResult } from '../ambiguityResolutionApplicationMapper';
import type {
  AmbiguityResolutionApplicationInput,
} from '../ambiguityResolutionApplicationTypes';
import type {
  ActiveAmbiguity,
  AmbiguityPrivacyFlags,
} from '../ambiguityResolutionTypes';

// ============================================================================
// Fixtures
// ============================================================================

const DEFAULT_PRIVACY_FLAGS: AmbiguityPrivacyFlags = {
  privacyRisk: false,
  safeToRender: true,
  requiresExplicitConfirmation: false,
  redactionApplied: false,
};

const PRIVACY_RISK_FLAGS: AmbiguityPrivacyFlags = {
  privacyRisk: true,
  safeToRender: false,
  requiresExplicitConfirmation: true,
  redactionApplied: true,
};

function buildMultipleSurveyAmbiguity(
  overrides?: Partial<ActiveAmbiguity>,
): ActiveAmbiguity {
  return {
    id: 'multiple-survey-scope-ambiguity',
    type: 'MultipleSurveyScopeAmbiguity',
    detectedAtStep: 'awaiting_survey_scope_selection',
    severity: 'blocking',
    confidence: 0.85,
    userFacingExplanation: 'Se detectaron múltiples archivos de diferentes periodos. ¿Cuál encuesta deseas cargar?',
    impactSummary: 'No se puede determinar el alcance de la encuesta.',
    options: [
      { id: 'multiple-survey-scope-ambiguity-opt-1', label: 'QS Clima 2025' },
      { id: 'multiple-survey-scope-ambiguity-opt-2', label: 'QS Clima 2024' },
      {
        id: 'multiple-survey-scope-ambiguity-opt-3',
        label: 'QS Clima 2024/2025 (multiciclo)',
      },
    ],
    recommendedOptionId: 'multiple-survey-scope-ambiguity-opt-1',
    expectedInput: { kind: 'numeric_choice', required: true, validOptionIds: ['multiple-survey-scope-ambiguity-opt-1', 'multiple-survey-scope-ambiguity-opt-2', 'multiple-survey-scope-ambiguity-opt-3'] },
    status: 'waiting_for_user_resolution',
    auditNote: 'Detected by H50 detection mapper: multiple distinct survey years detected.',
    privacyFlags: DEFAULT_PRIVACY_FLAGS,
    ...overrides,
  };
}

function buildOutOfScopeAmbiguity(
  overrides?: Partial<ActiveAmbiguity>,
): ActiveAmbiguity {
  return {
    id: 'out-of-scope-ambiguity',
    type: 'OutOfScopeRequestAmbiguity',
    detectedAtStep: 'awaiting_survey_scope_selection',
    severity: 'blocking',
    confidence: 0.9,
    userFacingExplanation: 'La solicitud está fuera del alcance del asistente de carga histórica. Por favor, contacta al administrador.',
    impactSummary: 'No se puede proceder con la carga.',
    options: [],
    expectedInput: { kind: 'clarification', required: false },
    status: 'blocked_until_user_clarifies',
    auditNote: 'User indicated this import is out of scope.',
    privacyFlags: DEFAULT_PRIVACY_FLAGS,
    ...overrides,
  };
}

function buildSurveyNameAmbiguity(
  overrides?: Partial<ActiveAmbiguity>,
): ActiveAmbiguity {
  return {
    id: 'survey-name-ambiguity',
    type: 'SurveyNameAmbiguity',
    detectedAtStep: 'confirming_survey_name',
    severity: 'medium',
    confidence: 0.6,
    userFacingExplanation: 'El nombre de la encuesta no está claro.',
    impactSummary: 'El nombre podría ser incorrecto.',
    options: [
      { id: 'survey-name-opt-1', label: 'Confirmar nombre actual' },
      { id: 'survey-name-opt-2', label: 'Ingresar nombre personalizado' },
    ],
    expectedInput: { kind: 'numeric_choice', required: true, validOptionIds: ['survey-name-opt-1', 'survey-name-opt-2'] },
    status: 'waiting_for_user_resolution',
    auditNote: 'Survey name needs confirmation.',
    privacyFlags: DEFAULT_PRIVACY_FLAGS,
    ...overrides,
  };
}

function buildInput(
  overrides?: Partial<AmbiguityResolutionApplicationInput>,
): AmbiguityResolutionApplicationInput {
  return {
    activeAmbiguity: buildMultipleSurveyAmbiguity(),
    userTextSanitized: '1',
    workspaceSnapshot: {
      selectedSurveyScopeId: null,
      currentStep: 'awaiting_survey_scope_selection',
      hasSelectedScope: false,
      hasConfiguredGeneralSettings: false,
      safeFileLabels: ['Resultados Clima Total QS 2025.xlsx', 'Resultados Encuesta de Clima 2024.xlsx'],
      safeCycleLabels: ['QS Clima 2025', 'QS Clima 2024'],
    },
    availableOptions: [
      { id: 'multiple-survey-scope-ambiguity-opt-1', label: 'QS Clima 2025' },
      { id: 'multiple-survey-scope-ambiguity-opt-2', label: 'QS Clima 2024' },
      { id: 'multiple-survey-scope-ambiguity-opt-3', label: 'QS Clima 2024/2025 (multiciclo)' },
    ],
    currentWizardStep: 'awaiting_survey_scope_selection',
    privacyFlags: DEFAULT_PRIVACY_FLAGS,
    ...overrides,
  };
}

// ============================================================================
// Happy path: MultipleSurveyScopeAmbiguity valid inputs
// ============================================================================

describe('MultipleSurveyScopeAmbiguity — valid inputs', () => {
  it('resolves option 1 → qs_clima_2025', () => {
    const input = buildInput({ userTextSanitized: '1' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('applied');
    expect(result.selectedOptionId).toBe('multiple-survey-scope-ambiguity-opt-1');
    expect(result.ambiguityType).toBe('MultipleSurveyScopeAmbiguity');
    expect(result.statePatch?.ambiguityType).toBe('MultipleSurveyScopeAmbiguity');
    expect(result.statePatch?.patch.selectedSurveyScopeId).toBe('qs_clima_2025');
    expect(result.statePatch?.patch.safeScopeLabel).toBe('QS Clima 2025');
    expect(result.statePatch?.patch.nextWizardStep).toBe('confirming_survey_name');
    expect(result.nextWorkspaceStep).toBe('confirming_survey_name');
    expect(result.agentFollowUpMessageIntent).toBe('scope_selected_proceed_to_general_config');
    expect(result.validationMessage).toBeUndefined();
  });

  it('resolves option 2 → qs_clima_2024', () => {
    const input = buildInput({ userTextSanitized: '2' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('applied');
    expect(result.selectedOptionId).toBe('multiple-survey-scope-ambiguity-opt-2');
    expect(result.statePatch?.patch.selectedSurveyScopeId).toBe('qs_clima_2024');
    expect(result.statePatch?.patch.safeScopeLabel).toBe('QS Clima 2024');
  });

  it('resolves option 3 → qs_clima_multicycle_2024_2025', () => {
    const input = buildInput({ userTextSanitized: '3' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('applied');
    expect(result.selectedOptionId).toBe('multiple-survey-scope-ambiguity-opt-3');
    expect(result.statePatch?.patch.selectedSurveyScopeId).toBe('qs_clima_multicycle_2024_2025');
    expect(result.statePatch?.patch.safeScopeLabel).toBe('QS Clima 2024/2025 (multiciclo)');
  });

  it('accepts whitespace-padded input " 1 "', () => {
    const input = buildInput({ userTextSanitized: ' 1 ' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('applied');
    expect(result.selectedOptionId).toBe('multiple-survey-scope-ambiguity-opt-1');
  });

  it('generates a deterministic resolutionId', () => {
    const input = buildInput({ userTextSanitized: '1' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.resolutionId).toBe('resolution-multiple-survey-scope-ambiguity-1');
    expect(result.resolutionId).toMatch(/^resolution-/);
  });

  it('assigns agentFollowUpMessageIntent scope_selected_proceed_to_general_config', () => {
    const input = buildInput({ userTextSanitized: '1' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.agentFollowUpMessageIntent).toBe('scope_selected_proceed_to_general_config');
  });

  it('auditNote includes type and selected option', () => {
    const input = buildInput({ userTextSanitized: '2' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.auditNote).toContain('MultipleSurveyScopeAmbiguity');
    expect(result.auditNote).toContain('multiple-survey-scope-ambiguity-opt-2');
  });
});

// ============================================================================
// Invalid inputs for MultipleSurveyScopeAmbiguity
// ============================================================================

describe('MultipleSurveyScopeAmbiguity — invalid inputs', () => {
  it('rejects "4" (beyond option count)', () => {
    const input = buildInput({ userTextSanitized: '4' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
    expect(result.selectedOptionId).toBeUndefined();
    expect(result.statePatch).toBeUndefined();
    expect(result.agentFollowUpMessageIntent).toBe('scope_invalid_retry_options');
    expect(result.validationMessage).toBeDefined();
    expect(result.validationMessage).toContain('1, 2, 3');
  });

  it('rejects empty string', () => {
    const input = buildInput({ userTextSanitized: '' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
  });

  it('rejects non-numeric text "abc"', () => {
    const input = buildInput({ userTextSanitized: 'abc' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
  });

  it('rejects mixed text "option 1"', () => {
    const input = buildInput({ userTextSanitized: 'option 1' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
  });

  it('rejects decimal "1.5"', () => {
    const input = buildInput({ userTextSanitized: '1.5' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
  });

  it('rejects negative number "-1"', () => {
    const input = buildInput({ userTextSanitized: '-1' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
  });

  it('rejects "0" (below option range)', () => {
    const input = buildInput({ userTextSanitized: '0' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('invalid_input');
  });

  it('validationMessage includes option labels for retry guidance', () => {
    const input = buildInput({ userTextSanitized: 'abc' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.validationMessage).toContain('QS Clima 2025');
    expect(result.validationMessage).toContain('QS Clima 2024');
    expect(result.validationMessage).toContain('QS Clima 2024/2025 (multiciclo)');
  });

  it('auditNote records invalid input', () => {
    const input = buildInput({ userTextSanitized: 'xyz' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.auditNote).toContain('Invalid input');
  });
});

// ============================================================================
// No active ambiguity
// ============================================================================

describe('no active ambiguity', () => {
  it('returns no_active_ambiguity when activeAmbiguity is undefined', () => {
    const input = buildInput({ activeAmbiguity: undefined });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('no_active_ambiguity');
    expect(result.resolutionId).toBe('resolution-none-0');
    expect(result.ambiguityType).toBeUndefined();
    expect(result.selectedOptionId).toBeUndefined();
    expect(result.statePatch).toBeUndefined();
    expect(result.nextWorkspaceStep).toBeUndefined();
    expect(result.agentFollowUpMessageIntent).toBe('no_active_ambiguity_proceed_normal');
    expect(result.validationMessage).toBeUndefined();
    expect(result.auditNote).toContain('No active ambiguity');
  });
});

// ============================================================================
// Privacy blocked
// ============================================================================

describe('privacy blocked', () => {
  it('returns blocked_privacy when privacyRisk is true', () => {
    const ambiguity = buildMultipleSurveyAmbiguity({ privacyFlags: PRIVACY_RISK_FLAGS });
    const input = buildInput({ activeAmbiguity: ambiguity, privacyFlags: PRIVACY_RISK_FLAGS });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('blocked_privacy');
    expect(result.selectedOptionId).toBeUndefined();
    expect(result.statePatch).toBeUndefined();
    expect(result.agentFollowUpMessageIntent).toBe('privacy_blocked_explain_and_retry');
    expect(result.validationMessage).toBeDefined();
    expect(result.validationMessage).toContain('privacidad');
    expect(result.privacySafeDetails).toBeDefined();
    expect(result.auditNote).toContain('Privacy blocked');
  });

  it('blocks resolution even when input is valid', () => {
    const ambiguity = buildMultipleSurveyAmbiguity({ privacyFlags: PRIVACY_RISK_FLAGS });
    const input = buildInput({
      activeAmbiguity: ambiguity,
      userTextSanitized: '1',
      privacyFlags: PRIVACY_RISK_FLAGS,
    });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('blocked_privacy');
  });
});

// ============================================================================
// Out of scope redirect
// ============================================================================

describe('out of scope redirect', () => {
  it('returns out_of_scope_redirect for OutOfScopeRequestAmbiguity', () => {
    const ambiguity = buildOutOfScopeAmbiguity();
    const input = buildInput({ activeAmbiguity: ambiguity });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('out_of_scope_redirect');
    expect(result.selectedOptionId).toBeUndefined();
    expect(result.statePatch).toBeUndefined();
    expect(result.agentFollowUpMessageIntent).toBe('out_of_scope_redirect_to_flow');
    expect(result.validationMessage).toBe(ambiguity.userFacingExplanation);
    expect(result.auditNote).toContain('Out of scope');
  });
});

// ============================================================================
// Unsupported ambiguity types
// ============================================================================

describe('unsupported ambiguity types', () => {
  it('returns needs_clarification for SurveyNameAmbiguity', () => {
    const ambiguity = buildSurveyNameAmbiguity();
    const input = buildInput({ activeAmbiguity: ambiguity, userTextSanitized: '1' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(result.status).toBe('needs_clarification');
    expect(result.statePatch).toBeUndefined();
    expect(result.validationMessage).toBeDefined();
    expect(result.validationMessage).toContain('SurveyNameAmbiguity');
    expect(result.auditNote).toContain('SurveyNameAmbiguity');
  });
});

// ============================================================================
// Determinism and safety
// ============================================================================

describe('determinism and safety', () => {
  it('produces identical output for identical input', () => {
    const input = buildInput({ userTextSanitized: '1' });
    const resultA = mapTextToAmbiguityResolutionApplicationResult(input);
    const resultB = mapTextToAmbiguityResolutionApplicationResult(input);
    expect(resultA).toEqual(resultB);
  });

  it('does not mutate the input', () => {
    const input = buildInput({ userTextSanitized: '1' });
    const frozen: AmbiguityResolutionApplicationInput = JSON.parse(JSON.stringify(input));
    mapTextToAmbiguityResolutionApplicationResult(input);
    expect(input).toEqual(frozen);
  });

  it('resolutionId is always deterministic from ambiguity id', () => {
    const inputA = buildInput({ userTextSanitized: '2' });
    const inputB = buildInput({ userTextSanitized: '1' });
    const resultA = mapTextToAmbiguityResolutionApplicationResult(inputA);
    const resultB = mapTextToAmbiguityResolutionApplicationResult(inputB);
    // Different options → same ambiguity id → same resolution id prefix
    const prefixA = resultA.resolutionId.split('-').slice(0, 2).join('-');
    const prefixB = resultB.resolutionId.split('-').slice(0, 2).join('-');
    expect(prefixA).toBe(prefixB);
  });

  it('does not expose PII, raw rows, or open text', () => {
    const input = buildInput({ userTextSanitized: '2' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('PII');
    expect(serialized).not.toContain('raw row');
    expect(serialized).not.toContain('open text');
    expect(serialized).not.toContain('workbook');
  });

  it('returns auditNote with no undefined fields', () => {
    const input = buildInput({ userTextSanitized: '3' });
    const result = mapTextToAmbiguityResolutionApplicationResult(input);
    // All required fields must be present
    expect(result.resolutionId).toBeDefined();
    expect(result.auditNote).toBeDefined();
    expect(result.status).toBeDefined();
  });

  it('has only valid status values', () => {
    const validStatuses = ['applied', 'invalid_input', 'needs_clarification', 'blocked_privacy', 'out_of_scope_redirect', 'no_active_ambiguity'];
    const scenarios: Array<{ input: AmbiguityResolutionApplicationInput; expected: string }> = [
      { input: buildInput({ userTextSanitized: '1' }), expected: 'applied' },
      { input: buildInput({ userTextSanitized: 'abc' }), expected: 'invalid_input' },
      { input: buildInput({ activeAmbiguity: undefined }), expected: 'no_active_ambiguity' },
      { input: buildInput({ activeAmbiguity: buildSurveyNameAmbiguity(), userTextSanitized: '1' }), expected: 'needs_clarification' },
    ];
    for (const { input: sc, expected } of scenarios) {
      const result = mapTextToAmbiguityResolutionApplicationResult(sc);
      expect(validStatuses).toContain(result.status);
      expect(result.status).toBe(expected);
    }
  });
});
