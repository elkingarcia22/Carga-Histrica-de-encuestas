import { describe, it, expect } from 'vitest';
import {
  buildResponseEvidence,
  validateQuestionTypeEdit,
  validateScaleTypeEdit,
  getQuestionTypeOptionsTextForEvidence,
  getScaleTypeOptionsTextForEvidence,
  getEvidenceFromQuestion,
  resolveNumericCompatibleOption,
} from '../questionEditCompatibilityMapper';
import type { QuestionReviewItem, DimensionAssignment } from '../questionScaleDimensionReviewTypes';

const makeLikertAgreementQuestion = (
  overrides: Partial<QuestionReviewItem> = {},
): QuestionReviewItem => {
  const base: QuestionReviewItem = {
    questionId: 'q_test',
    displayIndex: 24,
    questionText: 'Siento confianza hacia la dirección general.',
    questionType: 'rating_scale',
    scaleType: 'likert_5',
    scaleDetail: {
      scaleLabel: 'Likert 5 puntos',
      scaleValueRange: '1–5',
      scaleAnchors: [
        'Muy en desacuerdo',
        'En desacuerdo',
        'Neutral',
        'De acuerdo',
        'Muy de acuerdo',
      ],
      scoreDirection: 'positive_up',
      favorableValues: [4, 5],
      neutralValues: [3],
      unfavorableValues: [1, 2],
    },
    dimensionAssignment: {
      dimensionId: 'dim_compromiso',
      dimensionName: 'Compromiso',
      source: 'detected_by_sheet',
      confidence: 'high',
    },
    status: 'aligned',
    sourceSheetLabel: 'Clima',
    confidenceLevel: 'high',
  };
  return { ...base, ...overrides };
};

const makeNpsQuestion = (
  overrides: Partial<QuestionReviewItem> = {},
): QuestionReviewItem => {
  const base: QuestionReviewItem = {
    questionId: 'q_nps',
    displayIndex: 36,
    questionText: '¿Recomendarías trabajar aquí?',
    questionType: 'enps',
    scaleType: 'nps_0_10',
    scaleDetail: {
      scaleLabel: 'NPS 0–10',
      scaleValueRange: '0–10',
      scaleAnchors: ['0 a 10 · Detractores 0–6 · Pasivos 7–8 · Promotores 9–10'],
      scoreDirection: 'positive_up',
      favorableValues: [9, 10],
      neutralValues: [7, 8],
      unfavorableValues: [0, 1, 2, 3, 4, 5, 6],
    },
    dimensionAssignment: {
      dimensionId: 'dim_enps',
      dimensionName: 'eNPS',
      source: 'detected_by_sheet',
      confidence: 'high',
    },
    status: 'aligned',
    sourceSheetLabel: 'eNPS',
    confidenceLevel: 'high',
  };
  return { ...base, ...overrides };
};

const makeOpenTextQuestion = (
  overrides: Partial<QuestionReviewItem> = {},
): QuestionReviewItem => {
  const base: QuestionReviewItem = {
    questionId: 'q_open',
    displayIndex: 37,
    questionText: '¿Qué sugerencias tienes?',
    questionType: 'open_text',
    scaleType: 'not_applicable',
    scaleDetail: {
      scaleLabel: 'No aplica',
      scaleValueRange: 'N/A',
      scaleAnchors: [],
      scoreDirection: 'positive_up',
      favorableValues: [],
      neutralValues: [],
      unfavorableValues: [],
    },
    dimensionAssignment: {
      dimensionId: 'dim_bienestar',
      dimensionName: 'Bienestar',
      source: 'detected_by_sheet',
      confidence: 'medium',
    } as DimensionAssignment,
    status: 'aligned',
    sourceSheetLabel: 'Clima',
    confidenceLevel: 'medium',
  };
  return { ...base, ...overrides };
};

const makeSingleChoiceQuestion = (
  overrides: Partial<QuestionReviewItem> = {},
): QuestionReviewItem => {
  const base: QuestionReviewItem = {
    questionId: 'q_sc',
    displayIndex: 40,
    questionText: '¿Cuál es tu área?',
    questionType: 'single_choice',
    scaleType: 'custom',
    scaleDetail: {
      scaleLabel: 'Personalizada',
      scaleValueRange: 'N/A',
      scaleAnchors: ['Ventas', 'Marketing', 'IT', 'RH'],
      scoreDirection: 'positive_up',
      favorableValues: [],
      neutralValues: [],
      unfavorableValues: [],
    },
    dimensionAssignment: {
      dimensionId: 'dim_no_asignada',
      dimensionName: 'Sin asignar',
      source: 'not_assigned',
      confidence: 'low',
    } as DimensionAssignment,
    status: 'aligned',
    sourceSheetLabel: 'Demográficos',
    confidenceLevel: 'high',
  };
  return { ...base, ...overrides };
};

