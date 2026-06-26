/**
 * Phase 11D-H47 · Ambiguity Detection Mapper — Unit Tests
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
  detectHistoricalImportAmbiguities,
  type AmbiguityDetectionInput,
  type SurveyScopeSignal,
  type SurveyNameSignal,
  type SurveyTypeSignal,
  type VisibilitySignal,
  type EndDateSignal,
  type FileSignal,
  type AssociatedFileSignal,
  type QuestionScaleSignal,
  type DemographicMappingSignal,
  type DimensionMappingSignal,
  type SegmentCutSignal,
  type PrivacyThresholdSignal,
  type DuplicateOrConflictSignal,
  type OutOfScopeRequestSignal,
} from '../ambiguityDetectionMapper';

// ============================================================================
// Test fixtures — synthetic, minimal, sanitized
// ============================================================================

const SAFE_NAME_SIGNAL: SurveyNameSignal = {
  sanitizedInferredName: 'QS Clima 2025',
  confidence: 0.9,
  isConfirmed: true,
};

const SAFE_TYPE_SIGNAL: SurveyTypeSignal = {
  inferredType: 'climate',
  confidence: 0.9,
  isConfirmed: true,
};

const SAFE_VISIBILITY_SIGNAL: VisibilitySignal = {
  inferredVisibility: 'anonymous',
  isConfirmed: true,
};

const SAFE_END_DATE_SIGNAL: EndDateSignal = {
  hasInferredDate: true,
  confidence: 0.9,
  isConfirmed: true,
};

const SAFE_PRIVACY_SIGNAL: PrivacyThresholdSignal = {
  privacyRisk: false,
  thresholdConfirmed: true,
};

const SAFE_OUT_OF_SCOPE_SIGNAL: OutOfScopeRequestSignal = {
  hasOutOfScopeRequest: false,
  sanitizedRequestDescription: '',
};

const SINGLE_SCOPE_SIGNAL: SurveyScopeSignal = {
  sanitizedLabel: 'QS Clima 2025',
  confidence: 0.95,
  isSelected: true,
};

const SINGLE_FILE_SIGNAL: FileSignal = {
  sanitizedLabel: 'resumen_total.xlsx',
  confidence: 0.95,
};

/**
 * Builds a fully safe, unambiguous input snapshot.
 * Override individual fields to trigger specific ambiguities.
 */
