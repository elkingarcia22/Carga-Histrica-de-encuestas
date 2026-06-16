import type {
  HistoricalPrivacyMode,
  HistoricalVisibilityMode,
  HistoricalConfigurationDraftStatus,
  HistoricalFieldOrigin,
  HistoricalConfigurationIssueSeverity,
} from '../../lib/survey-import/configuration/historicalImportConfigurationTypes';

export const HISTORICAL_CONFIGURATION_PRIVACY_LABELS: Record<HistoricalPrivacyMode, string> = {
  anonymous: 'Anónima',
  confidential: 'Confidencial',
  identified: 'Identificada',
};

export const HISTORICAL_CONFIGURATION_VISIBILITY_LABELS: Record<HistoricalVisibilityMode, string> = {
  'administrators-only': 'Solo administradores',
  'administrators-and-authorized-consultants': 'Administradores y consultores autorizados',
};

export const HISTORICAL_CONFIGURATION_STATUS_LABELS: Record<HistoricalConfigurationDraftStatus, string> = {
  incomplete: 'Incompleto',
  valid: 'Válido',
  'confirmation-required': 'Requiere confirmación',
  'blocked-by-inherited-issue': 'Bloqueado por incidencia heredada',
  'simulated-error': 'Error de simulación',
  'ready-for-mapping': 'Listo para mapeo',
};

export const HISTORICAL_CONFIGURATION_ORIGIN_LABELS: Record<HistoricalFieldOrigin, string> = {
  inherited: 'Heredado',
  'simulated-suggestion': 'Sugerido',
  'user-edited': 'Editado',
  'user-confirmed': 'Confirmado',
};

export const HISTORICAL_CONFIGURATION_ISSUE_SEVERITY_PRIORITY: Record<HistoricalConfigurationIssueSeverity, number> = {
  blocking: 4,
  'simulated-error': 3,
  'confirmation-required': 2,
  'deferred-to-mapping': 1,
};

export const HISTORICAL_CONFIGURATION_DEFAULTS = {
  privacyMode: 'confidential' as HistoricalPrivacyMode,
  minimumThreshold: 5,
};

export const HISTORICAL_CONFIGURATION_LIMITS = {
  nameMinLength: 3,
  nameMaxLength: 100,
  thresholdMin: 3,
  thresholdMax: 10,
  yearMin: 2000,
  yearMax: 2030,
};

export const HISTORICAL_CONFIGURATION_MOCK_TYPES = [
  'Clima',
  'Engagement',
  'Pulso',
  'Onboarding',
  'Exit',
  'Evaluación 360',
];

export const HISTORICAL_CONFIGURATION_VALIDATION_MESSAGES = {
  nameRequired: 'El nombre de la encuesta es obligatorio.',
  nameLength: `El nombre debe tener entre ${HISTORICAL_CONFIGURATION_LIMITS.nameMinLength} y ${HISTORICAL_CONFIGURATION_LIMITS.nameMaxLength} caracteres.`,
  typeRequired: 'Debe seleccionar un tipo de encuesta.',
  typeConfirmationRequired: 'Debe confirmar el tipo sugerido.',
  yearRequired: 'Debe seleccionar un año.',
  yearInvalid: 'El año seleccionado no es válido.',
  privacyRequired: 'Debe seleccionar la privacidad.',
  privacyConfirmationRequired: 'Debe confirmar el modo identificado.',
  thresholdRequired: 'El umbral mínimo es obligatorio para encuestas confidenciales.',
  thresholdInvalid: `El umbral debe estar entre ${HISTORICAL_CONFIGURATION_LIMITS.thresholdMin} y ${HISTORICAL_CONFIGURATION_LIMITS.thresholdMax}.`,
  visibilityRequired: 'Debe seleccionar la visibilidad.',
  inheritedBlocking: 'Debe resolver las incidencias bloqueantes heredadas antes de continuar.',
  simulatedError: 'Se ha producido un error sintético en la simulación.',
};

export const HISTORICAL_CONFIGURATION_DISCLOSURE = {
  title: 'Configuración simulada',
  description: 'Esta pantalla es una simulación basada en los datos analizados. Ninguna configuración se guardará permanentemente hasta completar la importación final.',
};