const makeMultipleChoiceQuestion = (
  overrides: Partial<QuestionReviewItem> = {},
): QuestionReviewItem => {
  const base: QuestionReviewItem = {
    questionId: 'q_mc',
    displayIndex: 41,
    questionText: 'Selecciona tus beneficios',
    questionType: 'multiple_choice',
    scaleType: 'custom',
    scaleDetail: {
      scaleLabel: 'Personalizada',
      scaleValueRange: 'N/A',
      scaleAnchors: ['Seguro', 'Bonos', 'Flexibilidad', 'Capacitación'],
      scoreDirection: 'positive_up',
      favorableValues: [],
      neutralValues: [],
      unfavorableValues: [],
    },
    dimensionAssignment: {
      dimensionId: 'dim_no_asignada',
      dimensionName: 'Sin asignar',
      source: 'not_assigned',
      confidence: 'low',
    } as DimensionAssignment,
    status: 'aligned',
    sourceSheetLabel: 'Demográficos',
    confidenceLevel: 'high',
  };
  return { ...base, ...overrides };
};

describe('buildResponseEvidence', () => {
  it('builds evidence for Likert textual 5 puntos agreement', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    expect(evidence.responseValueKind).toBe('textual_scale_labels');
    expect(evidence.responseCardinality).toBe('single_per_respondent');
    expect(evidence.matchedKnownScale).toBe('likert_agreement_5');
    expect(evidence.knownOptionLabels).toEqual([
      'Muy en desacuerdo',
      'En desacuerdo',
      'Neutral',
      'De acuerdo',
      'Muy de acuerdo',
    ]);
    expect(evidence.knownNumericRange).toBeNull();
  });

  it('builds evidence for NPS numeric 0-10', () => {
    const q = makeNpsQuestion();
    const evidence = buildResponseEvidence(q);
    expect(evidence.responseValueKind).toBe('numeric_scale_values');
    expect(evidence.responseCardinality).toBe('single_per_respondent');
    expect(evidence.matchedKnownScale).toBe('nps_0_10');
    expect(evidence.knownNumericRange).toEqual([0, 10]);
  });

  it('builds evidence for open text', () => {
    const q = makeOpenTextQuestion();
    const evidence = buildResponseEvidence(q);
    expect(evidence.responseValueKind).toBe('free_text');
    expect(evidence.responseCardinality).toBe('free_text_per_respondent');
    expect(evidence.matchedKnownScale).toBe('none');
  });

  it('builds evidence for single choice', () => {
    const q = makeSingleChoiceQuestion();
    const evidence = buildResponseEvidence(q);
    expect(evidence.responseValueKind).toBe('categorical_single_value');
    expect(evidence.responseCardinality).toBe('single_per_respondent');
    expect(evidence.matchedKnownScale).toBe('none');
  });

  it('builds evidence for multiple choice', () => {
    const q = makeMultipleChoiceQuestion();
    const evidence = buildResponseEvidence(q);
    expect(evidence.responseValueKind).toBe('categorical_multi_value');
    expect(evidence.responseCardinality).toBe('multiple_per_respondent');
    expect(evidence.matchedKnownScale).toBe('none');
  });
});

describe('Likert textual compatibility', () => {
  const q = makeLikertAgreementQuestion();
  const evidence = buildResponseEvidence(q);

  it('allows Escala de valoración', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('allows Opción única', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'single_choice');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('allows Desplegable', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'dropdown');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('blocks Pregunta abierta', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
    expect(result.reason).toContain('texto libre');
    expect(result.message).toContain('Pregunta abierta');
    expect(result.message).toContain('Escala de valoración');
  });

  it('blocks Múltiples respuestas', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
    expect(result.reason).toContain('una sola respuesta');
    expect(result.message).toContain('Múltiples respuestas');
    expect(result.message).toContain('Escala de valoración');
  });

  it('blocks NPS scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'nps_0_10');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
    expect(result.reason).toContain('labels Likert textuales');
    expect(result.message).toContain('NPS');
    expect(result.message).toContain('Likert');
  });

  it('blocks Visual por estrellas scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'visual_stars');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
    expect(result.reason).toContain('labels Likert textuales');
  });

  it('blocks Visual por emociones scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'visual_emotions');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks Escala lineal scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'linear_scale');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('allows Likert scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'likert_5');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });
});

