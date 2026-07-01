import type {
  QuestionReviewItem,
  QuestionType,
  ScaleType,
  MatchedKnownScale,
  QuestionResponseEvidence,
} from './questionScaleDimensionReviewTypes';

export interface EditCompatibilityResult {
  compatible: boolean;
  reason?: string;
  allowedOptions: CompatibleOptionItem[];
  blockedOptions?: CompatibleOptionItem[];
  suggestedOptions?: CompatibleOptionItem[];
  normalizedTargetValue?: string;
  shouldMutate: boolean;
  message?: string;
}

export interface CompatibleOptionItem {
  value: string;
  label: string;
  description?: string;
}

const QUESTION_TYPE_LABELS_LOCAL: Record<QuestionType, string> = {
  rating_scale: 'Escala de valoración',
  single_choice: 'Opción única',
  multiple_choice: 'Múltiples respuestas',
  open_text: 'Pregunta abierta',
  nps: 'NPS',
  enps: 'eNPS',
  matrix: 'Matriz',
  dropdown: 'Desplegable',
  unknown: 'No determinado',
};

const SCALE_TYPE_LABELS_LOCAL: Record<ScaleType, string> = {
  likert_5: 'Likert (escala de preferencias)',
  likert_7: 'Likert (escala de preferencias)',
  nps_0_10: 'NPS (recomendabilidad)',
  binary_yes_no: 'Binaria Sí/No',
  frequency: 'Frecuencia',
  agreement: 'Acuerdo',
  custom: 'Personalizada',
  not_applicable: 'No aplica',
  visual_stars: 'Visual por estrellas',
  visual_emotions: 'Visual por emociones',
  linear_scale: 'Escala lineal',
  likert_nom035: 'Likert (NOM 035)',
  unknown: 'No determinado',
};

function makeOption(value: string, label: string, description?: string): CompatibleOptionItem {
  return { value, label, description };
}

