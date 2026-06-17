import type {
  HistoricalMappingDomain,
  HistoricalMappingEntityStatus,
  HistoricalImportMappingDraftStatus,
  HistoricalMappingIssueSeverity,
  HistoricalMappingIgnoredReason,
  HistoricalMappingOrigin,
  HistoricalMappingIssueOwnership,
} from '../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

export const HISTORICAL_MAPPING_DOMAIN_LABELS: Record<HistoricalMappingDomain, string> = {
  questions: 'Preguntas',
  scales: 'Escalas',
  participants: 'Participantes',
  hierarchies: 'Jerarquías',
  demographics: 'Demográficos',
  identifiers: 'Identificadores',
  relations: 'Relaciones',
  'ignored-columns': 'Columnas ignoradas',
};

export const HISTORICAL_MAPPING_ENTITY_STATUS_LABELS: Record<HistoricalMappingEntityStatus, string> = {
  confirmed: 'Confirmado',
  'needs-review': 'Requiere revisión',
  ambiguous: 'Ambiguo',
  unmapped: 'Sin mapear',
  ignored: 'Ignorado',
  blocked: 'Bloqueado',
};

export const HISTORICAL_MAPPING_DRAFT_STATUS_LABELS: Record<HistoricalImportMappingDraftStatus, string> = {
  incomplete: 'Incompleto',
  'needs-review': 'Requiere revisión',
  blocked: 'Bloqueado',
  'confirmation-required': 'Confirmación requerida',
  'ready-for-confirmation': 'Listo para confirmar',
  'simulated-error': 'Error de simulación',
  incompatible: 'Incompatible',
  stale: 'Desactualizado',
};

export const HISTORICAL_MAPPING_ISSUE_SEVERITY_LABELS: Record<HistoricalMappingIssueSeverity, string> = {
  blocking: 'Bloqueante',
  'needs-review': 'Requiere revisión',
  'confirmation-required': 'Confirmación requerida',
  deferred: 'Diferido',
  informational: 'Informativo',
  'simulated-error': 'Error',
};

export const HISTORICAL_MAPPING_IGNORED_REASON_LABELS: Record<HistoricalMappingIgnoredReason, string> = {
  'suggested-technical': 'Columna técnica sugerida',
  unsupported: 'No soportado',
  'optional-metadata': 'Metadatos opcionales',
  'user-ignored': 'Ignorado por usuario',
};

export const HISTORICAL_MAPPING_ORIGIN_LABELS: Record<HistoricalMappingOrigin, string> = {
  inherited: 'Heredado',
  'simulated-suggestion': 'Sugerencia automática',
  'user-confirmed': 'Confirmado manualmente',
  'user-ignored': 'Ignorado manualmente',
  derived: 'Derivado',
};

export const HISTORICAL_MAPPING_OWNERSHIP_LABELS: Record<HistoricalMappingIssueOwnership, string> = {
  normalization: 'Normalización',
  configuration: 'Configuración',
  'mapping-overview': 'Resumen de mapeo',
  'future-domain-review': 'Revisión detallada',
  confirmation: 'Confirmación',
};

export const HISTORICAL_MAPPING_PRIORITY_ORDER: HistoricalMappingIssueSeverity[] = [
  'simulated-error',
  'blocking',
  'confirmation-required',
  'needs-review',
  'deferred',
  'informational',
];

export const HISTORICAL_MAPPING_MAX_PRIORITY_ISSUES = 3;

export const HISTORICAL_MAPPING_REQUIRED_DOMAINS: HistoricalMappingDomain[] = [
  'questions',
  'scales',
  'identifiers',
];

export const HISTORICAL_MAPPING_READINESS_MESSAGES = {
  ready: 'Todos los dominios están listos para la importación.',
  blocked: 'Hay bloqueos que impiden continuar.',
  unmappedRequired: 'Hay campos obligatorios sin mapear.',
  unresolvedScale: 'Existen escalas con ambigüedades sin resolver.',
  missingIdentifier: 'Faltan identificadores críticos.',
  simulatedError: 'Un error simulado impide continuar.',
};

export const HISTORICAL_MAPPING_SIMULATED_DISCLOSURE_COPY = {
  title: 'Análisis asistido simulado',
  description: 'Esta pantalla muestra una simulación determinística del estado de mapeo de archivos históricos. Ciertas opciones de resolución profunda pueden estar temporalmente deshabilitadas en esta fase.',
};

export const HISTORICAL_MAPPING_DOMAIN_DISPLAY_ORDER: HistoricalMappingDomain[] = [
  'questions',
  'scales',
  'participants',
  'demographics',
  'hierarchies',
  'identifiers',
  'relations',
  'ignored-columns',
];

export const HISTORICAL_MAPPING_POLARITY_LABELS: Record<string, string> = {
  'high-is-favorable': 'Puntuación alta es favorable',
  'low-is-favorable': 'Puntuación baja es favorable',
  'unresolved': 'Sin resolver',
};

export const HISTORICAL_MAPPING_RESOLUTION_ORIGIN_LABELS: Record<string, string> = {
  'simulated-suggestion': 'Sugerencia simulada',
  'user-confirmed-suggestion': 'Sugerencia confirmada',
  'user-selected': 'Selección manual',
  'restored-to-suggestion': 'Sugerencia restaurada',
};

export const HISTORICAL_MAPPING_RESOLUTION_TYPE_LABELS: Record<string, string> = {
  'confirm-polarity': 'Confirmar polaridad',
};

export const HISTORICAL_MAPPING_RESOLUTION_ERROR_MESSAGES: Record<string, string> = {
  'issue-not-found': 'No se encontró la incidencia referenciada.',
  'entity-not-found': 'No se encontró la entidad referenciada.',
  'issue-entity-mismatch': 'La incidencia no corresponde a la entidad indicada.',
  'unsupported-issue': 'El tipo de incidencia no soporta esta resolución.',
  'invalid-polarity': 'Debe seleccionar una polaridad válida.',
  'mapping-incompatible': 'La configuración origen es incompatible. Refresque el mapeo.',
  'mapping-simulated-error': 'Error interno. No se pueden guardar resoluciones.',
  'issue-already-resolved': 'Esta incidencia ya fue resuelta.',
};

export const HISTORICAL_MAPPING_RESOLUTION_COPY = {
  simulatedSuggestionDisclosure: 'Basado en el análisis de tus datos históricos, te sugerimos esta equivalencia. Confírmala o cámbiala si es necesario.',
  impactExplanation: 'Esta decisión afectará cómo se calculan los promedios y el porcentaje de favorabilidad en los resultados de tu medición.',
};