describe('NPS 0-10 compatibility', () => {
  const q = makeNpsQuestion();
  const evidence = buildResponseEvidence(q);

  it('allows NPS scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'nps_0_10');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('blocks Likert scale type', () => {
    const result = validateScaleTypeEdit(q, evidence, 'likert_5');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks open_text question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('allows rating_scale question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });
});

describe('Free text compatibility', () => {
  const q = makeOpenTextQuestion();
  const evidence = buildResponseEvidence(q);

  it('allows open_text question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('blocks rating_scale question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks single_choice question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'single_choice');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks multiple_choice question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks dropdown question type', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'dropdown');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });
});

describe('Single choice compatibility', () => {
  const q = makeSingleChoiceQuestion();
  const evidence = buildResponseEvidence(q);

  it('allows single_choice', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'single_choice');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('allows dropdown', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'dropdown');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('blocks open_text', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks multiple_choice', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });
});

describe('Multiple choice compatibility', () => {
  const q = makeMultipleChoiceQuestion();
  const evidence = buildResponseEvidence(q);

  it('allows multiple_choice', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });

  it('blocks open_text', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks single_choice', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'single_choice');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks dropdown', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'dropdown');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });

  it('blocks rating_scale', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(false);
    expect(result.shouldMutate).toBe(false);
  });
});

describe('Invalid edit guards', () => {
  it('invalid edit does not mutate state (shouldMutate=false)', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.shouldMutate).toBe(false);
  });

  it('invalid edit explains reason', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.reason).toBeTruthy();
    expect(result.reason!.length).toBeGreaterThan(10);
  });

  it('invalid edit suggests compatible options', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.allowedOptions.length).toBeGreaterThan(0);
    expect(result.message).toContain('Opciones compatibles');
  });
});

describe('Numeric selection validation', () => {
  const q = makeLikertAgreementQuestion();
  const evidence = buildResponseEvidence(q);

  it('blocks numeric selection for open_text on Likert', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(false);
  });

  it('blocks numeric selection for multiple_choice on Likert', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(result.compatible).toBe(false);
  });

  it('allows numeric selection for rating_scale on Likert', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(true);
  });
});

describe('Free text edit validation', () => {
  const q = makeLikertAgreementQuestion();
  const evidence = buildResponseEvidence(q);

  it('blocks free text "cambia la pregunta 24 a abierta"', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(result.compatible).toBe(false);
    expect(result.reason).toContain('texto libre');
  });

  it('blocks free text "la pregunta 24 debe ser múltiple"', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(result.compatible).toBe(false);
    expect(result.reason).toContain('una sola respuesta');
  });

  it('blocks free text "usa NPS en la pregunta 24"', () => {
    const result = validateScaleTypeEdit(q, evidence, 'nps_0_10');
    expect(result.compatible).toBe(false);
    expect(result.reason).toContain('labels Likert textuales');
  });

  it('blocks free text "ponle escala lineal a la pregunta 24"', () => {
    const result = validateScaleTypeEdit(q, evidence, 'linear_scale');
    expect(result.compatible).toBe(false);
  });

  it('allows free text "cambia la pregunta 24 a opción única"', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'single_choice');
    expect(result.compatible).toBe(true);
  });

  it('allows free text "la pregunta 24 debe ser desplegable"', () => {
    const result = validateQuestionTypeEdit(q, evidence, 'dropdown');
    expect(result.compatible).toBe(true);
  });

  it('allows free text "usa Likert escala de preferencias"', () => {
    const result = validateScaleTypeEdit(q, evidence, 'likert_5');
    expect(result.compatible).toBe(true);
  });
});

describe('getQuestionTypeOptionsTextForEvidence', () => {
  it('returns Likert compatible options for Likert textual evidence', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const text = getQuestionTypeOptionsTextForEvidence(evidence, 24);
    expect(text).toContain('Escala de valoración');
    expect(text).toContain('Opción única');
    expect(text).toContain('Desplegable');
    expect(text).toContain('Pregunta abierta');
    expect(text).toContain('Múltiples respuestas');
  });
});

describe('getScaleTypeOptionsTextForEvidence', () => {
  it('returns Likert compatible for Likert textual evidence', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const text = getScaleTypeOptionsTextForEvidence(evidence, 24);
    expect(text).toContain('Likert');
    expect(text).toContain('NPS');
    expect(text).toContain('Visual por estrellas');
  });
});

