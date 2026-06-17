import type {
  HistoricalImportMappingDraft,
  HistoricalImportReviewMappingSource,
  HistoricalImportMappingDomainSummary,
  HistoricalMappingDomain,
  HistoricalImportMappingDraftStatus,
  HistoricalImportMappingReadiness,
  HistoricalImportMappingConfirmationBoundary,
  HistoricalConfigurationCompatibilityCheck,
  HistoricalImportMappingIssue,
  HistoricalMappingIssueResolutionInput,
  HistoricalMappingIssueResolutionResult,
  HistoricalImportMappingEntity,
} from './historicalImportReviewMappingTypes';
import type {
  HistoricalImportReviewMappingBoundary,
  HistoricalImportConfigurationSource
} from '../configuration/historicalImportConfigurationTypes';
import {
  HISTORICAL_MAPPING_MAX_PRIORITY_ISSUES,
  HISTORICAL_MAPPING_PRIORITY_ORDER,
  HISTORICAL_MAPPING_REQUIRED_DOMAINS,
} from '../../../config/survey-import/historicalImportReviewMappingConfig';
import { historicalImportReviewMappingScenarios } from '../../../mocks/survey-import/review-mapping/historicalImportReviewMappingScenarios';

export const buildMappingSignature = (draft: HistoricalImportMappingDraft): string => {
  const confirmedIds = [...draft.entities]
    .filter(e => e.status === 'confirmed')
    .map(e => e.id)
    .sort();
  const ignoredIds = [...draft.ignoredColumns].map(i => i.id).sort();
  const deferredIds = [...draft.deferredIssueIds].sort();

  return [
    draft.mappingDraftId,
    draft.configurationDraftId,
    draft.sourceBatchId,
    draft.configurationSignature,
    draft.globalStatus,
    `C:${confirmedIds.length}`,
    `I:${ignoredIds.length}`,
    `D:${deferredIds.length}`
  ].join('|');
};

export const buildConfigurationSignature = (
  surveyType: string,
  privacyMode: string,
  periodYear: number
): string => {
  return `${surveyType}|${privacyMode}|${periodYear}`;
};

export const checkConfigurationCompatibility = (
  draftSignature: string,
  source: HistoricalImportReviewMappingSource
): HistoricalConfigurationCompatibilityCheck => {
  const currentSignature = buildConfigurationSignature(
    source.confirmedSurveyType,
    source.confirmedPrivacyMode || '',
    source.confirmedPeriodYear
  );

  if (draftSignature === currentSignature) {
    return { status: 'current', currentSignature, draftSignature };
  }

  // Assuming any structural change is incompatible for now
  return {
    status: 'incompatible',
    currentSignature,
    draftSignature,
    reason: 'Cambio estructural detectado en la configuración.',
  };
};

export const deriveDomainSummaries = (draft: HistoricalImportMappingDraft): Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary> => {
  const summaries: Partial<Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary>> = {};

  const ALL_DOMAINS: HistoricalMappingDomain[] = [
    'questions',
    'scales',
    'participants',
    'hierarchies',
    'demographics',
    'identifiers',
    'relations',
    'ignored-columns',
  ];

  for (const domain of ALL_DOMAINS) {
    const domainEntities = draft.entities.filter(e => e.domain === domain);
    const domainIssues = draft.issues.filter(i => i.domain === domain && i.resolutionStatus === 'open');
    const blockingIssues = domainIssues.filter(i => i.severity === 'blocking');

    let total = domainEntities.length;
    let confirmed = 0;
    let needsReviewCount = 0;
    let ambiguous = 0;
    let unmapped = 0;
    let ignored = 0;
    let blocked = 0;

    for (const ent of domainEntities) {
      if (ent.status === 'confirmed') confirmed++;
      if (ent.status === 'needs-review') needsReviewCount++;
      if (ent.status === 'ambiguous') ambiguous++;
      if (ent.status === 'unmapped') unmapped++;
      if (ent.status === 'ignored') ignored++;
      if (ent.status === 'blocked') blocked++;
    }

    if (domain === 'ignored-columns') {
      const ignoredCols = draft.ignoredColumns.length;
      total += ignoredCols;
      ignored += ignoredCols;
    }

    let status: HistoricalImportMappingDomainSummary['status'] = 'confirmed';
    if (total === 0) status = 'confirmed';
    else if (blocked > 0 || blockingIssues.length > 0) status = 'blocked';
    else if (needsReviewCount > 0 || ambiguous > 0) status = 'needs-review';
    else if (unmapped > 0 && HISTORICAL_MAPPING_REQUIRED_DOMAINS.includes(domain)) status = 'needs-review';
    else if (ignored === total && total > 0) status = 'ignored';
    else if (unmapped > 0) status = 'unmapped';

    summaries[domain] = {
      domain,
      total,
      confirmed,
      needsReview: needsReviewCount,
      ambiguous,
      unmapped,
      ignored,
      blocked,
      issueCount: domainIssues.length,
      blockingIssueCount: blockingIssues.length,
      status,
      reviewAvailability: total > 0 || domainIssues.length > 0 ? 'available' : 'hidden',
    };
  }

  return summaries as Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary>;
};

