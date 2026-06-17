import type {
  HistoricalImportMappingDraft,
  HistoricalImportReviewMappingSource,
  HistoricalMappingIssueId,
  HistoricalImportMappingDomainSummary,
  HistoricalImportMappingDraftStatus,
  HistoricalImportMappingReadiness,
} from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

export interface HistoricalImportReviewMappingScenario {
  scenarioId: string;
  source: HistoricalImportReviewMappingSource;
  initialDraft: Omit<HistoricalImportMappingDraft, 'domainSummaries' | 'globalStatus' | 'readiness' | 'canContinueToConfirmation'>;
  expected: {
    globalStatus: HistoricalImportMappingDraftStatus;
    domainSummaries: Partial<Record<string, HistoricalImportMappingDomainSummary>>;
    readiness: Partial<HistoricalImportMappingReadiness>;
    cta: boolean;
    boundaryAvailable: boolean;
    priorityIssueIds: HistoricalMappingIssueId[];
    visualExpectationConceptual: string;
  };
}

const baseSource: HistoricalImportReviewMappingSource = {
  configurationDraftId: 'DRAFT_CONF_001',
  sourceBatchId: 'BATCH_001',
  sourceScenarioId: 'SCENARIO_READY',
  confirmedSurveyName: 'Clima Organizacional 2026',
  confirmedSurveyType: 'climate',
  confirmedPeriodYear: 2026,
  confirmedPeriodMode: 'year',
  confirmedPrivacyMode: 'confidential',
  confirmedVisibilityMode: 'administrators-only',
  fileCount: 3,
  structuralFamilies: ['Liderazgo', 'Comunicación'],
  detectedRoles: ['employee', 'manager'],
  relationsSummary: ['Roster.email -> Responses.email'],
  deferredConfigurationIssueIds: [],
  configurationReadiness: true,
  configurationSignature: 'climate|confidential|2026',
};

