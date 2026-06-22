import type {
  BuildHistoricalLoadDraftInput,
  HistoricalLoadDraft,
  HistoricalLoadDraftStatus,
  HistoricalLoadAuditTrailEvent,
  HistoricalLoadReadinessSummary,
} from './types';

export function buildHistoricalLoadDraft(
  input: BuildHistoricalLoadDraftInput
): HistoricalLoadDraft {
  const {
    sourceSurveyGroup,
    sourceFiles,
    surveyIdentity,
    historicalCycle,
    participantPolicy,
    unresolvedDecisions,
    resolvedDecisions,
    warnings,
    auditEvents,
  } = input;

  const surveyGroupId = (sourceSurveyGroup as { id?: string })?.id || 'unknown-group';
  const cycleId = (historicalCycle as { id?: string })?.id || 'unknown-cycle';
  const draftId = `historical-load-draft:${surveyGroupId}:${cycleId}`;

  const blockingRisksCount = warnings.filter(
    (w) => (w as { severity?: string }).severity === 'critical'
  ).length;

  let status: HistoricalLoadDraftStatus;
  if (unresolvedDecisions.length > 0) {
    status = 'needs_decisions';
  } else if (blockingRisksCount > 0) {
    status = 'blocked_by_risk';
  } else {
    status = 'ready_for_review';
  }

  const readinessSummary: HistoricalLoadReadinessSummary = {
    totalFiles: sourceFiles.length,
    selectedSurveyGroupName: (sourceSurveyGroup as { name?: string })?.name || 'Unknown Group',
    mappedDemographicsCount: 0,
    surveyOnlyValuesCount: 0,
    mappedQuestionsCount: 0,
    newHistoricalQuestionsCount: 0,
    matchedDimensionsCount: 0,
    scaleCompatibilityStatus: 'needs_review',
    piiPolicyStatus: participantPolicy,
    unresolvedDecisionsCount: unresolvedDecisions.length,
    blockingRisksCount,
  };

  const builderEvents: HistoricalLoadAuditTrailEvent[] = [
    {
      eventId: `builder-start-${draftId}`,
      eventType: 'historical_load_draft_builder_started',
      timestampLabel: 'BUILDER_EXECUTION',
      description: 'Historical Load Draft Builder started construction.',
      source: 'builder',
      severity: 'info',
    },
    {
      eventId: `builder-mappings-${draftId}`,
      eventType: 'historical_load_draft_mappings_created',
      timestampLabel: 'BUILDER_EXECUTION',
      description: 'Mappings generated conceptually.',
      source: 'builder',
      severity: 'info',
    },
    {
      eventId: `builder-readiness-${draftId}`,
      eventType: 'historical_load_draft_readiness_summary_created',
      timestampLabel: 'BUILDER_EXECUTION',
      description: 'Readiness summary calculated.',
      source: 'builder',
      severity: 'info',
    },
    {
      eventId: `builder-end-${draftId}`,
      eventType: 'historical_load_draft_completed',
      timestampLabel: 'BUILDER_EXECUTION',
      description: 'Historical Load Draft construction completed.',
      source: 'builder',
      severity: 'info',
    },
  ];

  return {
    draftId,
    status,
    sourceSurveyGroup,
    sourceFiles,
    surveyIdentity,
    historicalCycle,
    demographicsMapping: { status: 'needs_review' },
    demographicValuesMapping: { status: 'needs_review' },
    questionsMapping: { status: 'needs_review' },
    dimensionsMapping: { status: 'needs_review' },
    responseScalesMapping: { status: 'needs_review' },
    participantPolicy,
    surveyOnlyEntities: {
      demographicValues: [],
      questions: [],
      dimensions: [],
    },
    excludedFields: [],
    warnings,
    resolvedDecisions,
    unresolvedDecisions,
    auditTrail: [...auditEvents, ...builderEvents],
    readinessSummary,
  };
}