export const deriveReadiness = (draft: HistoricalImportMappingDraft): HistoricalImportMappingReadiness => {
  const blockingIssues = draft.issues.filter(i => i.severity === 'blocking' && i.resolutionStatus === 'open');
  const pendingIssues = draft.issues.filter(i => (i.severity === 'needs-review' || i.severity === 'confirmation-required') && i.resolutionStatus === 'open');
  const simErrorIssues = draft.issues.filter(i => i.severity === 'simulated-error' && i.resolutionStatus === 'open');

  const unmappedRequired = draft.entities.filter(e => e.required && e.status === 'unmapped').length;
  const unresolvedScales = draft.entities.filter(e => e.domain === 'scales' && (e.status === 'ambiguous' || e.status === 'needs-review')).length;
  const missingIdentifiers = draft.entities.filter(e => e.domain === 'identifiers' && e.required && e.status === 'unmapped').length;

  const hasInheritedBlock = draft.issues.some(i => i.code === 'INHERITED_CONFIG_BLOCK' && i.resolutionStatus === 'open');

  const canContinue =
    !hasInheritedBlock &&
    blockingIssues.length === 0 &&
    simErrorIssues.length === 0 &&
    unmappedRequired === 0 &&
    unresolvedScales === 0 &&
    missingIdentifiers === 0 &&
    pendingIssues.length === 0;

  return {
    configurationValid: !hasInheritedBlock,
    blockingMappingsCount: draft.entities.filter(e => e.status === 'blocked').length,
    requiredUnmappedCount: unmappedRequired,
    unresolvedScaleCount: unresolvedScales,
    missingIdentifierCount: missingIdentifiers,
    incompleteCriticalRelationsCount: 0,
    pendingConfirmationCount: draft.entities.filter(e => e.status === 'ambiguous' || e.status === 'needs-review').length,
    simulatedErrorCount: simErrorIssues.length,
    blockingIssueIds: blockingIssues.map(i => i.id),
    pendingIssueIds: pendingIssues.map(i => i.id),
    canContinueToConfirmation: canContinue,
  };
};

export const determineGlobalStatus = (readiness: HistoricalImportMappingReadiness): HistoricalImportMappingDraftStatus => {
  if (readiness.simulatedErrorCount > 0) return 'simulated-error';
  if (readiness.blockingIssueIds.length > 0 || readiness.blockingMappingsCount > 0) return 'blocked';
  if (readiness.requiredUnmappedCount > 0 || readiness.pendingConfirmationCount > 0 || readiness.pendingIssueIds.length > 0) return 'needs-review';
  if (readiness.canContinueToConfirmation) return 'ready-for-confirmation';
  return 'incomplete';
};

export const getPriorityIssues = (issues: HistoricalImportMappingIssue[]): HistoricalImportMappingIssue[] => {
  const openIssues = issues.filter(i => i.resolutionStatus === 'open');
  openIssues.sort((a, b) => {
    const orderA = HISTORICAL_MAPPING_PRIORITY_ORDER.indexOf(a.severity);
    const orderB = HISTORICAL_MAPPING_PRIORITY_ORDER.indexOf(b.severity);
    return orderA - orderB;
  });
  return openIssues.slice(0, HISTORICAL_MAPPING_MAX_PRIORITY_ISSUES);
};

export const validateReferences = (draft: HistoricalImportMappingDraft): string[] => {
  const errors: string[] = [];
  const entityIds = new Set(draft.entities.map(e => e.id));
  if (entityIds.size !== draft.entities.length) errors.push('Duplicate entity IDs detected.');

  const issueIds = new Set(draft.issues.map(i => i.id));
  if (issueIds.size !== draft.issues.length) errors.push('Duplicate issue IDs detected.');

  const ignoredColIds = new Set(draft.ignoredColumns.map(i => i.id));
  if (ignoredColIds.size !== draft.ignoredColumns.length) errors.push('Duplicate ignored column IDs detected.');

  for (const entity of draft.entities) {
    for (const iId of entity.issueIds) {
      if (!issueIds.has(iId)) errors.push(`Entity ${entity.id} refers to non-existent issue ${iId}.`);
    }
  }

  for (const issue of draft.issues) {
    if (issue.entityId && !entityIds.has(issue.entityId)) {
      errors.push(`Issue ${issue.id} refers to non-existent entity ${issue.entityId}.`);
    }
  }

  return errors;
};