export const historicalImportReviewMappingScenarios: HistoricalImportReviewMappingScenario[] = [
  {
    scenarioId: 'ready-for-confirmation',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_001',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'ready-for-confirmation',
      configurationSignature: 'climate|confidential|2026',
      entities: [
        {
          id: 'ENT_Q_01',
          domain: 'questions',
          sourceLabel: 'Mi jefe me escucha',
          sourceKey: 'q1_listen',
          syntheticTargetReference: 'Liderazgo',
          status: 'confirmed',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
        {
          id: 'ENT_S_01',
          domain: 'scales',
          sourceLabel: '1 a 5 (Totalmente de acuerdo)',
          sourceKey: 'scale_1_5',
          status: 'confirmed',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
        {
          id: 'ENT_P_01',
          domain: 'participants',
          sourceLabel: 'Participantes',
          sourceKey: 'participants_file',
          status: 'confirmed',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
        {
          id: 'ENT_D_01',
          domain: 'demographics',
          sourceLabel: 'Área',
          sourceKey: 'area_code',
          syntheticTargetReference: 'Area',
          status: 'confirmed',
          required: false,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
        {
          id: 'ENT_I_01',
          domain: 'identifiers',
          sourceLabel: 'Correo electrónico',
          sourceKey: 'email',
          syntheticTargetReference: 'Email',
          status: 'confirmed',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
        {
          id: 'ENT_R_01',
          domain: 'relations',
          sourceLabel: 'Roster a Respuestas',
          sourceKey: 'rel_email',
          status: 'confirmed',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
      ],
      ignoredColumns: [
        {
          id: 'IGN_01',
          sourceKey: 'internal_id_789',
          label: 'InternalID_789',
          reason: 'suggested-technical',
          required: false,
          restorable: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
      ],
      issues: [],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'ready-for-confirmation',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: true },
      cta: true,
      boundaryAvailable: true,
      priorityIssueIds: [],
      visualExpectationConceptual: 'Todos los dominios listos, sin alertas, CTA activo.',
    },
  },
  {
    scenarioId: 'ambiguous-question-target',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_002',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'ambiguous-question-target',
      configurationSignature: 'climate|confidential|2026',
      entities: [
        {
          id: 'ENT_Q_02',
          domain: 'questions',
          sourceLabel: 'Tengo herramientas para trabajar',
          sourceKey: 'q2_tools',
          syntheticTargetReference: 'Recursos',
          status: 'ambiguous',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: ['ISS_Q_01'],
        },
      ],
      ignoredColumns: [],
      issues: [
        {
          id: 'ISS_Q_01',
          code: 'AMBIGUOUS_TARGET',
          domain: 'questions',
          entityId: 'ENT_Q_02',
          title: 'Pregunta ambigua',
          description: 'Se sugirió "Recursos" pero la similitud es baja.',
          actionConcept: 'Confirmar o editar',
          resolutionStatus: 'open',
          ownershipStage: 'mapping-overview',
          severity: 'confirmation-required',
        },
      ],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'needs-review',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: false },
      cta: false,
      boundaryAvailable: false,
      priorityIssueIds: ['ISS_Q_01'],
      visualExpectationConceptual: 'Dominio preguntas en revisión, CTA deshabilitado.',
    },
  },
  {
    scenarioId: 'incompatible-scale',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_003',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'incompatible-scale',
      configurationSignature: 'climate|confidential|2026',
      entities: [
        {
          id: 'ENT_S_02',
          domain: 'scales',
          sourceLabel: 'A, B, C',
          sourceKey: 'scale_abc',
          status: 'blocked',
          required: true,
          origin: 'simulated-suggestion',
          issueIds: ['ISS_S_01'],
        },
      ],
      ignoredColumns: [],
      issues: [
        {
          id: 'ISS_S_01',
          code: 'INCOMPATIBLE_SCALE',
          domain: 'scales',
          entityId: 'ENT_S_02',
          title: 'Escala incompatible',
          description: 'No se puede mapear la escala a los estándares.',
          actionConcept: 'Revisar datos origen',
          resolutionStatus: 'open',
          ownershipStage: 'mapping-overview',
          severity: 'blocking',
        },
      ],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'blocked',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: false },
      cta: false,
      boundaryAvailable: false,
      priorityIssueIds: ['ISS_S_01'],
      visualExpectationConceptual: 'Bloqueo en escalas, alerta roja, CTA deshabilitado.',
    },
  },
  {
    scenarioId: 'unmapped-required-field',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_004',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'unmapped-required-field',
      configurationSignature: 'climate|confidential|2026',
      entities: [
        {
          id: 'ENT_I_02',
          domain: 'identifiers',
          sourceLabel: 'Falta Email',
          sourceKey: 'email_missing',
          status: 'unmapped',
          required: true,
          origin: 'inherited',
          issueIds: ['ISS_I_01'],
        },
      ],
      ignoredColumns: [],
      issues: [
        {
          id: 'ISS_I_01',
          code: 'REQUIRED_FIELD_UNMAPPED',
          domain: 'identifiers',
          entityId: 'ENT_I_02',
          title: 'Identificador requerido sin mapeo',
          description: 'Falta mapear el campo email que es obligatorio.',
          actionConcept: 'Asignar campo',
          resolutionStatus: 'open',
          ownershipStage: 'mapping-overview',
          severity: 'blocking',
        },
      ],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'blocked',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: false },
      cta: false,
      boundaryAvailable: false,
      priorityIssueIds: ['ISS_I_01'],
      visualExpectationConceptual: 'Identificadores bloqueados, CTA inactivo.',
    },
  },
  {
    scenarioId: 'ignored-technical-column',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_005',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'ignored-technical-column',
      configurationSignature: 'climate|confidential|2026',
      entities: [],
      ignoredColumns: [
        {
          id: 'IGN_02',
          sourceKey: 'sys_created_at',
          label: 'System Created At',
          reason: 'suggested-technical',
          required: false,
          restorable: true,
          origin: 'simulated-suggestion',
          issueIds: [],
        },
      ],
      issues: [],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'ready-for-confirmation',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: true },
      cta: true,
      boundaryAvailable: true,
      priorityIssueIds: [],
      visualExpectationConceptual: 'CTA activo, hay una columna ignorada pero no bloquea.',
    },
  },
  {
    scenarioId: 'demographic-review-required',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_006',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'demographic-review-required',
      configurationSignature: 'climate|confidential|2026',
      entities: [
        {
          id: 'ENT_D_02',
          domain: 'demographics',
          sourceLabel: 'Departamento',
          sourceKey: 'depto',
          syntheticTargetReference: 'Area',
          status: 'ambiguous',
          required: false,
          origin: 'simulated-suggestion',
          issueIds: ['ISS_D_01'],
        },
      ],
      ignoredColumns: [],
      issues: [
        {
          id: 'ISS_D_01',
          code: 'DEMOGRAPHIC_AMBIGUOUS',
          domain: 'demographics',
          entityId: 'ENT_D_02',
          title: 'Revisión demográfica sugerida',
          description: '"Departamento" se mapeó a "Area".',
          actionConcept: 'Confirmar',
          resolutionStatus: 'open',
          ownershipStage: 'mapping-overview',
          severity: 'confirmation-required',
        },
      ],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'needs-review',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: false },
      cta: false,
      boundaryAvailable: false,
      priorityIssueIds: ['ISS_D_01'],
      visualExpectationConceptual: 'Demográfico ambiguo, CTA inactivo.',
    },
  },
  {
    scenarioId: 'inherited-blocking-issue',
    source: {
      ...baseSource,
      deferredConfigurationIssueIds: ['CONF_ISS_1'],
    },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_007',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'inherited-blocking-issue',
      configurationSignature: 'climate|confidential|2026',
      entities: [],
      ignoredColumns: [],
      issues: [
        {
          id: 'ISS_INH_01',
          code: 'INHERITED_CONFIG_BLOCK',
          domain: 'global',
          title: 'Configuración inválida heredada',
          description: 'Hay un problema en configuración no resuelto.',
          actionConcept: 'Volver a Configuración',
          sourceIssueId: 'CONF_ISS_1',
          resolutionStatus: 'open',
          ownershipStage: 'configuration',
          severity: 'blocking',
        },
      ],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'blocked',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: false, configurationValid: false },
      cta: false,
      boundaryAvailable: false,
      priorityIssueIds: ['ISS_INH_01'],
      visualExpectationConceptual: 'Incidencia global heredada, CTA inactivo, acción lleva atrás.',
    },
  },
  {
    scenarioId: 'simulated-error',
    source: { ...baseSource },
    initialDraft: {
      mappingDraftId: 'DRAFT_MAP_008',
      configurationDraftId: 'DRAFT_CONF_001',
      sourceBatchId: 'BATCH_001',
      sourceScenarioId: 'simulated-error',
      configurationSignature: 'climate|confidential|2026',
      entities: [],
      ignoredColumns: [],
      issues: [
        {
          id: 'ISS_ERR_01',
          code: 'SIMULATED_CRASH',
          domain: 'global',
          title: 'Error interno simulado',
          description: 'Fallo simulado de procesamiento.',
          actionConcept: 'Reintentar',
          resolutionStatus: 'open',
          ownershipStage: 'mapping-overview',
          severity: 'simulated-error',
        },
      ],
      resolvedIssueIds: [],
      deferredIssueIds: [],
    },
    expected: {
      globalStatus: 'simulated-error',
      domainSummaries: {},
      readiness: { canContinueToConfirmation: false },
      cta: false,
      boundaryAvailable: false,
      priorityIssueIds: ['ISS_ERR_01'],
      visualExpectationConceptual: 'Pantalla de error de simulación seguro.',
    },
  },
];