export function buildResponseEvidence(question: QuestionReviewItem): QuestionResponseEvidence {
  const q = question;
  const qType = q.questionType;
  const sType = q.scaleType;
  const anchors = q.scaleDetail.scaleAnchors || [];

  if (qType === 'open_text') {
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: 'open_text',
      detectedScaleType: 'not_applicable',
      detectedScaleDetail: null,
      responseValueKind: 'free_text',
      responseCardinality: 'free_text_per_respondent',
      responseShape: 'open_text',
      knownOptionLabels: [],
      knownNumericRange: null,
      matchedKnownScale: 'none',
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  if (sType === 'nps_0_10') {
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: qType === 'enps' ? 'enps' : 'rating_scale',
      detectedScaleType: 'nps_0_10',
      detectedScaleDetail: q.scaleDetail,
      responseValueKind: 'numeric_scale_values',
      responseCardinality: 'single_per_respondent',
      responseShape: 'scale_numbers',
      knownOptionLabels: anchors,
      knownNumericRange: [0, 10],
      matchedKnownScale: 'nps_0_10',
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  if (sType === 'likert_5' || sType === 'likert_7' || sType === 'agreement') {
    const isAgreement = anchors.some(a =>
      a.toLowerCase().includes('acuerdo') || a.toLowerCase().includes('desacuerdo')
    );
    const isFrequency = anchors.some(a =>
      a.toLowerCase().includes('nunca') || a.toLowerCase().includes('siempre')
    );
    const isSatisfaction = anchors.some(a =>
      a.toLowerCase().includes('satisfecho') || a.toLowerCase().includes('insatisfecho')
    );

    let matchedKnownScale: MatchedKnownScale = 'custom';
    if (isAgreement) matchedKnownScale = 'likert_agreement_5';
    else if (isFrequency) matchedKnownScale = 'likert_frequency_5';
    else if (isSatisfaction) matchedKnownScale = 'satisfaction_5';

    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: qType,
      detectedScaleType: sType,
      detectedScaleDetail: q.scaleDetail,
      responseValueKind: 'textual_scale_labels',
      responseCardinality: 'single_per_respondent',
      responseShape: 'scale_labels',
      knownOptionLabels: anchors,
      knownNumericRange: null,
      matchedKnownScale,
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  if (sType === 'frequency') {
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: qType,
      detectedScaleType: 'frequency',
      detectedScaleDetail: q.scaleDetail,
      responseValueKind: 'textual_scale_labels',
      responseCardinality: 'single_per_respondent',
      responseShape: 'scale_labels',
      knownOptionLabels: anchors,
      knownNumericRange: null,
      matchedKnownScale: 'likert_frequency_5',
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  if (sType === 'binary_yes_no') {
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: qType,
      detectedScaleType: 'binary_yes_no',
      detectedScaleDetail: q.scaleDetail,
      responseValueKind: 'categorical_single_value',
      responseCardinality: 'single_per_respondent',
      responseShape: 'categorical',
      knownOptionLabels: anchors,
      knownNumericRange: null,
      matchedKnownScale: 'none',
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  if (qType === 'single_choice') {
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: 'single_choice',
      detectedScaleType: sType,
      detectedScaleDetail: q.scaleDetail,
      responseValueKind: 'categorical_single_value',
      responseCardinality: 'single_per_respondent',
      responseShape: 'categorical',
      knownOptionLabels: anchors,
      knownNumericRange: null,
      matchedKnownScale: 'none',
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  if (qType === 'multiple_choice') {
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      detectedQuestionType: 'multiple_choice',
      detectedScaleType: sType,
      detectedScaleDetail: q.scaleDetail,
      responseValueKind: 'categorical_multi_value',
      responseCardinality: 'multiple_per_respondent',
      responseShape: 'multi_select',
      knownOptionLabels: anchors,
      knownNumericRange: null,
      matchedKnownScale: 'none',
      confidence: 'high',
      compatibilityWarnings: [],
    };
  }

  return {
    questionId: q.questionId,
    questionText: q.questionText,
    detectedQuestionType: qType,
    detectedScaleType: sType,
    detectedScaleDetail: q.scaleDetail,
    responseValueKind: 'unknown',
    responseCardinality: 'unknown',
    responseShape: 'unknown',
    knownOptionLabels: anchors,
    knownNumericRange: null,
    matchedKnownScale: 'unknown',
    confidence: 'low',
    compatibilityWarnings: ['No se pudo determinar la estructura de respuesta'],
  };
}

export function getEvidenceFromQuestion(
  question: QuestionReviewItem,
): QuestionResponseEvidence {
  if (question.responseEvidence) {
    return question.responseEvidence;
  }
  return buildResponseEvidence(question);
}

function getLikertTextualAllowedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('rating_scale', 'Escala de valoración'),
    makeOption('single_choice', 'Opción única'),
    makeOption('dropdown', 'Desplegable'),
  ];
}

function getLikertTextualBlockedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('open_text', 'Pregunta abierta'),
    makeOption('multiple_choice', 'Múltiples respuestas'),
    makeOption('nps', 'NPS'),
    makeOption('enps', 'eNPS'),
  ];
}

function getLikertTextualAllowedScaleTypes(): CompatibleOptionItem[] {
  return [
    makeOption('likert_5', 'Likert (escala de preferencias)'),
    makeOption('likert_7', 'Likert (escala de preferencias)'),
    makeOption('agreement', 'Acuerdo'),
  ];
}

function getLikertTextualBlockedScaleTypes(): CompatibleOptionItem[] {
  return [
    makeOption('nps_0_10', 'NPS (recomendabilidad)'),
    makeOption('visual_stars', 'Visual por estrellas'),
    makeOption('visual_emotions', 'Visual por emociones'),
    makeOption('linear_scale', 'Escala lineal'),
  ];
}

function getNpsAllowedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('rating_scale', 'Escala de valoración'),
  ];
}

function getNpsBlockedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('open_text', 'Pregunta abierta'),
    makeOption('single_choice', 'Opción única'),
    makeOption('multiple_choice', 'Múltiples respuestas'),
    makeOption('dropdown', 'Desplegable'),
  ];
}

