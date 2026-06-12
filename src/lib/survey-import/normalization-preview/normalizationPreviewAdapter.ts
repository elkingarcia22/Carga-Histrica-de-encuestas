import type {
  NormalizationBatch,
  NormalizationPreviewModel,
  NormalizationScenarioId,
  NormalizationIssue,
} from './normalizationPreviewTypes';
import { NORMALIZATION_PREVIEW_SCENARIOS } from '../../../mocks/survey-import/normalization-preview/normalizationPreviewScenarios';
import { NORMALIZATION_PREVIEW_CONFIG } from '../../../config/survey-import/normalizationPreviewConfig';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateBatchReferences = (batch: NormalizationBatch): ValidationResult => {
  const errors: string[] = [];

  if (batch.fileCount !== batch.fileSummaries.length) {
    errors.push(`fileCount (${batch.fileCount}) does not match fileSummaries length (${batch.fileSummaries.length})`);
  }

  const fileIds = new Set(batch.fileSummaries.map((f) => f.id));
  const relationIds = new Set(batch.relations.map((r) => r.id));
  const issueIds = new Set(batch.issues.map((i) => i.id));

  if (batch.primarySourceFileId && !fileIds.has(batch.primarySourceFileId)) {
    errors.push(`primarySourceFileId '${batch.primarySourceFileId}' not found in files`);
  }

  const primarySources = batch.fileSummaries.filter((f) => f.proposedRole === 'primary-source');
  if (primarySources.length > 1) {
    errors.push('More than one file has proposedRole primary-source');
  }

  for (const relation of batch.relations) {
    if (!fileIds.has(relation.sourceFileId)) errors.push(`Relation '${relation.id}' sourceFileId not found`);
    if (!fileIds.has(relation.targetFileId)) errors.push(`Relation '${relation.id}' targetFileId not found`);
    if (relation.sourceFileId === relation.targetFileId) {
      errors.push(`Relation '${relation.id}' references same file as source and target`);
    }
  }

  for (const mapping of batch.mappings) {
    if (!fileIds.has(mapping.sourceFileId)) errors.push(`Mapping '${mapping.id}' sourceFileId not found`);
  }

  for (const file of batch.fileSummaries) {
    for (const issueId of file.issueIds) {
      if (!issueIds.has(issueId)) errors.push(`File '${file.id}' references non-existent issue '${issueId}'`);
    }
    for (const relId of file.relationIds) {
      if (!relationIds.has(relId)) errors.push(`File '${file.id}' references non-existent relation '${relId}'`);
    }
  }

  const hasBlockingIssues = batch.issues.some((i) => i.blocking);
  if (batch.status === 'ready-for-configuration' && hasBlockingIssues) {
    errors.push('Batch is ready-for-configuration but has blocking issues');
  }

  if (batch.status === 'blocked' && !hasBlockingIssues) {
    errors.push('Batch is blocked but has no blocking issues');
  }

  const hasMixedPeriodIssue = batch.issues.some((i) => i.code === 'MIXED_PERIOD');
  const hasDifferentPeriodFiles = batch.fileSummaries.some((f) => f.proposedRole === 'different-period');
  if (hasMixedPeriodIssue && !hasDifferentPeriodFiles) {
    errors.push('Batch has MIXED_PERIOD issue but no different-period files');
  }

  const hasMixedSurveyIssue = batch.issues.some((i) => i.code === 'MIXED_SURVEY');
  const hasDifferentSurveyFiles = batch.fileSummaries.some((f) => f.proposedRole === 'different-survey');
  if (hasMixedSurveyIssue && !hasDifferentSurveyFiles) {
    errors.push('Batch has MIXED_SURVEY issue but no different-survey files');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getScenarioBatch = (scenarioId: NormalizationScenarioId): NormalizationBatch => {
  const scenario = NORMALIZATION_PREVIEW_SCENARIOS[scenarioId];
  if (!scenario) {
    return {
      batchId: 'unknown',
      scenarioId,
      surveyIdentity: 'Desconocido',
      surveyType: 'Desconocido',
      surveyPeriod: 'Desconocido',
      fileCount: 0,
      status: 'simulated-error',
      fileSummaries: [],
      relations: [],
      issues: [
        {
          id: 'error-not-found',
          scope: 'batch',
          severity: 'blocking',
          code: 'SCENARIO_NOT_FOUND',
          title: 'Escenario no encontrado',
          description: `No se encontró el escenario con id: ${scenarioId}`,
          blocking: true,
          relatedFileIds: [],
          relatedRelationIds: [],
          relatedMappingIds: [],
        },
      ],
      mappings: [],
    };
  }
  return scenario;
};

export const determineCanContinueToConfiguration = (batch: NormalizationBatch): boolean => {
  if (batch.fileCount === 0) return false;
  if (!batch.primarySourceFileId) return false;

  const hasBlockingIssues = batch.issues.some((i) => i.blocking);
  if (hasBlockingIssues) return false;

  const hasDifferentSurveyFiles = batch.fileSummaries.some((f) => f.status === 'different-survey');
  if (hasDifferentSurveyFiles) return false;

  const hasDifferentPeriodFiles = batch.fileSummaries.some((f) => f.status === 'different-period');
  if (hasDifferentPeriodFiles) return false;

  const hasIncompatibleCritical = batch.fileSummaries.some((f) => f.status === 'incompatible');
  if (hasIncompatibleCritical) return false;

  const hasPendingConfirmations =
    batch.fileSummaries.some((f) => f.status === 'confirmation-required') ||
    batch.issues.some((i) => i.severity === 'confirmation-required');
  if (hasPendingConfirmations) return false;

  const hasCriticalRedundancy = batch.issues.some((i) => i.code === 'REDUNDANT_FILES');
  if (hasCriticalRedundancy) return false;

  if (batch.status !== 'ready-for-configuration') return false;

  return true;
};

const getBlockingReasons = (issues: NormalizationIssue[]): string[] => {
  return issues.filter((i) => i.blocking).map((i) => i.title);
};

const sortIssuesBySeverity = (issues: NormalizationIssue[]): NormalizationIssue[] => {
  return [...issues].sort((a, b) => {
    const priorityA = NORMALIZATION_PREVIEW_CONFIG.issueSeverityPriority[a.severity] ?? 99;
    const priorityB = NORMALIZATION_PREVIEW_CONFIG.issueSeverityPriority[b.severity] ?? 99;
    return priorityA - priorityB;
  });
};

export const getNormalizationPreviewModel = (scenarioId: NormalizationScenarioId): NormalizationPreviewModel => {
  const batch = getScenarioBatch(scenarioId);

  const canContinueToConfiguration = determineCanContinueToConfiguration(batch);
  const blockingReasons = getBlockingReasons(batch.issues);
  const sortedIssues = sortIssuesBySeverity(batch.issues);

  const confirmationRequiredIssues = batch.issues.filter((i) => i.severity === 'confirmation-required').length;
  const blockingIssuesCount = batch.issues.filter((i) => i.blocking).length;

  return {
    batch,
    totals: {
      files: batch.fileCount,
      relations: batch.relations.length,
      issues: batch.issues.length,
      mappings: batch.mappings.length,
      blockingIssues: blockingIssuesCount,
      confirmationRequiredIssues,
    },
    statusSummary: NORMALIZATION_PREVIEW_CONFIG.globalStatusLabels[batch.status],
    blockingReasons,
    canContinueToConfiguration,
    visibleFiles: batch.fileSummaries,
    visibleRelations: batch.relations,
    visibleIssues: sortedIssues,
    visibleMappings: batch.mappings,
  };
};
