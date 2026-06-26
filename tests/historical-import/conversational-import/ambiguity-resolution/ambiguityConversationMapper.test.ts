import { describe, it, expect } from 'vitest';
import { mapAmbiguityResolutionToChatMessages } from '../../../../src/features/historical-import/conversational-import/ambiguity-resolution/ambiguityConversationMapper';
import type { AmbiguityResolutionSnapshot as AmbiguityResolutionSnapshotType } from '../../../../src/features/historical-import/conversational-import/ambiguity-resolution/ambiguityResolutionTypes';

function buildSurveyTypeAmbiguitySnapshot(
  overrides?: Partial<AmbiguityResolutionSnapshotType>,
): AmbiguityResolutionSnapshotType {
  return {
    activeAmbiguity: {
      id: 'ambiguity-survey-type-ambiguity',
      type: 'SurveyTypeAmbiguity',
      detectedAtStep: 'confirming_survey_type',
      severity: 'high',
      confidence: 0.85,
      userFacingExplanation:
        'No fue posible determinar con certeza el tipo de encuesta.',
      impactSummary:
        'El tipo de encuesta determina qué dimensiones, preguntas y escalas se esperan en la estructura.',
      options: [
        {
          id: 'survey-type-ambiguity-opt-1',
          label: 'Clima',
          description: 'Encuesta de clima organizacional.',
          isRecommended: true,
        },
        {
          id: 'survey-type-ambiguity-opt-2',
          label: 'Cultura',
          description: 'Encuesta de cultura organizacional.',
        },
        {
          id: 'survey-type-ambiguity-opt-3',
          label: 'NPS',
          description: 'Net Promoter Score.',
        },
      ],
      recommendedOptionId: 'survey-type-ambiguity-opt-1',
      expectedInput: {
        kind: 'numeric_choice',
        required: true,
        validOptionIds: [
          'survey-type-ambiguity-opt-1',
          'survey-type-ambiguity-opt-2',
          'survey-type-ambiguity-opt-3',
        ],
      },
      status: 'ambiguity_detected',
      auditNote: 'Inferred type: unknown. Step: confirming_survey_type.',
      privacyFlags: {
        privacyRisk: false,
        safeToRender: true,
        requiresExplicitConfirmation: false,
        redactionApplied: false,
      },
    },
    resolvedAmbiguities: [],
    pendingAmbiguities: [],
    hasBlockingAmbiguity: false,
    ...overrides,
  };
}

function buildSurveyNameAmbiguitySnapshot(
  overrides?: Partial<AmbiguityResolutionSnapshotType>,
): AmbiguityResolutionSnapshotType {
  return {
    activeAmbiguity: {
      id: 'ambiguity-survey-name-ambiguity',
      type: 'SurveyNameAmbiguity',
      detectedAtStep: 'confirming_survey_name',
      severity: 'medium',
      confidence: 0.8,
      userFacingExplanation:
        'No se detectó un nombre de encuesta en los archivos cargados.',
      impactSummary:
        'El nombre de la encuesta es necesario para identificar la carga histórica en el sistema.',
      options: [],
      expectedInput: { kind: 'free_text', required: true },
      status: 'ambiguity_detected',
      auditNote: 'Name absent. Step: confirming_survey_name.',
      privacyFlags: {
        privacyRisk: false,
        safeToRender: true,
        requiresExplicitConfirmation: false,
        redactionApplied: false,
      },
    },
    resolvedAmbiguities: [],
    pendingAmbiguities: [],
    hasBlockingAmbiguity: false,
    ...overrides,
  };
}

function buildPrivacyThresholdBlockingSnapshot(
  overrides?: Partial<AmbiguityResolutionSnapshotType>,
): AmbiguityResolutionSnapshotType {
  return {
    activeAmbiguity: {
      id: 'ambiguity-privacy-threshold-ambiguity',
      type: 'PrivacyThresholdAmbiguity',
      detectedAtStep: 'confirming_privacy_threshold',
      severity: 'blocking',
      confidence: 0.95,
      userFacingExplanation:
        'Se detectaron grupos con muy pocos participantes. Confirma el umbral de confidencialidad antes de continuar.',
      impactSummary:
        'Sin un umbral de confidencialidad confirmado, la carga histórica puede exponer datos individuales.',
      options: [],
      expectedInput: { kind: 'confirmation', required: true },
      status: 'blocked_until_user_clarifies',
      auditNote: 'Privacy risk: true. Step: confirming_privacy_threshold.',
      privacyFlags: {
        privacyRisk: true,
        safeToRender: true,
        requiresExplicitConfirmation: true,
        redactionApplied: false,
      },
      blockingReason:
        'Grupos con tamaño inferior al umbral mínimo detectados. La carga está bloqueada hasta confirmar un umbral seguro.',
    },
    resolvedAmbiguities: [],
    pendingAmbiguities: [],
    hasBlockingAmbiguity: true,
    ...overrides,
  };
}