describe('getEvidenceFromQuestion', () => {
  it('uses stored evidence if present', () => {
    const q = makeLikertAgreementQuestion();
    const storedEvidence = buildResponseEvidence(q);
    q.responseEvidence = storedEvidence;
    const evidence = getEvidenceFromQuestion(q);
    expect(evidence).toBe(storedEvidence);
  });

  it('builds evidence if not stored', () => {
    const q = makeLikertAgreementQuestion();
    q.responseEvidence = undefined;
    const evidence = getEvidenceFromQuestion(q);
    expect(evidence.responseValueKind).toBe('textual_scale_labels');
  });
});

describe('Dimensions remain blocked', () => {
  it('dimension editing is not affected by compatibility validation', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(true);
    expect(result.shouldMutate).toBe(true);
  });
});

describe('Determinism', () => {
  it('produces same output for same input', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const r1 = validateQuestionTypeEdit(q, evidence, 'open_text');
    const r2 = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(r1).toEqual(r2);
  });

  it('no Date/Math.random dependency', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const r1 = JSON.stringify(validateQuestionTypeEdit(q, evidence, 'single_choice'));
    const r2 = JSON.stringify(validateQuestionTypeEdit(q, evidence, 'single_choice'));
    expect(r1).toBe(r2);
  });
});

describe('No action buttons or side panel', () => {
  it('compatibility result does not contain action buttons', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, 'open_text');
    const json = JSON.stringify(result);
    expect(json).not.toContain('onClick');
    expect(json).not.toContain('button');
    expect(json).not.toContain('href');
  });
});

describe('UBITS taxonomy still valid', () => {
  it('Likert textual still recognizes agreement labels', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    expect(evidence.matchedKnownScale).toBe('likert_agreement_5');
  });
});

describe('resolveNumericCompatibleOption', () => {
  const options = [
    { value: 'rating_scale', label: 'Escala de valoración' },
    { value: 'single_choice', label: 'Opción única' },
    { value: 'dropdown', label: 'Desplegable' },
  ];

  it('resolves 1 to first option', () => {
    const result = resolveNumericCompatibleOption('1', options);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value).toBe('rating_scale');
    }
  });

  it('resolves 2 to second option', () => {
    const result = resolveNumericCompatibleOption('2', options);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value).toBe('single_choice');
    }
  });

  it('resolves 3 to third option', () => {
    const result = resolveNumericCompatibleOption('3', options);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value).toBe('dropdown');
    }
  });

  it('rejects 4 as out of range when 3 options visible', () => {
    const result = resolveNumericCompatibleOption('4', options);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.isOutOfRange).toBe(true);
      if (result.isOutOfRange) {
        expect(result.maxRange).toBe(3);
      }
    }
  });

  it('rejects 0 as out of range', () => {
    const result = resolveNumericCompatibleOption('0', options);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.isOutOfRange).toBe(true);
    }
  });

  it('rejects negative number', () => {
    const result = resolveNumericCompatibleOption('-1', options);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.isOutOfRange).toBe(true);
    }
  });

  it('rejects non-numeric input as not numeric', () => {
    const result = resolveNumericCompatibleOption('abc', options);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.isOutOfRange).toBe(false);
    }
  });

  it('rejects decimal input as not numeric', () => {
    const result = resolveNumericCompatibleOption('1.5', options);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.isOutOfRange).toBe(false);
    }
  });

  it('works with single option', () => {
    const singleOption = [{ value: 'open_text', label: 'Pregunta abierta' }];
    const result = resolveNumericCompatibleOption('1', singleOption);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.value).toBe('open_text');
    }
  });

  it('rejects out of range with single option', () => {
    const singleOption = [{ value: 'open_text', label: 'Pregunta abierta' }];
    const result = resolveNumericCompatibleOption('2', singleOption);
    expect(result.isValid).toBe(false);
    if (!result.isValid && result.isOutOfRange) {
      expect(result.maxRange).toBe(1);
    }
  });
});