function buildSafeInput(
  overrides: Partial<AmbiguityDetectionInput> = {},
): AmbiguityDetectionInput {
  return {
    detectedSurveyScopes: [SINGLE_SCOPE_SIGNAL],
    surveyNameSignal: SAFE_NAME_SIGNAL,
    surveyTypeSignal: SAFE_TYPE_SIGNAL,
    visibilitySignal: SAFE_VISIBILITY_SIGNAL,
    endDateSignal: SAFE_END_DATE_SIGNAL,
    fileSignals: [SINGLE_FILE_SIGNAL],
    associatedFileSignals: [],
    questionScaleSignals: [],
    demographicMappingSignals: [],
    dimensionMappingSignals: [],
    segmentCutSignals: [],
    privacyThresholdSignal: SAFE_PRIVACY_SIGNAL,
    duplicateOrConflictSignals: [],
    outOfScopeRequestSignal: SAFE_OUT_OF_SCOPE_SIGNAL,
    currentStep: 'confirming_survey_type',
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('detectHistoricalImportAmbiguities', () => {
  // 1. No ambiguity when snapshot is complete and safe
  it('returns no ambiguities when snapshot is complete and safe', () => {
    const result = detectHistoricalImportAmbiguities(buildSafeInput());
    expect(result.activeAmbiguity).toBeUndefined();
    expect(result.pendingAmbiguities).toHaveLength(0);
    expect(result.resolvedAmbiguities).toHaveLength(0);
    expect(result.hasBlockingAmbiguity).toBe(false);
  });

  // 2. MultipleSurveyScopeAmbiguity when several scopes, none selected
  it('detects MultipleSurveyScopeAmbiguity when multiple scopes and none selected', () => {
    const scopes: SurveyScopeSignal[] = [
      { sanitizedLabel: 'QS Clima 2025', confidence: 0.8, isSelected: false },
      { sanitizedLabel: 'QS Clima 2024', confidence: 0.75, isSelected: false },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ detectedSurveyScopes: scopes }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('MultipleSurveyScopeAmbiguity');
    expect(active?.options).toHaveLength(2);
    expect(active?.severity).toBe('high');
  });

  // 3. SurveyTypeAmbiguity when type not confirmed
  it('detects SurveyTypeAmbiguity when type is unknown and not confirmed', () => {
    const typeSignal: SurveyTypeSignal = {
      inferredType: 'unknown',
      confidence: 0.3,
      isConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ surveyTypeSignal: typeSignal }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('SurveyTypeAmbiguity');
    expect(active?.options).toHaveLength(3);
    expect(active?.options.map((o) => o.label)).toEqual(['Clima', 'Cultura', 'NPS']);
  });

  // 4. VisibilityAmbiguity when visibility not confirmed
  it('detects VisibilityAmbiguity when visibility is unknown', () => {
    const visSignal: VisibilitySignal = {
      inferredVisibility: 'unknown',
      isConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ visibilitySignal: visSignal }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('VisibilityAmbiguity');
    expect(active?.options).toHaveLength(2);
    expect(active?.options.map((o) => o.label)).toEqual(['Anónimo', 'Público']);
  });

  // 5. EndDateAmbiguity when date has low confidence
  it('detects EndDateAmbiguity when date confidence is low', () => {
    const dateSignal: EndDateSignal = {
      hasInferredDate: true,
      confidence: 0.4,
      isConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ endDateSignal: dateSignal }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('EndDateAmbiguity');
    expect(active?.expectedInput.kind).toBe('free_text');
  });

  // 6. MainFileAmbiguity when multiple candidate main files
  it('detects MainFileAmbiguity when multiple main file candidates exist', () => {
    const files: FileSignal[] = [
      { sanitizedLabel: 'resumen_total.xlsx', confidence: 0.75 },
      { sanitizedLabel: 'respuestas_raw.xlsx', confidence: 0.7 },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ fileSignals: files }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('MainFileAmbiguity');
    expect(active?.options).toHaveLength(2);
  });

  // 7. AssociatedFilesAmbiguity when associated file role is dubious
  it('detects AssociatedFilesAmbiguity when associated file role is ambiguous', () => {
    const assocFiles: AssociatedFileSignal[] = [
      { sanitizedLabel: 'segmento_gerencia.xlsx', roleIsAmbiguous: true },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ associatedFileSignals: assocFiles }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('AssociatedFilesAmbiguity');
    expect(active?.options).toHaveLength(1);
    expect(active?.options[0].label).toBe('segmento_gerencia.xlsx');
  });

  // 8. QuestionScaleAmbiguity when scale is unconfirmed
  it('detects QuestionScaleAmbiguity when a scale is unconfirmed', () => {
    const qsSignals: QuestionScaleSignal[] = [
      { sanitizedLabel: 'Pregunta 12 – Escala desconocida', isUnconfirmed: true },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ questionScaleSignals: qsSignals }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('QuestionScaleAmbiguity');
    expect(active?.options[0].label).toBe('Pregunta 12 – Escala desconocida');
  });

  // 9. DemographicMappingAmbiguity when column has multiple mappings
  it('detects DemographicMappingAmbiguity when a column has multiple possible mappings', () => {
    const demoSignals: DemographicMappingSignal[] = [
      { sanitizedLabel: 'Área o Departamento', possibleMappingCount: 3 },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ demographicMappingSignals: demoSignals }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('DemographicMappingAmbiguity');
    expect(active?.options[0].label).toBe('Área o Departamento');
  });

  // 10. DimensionMappingAmbiguity when question has multiple dimension candidates
  it('detects DimensionMappingAmbiguity when a question has multiple dimension candidates', () => {
    const dimSignals: DimensionMappingSignal[] = [
      { sanitizedLabel: 'Pregunta 5 – Liderazgo / Comunicación', possibleDimensionCount: 2 },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ dimensionMappingSignals: dimSignals }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('DimensionMappingAmbiguity');
    expect(active?.options[0].label).toBe('Pregunta 5 – Liderazgo / Comunicación');
  });

  // 11. SegmentCutAmbiguity when segment/cut role is dubious
  it('detects SegmentCutAmbiguity when segment/cut role is ambiguous', () => {
    const segSignals: SegmentCutSignal[] = [
      { sanitizedLabel: 'gerencia_area_col.xlsx', possibleRoleCount: 3 },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ segmentCutSignals: segSignals }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('SegmentCutAmbiguity');
    expect(active?.options[0].label).toBe('gerencia_area_col.xlsx');
  });

  // 12. PrivacyThresholdAmbiguity blocking when privacyRisk is true
  it('detects PrivacyThresholdAmbiguity as blocking when privacyRisk is true', () => {
    const privacySignal: PrivacyThresholdSignal = {
      privacyRisk: true,
      thresholdConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ privacyThresholdSignal: privacySignal }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('PrivacyThresholdAmbiguity');
    expect(active?.severity).toBe('blocking');
    expect(active?.privacyFlags.privacyRisk).toBe(true);
    expect(active?.privacyFlags.requiresExplicitConfirmation).toBe(true);
    expect(result.hasBlockingAmbiguity).toBe(true);
    expect(active?.blockingReason).toBeDefined();
  });

  // 13. DuplicateOrConflictAmbiguity when conflict detected
  it('detects DuplicateOrConflictAmbiguity when conflict signals exist', () => {
    const conflictSignals: DuplicateOrConflictSignal[] = [
      {
        sanitizedLabels: ['resumen_2024.xlsx', 'respuestas_2024.xlsx'],
        sanitizedConflictDescription: 'Ambos archivos contienen datos del mismo ciclo con columnas solapadas.',
      },
    ];
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ duplicateOrConflictSignals: conflictSignals }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('DuplicateOrConflictAmbiguity');
    expect(active?.severity).toBe('high');
    expect(active?.options[0].label).toContain('resumen_2024.xlsx');
  });

  // 14. OutOfScopeRequestAmbiguity when user requests dashboard/comparison/real import
  it('detects OutOfScopeRequestAmbiguity when user requests an out-of-scope action', () => {
    const oos: OutOfScopeRequestSignal = {
      hasOutOfScopeRequest: true,
      sanitizedRequestDescription: 'Solicitud de comparativo de encuestas.',
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ outOfScopeRequestSignal: oos }),
    );
    const active = result.activeAmbiguity;
    expect(active).toBeDefined();
    expect(active?.type).toBe('OutOfScopeRequestAmbiguity');
    expect(active?.status).toBe('out_of_scope_redirected');
    expect(active?.severity).toBe('blocking');
    expect(result.hasBlockingAmbiguity).toBe(true);
  });

  // 15. activeAmbiguity respects deterministic priority order
  it('respects deterministic priority: PrivacyThreshold > OutOfScope > MultipleSurveyScope', () => {
    const scopes: SurveyScopeSignal[] = [
      { sanitizedLabel: 'QS Clima 2025', confidence: 0.8, isSelected: false },
      { sanitizedLabel: 'QS Clima 2024', confidence: 0.75, isSelected: false },
    ];
    const oos: OutOfScopeRequestSignal = {
      hasOutOfScopeRequest: true,
      sanitizedRequestDescription: 'Solicitud de dashboard.',
    };
    const privacySignal: PrivacyThresholdSignal = {
      privacyRisk: true,
      thresholdConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({
        detectedSurveyScopes: scopes,
        outOfScopeRequestSignal: oos,
        privacyThresholdSignal: privacySignal,
      }),
    );
    // PrivacyThreshold has highest priority
    expect(result.activeAmbiguity?.type).toBe('PrivacyThresholdAmbiguity');
    // OutOfScope should be in pendingAmbiguities
    const pendingTypes = result.pendingAmbiguities.map((a) => a.type);
    expect(pendingTypes).toContain('OutOfScopeRequestAmbiguity');
    // MultipleSurveyScope should also be pending
    expect(pendingTypes).toContain('MultipleSurveyScopeAmbiguity');
    // OutOfScope must come before MultipleSurveyScope in pending
    const oosIdx = pendingTypes.indexOf('OutOfScopeRequestAmbiguity');
    const msIdx = pendingTypes.indexOf('MultipleSurveyScopeAmbiguity');
    expect(oosIdx).toBeLessThan(msIdx);
  });

  // 16. IDs are deterministic — same input always produces same IDs
  it('produces deterministic IDs for the same input', () => {
    const typeSignal: SurveyTypeSignal = {
      inferredType: 'unknown',
      confidence: 0.2,
      isConfirmed: false,
    };
    const input = buildSafeInput({ surveyTypeSignal: typeSignal });
    const result1 = detectHistoricalImportAmbiguities(input);
    const result2 = detectHistoricalImportAmbiguities(input);
    expect(result1.activeAmbiguity?.id).toBe(result2.activeAmbiguity?.id);
    expect(result1.activeAmbiguity?.options.map((o) => o.id)).toEqual(
      result2.activeAmbiguity?.options.map((o) => o.id),
    );
  });

  // 17. Input is not mutated
  it('does not mutate the input snapshot', () => {
    const scopes: SurveyScopeSignal[] = [
      { sanitizedLabel: 'QS Clima 2025', confidence: 0.8, isSelected: false },
      { sanitizedLabel: 'QS Clima 2024', confidence: 0.75, isSelected: false },
    ];
    const input = buildSafeInput({ detectedSurveyScopes: scopes });
    const originalScopesLength = input.detectedSurveyScopes.length;
    const originalStep = input.currentStep;
    detectHistoricalImportAmbiguities(input);
    // Input arrays and fields must be unchanged
    expect(input.detectedSurveyScopes.length).toBe(originalScopesLength);
    expect(input.currentStep).toBe(originalStep);
    expect(input.detectedSurveyScopes[0].sanitizedLabel).toBe('QS Clima 2025');
  });

  // 18. Privacy safety: resolvedAmbiguities is always empty in H47
  it('never exposes PII or raw rows — resolvedAmbiguities is always empty in H47', () => {
    const typeSignal: SurveyTypeSignal = {
      inferredType: 'unknown',
      confidence: 0.2,
      isConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({ surveyTypeSignal: typeSignal }),
    );
    // No resolution applied in H47
    expect(result.resolvedAmbiguities).toHaveLength(0);
    // No PII in explanation
    const explanation = result.activeAmbiguity?.userFacingExplanation ?? '';
    expect(explanation).not.toMatch(/@/); // no emails
    expect(explanation).not.toMatch(/\d{8,}/); // no long numeric IDs
    // options labels are sanitized (no raw workbook headers)
    const optionLabels = result.activeAmbiguity?.options.map((o) => o.label) ?? [];
    optionLabels.forEach((label) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  // Additional: assert pendingAmbiguities ordering is deterministic
  it('orders pendingAmbiguities deterministically by priority order', () => {
    const typeSignal: SurveyTypeSignal = {
      inferredType: 'unknown',
      confidence: 0.2,
      isConfirmed: false,
    };
    const visSignal: VisibilitySignal = {
      inferredVisibility: 'unknown',
      isConfirmed: false,
    };
    const dateSignal: EndDateSignal = {
      hasInferredDate: false,
      confidence: 0,
      isConfirmed: false,
    };
    const result = detectHistoricalImportAmbiguities(
      buildSafeInput({
        surveyTypeSignal: typeSignal,
        visibilitySignal: visSignal,
        endDateSignal: dateSignal,
      }),
    );
    // SurveyTypeAmbiguity (priority 6) > VisibilityAmbiguity (7) > EndDateAmbiguity (8)
    const types = [
      result.activeAmbiguity?.type,
      ...result.pendingAmbiguities.map((a) => a.type),
    ];
    const surveyTypeIdx = types.indexOf('SurveyTypeAmbiguity');
    const visibilityIdx = types.indexOf('VisibilityAmbiguity');
    const endDateIdx = types.indexOf('EndDateAmbiguity');
    expect(surveyTypeIdx).toBeLessThan(visibilityIdx);
    expect(visibilityIdx).toBeLessThan(endDateIdx);
  });
});