function buildOutOfScopeSnapshot(
  overrides?: Partial<AmbiguityResolutionSnapshotType>,
): AmbiguityResolutionSnapshotType {
  return {
    activeAmbiguity: {
      id: 'ambiguity-out-of-scope-request-ambiguity',
      type: 'OutOfScopeRequestAmbiguity',
      detectedAtStep: 'reviewing_structure',
      severity: 'blocking',
      confidence: 1.0,
      userFacingExplanation:
        'Lo que solicitaste está fuera del alcance de esta herramienta de preparación de carga histórica.',
      impactSummary:
        'La acción solicitada no puede ejecutarse aquí. Puedes continuar con la preparación de la carga histórica.',
      options: [],
      expectedInput: { kind: 'clarification', required: true },
      status: 'out_of_scope_redirected',
      auditNote: 'Out of scope request detected.',
      privacyFlags: {
        privacyRisk: false,
        safeToRender: true,
        requiresExplicitConfirmation: false,
        redactionApplied: false,
      },
      blockingReason:
        'Solicitud fuera del alcance del flujo de preparación de carga histórica.',
    },
    resolvedAmbiguities: [],
    pendingAmbiguities: [],
    hasBlockingAmbiguity: true,
    ...overrides,
  };
}

function buildEmptySnapshot(): AmbiguityResolutionSnapshotType {
  return {
    activeAmbiguity: undefined,
    resolvedAmbiguities: [],
    pendingAmbiguities: [],
    hasBlockingAmbiguity: false,
  };
}

