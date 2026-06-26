/**
 * Phase 11D-H49 · Ambiguity Runtime Mapper — Unit Tests
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
import {
  mapWorkspaceToAmbiguityDetectionInput,
  type WorkspaceAmbiguityContext,
} from '../ambiguityRuntimeMapper';

// ============================================================================
// Helpers
// ============================================================================

function buildContext(
  overrides?: Partial<WorkspaceAmbiguityContext>,
): WorkspaceAmbiguityContext {
  return {
    stagedFileNames: [],
    selectedSurveyScope: null,
    currentWizardState: 'idle',
    userLastText: '',
    surveyName: '',
    surveyTypeConfirmed: false,
    inferredSurveyType: '',
    visibilityConfirmed: false,
    inferredVisibility: '',
    surveyEndDate: null,
    confidentialityThreshold: null,
    hasPrivacyRisk: false,
    ...overrides,
  };
}

// ============================================================================
// Survey scope derivation
// ============================================================================

describe('survey scope derivation', () => {
  it('returns empty detected scopes when no files are staged', () => {
    const input = buildContext({ stagedFileNames: [] });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes).toEqual([]);
  });

  it('returns single scope for 2025-only files', () => {
    const input = buildContext({
      stagedFileNames: ['Resultados Clima Total QS 2025.xlsx'],
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes).toHaveLength(1);
    expect(result.detectedSurveyScopes[0].sanitizedLabel).toBe('QS Clima 2025');
    expect(result.detectedSurveyScopes[0].confidence).toBe(0.95);
    expect(result.detectedSurveyScopes[0].isSelected).toBe(true);
  });

  it('returns single scope for 2024-only files', () => {
    const input = buildContext({
      stagedFileNames: ['Resultados Encuesta de Clima 2024.xlsx'],
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes).toHaveLength(1);
    expect(result.detectedSurveyScopes[0].sanitizedLabel).toBe('QS Clima 2024');
    expect(result.detectedSurveyScopes[0].confidence).toBe(0.9);
    expect(result.detectedSurveyScopes[0].isSelected).toBe(true);
  });

  it('returns three scope candidates when both 2024 and 2025 files present', () => {
    const input = buildContext({
      stagedFileNames: [
        'Resultados Clima Total QS 2025.xlsx',
        'Resultados Encuesta de Clima 2024.xlsx',
      ],
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes).toHaveLength(3);
    expect(result.detectedSurveyScopes[0].sanitizedLabel).toBe('QS Clima 2025');
    expect(result.detectedSurveyScopes[1].sanitizedLabel).toBe('QS Clima 2024');
    expect(result.detectedSurveyScopes[2].sanitizedLabel).toBe(
      'QS Clima 2024/2025 (multiciclo)',
    );
    expect(result.detectedSurveyScopes[0].isSelected).toBe(false);
    expect(result.detectedSurveyScopes[1].isSelected).toBe(false);
    expect(result.detectedSurveyScopes[2].isSelected).toBe(false);
  });

  it('marks the correct scope as selected when selectedSurveyScope is set', () => {
    const input = buildContext({
      stagedFileNames: [
        'Resultados Clima Total QS 2025.xlsx',
        'Resultados Encuesta de Clima 2024.xlsx',
      ],
      selectedSurveyScope: 'qs_clima_2024',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes[0].isSelected).toBe(false);
    expect(result.detectedSurveyScopes[1].isSelected).toBe(true);
    expect(result.detectedSurveyScopes[2].isSelected).toBe(false);
  });

  it('marks qs_clima_multicycle_2024_2025 as selected when set', () => {
    const input = buildContext({
      stagedFileNames: [
        'Resultados Clima Total QS 2025.xlsx',
        'Resultados Encuesta de Clima 2024.xlsx',
      ],
      selectedSurveyScope: 'qs_clima_multicycle_2024_2025',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes[2].isSelected).toBe(true);
  });

  it('returns single generic scope when no year pattern is detected', () => {
    const input = buildContext({
      stagedFileNames: ['survey_results.xlsx', 'data.xlsx'],
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes).toHaveLength(1);
    expect(result.detectedSurveyScopes[0].sanitizedLabel).toBe('Carga única');
    expect(result.detectedSurveyScopes[0].isSelected).toBe(true);
  });

  it('handles mixed file names correctly with 2025 prefix patterns', () => {
    const input = buildContext({
      stagedFileNames: [
        '2025_Resultados_Clima.xlsx',
        '2024_Resultados_Clima.xlsx',
      ],
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.detectedSurveyScopes).toHaveLength(3);
  });
});

// ============================================================================
// Signal builders
// ============================================================================

describe('survey name signal', () => {
  it('populates name signal when survey name is provided', () => {
    const input = buildContext({ surveyName: 'QS Clima 2025' });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.surveyNameSignal.sanitizedInferredName).toBe('QS Clima 2025');
    expect(result.surveyNameSignal.confidence).toBe(0.8);
    expect(result.surveyNameSignal.isConfirmed).toBe(true);
  });

  it('defaults to confirmed=true when name is empty', () => {
    const input = buildContext({ surveyName: '' });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.surveyNameSignal.sanitizedInferredName).toBe('');
    expect(result.surveyNameSignal.isConfirmed).toBe(true);
  });
});

describe('survey type signal', () => {
  it('reflects confirmed type when workspace provides evidence', () => {
    const input = buildContext({
      surveyTypeConfirmed: true,
      inferredSurveyType: 'climate',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.surveyTypeSignal.inferredType).toBe('climate');
    expect(result.surveyTypeSignal.isConfirmed).toBe(true);
  });

  it('defaults to climate when no type is provided', () => {
    const input = buildContext({
      surveyTypeConfirmed: false,
      inferredSurveyType: '',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.surveyTypeSignal.inferredType).toBe('climate');
    expect(result.surveyTypeSignal.isConfirmed).toBe(true);
  });
});

describe('visibility signal', () => {
  it('reflects confirmed visibility when workspace provides evidence', () => {
    const input = buildContext({
      visibilityConfirmed: true,
      inferredVisibility: 'public',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.visibilitySignal.inferredVisibility).toBe('public');
    expect(result.visibilitySignal.isConfirmed).toBe(true);
  });

  it('defaults to anonymous when no visibility is provided', () => {
    const input = buildContext({
      visibilityConfirmed: false,
      inferredVisibility: '',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.visibilitySignal.inferredVisibility).toBe('anonymous');
    expect(result.visibilitySignal.isConfirmed).toBe(true);
  });
});

describe('end date signal', () => {
  it('populates end date signal when date is provided', () => {
    const input = buildContext({ surveyEndDate: '2025-06-30' });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.endDateSignal.hasInferredDate).toBe(true);
    expect(result.endDateSignal.confidence).toBe(0.7);
    expect(result.endDateSignal.isConfirmed).toBe(true);
  });

  it('defaults to not having a date when null', () => {
    const input = buildContext({ surveyEndDate: null });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.endDateSignal.hasInferredDate).toBe(false);
    expect(result.endDateSignal.isConfirmed).toBe(false);
  });
});

describe('privacy threshold signal', () => {
  it('flags threshold as confirmed when configured', () => {
    const input = buildContext({
      hasPrivacyRisk: false,
      confidentialityThreshold: 5,
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.privacyThresholdSignal.privacyRisk).toBe(false);
    expect(result.privacyThresholdSignal.thresholdConfirmed).toBe(true);
  });

  it('flags threshold as unconfirmed when not configured and no risk', () => {
    const input = buildContext({
      hasPrivacyRisk: false,
      confidentialityThreshold: null,
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.privacyThresholdSignal.thresholdConfirmed).toBe(true);
  });

  it('flags as not confirmed when privacy risk exists without threshold', () => {
    const input = buildContext({
      hasPrivacyRisk: true,
      confidentialityThreshold: null,
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.privacyThresholdSignal.privacyRisk).toBe(true);
    expect(result.privacyThresholdSignal.thresholdConfirmed).toBe(false);
  });
});

// ============================================================================
// Determinism and safety
// ============================================================================

describe('determinism and safety', () => {
  it('produces identical output for identical input', () => {
    const input = buildContext({
      stagedFileNames: [
        'Resultados Clima Total QS 2025.xlsx',
        'Resultados Encuesta de Clima 2024.xlsx',
      ],
      currentWizardState: 'awaiting_survey_scope_selection',
    });
    const resultA = mapWorkspaceToAmbiguityDetectionInput(input);
    const resultB = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(resultA).toEqual(resultB);
  });

  it('does not mutate the input context', () => {
    const input: WorkspaceAmbiguityContext = {
      stagedFileNames: ['test_2025.xlsx', 'test_2024.xlsx'],
      selectedSurveyScope: null,
      currentWizardState: 'awaiting_survey_scope_selection',
      userLastText: '',
      surveyName: '',
      surveyTypeConfirmed: false,
      inferredSurveyType: '',
      visibilityConfirmed: false,
      inferredVisibility: '',
      surveyEndDate: null,
      confidentialityThreshold: null,
      hasPrivacyRisk: false,
    };
    const frozen = { ...input, stagedFileNames: [...input.stagedFileNames] };
    mapWorkspaceToAmbiguityDetectionInput(input);
    expect(input).toEqual(frozen);
  });

  it('does not expose PII, raw rows, or open text', () => {
    const input = buildContext({
      stagedFileNames: ['results_2025.xlsx', 'results_2024.xlsx'],
      currentWizardState: 'awaiting_survey_scope_selection',
    });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('PII');
    expect(serialized).not.toContain('raw row');
    expect(serialized).not.toContain('open text');
    expect(serialized).not.toContain('workbook');
  });

  it('sets currentStep from currentWizardState', () => {
    const input = buildContext({ currentWizardState: 'awaiting_survey_scope_selection' });
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.currentStep).toBe('awaiting_survey_scope_selection');
  });

  it('leaves fileSignals and other signal arrays empty', () => {
    const input = buildContext();
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.fileSignals).toEqual([]);
    expect(result.associatedFileSignals).toEqual([]);
    expect(result.questionScaleSignals).toEqual([]);
    expect(result.demographicMappingSignals).toEqual([]);
    expect(result.dimensionMappingSignals).toEqual([]);
    expect(result.segmentCutSignals).toEqual([]);
    expect(result.duplicateOrConflictSignals).toEqual([]);
  });

  it('outOfScopeRequestSignal defaults to false', () => {
    const input = buildContext();
    const result = mapWorkspaceToAmbiguityDetectionInput(input);
    expect(result.outOfScopeRequestSignal.hasOutOfScopeRequest).toBe(false);
    expect(result.outOfScopeRequestSignal.sanitizedRequestDescription).toBe('');
  });
});