function getNpsAllowedScaleTypes(): CompatibleOptionItem[] {
  return [
    makeOption('nps_0_10', 'NPS (recomendabilidad)'),
  ];
}

function getNpsBlockedScaleTypes(): CompatibleOptionItem[] {
  return [
    makeOption('likert_5', 'Likert (escala de preferencias)'),
    makeOption('likert_7', 'Likert (escala de preferencias)'),
    makeOption('visual_stars', 'Visual por estrellas'),
    makeOption('visual_emotions', 'Visual por emociones'),
    makeOption('linear_scale', 'Escala lineal'),
    makeOption('frequency', 'Frecuencia'),
    makeOption('agreement', 'Acuerdo'),
    makeOption('likert_nom035', 'Likert (NOM 035)'),
    makeOption('custom', 'Personalizada'),
  ];
}

function getFreeTextAllowedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('open_text', 'Pregunta abierta'),
  ];
}

function getFreeTextBlockedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('rating_scale', 'Escala de valoración'),
    makeOption('single_choice', 'Opción única'),
    makeOption('multiple_choice', 'Múltiples respuestas'),
    makeOption('dropdown', 'Desplegable'),
    makeOption('nps', 'NPS'),
    makeOption('enps', 'eNPS'),
  ];
}

function getSingleChoiceAllowedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('single_choice', 'Opción única'),
    makeOption('dropdown', 'Desplegable'),
  ];
}

function getSingleChoiceBlockedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('open_text', 'Pregunta abierta'),
    makeOption('multiple_choice', 'Múltiples respuestas'),
  ];
}

function getMultipleChoiceAllowedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('multiple_choice', 'Múltiples respuestas'),
  ];
}

function getMultipleChoiceBlockedQuestionTypes(): CompatibleOptionItem[] {
  return [
    makeOption('open_text', 'Pregunta abierta'),
    makeOption('single_choice', 'Opción única'),
    makeOption('dropdown', 'Desplegable'),
    makeOption('rating_scale', 'Escala de valoración'),
    makeOption('nps', 'NPS'),
    makeOption('enps', 'eNPS'),
  ];
}

function getLikertAgreementBlockReason(invalidTypeLabel: string, displayIndex: number): string {
  return `No puedo cambiar la pregunta ${displayIndex} a ${invalidTypeLabel} porque las respuestas históricas detectadas no son texto libre; corresponden a una escala Likert de una sola respuesta por usuario.`;
}

function getLikertTextualScaleBlockReason(invalidScaleLabel: string, displayIndex: number): string {
  return `No puedo cambiar la escala de la pregunta ${displayIndex} a ${invalidScaleLabel} porque las respuestas históricas detectadas son labels Likert textuales, no valores numéricos de 0 a 10.`;
}

