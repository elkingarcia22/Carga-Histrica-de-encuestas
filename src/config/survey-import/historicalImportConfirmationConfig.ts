import type {
  HistoricalConfirmationStatus,
  HistoricalConfirmationCompatibility,
  HistoricalConfirmationRole,
} from '../../lib/survey-import/confirmation/historicalImportConfirmationTypes';

export const HISTORICAL_IMPORT_CONFIRMATION_CONFIG = {
  statusLabels: {
    'incomplete': 'Incompleto',
    'confirmation-required': 'Confirmación requerida',
    'blocked': 'Bloqueado',
    'stale': 'Mapeo desactualizado',
    'incompatible': 'Mapeo incompatible',
    'ready-for-confirmation': 'Listo para confirmar',
    'confirmation-prepared': 'Confirmación preparada',
    'simulated-error': 'Error del sistema',
  } as Record<HistoricalConfirmationStatus, string>,

  compatibilityLabels: {
    'current': 'Vigente',
    'stale': 'Desactualizado',
    'incompatible': 'Incompatible',
  } as Record<HistoricalConfirmationCompatibility, string>,

  roleLabels: {
    'implementation-consultant': 'Consultor de implementación',
    'client-administrator': 'Administrador del cliente',
  } as Record<HistoricalConfirmationRole, string>,

  copy: {
    disclosureTitle: 'Aviso de simulación',
    disclosureDescription: 'Esta pantalla muestra una simulación in-memory de los datos a importar. No se modificará la base de datos hasta iniciar la ejecución simulada.',
    checkboxLabel: 'He revisado la configuración y el mapeo, y confirmo que los datos están listos para ser importados.',
    checkboxDescription: 'Al confirmar, se preparará la importación histórica. Este proceso es simulado en el prototipo.',
    feedbackPreparedTitle: 'Confirmación preparada',
    feedbackPreparedDescription: 'La confirmación ha sido guardada en memoria. Puedes proceder con la simulación.',
    disabledReasonUnmetRequirements: 'Resuelve todos los errores bloqueantes y marca el check de confirmación para continuar.',
    disabledReasonStale: 'El mapeo ha cambiado. Por favor vuelve a la pantalla de mapeo para actualizar la revisión.',
    disabledReasonIncompatible: 'La fuente es incompatible. Es necesario reiniciar el proceso.',
  },

  unmetRequirementCodes: {
    BOUNDARY_INVALID: 'BOUNDARY_INVALID',
    MAPPING_NOT_READY: 'MAPPING_NOT_READY',
    COMPATIBILITY_STALE: 'COMPATIBILITY_STALE',
    COMPATIBILITY_INCOMPATIBLE: 'COMPATIBILITY_INCOMPATIBLE',
    BLOCKING_ISSUES_PRESENT: 'BLOCKING_ISSUES_PRESENT',
    PENDING_CONFIRMATION_ISSUES: 'PENDING_CONFIRMATION_ISSUES',
    REQUIRED_IGNORED_COLUMNS: 'REQUIRED_IGNORED_COLUMNS',
    EXPLICIT_CONFIRMATION_MISSING: 'EXPLICIT_CONFIRMATION_MISSING',
    SIMULATED_ERROR_PRESENT: 'SIMULATED_ERROR_PRESENT',
    ALREADY_PREPARED: 'ALREADY_PREPARED',
  },
};
