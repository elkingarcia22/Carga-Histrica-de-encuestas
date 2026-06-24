export type StructureInventoryEntityType =
  | 'dimension'
  | 'question'
  | 'demographic'
  | 'metric'
  | 'segment'
  | 'decision';

export type StructureInventoryReviewState =
  | 'pending_review'
  | 'confirmed'
  | 'renamed'
  | 'moved'
  | 'ignored'
  | 'blocked'
  | 'not_applicable';

export type StructureInventoryConfidence =
  | 'high'
  | 'medium'
  | 'low'
  | 'blocked';

export interface StructureInventorySourceTrace {
  sourceFileName: string;
  sourceSheetName: string;
  sourceLayout: string;
  sourceEntityType: string;
  sourceLabel: string;
  normalizedSourceLabel: string;
  sourceRowReference?: number;
  sourceColumnReference?: string;
  confidence: StructureInventoryConfidence;
  detectionReason: string;
}

export interface StructureInventoryDimension {
  id: string;
  entityType: 'dimension';
  label: string;
  trace: StructureInventorySourceTrace;
  reviewState: StructureInventoryReviewState;
}

export interface StructureInventoryQuestion {
  id: string;
  entityType: 'question';
  label: string;
  dimensionId?: string;
  trace: StructureInventorySourceTrace;
  reviewState: StructureInventoryReviewState;
}

export interface StructureInventoryDemographic {
  id: string;
  entityType: 'demographic';
  label: string;
  trace: StructureInventorySourceTrace;
  reviewState: StructureInventoryReviewState;
}

export interface StructureInventoryMetric {
  id: string;
  entityType: 'metric';
  label: string;
  trace: StructureInventorySourceTrace;
  reviewState: StructureInventoryReviewState;
}

export interface StructureInventorySegment {
  id: string;
  entityType: 'segment';
  label: string;
  trace: StructureInventorySourceTrace;
  reviewState: StructureInventoryReviewState;
}

export interface StructureInventoryDecision {
  id: string;
  entityType: 'decision';
  description: string;
  isBlocking: boolean;
  trace: StructureInventorySourceTrace;
  reviewState: StructureInventoryReviewState;
}

export interface StructureInventorySummary {
  dimensionsCount: number;
  questionsCount: number;
  demographicsCount: number;
  metricsCount: number;
  segmentsCount: number;
  decisionsCount: number;
  blockingDecisionsCount: number;
  inventoryDetailAvailable: boolean;
  recommendedNextStep: string;
}

export interface StructureInventoryCapabilities {
  inventoryDetailAvailable: boolean;
  canListDimensions: boolean;
  canListQuestions: boolean;
  canListDemographics: boolean;
  canListMetrics: boolean;
  canListSegments: boolean;
  requiresSecureRowInventory: boolean;
  fallbackReason?: string;
}

export interface SafeHomologationPrecheckResult {
  isHomologationPossible: boolean;
  reason: string;
}

export interface StructureInventoryInput {
  fileName: string;
  sheetName: string;
  sheetLayout: string;
  rowCount: number;
  columnCount: number;
  sampleColumnLabels: string[];
  detectedSignals: string[];
  classificationReason: string;
  confidence: string;
  participantIdentificationState: string;
  sourceFileRole: string;
  homologationPrecheckResult?: SafeHomologationPrecheckResult;
}

export interface StructureInventoryResult {
  dimensions: StructureInventoryDimension[];
  questions: StructureInventoryQuestion[];
  demographics: StructureInventoryDemographic[];
  metrics: StructureInventoryMetric[];
  segments: StructureInventorySegment[];
  decisions: StructureInventoryDecision[];
  summary: StructureInventorySummary;
  capabilities: StructureInventoryCapabilities;
}
