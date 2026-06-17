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