import type {
  HistoricalMappingIssueResolutionInput,
  HistoricalMappingScalePolarity,
  HistoricalMappingResolutionOrigin,
  HistoricalMappingIssueResolutionFailureCode,
} from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

export interface HistoricalImportResolutionScenario {
  scenarioId: string;
  baseDraft: HistoricalImportMappingDraft;
  compatibility: 'current' | 'stale' | 'incompatible';
  resolutionInput: HistoricalMappingIssueResolutionInput;
  expected: {
    success: boolean;
    errorCode?: HistoricalMappingIssueResolutionFailureCode;
    issueStatus: 'open' | 'resolved' | 'deferred';
    entityPolarity: HistoricalMappingScalePolarity;
    resolutionOrigin: HistoricalMappingResolutionOrigin;
    globalStatus: HistoricalImportMappingDraftStatus;
    cta: boolean;
    boundaryAvailable: boolean;
  };
}

const createBaseDraftWithAmbiguousScale = (
  suggestedPolarity: HistoricalMappingScalePolarity,
  otherBlockingIssue: boolean = false,
  isSimulatedError: boolean = false
): HistoricalImportMappingDraft => {
  const issues: import('../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes').HistoricalImportMappingIssue[] = [
    {
      id: 'ISS_S_AMB_01',
      code: 'AMBIGUOUS_POLARITY',
      domain: 'scales',
      entityId: 'ENT_S_AMB_01',
      title: 'Polaridad ambigua en escala',
      description: 'No se pudo determinar si una puntuación alta es favorable.',
      actionConcept: 'Confirmar polaridad',
      resolutionStatus: 'open',
      ownershipStage: 'mapping-overview',
      severity: 'confirmation-required',
    }
  ];

  if (otherBlockingIssue) {
    issues.push({
      id: 'ISS_BLOCK_01',
      code: 'REQUIRED_FIELD_UNMAPPED',
      domain: 'identifiers',
      entityId: 'ENT_I_MISSING',
      title: 'Identificador faltante',
      description: 'Falta email',
      actionConcept: 'Asignar',
      resolutionStatus: 'open',
      ownershipStage: 'mapping-overview',
      severity: 'blocking',
    });
  }

  return {
    mappingDraftId: 'DRAFT_RES_001',
    configurationDraftId: 'DRAFT_CONF_001',
    sourceBatchId: 'BATCH_001',
    sourceScenarioId: 'resolution-test',
    configurationSignature: 'climate|confidential|2026',
    entities: [
      {
        id: 'ENT_S_AMB_01',
        domain: 'scales',
        sourceLabel: 'Satisfacción',
        sourceKey: 'scale_sat',
        status: 'ambiguous',
        required: true,
        origin: 'simulated-suggestion',
        issueIds: ['ISS_S_AMB_01'],
        scaleMetadata: {
          sourceScaleName: 'Satisfacción (1-5)',
          syntheticMinimum: 1,
          syntheticMaximum: 5,
          currentPolarity: 'unresolved',
          suggestedPolarity,
        }
      },
      ...(otherBlockingIssue ? [{
        id: 'ENT_I_MISSING',
        domain: 'identifiers' as const,
        sourceLabel: 'Email missing',
        sourceKey: 'missing',
        status: 'unmapped' as const,
        required: true,
        origin: 'inherited' as const,
        issueIds: ['ISS_BLOCK_01']
      }] : [])
    ],
    ignoredColumns: [],
    issues,
    resolvedIssueIds: [],
    deferredIssueIds: [],
    domainSummaries: {} as import('../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes').HistoricalImportMappingDraft['domainSummaries'],
    globalStatus: isSimulatedError ? 'simulated-error' : 'needs-review',
    readiness: { canContinueToConfirmation: false } as import('../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes').HistoricalImportMappingReadiness,
    canContinueToConfirmation: false,
  };
};

