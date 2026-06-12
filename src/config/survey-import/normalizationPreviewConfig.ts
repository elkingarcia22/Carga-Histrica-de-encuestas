import type {
  NormalizationStructuralFamily,
  NormalizationFileRole,
  NormalizationFileStatus,
  NormalizationSimulatedConfidence,
  NormalizationIssueSeverity,
  NormalizationGlobalStatus,
} from '../../lib/survey-import/normalization-preview/normalizationPreviewTypes';

export const NORMALIZATION_PREVIEW_CONFIG = {
  structuralFamilyLabels: {
    'individual-responses-raw': 'Respuestas Individuales (Raw)',
    'question-catalog': 'Catálogo de Preguntas',
    'participant-roster': 'Padrón de Participantes',
    'organizational-hierarchy': 'Jerarquía Organizacional',
    'organizational-aggregate-report': 'Reporte Agregado Organizacional',
    'demographic-aggregate-report': 'Reporte Agregado Demográfico',
    'unknown': 'Desconocido',
    'incompatible': 'Incompatible',
  } satisfies Record<NormalizationStructuralFamily, string>,

  fileRoleLabels: {
    'primary-source': 'Fuente Principal',
    'complementary-source': 'Fuente Complementaria',
    'question-catalog-auxiliary': 'Auxiliar: Catálogo de Preguntas',
    'participant-roster-auxiliary': 'Auxiliar: Padrón de Participantes',
    'hierarchy-auxiliary': 'Auxiliar: Jerarquía',
    'validation-evidence': 'Evidencia de Validación',
    'redundant': 'Redundante',
    'confirmation-required': 'Requiere Confirmación',
    'incompatible': 'Incompatible',
    'different-period': 'Periodo Diferente',
    'different-survey': 'Encuesta Diferente',
  } satisfies Record<NormalizationFileRole, string>,

  fileStatusLabels: {
    'recognized': 'Reconocido',
    'confirmation-required': 'Requiere Confirmación',
    'redundant': 'Redundante',
    'incompatible': 'Incompatible',
    'different-survey': 'Encuesta Diferente',
    'different-period': 'Periodo Diferente',
    'simulated-error': 'Error Simulado',
  } satisfies Record<NormalizationFileStatus, string>,

  globalStatusLabels: {
    'ready-for-configuration': 'Listo para Configuración',
    'review-required': 'Revisión Requerida',
    'blocked': 'Bloqueado',
    'empty': 'Vacío',
    'simulated-error': 'Error Simulado',
  } satisfies Record<NormalizationGlobalStatus, string>,

  confidenceLabels: {
    'high': 'Alta',
    'medium': 'Media',
    'low': 'Baja',
  } satisfies Record<NormalizationSimulatedConfidence, string>,

  severityLabels: {
    'informational': 'Informativo',
    'warning': 'Advertencia',
    'confirmation-required': 'Requiere Confirmación',
    'blocking': 'Bloqueante',
  } satisfies Record<NormalizationIssueSeverity, string>,

  issueSeverityPriority: {
    'blocking': 1,
    'confirmation-required': 2,
    'warning': 3,
    'informational': 4,
  } satisfies Record<NormalizationIssueSeverity, number>,

  supportedIssueCodes: [
    'MIXED_PERIOD',
    'MIXED_SURVEY',
    'MISSING_PRIMARY_SOURCE',
    'INCOMPATIBLE_FILE',
    'REDUNDANT_FILES',
    'UNRECOGNIZED_COLUMN',
    'SIMULATED_ERROR',
  ] as const,

  limits: {
    maxFilesPreview: 10,
    maxIssuesPreview: 50,
  },
} as const;
