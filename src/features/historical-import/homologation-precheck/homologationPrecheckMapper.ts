import type {
  HomologationPrecheckInput,
  HomologationPrecheckEntity,
  HomologationPrecheckDecision,
  HomologationPrecheckResult,
  HomologationPrecheckSummary,
  HomologationPrecheckPrivacyBoundary,
  HomologationPrecheckCapabilities,
} from './types';

const normalizeLabel = (label: string): string => {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

const createId = (entityType: string, label: string, index: number): string => {
  return `${entityType}-${normalizeLabel(label).replace(/[^a-z0-9]/g, '-')}-${index}`;
};

export const mapHomologationPrecheck = (
  input: HomologationPrecheckInput
): HomologationPrecheckResult => {
  const entities: HomologationPrecheckEntity[] = [];
  const decisions: HomologationPrecheckDecision[] = [];

  const privacyBoundary: HomologationPrecheckPrivacyBoundary = {
    privacyAssured: true,
    classificationReason: 'Homologation precheck runs on secure metadata only, avoiding direct data exposure.',
    rawRowsIncluded: false,
    fullWorkbookIncluded: false,
    rawJsonIncluded: false,
    containsOnlyMetadata: true,
    localOnly: true,
  };

  const capabilities: HomologationPrecheckCapabilities = {
    canHomologate: input.sheetLayout !== 'unknown' && input.confidence !== 'blocked',
    classificationReason: 'Determined from layout confidence.',
    requiresHumanReview: true,
  };

  if (input.sheetLayout === 'aggregated_items_by_rows') {
    entities.push({
      id: createId('question_or_item', 'aggregated_items', 1),
      entityType: 'question_or_item',
      state: 'needs_review',
      confidence: 'blocked',
      reason: 'Requires safe parsing of row values to identify items properly.',
      detectedSignals: [],
    });

    entities.push({
      id: createId('dimension', 'aggregated_dimensions', 1),
      entityType: 'dimension',
      state: 'needs_review',
      confidence: 'blocked',
      reason: 'Requires safe parsing of row values to identify dimensions properly.',
      detectedSignals: [],
    });

    const metricMatch = input.sampleColumnLabels.some(label =>
      ['favorabilidad', 'favorable', 'positivo', 'negativo', 'neutro'].includes(normalizeLabel(label))
    );

    entities.push({
      id: createId('metric', 'aggregated_metrics', 1),
      entityType: 'metric',
      state: metricMatch ? 'suggested_match' : 'needs_review',
      confidence: metricMatch ? 'medium' : 'blocked',
      reason: metricMatch ? 'Detected positive/negative perception metrics in columns.' : 'Cannot map standard metrics automatically.',
      detectedSignals: input.sampleColumnLabels,
    });

    entities.push({
      id: createId('participant_identifier', 'aggregated_participants', 1),
      entityType: 'participant_identifier',
      state: 'not_applicable',
      confidence: 'high',
      reason: 'Aggregated files usually do not contain participant identifiers.',
      detectedSignals: [],
    });

    entities.push({
      id: createId('response_scale', 'aggregated_scale', 1),
      entityType: 'response_scale',
      state: 'needs_review',
      confidence: 'blocked',
      reason: 'Explicit scale configuration is not identifiable from column headers alone.',
      detectedSignals: [],
    });
  } else if (input.sheetLayout === 'raw_responses_by_columns') {
    entities.push({
      id: createId('question_or_item', 'raw_items', 1),
      entityType: 'question_or_item',
      state: 'suggested_match',
      confidence: 'medium',
      reason: 'Columns typically map directly to survey items/questions.',
      detectedSignals: input.sampleColumnLabels,
    });

    entities.push({
      id: createId('dimension', 'raw_dimensions', 1),
      entityType: 'dimension',
      state: 'needs_review',
      confidence: 'low',
      reason: 'Raw responses do not inherently include dimension mapping without catalog or structured header rows.',
      detectedSignals: [],
    });

    const identifierMatch = input.sampleColumnLabels.some(label =>
      ['documento', 'correo', 'email', 'identificacion', 'id', 'employee_id', 'colaborador_id'].includes(normalizeLabel(label))
    );

    entities.push({
      id: createId('participant_identifier', 'raw_participants', 1),
      entityType: 'participant_identifier',
      state: identifierMatch ? 'suggested_match' : 'needs_review',
      confidence: identifierMatch ? 'medium' : 'low',
      reason: identifierMatch ? 'Detected possible direct or indirect participant identifiers.' : 'No identifiable participant columns found.',
      detectedSignals: input.sampleColumnLabels,
    });
  } else if (input.sheetLayout === 'segment_summary') {
    entities.push({
      id: createId('source_file_role', 'segment_file', 1),
      entityType: 'source_file_role',
      state: 'suggested_match',
      confidence: 'medium',
      reason: 'File role suggests it serves as a segment grouping for an overarching survey cycle.',
      detectedSignals: [input.sourceFileRole],
    });

    decisions.push({
      id: createId('decision', 'confirm_segment_mapping', 1),
      title: 'Confirm Segment Mapping',
      entityType: 'segment',
      sourceLabel: input.sourceFileRole,
      suggestedTarget: 'survey_segment',
      reason: 'The file seems to be a segment summary, need to confirm it belongs to the current cycle as a subset.',
      confidence: 'medium',
      impact: 'Mapping affects how demographic boundaries are applied to this file.',
      options: [
        { id: 'opt_confirm_segment', label: 'Confirm as Segment Summary' },
        { id: 'opt_reject_segment', label: 'Reject, treat as normal responses' },
      ],
      recommendedOptionId: 'opt_confirm_segment',
    });
  }

  entities.forEach((entity, idx) => {
    if (entity.state === 'needs_review' || entity.state === 'blocked') {
      decisions.push({
        id: createId('decision', `confirm_${entity.entityType}_mapping`, idx),
        title: `Review ${entity.entityType} mapping`,
        entityType: entity.entityType,
        sourceLabel: entity.sourceLabel || 'unknown',
        suggestedTarget: 'manual_mapping',
        reason: entity.reason,
        confidence: entity.confidence,
        impact: `Incorrect mapping of ${entity.entityType} may invalidate import structure.`,
        options: [
          { id: 'opt_manual_map', label: 'Manually Map' },
          { id: 'opt_skip_map', label: 'Skip' },
        ],
        recommendedOptionId: 'opt_manual_map',
      });
    }
  });

  const summary: HomologationPrecheckSummary = {
    itemsStatus: entities.find(e => e.entityType === 'question_or_item')?.state === 'suggested_match' ? 'Detected from structure' : 'Requires row parsing before mapping',
    dimensionsStatus: entities.find(e => e.entityType === 'dimension')?.state === 'suggested_match' ? 'Detected' : 'Requires catalog or deeper inspection',
    metricsStatus: entities.find(e => e.entityType === 'metric')?.state === 'suggested_match' ? 'Inferred standard metrics' : 'Needs review',
    segmentsStatus: input.sheetLayout === 'segment_summary' ? 'Inferred as segment' : 'Not segment summary',
    participantIdentificationStatus: entities.find(e => e.entityType === 'participant_identifier')?.state === 'suggested_match' ? 'Detected potential identifiers' : 'No identifiers found or not applicable',
    responseScaleStatus: entities.find(e => e.entityType === 'response_scale')?.state === 'suggested_match' ? 'Scale inferred' : 'Scale configuration needs explicit mapping',
    decisionsCount: decisions.length,
    blockingDecisionsCount: decisions.filter(d => d.confidence === 'blocked').length,
    recommendedNextStep: 'Review structural mapping before generating load draft',
  };

  return {
    entities,
    decisions,
    summary,
    privacyBoundary,
    capabilities,
  };
};