describe('mapAmbiguityResolutionToChatMessages', () => {
  it('returns empty array when there is no active ambiguity', () => {
    const snapshot = buildEmptySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    expect(messages).toHaveLength(0);
  });

  it('renders thinking message as the first message when ambiguity is active', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].kind).toBe('thinking');
    expect(messages[0].role).toBe('assistant');
  });

  it('renders explanation message with userFacingExplanation content', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const explanation = messages.find((m) => m.id.includes('explanation'));
    expect(explanation).toBeDefined();
    expect(explanation?.kind).toBe('plain_text');
    expect(explanation?.content).toBe(
      snapshot.activeAmbiguity?.userFacingExplanation,
    );
  });

  it('renders impact message with impactSummary content', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const impact = messages.find((m) => m.id.includes('impact'));
    expect(impact).toBeDefined();
    expect(impact?.kind).toBe('safe_details');
    expect(impact?.content).toBe(snapshot.activeAmbiguity?.impactSummary);
  });

  it('renders numbered options as text when options exist', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const optionsMsg = messages.find((m) => m.id.includes('options'));
    expect(optionsMsg).toBeDefined();
    expect(optionsMsg?.kind).toBe('plain_text');
    expect(optionsMsg?.content).toContain('1. Clima');
    expect(optionsMsg?.content).toContain('2. Cultura');
    expect(optionsMsg?.content).toContain('3. NPS');
    expect(optionsMsg?.content).not.toContain('<');
    expect(optionsMsg?.content).not.toContain('{');
  });

  it('renders question message for numeric_choice expected input', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const question = messages.find((m) => m.id.includes('question'));
    expect(question).toBeDefined();
    expect(question?.kind).toBe('plain_text');
    expect(question?.content).toContain('¿Cuál opción prefieres?');
  });

  it('renders question message for free_text expected input', () => {
    const snapshot = buildSurveyNameAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const question = messages.find((m) => m.id.includes('question'));
    expect(question).toBeDefined();
    expect(question?.kind).toBe('plain_text');
    expect(question?.content).toContain('Por favor, escribe tu respuesta.');
  });

  it('renders confirmation question when expected input is confirmation', () => {
    const snapshot = buildPrivacyThresholdBlockingSnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const question = messages.find((m) => m.id.includes('question'));
    expect(question).toBeDefined();
    expect(question?.kind).toBe('plain_text');
    expect(question?.content).toContain('¿Confirmas que la información es correcta?');
  });

  it('renders warning message when privacyRisk is true', () => {
    const snapshot = buildPrivacyThresholdBlockingSnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const warning = messages.find((m) => m.id.includes('privacy-warning'));
    expect(warning).toBeDefined();
    expect(warning?.kind).toBe('warning');
    expect(warning?.tone).toBe('warning');
    expect(warning?.content).toContain('privacidad');
  });

  it('renders blocking error for PrivacyThresholdAmbiguity with blocking severity', () => {
    const snapshot = buildPrivacyThresholdBlockingSnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const blocking = messages.find((m) => m.id.includes('blocking'));
    expect(blocking).toBeDefined();
    expect(blocking?.kind).toBe('error');
    expect(blocking?.status).toBe('blocked');
    expect(blocking?.tone).toBe('error');
    expect(blocking?.content).toContain('umbral mínimo');
  });

  it('renders safe redirect for OutOfScopeRequestAmbiguity', () => {
    const snapshot = buildOutOfScopeSnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const redirect = messages.find((m) => m.id.includes('redirect'));
    expect(redirect).toBeDefined();
    expect(redirect?.kind).toBe('handoff');
    expect(redirect?.tone).toBe('info');
    const blocking = messages.find((m) => m.id.includes('blocking'));
    expect(blocking).toBeUndefined();
  });

  it('does not create actions, callbacks, or buttons', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    messages.forEach((msg) => {
      expect(msg.role).toBe('assistant');
      expect(typeof msg.content).toBe('string');
      expect(msg.content).not.toContain('onClick');
      expect(msg.content).not.toContain('javascript:');
    });
  });

  it('produces deterministic message IDs for the same input', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages1 = mapAmbiguityResolutionToChatMessages(snapshot);
    const messages2 = mapAmbiguityResolutionToChatMessages(snapshot);
    expect(messages1.map((m) => m.id)).toEqual(messages2.map((m) => m.id));
    messages1.forEach((msg) => {
      expect(msg.id).toMatch(/^amb-conv-/);
    });
  });

  it('does not mutate the input snapshot', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const originalId = snapshot.activeAmbiguity?.id;
    const originalOptionCount = snapshot.activeAmbiguity?.options.length;
    mapAmbiguityResolutionToChatMessages(snapshot);
    expect(snapshot.activeAmbiguity?.id).toBe(originalId);
    expect(snapshot.activeAmbiguity?.options.length).toBe(originalOptionCount);
  });

  it('does not expose PII, raw rows, open text, or workbook dump', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    messages.forEach((msg) => {
      expect(msg.content).not.toMatch(/@/);
      expect(msg.content).not.toMatch(/\d{8,}/);
      expect(msg.content).not.toMatch(/[A-Za-z0-9+/]{40,}/);
      expect(msg.content).not.toMatch(/\b(?:fila|row)\s*\d+/i);
    });
  });

  it('handles ambiguity with no options gracefully', () => {
    const snapshot = buildSurveyNameAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const optionsMsg = messages.find((m) => m.id.includes('options'));
    expect(optionsMsg).toBeUndefined();
    expect(messages.length).toBeGreaterThanOrEqual(5);
  });

  it('includes recommended label in options text when isRecommended is true', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const optionsMsg = messages.find((m) => m.id.includes('options'));
    expect(optionsMsg).toBeDefined();
    expect(optionsMsg?.content).toContain('(Recomendado)');
  });

  it('maintains stable conversational order: thinking → explanation → impact → options → question → expected-input', () => {
    const snapshot = buildSurveyTypeAmbiguitySnapshot();
    const messages = mapAmbiguityResolutionToChatMessages(snapshot);
    const order = messages.map((m) => {
      const parts = m.id.split('-assistant-');
      return parts[parts.length - 1];
    });
    const thinkingIdx = order.indexOf('thinking');
    const explanationIdx = order.indexOf('explanation');
    const impactIdx = order.indexOf('impact');
    const optionsIdx = order.indexOf('options');
    const questionIdx = order.indexOf('question');
    const expectedInputIdx = order.indexOf('expected-input');
    expect(thinkingIdx).toBeLessThan(explanationIdx);
    expect(explanationIdx).toBeLessThan(impactIdx);
    expect(impactIdx).toBeLessThan(optionsIdx);
    expect(optionsIdx).toBeLessThan(questionIdx);
    expect(questionIdx).toBeLessThan(expectedInputIdx);
  });
});