export const enrichDraft = (draft: Omit<HistoricalImportMappingDraft, 'domainSummaries' | 'globalStatus' | 'readiness' | 'canContinueToConfirmation'>): HistoricalImportMappingDraft => {
  const summaries = deriveDomainSummaries(draft as HistoricalImportMappingDraft);
  const tempDraft = { ...draft, domainSummaries: summaries } as HistoricalImportMappingDraft;
  const readiness = deriveReadiness(tempDraft);
  const status = determineGlobalStatus(readiness);

  return {
    ...tempDraft,
    readiness,
    globalStatus: status,
    canContinueToConfirmation: readiness.canContinueToConfirmation,
  };
};

export const getReviewMappingScenario = (scenarioId: string): HistoricalImportMappingDraft => {
  let scenario = historicalImportReviewMappingScenarios.find(s => s.scenarioId === scenarioId);

  // Prototype contractual fix: align transition from configuration
  if (!scenario && scenarioId === 'ready-for-mapping') {
    scenario = historicalImportReviewMappingScenarios.find(s => s.scenarioId === 'ready-for-confirmation');
  }

  if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

  const enriched = enrichDraft(scenario.initialDraft);
  const errors = validateReferences(enriched);
  if (errors.length > 0) {
    console.warn('Scenario validation errors:', errors);
  }

  return JSON.parse(JSON.stringify(enriched));
};

export const buildConfirmationBoundary = (draft: HistoricalImportMappingDraft, source: HistoricalImportReviewMappingSource): HistoricalImportMappingConfirmationBoundary | null => {
  if (!draft.canContinueToConfirmation) return null;

  const confirmedEntityReferences: Record<HistoricalMappingDomain, string[]> = {
    questions: [],
    scales: [],
    participants: [],
    hierarchies: [],
    demographics: [],
    identifiers: [],
    relations: [],
    'ignored-columns': [],
  };

  for (const entity of draft.entities) {
    if (entity.status === 'confirmed') {
      confirmedEntityReferences[entity.domain].push(entity.id);
    }
  }

  return {
    mappingDraftId: draft.mappingDraftId,
    configurationDraftId: draft.configurationDraftId,
    sourceBatchId: draft.sourceBatchId,
    sourceScenarioId: draft.sourceScenarioId,
    configurationSignature: draft.configurationSignature,
    mappingSignature: buildMappingSignature(draft),
    fileCount: source.fileCount,
    confirmedConfiguration: {
      surveyName: source.confirmedSurveyName,
      surveyType: source.confirmedSurveyType,
      periodMode: source.confirmedPeriodMode,
      periodYear: source.confirmedPeriodYear,
      privacyMode: source.confirmedPrivacyMode,
      minimumThreshold: source.confirmedMinimumThreshold,
      visibilityMode: source.confirmedVisibilityMode,
    },
    confirmedEntityReferences,
    ignoredColumnIds: draft.ignoredColumns.map(i => i.id),
    resolvedIssueIds: draft.resolvedIssueIds,
    deferredIssueIds: draft.deferredIssueIds,
    finalDomainSummaries: draft.domainSummaries,
    readiness: draft.readiness,
    canContinueToConfirmation: draft.canContinueToConfirmation,
  };
};