export const historicalImportResolutionScenarios: HistoricalImportResolutionScenario[] = [
  {
    scenarioId: 'polarity-ambiguous-default',
    baseDraft: createBaseDraftWithAmbiguousScale('unresolved'),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-selected',
      resolvedByRole: 'admin',
    },
    expected: {
      success: true,
      issueStatus: 'resolved',
      entityPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-selected',
      globalStatus: 'ready-for-confirmation',
      cta: true,
      boundaryAvailable: true,
    }
  },
  {
    scenarioId: 'high-is-favorable-suggested',
    baseDraft: createBaseDraftWithAmbiguousScale('high-is-favorable'),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      resolvedByRole: 'admin',
    },
    expected: {
      success: true,
      issueStatus: 'resolved',
      entityPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      globalStatus: 'ready-for-confirmation',
      cta: true,
      boundaryAvailable: true,
    }
  },
  {
    scenarioId: 'low-is-favorable-suggested',
    baseDraft: createBaseDraftWithAmbiguousScale('low-is-favorable'),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'low-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      resolvedByRole: 'admin',
    },
    expected: {
      success: true,
      issueStatus: 'resolved',
      entityPolarity: 'low-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      globalStatus: 'ready-for-confirmation',
      cta: true,
      boundaryAvailable: true,
    }
  },
  {
    scenarioId: 'manual-resolution-required',
    baseDraft: createBaseDraftWithAmbiguousScale('unresolved'),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'low-is-favorable',
      resolutionOrigin: 'user-selected',
      resolvedByRole: 'admin',
    },
    expected: {
      success: true,
      issueStatus: 'resolved',
      entityPolarity: 'low-is-favorable',
      resolutionOrigin: 'user-selected',
      globalStatus: 'ready-for-confirmation',
      cta: true,
      boundaryAvailable: true,
    }
  },
  {
    scenarioId: 'resolution-restored-to-suggestion',
    baseDraft: createBaseDraftWithAmbiguousScale('high-is-favorable'),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'high-is-favorable',
      resolutionOrigin: 'restored-to-suggestion',
      resolvedByRole: 'admin',
    },
    expected: {
      success: true,
      issueStatus: 'resolved',
      entityPolarity: 'high-is-favorable',
      resolutionOrigin: 'restored-to-suggestion',
      globalStatus: 'ready-for-confirmation',
      cta: true,
      boundaryAvailable: true,
    }
  },
  {
    scenarioId: 'other-blocking-issue-remains',
    baseDraft: createBaseDraftWithAmbiguousScale('high-is-favorable', true),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      resolvedByRole: 'admin',
    },
    expected: {
      success: true,
      issueStatus: 'resolved',
      entityPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      globalStatus: 'blocked',
      cta: false,
      boundaryAvailable: false,
    }
  },
  {
    scenarioId: 'configuration-incompatible',
    baseDraft: createBaseDraftWithAmbiguousScale('high-is-favorable'),
    compatibility: 'incompatible',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      resolvedByRole: 'admin',
    },
    expected: {
      success: false,
      errorCode: 'mapping-incompatible',
      issueStatus: 'open',
      entityPolarity: 'unresolved',
      resolutionOrigin: 'simulated-suggestion',
      globalStatus: 'needs-review',
      cta: false,
      boundaryAvailable: false,
    }
  },
  {
    scenarioId: 'simulated-error',
    baseDraft: createBaseDraftWithAmbiguousScale('high-is-favorable', false, true),
    compatibility: 'current',
    resolutionInput: {
      mappingIssueId: 'ISS_S_AMB_01',
      mappingEntityId: 'ENT_S_AMB_01',
      resolutionType: 'confirm-polarity',
      selectedPolarity: 'high-is-favorable',
      resolutionOrigin: 'user-confirmed-suggestion',
      resolvedByRole: 'admin',
    },
    expected: {
      success: false,
      errorCode: 'mapping-simulated-error',
      issueStatus: 'open',
      entityPolarity: 'unresolved',
      resolutionOrigin: 'simulated-suggestion',
      globalStatus: 'simulated-error',
      cta: false,
      boundaryAvailable: false,
    }
  }
];
