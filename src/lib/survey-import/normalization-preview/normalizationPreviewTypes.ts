export type NormalizationBatchId = string;
export type NormalizationScenarioId = string;
export type NormalizationFileId = string;
export type NormalizationIssueId = string;
export type NormalizationRelationId = string;
export type NormalizationMappingId = string;

export type NormalizationStructuralFamily =
  | 'individual-responses-raw'
  | 'question-catalog'
  | 'participant-roster'
  | 'organizational-hierarchy'
  | 'organizational-aggregate-report'
  | 'demographic-aggregate-report'
  | 'unknown'
  | 'incompatible';

export type NormalizationFileRole =
  | 'primary-source'
  | 'complementary-source'
  | 'question-catalog-auxiliary'
  | 'participant-roster-auxiliary'
  | 'hierarchy-auxiliary'
  | 'validation-evidence'
  | 'redundant'
  | 'confirmation-required'
  | 'incompatible'
  | 'different-period'
  | 'different-survey';

export type NormalizationFileStatus =
  | 'recognized'
  | 'confirmation-required'
  | 'redundant'
  | 'incompatible'
  | 'different-survey'
  | 'different-period'
  | 'simulated-error';

export type NormalizationRelationType =
  | 'complementary'
  | 'supporting'
  | 'duplicated'
  | 'conflicting'
  | 'unrelated';

export type NormalizationGlobalStatus =
  | 'ready-for-configuration'
  | 'review-required'
  | 'blocked'
  | 'empty'
  | 'simulated-error';

export type NormalizationSimulatedConfidence = 'high' | 'medium' | 'low';

export type NormalizationIssueSeverity =
  | 'informational'
  | 'warning'
  | 'confirmation-required'
  | 'blocking';

export type NormalizationIssueScope =
  | 'batch'
  | 'file'
  | 'relation'
  | 'mapping';

export interface NormalizationStructuralSummary {
  sheetCount?: number;
  columnCount?: number;
  questionCount?: number;
  participantCount?: number;
  responseRecordCount?: number;
  demographicFieldCount?: number;
  organizationalUnitCount?: number;
}

export interface NormalizationFileSummary {
  id: NormalizationFileId;
  sanitizedFilename: string;
  extension: string;
  sizeBytes: number;
  order: number;
  structuralFamily: NormalizationStructuralFamily;
  proposedRole: NormalizationFileRole;
  detectedSurveyIdentity?: string;
  detectedSurveyType?: string;
  detectedPeriod?: string;
  simulatedConfidence: NormalizationSimulatedConfidence;
  status: NormalizationFileStatus;
  structuralSummary: NormalizationStructuralSummary;
  issueIds: NormalizationIssueId[];
  relationIds: NormalizationRelationId[];
}

export interface NormalizationRelation {
  id: NormalizationRelationId;
  sourceFileId: NormalizationFileId;
  targetFileId: NormalizationFileId;
  type: NormalizationRelationType;
  explanation: string;
  issueIds: NormalizationIssueId[];
}

export interface NormalizationIssue {
  id: NormalizationIssueId;
  scope: NormalizationIssueScope;
  severity: NormalizationIssueSeverity;
  code: string;
  title: string;
  description: string;
  blocking: boolean;
  relatedFileIds: NormalizationFileId[];
  relatedRelationIds: NormalizationRelationId[];
  relatedMappingIds: NormalizationMappingId[];
  suggestedResolution?: string;
}

export type NormalizationMappingStatus =
  | 'recognized'
  | 'confirmation-required'
  | 'unrecognized'
  | 'ignored'
  | 'blocked';

export interface NormalizationMapping {
  id: NormalizationMappingId;
  sourceLabel: string;
  sourceFileId: NormalizationFileId;
  sourceCategory: string;
  proposedTarget?: string;
  status: NormalizationMappingStatus;
  simulatedConfidence: NormalizationSimulatedConfidence;
  requiresConfirmation: boolean;
  issueIds: NormalizationIssueId[];
}

export interface NormalizationBatch {
  batchId: NormalizationBatchId;
  scenarioId: NormalizationScenarioId;
  surveyIdentity: string;
  surveyType: string;
  surveyPeriod: string;
  fileCount: number;
  status: NormalizationGlobalStatus;
  primarySourceFileId?: NormalizationFileId;
  fileSummaries: NormalizationFileSummary[];
  relations: NormalizationRelation[];
  issues: NormalizationIssue[];
  mappings: NormalizationMapping[];
}

export interface NormalizationPreviewTotals {
  files: number;
  relations: number;
  issues: number;
  mappings: number;
  blockingIssues: number;
  confirmationRequiredIssues: number;
}

export interface NormalizationPreviewModel {
  batch: NormalizationBatch;
  totals: NormalizationPreviewTotals;
  statusSummary: string;
  blockingReasons: string[];
  canContinueToConfiguration: boolean;
  visibleFiles: NormalizationFileSummary[];
  visibleRelations: NormalizationRelation[];
  visibleIssues: NormalizationIssue[];
  visibleMappings: NormalizationMapping[];
}