export const buildMappingSourceFromConfiguration = (
  boundary: HistoricalImportReviewMappingBoundary,
  configSource: HistoricalImportConfigurationSource
): HistoricalImportReviewMappingSource => {
  const scenario = historicalImportReviewMappingScenarios.find(s => s.scenarioId === boundary.sourceScenarioId);
  const baseRelations = scenario ? scenario.source.relationsSummary : [];

  return {
    configurationDraftId: boundary.configurationDraftId,
    sourceBatchId: boundary.sourceBatchId,
    sourceScenarioId: boundary.sourceScenarioId,
    confirmedSurveyName: boundary.confirmedConfiguration.surveyName,
    confirmedSurveyType: boundary.confirmedConfiguration.surveyType,
    confirmedPeriodYear: boundary.confirmedConfiguration.periodYear,
    confirmedPeriodMode: boundary.confirmedConfiguration.periodMode,
    confirmedPrivacyMode: boundary.confirmedConfiguration.privacyMode,
    confirmedMinimumThreshold: boundary.confirmedConfiguration.minimumThreshold,
    confirmedVisibilityMode: boundary.confirmedConfiguration.visibilityMode || 'administrators-only',
    fileCount: configSource.fileCount,
    structuralFamilies: Object.keys(configSource.familySummary),
    detectedRoles: Object.keys(configSource.roleSummary),
    relationsSummary: baseRelations,
    deferredConfigurationIssueIds: boundary.deferredIssueIds,
    configurationReadiness: boundary.isReadyForMapping,
    configurationSignature: buildConfigurationSignature(
      boundary.confirmedConfiguration.surveyType,
      boundary.confirmedConfiguration.privacyMode,
      boundary.confirmedConfiguration.periodYear
    ),
  };
};

export const resolveMappingIssue = (
  baseDraft: HistoricalImportMappingDraft,
  compatibilityStatus: 'current' | 'stale' | 'incompatible',
  input: HistoricalMappingIssueResolutionInput
): HistoricalMappingIssueResolutionResult => {
  if (compatibilityStatus !== 'current') {
    return {
      ok: false,
      errorCode: 'mapping-incompatible',
      messageKey: 'resolution.error.mapping_incompatible',
      originalDraft: baseDraft,
    };
  }

  if (baseDraft.globalStatus === 'simulated-error') {
    return {
      ok: false,
      errorCode: 'mapping-simulated-error',
      messageKey: 'resolution.error.mapping_simulated_error',
      originalDraft: baseDraft,
    };
  }

  const issue = baseDraft.issues.find(i => i.id === input.mappingIssueId);
  if (!issue) {
    return { ok: false, errorCode: 'issue-not-found', messageKey: 'resolution.error.issue_not_found', originalDraft: baseDraft };
  }

  if (issue.resolutionStatus !== 'open') {
    return { ok: false, errorCode: 'issue-already-resolved', messageKey: 'resolution.error.issue_already_resolved', originalDraft: baseDraft };
  }

  const entity = baseDraft.entities.find(e => e.id === input.mappingEntityId);
  if (!entity) {
    return { ok: false, errorCode: 'entity-not-found', messageKey: 'resolution.error.entity_not_found', originalDraft: baseDraft };
  }

  if (issue.entityId !== entity.id) {
    return { ok: false, errorCode: 'issue-entity-mismatch', messageKey: 'resolution.error.issue_entity_mismatch', originalDraft: baseDraft };
  }

  if (input.resolutionType !== 'confirm-polarity' || issue.code !== 'AMBIGUOUS_POLARITY') {
    return { ok: false, errorCode: 'unsupported-issue', messageKey: 'resolution.error.unsupported_issue', originalDraft: baseDraft };
  }

  if (input.selectedPolarity === 'unresolved') {
    return { ok: false, errorCode: 'invalid-polarity', messageKey: 'resolution.error.invalid_polarity', originalDraft: baseDraft };
  }

  const updatedEntity: HistoricalImportMappingEntity = {
    ...entity,
    status: 'confirmed',
    scaleMetadata: entity.scaleMetadata ? {
      ...entity.scaleMetadata,
      currentPolarity: input.selectedPolarity,
      confirmedResolutionType: input.resolutionType,
      resolutionOrigin: input.resolutionOrigin,
    } : undefined
  };

  const updatedIssue: HistoricalImportMappingIssue = {
    ...issue,
    resolutionStatus: 'resolved',
  };

  const updatedEntities = baseDraft.entities.map(e => e.id === entity.id ? updatedEntity : e);
  const updatedIssues = baseDraft.issues.map(i => i.id === issue.id ? updatedIssue : i);
  const updatedResolvedIssueIds = [...baseDraft.resolvedIssueIds, issue.id].sort();

  const tempDraft: HistoricalImportMappingDraft = {
    ...baseDraft,
    entities: updatedEntities,
    issues: updatedIssues,
    resolvedIssueIds: updatedResolvedIssueIds,
  };

  const enrichedDraft = enrichDraft(tempDraft);

  return {
    ok: true,
    updatedDraft: enrichedDraft,
    issueId: issue.id,
    entityId: entity.id,
    expectedGlobalStatus: enrichedDraft.globalStatus,
    expectedBoundaryAvailable: enrichedDraft.canContinueToConfirmation,
  };
};
