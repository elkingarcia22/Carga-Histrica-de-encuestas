import type { DemoFixtureDataset } from "../demo-fixture/types";
import type { DraftReadinessInput } from "../draft-preparation/draftReadinessMapper";
import type { OverlayAction } from "../overlay-editing/types";

export function mapDemoFixtureToReadinessInput(
  fixture: DemoFixtureDataset,
  overlayState: Record<string, string>
): DraftReadinessInput {
  const sourceKind = 'review_overlay';

  const overlayActions: OverlayAction[] = Object.entries(overlayState).map(([id, newLabel]) => ({
    id: `overlay_${id}`,
    targetEntityId: id,
    targetEntityType: 'dimension',
    actionType: 'rename_dimension_label',
    previousLabel: '', // Not strictly needed for mapping length logic
    nextLabel: newLabel,
    reason: 'Preview simulation',
    sourceTrace: 'review_overlay',
    reviewState: 'approved',
    createdBy: 'demo_user',
    createdAtLabel: '2025-01-01T12:00:00.000Z'
  }));

  return {
    sourceCycles: fixture.surveyCycles.map(c => ({
      id: c,
      label: c,
      yearLabel: c.replace('qs_clima_', ''),
      sourceKind,
      reviewState: 'reviewed'
    })),
    sourceDimensions: fixture.sourceLayer.dimensions.map(d => ({
      id: d.id,
      sourceDimensionId: d.id,
      label: overlayState[d.id] || d.displayLabel,
      originalLabel: d.displayLabel,
      hasLocalAdjustment: !!overlayState[d.id],
      sourceKind,
      reviewState: 'reviewed'
    })),
    sourceQuestions: fixture.sourceLayer.questions.map(q => ({
      id: q.id,
      sourceQuestionId: q.id,
      label: overlayState[q.id] || q.displayLabel,
      originalLabel: q.displayLabel,
      questionType: q.questionType,
      hasLocalAdjustment: !!overlayState[q.id],
      sourceKind,
      reviewState: 'reviewed'
    })),
    sourceQuestionMappings: fixture.sourceLayer.mappings.map(m => ({
      id: m.id,
      questionId: m.questionId,
      dimensionId: m.detectedDimensionId,
      mappingSource: m.mappingSource,
      hasLocalAdjustment: false,
      sourceKind,
      reviewState: 'reviewed'
    })),
    sourceMetrics: fixture.sourceLayer.metrics.map(m => ({
      id: m.id,
      label: m.displayLabel,
      metricType: m.metricType,
      includedInDraft: true,
      sourceKind,
      reviewState: 'reviewed'
    })),
    sourceDemographics: fixture.sourceLayer.demographics.map(d => ({
      id: d.id,
      label: d.displayLabel,
      demographicType: d.demographicType,
      includedInDraft: true,
      isSegmentable: d.isSegmentableByDefault,
      isSensitive: d.isSensitive,
      sourceKind,
      reviewState: 'reviewed'
    })),
    sourceSegments: fixture.sourceLayer.segments.map(s => ({
      id: s.id,
      label: s.displayLabel,
      segmentType: s.segmentType,
      sourceFileIds: s.sourceFileIds,
      includedInDraft: true,
      sourceKind,
      reviewState: 'reviewed'
    })),
    reviewDecisions: fixture.sourceLayer.decisions.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      severity: d.severity,
      status: d.reviewState === 'pending' ? 'pending' : 'resolved',
      relatedEntityType: d.entityType,
      relatedEntityId: d.entityId,
      sourceKind
    })),
    privacyBoundary: {
      realResponsesIncluded: fixture.privacyBoundary.realResponsesIncluded,
      openTextIncluded: fixture.privacyBoundary.openTextIncluded,
      piiIncluded: fixture.privacyBoundary.piiIncluded,
      rawRowsIncluded: fixture.privacyBoundary.rawRowsIncluded,
      workbookDumpIncluded: fixture.privacyBoundary.workbookDumpIncluded,
      apiConnected: fixture.privacyBoundary.apiConnected,
      storageConnected: fixture.privacyBoundary.storageConnected,
      claudeConnected: fixture.privacyBoundary.claudeConnected,
      privacyRiskLevel: fixture.privacyBoundary.piiIncluded ? 'high' : fixture.privacyBoundary.rawRowsIncluded ? 'medium' : 'low',
      notes: ''
    },
    overlayActions
  };
}