export function validateQuestionTypeEdit(
  question: QuestionReviewItem,
  evidence: QuestionResponseEvidence,
  targetType: QuestionType,
): EditCompatibilityResult {
  const displayIndex = question.displayIndex;
  const targetLabel = QUESTION_TYPE_LABELS_LOCAL[targetType] || targetType;

  const ev = evidence;
  const rvk = ev.responseValueKind;
  const cardinality = ev.responseCardinality;
  const matchedScale = ev.matchedKnownScale;

  // Dimension edit attempts are handled separately (blocked at intent level)

  // Likert textual
  if (rvk === 'textual_scale_labels' && cardinality === 'single_per_respondent') {
    if (targetType === 'rating_scale' || targetType === 'single_choice' || targetType === 'dropdown') {
      return {
        compatible: true,
        allowedOptions: getLikertTextualAllowedQuestionTypes(),
        shouldMutate: true,
      };
    }
    if (targetType === 'open_text') {
      return {
        compatible: false,
        reason: getLikertAgreementBlockReason(targetLabel, displayIndex),
        allowedOptions: getLikertTextualAllowedQuestionTypes(),
        blockedOptions: [makeOption('open_text', 'Pregunta abierta')],
        shouldMutate: false,
        message: `No puedo cambiar la pregunta ${displayIndex} a Pregunta abierta porque las respuestas históricas detectadas no son texto libre; corresponden a una escala Likert de una sola respuesta por usuario.\n\nOpciones compatibles:\n1. Escala de valoración\n2. Opción única\n3. Desplegable`,
      };
    }
    if (targetType === 'multiple_choice') {
      return {
        compatible: false,
        reason: `No puedo cambiar la pregunta ${displayIndex} a Múltiples respuestas porque la estructura detectada muestra una sola respuesta por usuario.`,
        allowedOptions: getLikertTextualAllowedQuestionTypes(),
        blockedOptions: [makeOption('multiple_choice', 'Múltiples respuestas')],
        shouldMutate: false,
        message: `No puedo cambiar la pregunta ${displayIndex} a Múltiples respuestas porque la estructura detectada muestra una sola respuesta por usuario.\n\nOpciones compatibles:\n1. Escala de valoración\n2. Opción única\n3. Desplegable`,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas detectadas corresponden a una escala Likert de una sola respuesta por usuario.`,
      allowedOptions: getLikertTextualAllowedQuestionTypes(),
      blockedOptions: [...getLikertTextualBlockedQuestionTypes()],
      shouldMutate: false,
    };
  }

  // NPS numeric
  if (rvk === 'numeric_scale_values' && matchedScale === 'nps_0_10') {
    if (targetType === 'rating_scale') {
      return {
        compatible: true,
        allowedOptions: getNpsAllowedQuestionTypes(),
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas son valores numéricos de 0 a 10, no ${targetLabel === 'Pregunta abierta' ? 'texto libre' : 'aplican a este tipo de respuesta'}.`,
      allowedOptions: getNpsAllowedQuestionTypes(),
      blockedOptions: getNpsBlockedQuestionTypes(),
      shouldMutate: false,
    };
  }

  // Free text
  if (rvk === 'free_text') {
    if (targetType === 'open_text') {
      return {
        compatible: true,
        allowedOptions: getFreeTextAllowedQuestionTypes(),
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas son texto libre y no se pueden convertir con seguridad a categorías o escalas sin reclasificación semántica posterior.`,
      allowedOptions: getFreeTextAllowedQuestionTypes(),
      blockedOptions: getFreeTextBlockedQuestionTypes(),
      shouldMutate: false,
    };
  }

  // Categorical single value
  if (rvk === 'categorical_single_value') {
    if (targetType === 'single_choice' || targetType === 'dropdown') {
      return {
        compatible: true,
        allowedOptions: getSingleChoiceAllowedQuestionTypes(),
        shouldMutate: true,
      };
    }
    if (targetType === 'rating_scale') {
      return {
        compatible: true,
        allowedOptions: [
          makeOption('single_choice', 'Opción única'),
          makeOption('dropdown', 'Desplegable'),
          makeOption('rating_scale', 'Escala de valoración (solo si los labels corresponden a una escala conocida)'),
        ],
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas son categóricas de selección única.`,
      allowedOptions: getSingleChoiceAllowedQuestionTypes(),
      blockedOptions: getSingleChoiceBlockedQuestionTypes(),
      shouldMutate: false,
    };
  }

  // Categorical multi value
  if (rvk === 'categorical_multi_value') {
    if (targetType === 'multiple_choice') {
      return {
        compatible: true,
        allowedOptions: getMultipleChoiceAllowedQuestionTypes(),
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas son de selección múltiple.`,
      allowedOptions: getMultipleChoiceAllowedQuestionTypes(),
      blockedOptions: getMultipleChoiceBlockedQuestionTypes(),
      shouldMutate: false,
    };
  }

  // Unknown / mixed
  return {
    compatible: false,
    reason: `No tengo suficiente evidencia para validar ese cambio con seguridad. Puedo mantener la clasificación actual o pedir una aclaración sobre la estructura esperada de esta pregunta.`,
    allowedOptions: [],
    shouldMutate: false,
    message: `No tengo suficiente evidencia para validar ese cambio con seguridad.\nPuedo mantener la clasificación actual o pedir una aclaración sobre la estructura esperada de esta pregunta.`,
  };
}

export function validateScaleTypeEdit(
  question: QuestionReviewItem,
  evidence: QuestionResponseEvidence,
  targetScale: ScaleType,
): EditCompatibilityResult {
  const displayIndex = question.displayIndex;
  const targetLabel = SCALE_TYPE_LABELS_LOCAL[targetScale] || targetScale;

  const ev = evidence;
  const rvk = ev.responseValueKind;
  const cardinality = ev.responseCardinality;
  const matchedScale = ev.matchedKnownScale;

  // Likert textual
  if (rvk === 'textual_scale_labels' && cardinality === 'single_per_respondent' && matchedScale === 'likert_agreement_5') {
    if (targetScale === 'likert_5' || targetScale === 'likert_7' || targetScale === 'agreement') {
      return {
        compatible: true,
        allowedOptions: getLikertTextualAllowedScaleTypes(),
        shouldMutate: true,
      };
    }
    if (targetScale === 'nps_0_10') {
      return {
        compatible: false,
        reason: getLikertTextualScaleBlockReason(targetLabel, displayIndex),
        allowedOptions: getLikertTextualAllowedScaleTypes(),
        blockedOptions: [makeOption('nps_0_10', 'NPS (recomendabilidad)')],
        shouldMutate: false,
        message: `No puedo cambiar la escala de la pregunta ${displayIndex} a NPS porque las respuestas históricas detectadas son labels Likert textuales, no valores numéricos de 0 a 10.\n\nEscala compatible:\n1. Likert (escala de preferencias)`,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la escala de la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas detectadas son labels Likert textuales, no valores numéricos o visuales.`,
      allowedOptions: getLikertTextualAllowedScaleTypes(),
      blockedOptions: getLikertTextualBlockedScaleTypes(),
      shouldMutate: false,
    };
  }

  // Many Likert textual (frequency variant) - same rules basically
  if (rvk === 'textual_scale_labels' && cardinality === 'single_per_respondent') {
    if (targetScale === 'likert_5' || targetScale === 'likert_7' || targetScale === 'agreement' || targetScale === 'frequency') {
      return {
        compatible: true,
        allowedOptions: [
          makeOption('likert_5', 'Likert (escala de preferencias)'),
          makeOption('frequency', 'Frecuencia'),
          makeOption('agreement', 'Acuerdo'),
        ],
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la escala de la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas detectadas son labels textuales de escala.`,
      allowedOptions: [
        makeOption('likert_5', 'Likert (escala de preferencias)'),
        makeOption('frequency', 'Frecuencia'),
        makeOption('agreement', 'Acuerdo'),
      ],
      shouldMutate: false,
    };
  }

  // NPS numeric
  if (rvk === 'numeric_scale_values' && matchedScale === 'nps_0_10') {
    if (targetScale === 'nps_0_10') {
      return {
        compatible: true,
        allowedOptions: getNpsAllowedScaleTypes(),
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la escala de la pregunta ${displayIndex} a ${targetLabel} porque las respuestas históricas son valores NPS numéricos de 0 a 10.`,
      allowedOptions: getNpsAllowedScaleTypes(),
      blockedOptions: getNpsBlockedScaleTypes(),
      shouldMutate: false,
    };
  }

  // Free text
  if (rvk === 'free_text') {
    if (targetScale === 'not_applicable') {
      return {
        compatible: true,
        allowedOptions: [makeOption('not_applicable', 'No aplica')],
        shouldMutate: true,
      };
    }
    return {
      compatible: false,
      reason: `No puedo cambiar la escala de la pregunta ${displayIndex} porque las respuestas históricas son texto libre y no tienen escala asociada.`,
      allowedOptions: [makeOption('not_applicable', 'No aplica')],
      shouldMutate: false,
    };
  }

  // Unknown / mixed
  return {
    compatible: false,
    reason: `No tengo suficiente evidencia para validar ese cambio con seguridad. Puedo mantener la clasificación actual o pedir una aclaración sobre la estructura esperada de esta pregunta.`,
    allowedOptions: [],
    shouldMutate: false,
    message: `No tengo suficiente evidencia para validar ese cambio con seguridad.\nPuedo mantener la clasificación actual o pedir una aclaración sobre la estructura esperada de esta pregunta.`,
  };
}

export function getCompatibleQuestionTypeOptionsText(
  question: QuestionReviewItem,
  evidence: QuestionResponseEvidence,
): string {
  const result = validateQuestionTypeEdit(question, evidence, question.questionType);
  const allowed = result.allowedOptions.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n');
  const blockedLabels = getBlockedQuestionTypeLabels(evidence);
  const displayIndex = question.displayIndex;

  let blockedText = '';
  if (blockedLabels.length > 0) {
    blockedText = `\n\nNo recomiendo cambiarla a ${blockedLabels.join(' o ')} porque las respuestas históricas detectadas son de selección única sobre una escala Likert.`;
  }

  return `Estas son las opciones compatibles para la pregunta ${displayIndex}:\n\n${allowed}${blockedText}`;
}

export function getCompatibleScaleTypeOptionsText(
  question: QuestionReviewItem,
  evidence: QuestionResponseEvidence,
): string {
  const result = validateScaleTypeEdit(question, evidence, question.scaleType);
  const allowed = result.allowedOptions.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n');
  const displayIndex = question.displayIndex;

  if (evidence.responseValueKind === 'textual_scale_labels') {
    return `Escala compatible para la pregunta ${displayIndex}:\n\n${allowed}\n\nNo recomiendo cambiarla a NPS, Visual por estrellas, Visual por emociones o Escala lineal porque las respuestas históricas detectadas son labels Likert textuales, no valores numéricos o visuales.`;
  }

  return `Escala compatible para la pregunta ${displayIndex}:\n\n${allowed}`;
}

function getBlockedQuestionTypeLabels(evidence: QuestionResponseEvidence): string[] {
  if (evidence.responseValueKind === 'textual_scale_labels') {
    return ['Pregunta abierta', 'Múltiples respuestas'];
  }
  return [];
}

export function getQuestionTypeOptionsTextForEvidence(
  evidence: QuestionResponseEvidence,
  displayIndex: number,
): string {
  if (evidence.responseValueKind === 'textual_scale_labels') {
    return `Estas son las opciones compatibles para la pregunta ${displayIndex}:\n\n1. Escala de valoración\n2. Opción única\n3. Desplegable\n\nNo recomiendo cambiarla a Pregunta abierta o Múltiples respuestas porque las respuestas históricas detectadas son de selección única sobre una escala Likert.`;
  }

  if (evidence.responseValueKind === 'numeric_scale_values') {
    return `Opción compatible para la pregunta ${displayIndex}:\n\n1. Escala de valoración`;
  }

  if (evidence.responseValueKind === 'free_text') {
    return `Opción compatible para la pregunta ${displayIndex}:\n\n1. Pregunta abierta`;
  }

  if (evidence.responseValueKind === 'categorical_single_value') {
    return `Estas son las opciones compatibles para la pregunta ${displayIndex}:\n\n1. Opción única\n2. Desplegable`;
  }

  if (evidence.responseValueKind === 'categorical_multi_value') {
    return `Opción compatible para la pregunta ${displayIndex}:\n\n1. Múltiples respuestas`;
  }

  return `No tengo suficiente evidencia para determinar las opciones compatibles para la pregunta ${displayIndex}.`;
}

export function getScaleTypeOptionsTextForEvidence(
  evidence: QuestionResponseEvidence,
  displayIndex: number,
): string {
  if (evidence.responseValueKind === 'textual_scale_labels') {
    return `Escala compatible para la pregunta ${displayIndex}:\n\n1. Likert (escala de preferencias)\n\nNo recomiendo cambiarla a NPS, Visual por estrellas, Visual por emociones o Escala lineal porque las respuestas históricas detectadas son labels Likert textuales, no valores numéricos o visuales.`;
  }

  if (evidence.responseValueKind === 'numeric_scale_values') {
    return `Escala compatible para la pregunta ${displayIndex}:\n\n1. NPS (recomendabilidad)`;
  }

  return `Escala compatible para la pregunta ${displayIndex}:\n\nN/A`;
}