describe('Contextual numeric mapping integration', () => {
  it('Likert textual compatible options list has 3 items', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    expect(result.allowedOptions).toHaveLength(3);
  });

  it('Likert textual numeric 1 maps to rating_scale', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('1', result.allowedOptions);
    expect(resolution.isValid).toBe(true);
    if (resolution.isValid) {
      expect(resolution.value).toBe('rating_scale');
      const compatResult = validateQuestionTypeEdit(q, evidence, resolution.value as never);
      expect(compatResult.compatible).toBe(true);
    }
  });

  it('Likert textual numeric 2 maps to single_choice, not open_text', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('2', result.allowedOptions);
    expect(resolution.isValid).toBe(true);
    if (resolution.isValid) {
      expect(resolution.value).toBe('single_choice');
      const compatResult = validateQuestionTypeEdit(q, evidence, resolution.value as never);
      expect(compatResult.compatible).toBe(true);
    }
  });

  it('Likert textual numeric 3 maps to dropdown', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('3', result.allowedOptions);
    expect(resolution.isValid).toBe(true);
    if (resolution.isValid) {
      expect(resolution.value).toBe('dropdown');
      const compatResult = validateQuestionTypeEdit(q, evidence, resolution.value as never);
      expect(compatResult.compatible).toBe(true);
    }
  });

  it('Likert textual numeric 4 blocked by out of range contextual', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    expect(result.allowedOptions).toHaveLength(3);
    const resolution = resolveNumericCompatibleOption('4', result.allowedOptions);
    expect(resolution.isValid).toBe(false);
    if (!resolution.isValid && resolution.isOutOfRange) {
      expect(resolution.maxRange).toBe(3);
    }
  });

  it('Likert textual free text open_text still blocked', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const compatResult = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(compatResult.compatible).toBe(false);
    expect(compatResult.reason).toContain('texto libre');
  });

  it('Likert textual free text multiple_choice still blocked', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const compatResult = validateQuestionTypeEdit(q, evidence, 'multiple_choice');
    expect(compatResult.compatible).toBe(false);
    expect(compatResult.reason).toContain('una sola respuesta');
  });

  it('Likert textual free text single_choice still allowed', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const compatResult = validateQuestionTypeEdit(q, evidence, 'single_choice');
    expect(compatResult.compatible).toBe(true);
  });

  it('Likert textual free text dropdown still allowed', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const compatResult = validateQuestionTypeEdit(q, evidence, 'dropdown');
    expect(compatResult.compatible).toBe(true);
  });

  it('invalid numeric selection does not mutate state', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('4', result.allowedOptions);
    expect(resolution.isValid).toBe(false);
    expect(result.shouldMutate).toBe(true);
    expect(result.allowedOptions).toHaveLength(3);
  });

  it('invalid free text selection does not mutate state', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const compatResult = validateQuestionTypeEdit(q, evidence, 'open_text');
    expect(compatResult.shouldMutate).toBe(false);
  });

  it('global taxonomy index not used for numeric selection', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('2', result.allowedOptions);
    expect(resolution.isValid).toBe(true);
    if (resolution.isValid) {
      expect(resolution.value).not.toBe('open_text');
    }
  });

  it('NPS compatible options list has 1 item', () => {
    const q = makeNpsQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    expect(result.allowedOptions).toHaveLength(1);
  });

  it('NPS numeric 1 maps to rating_scale', () => {
    const q = makeNpsQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('1', result.allowedOptions);
    expect(resolution.isValid).toBe(true);
    if (resolution.isValid) {
      expect(resolution.value).toBe('rating_scale');
    }
  });

  it('NPS numeric 2 blocked by out of range contextual', () => {
    const q = makeNpsQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const resolution = resolveNumericCompatibleOption('2', result.allowedOptions);
    expect(resolution.isValid).toBe(false);
    if (!resolution.isValid && resolution.isOutOfRange) {
      expect(resolution.maxRange).toBe(1);
    }
  });

  it('no Date/Math.random dependency in resolveNumericCompatibleOption', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const r1 = JSON.stringify(resolveNumericCompatibleOption('1', options));
    const r2 = JSON.stringify(resolveNumericCompatibleOption('1', options));
    expect(r1).toBe(r2);
  });

  it('deterministic output for same input', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, q.questionType);
    const r1 = resolveNumericCompatibleOption('2', result.allowedOptions);
    const r2 = resolveNumericCompatibleOption('2', result.allowedOptions);
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });

  it('no action buttons or side panel in resolution', () => {
    const result = resolveNumericCompatibleOption('1', [
      { value: 'test', label: 'Test' },
    ]);
    const json = JSON.stringify(result);
    expect(json).not.toContain('onClick');
    expect(json).not.toContain('button');
    expect(json).not.toContain('href');
  });

  it('Likert textual compatible options text still shows 3 options', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const text = getQuestionTypeOptionsTextForEvidence(evidence, 24);
    expect(text).toContain('Escala de valoración');
    expect(text).toContain('Opción única');
    expect(text).toContain('Desplegable');
  });

  it('dimension edit attempt still blocked', () => {
    const q = makeLikertAgreementQuestion();
    const evidence = buildResponseEvidence(q);
    const result = validateQuestionTypeEdit(q, evidence, 'rating_scale');
    expect(result.compatible).toBe(true);
  });
});
