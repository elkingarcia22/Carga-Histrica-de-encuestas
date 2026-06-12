import type {
  HistoricalPreviewStatus,
  HistoricalPreviewPeriodRole,
  HistoricalPreviewDistributionCategory,
  HistoricalPreviewCapabilityStatus,
  HistoricalPreviewSegmentStatus,
  HistoricalPreviewInsightType,
  HistoricalPreviewDeltaDirection,
  HistoricalPreviewDisclosure,
  HistoricalPreviewIssueCode,
} from '@/lib/survey-import/historical-preview/historicalPreviewTypes';

/**
 * 1. Copy principal y Disclosure
 */
export const HISTORICAL_PREVIEW_MAIN_COPY = {
  title: 'Vista histórica simulada',
  contextDescription: 'Representación sintética de resultados históricos. El contenido de los archivos seleccionados no fue leído ni procesado.',
} as const;

export const HISTORICAL_PREVIEW_DISCLOSURE: HistoricalPreviewDisclosure = {
  title: 'Vista histórica simulada',
  description: 'Los resultados mostrados son datos sintéticos para validar la experiencia del prototipo. El contenido de los archivos seleccionados no fue leído ni procesado.',
  isPersistent: true,
};

/**
 * 2. Headings de secciones
 */
export const HISTORICAL_PREVIEW_SECTION_HEADINGS = {
  periodComparison: 'Comparación de periodos',
  keyIndicators: 'Indicadores principales',
  distribution: 'Distribución de respuestas',
  historicalComparison: 'Comparación histórica',
  availableCapabilities: 'Capacidades disponibles',
  segments: 'Segmentos',
  syntheticInsights: 'Insights sintéticos',
  actions: 'Acciones',
} as const;

/**
 * 3. Métricas y Unidades
 */
export const HISTORICAL_PREVIEW_METRIC_LABELS = {
  favorability: 'Favorabilidad',
  participation: 'Participación',
  responses: 'Respuestas',
  favorabilityVariation: 'Variación de favorabilidad',
} as const;

export const HISTORICAL_PREVIEW_METRIC_UNITS = {
  percentage: 'porcentaje',
  percentagePoints: 'puntos porcentuales',
  responses: 'respuestas',
} as const;

/**
 * 4. Roles de periodo
 */
export const HISTORICAL_PREVIEW_PERIOD_ROLES: Record<HistoricalPreviewPeriodRole, string> = {
  base: 'Periodo base',
  comparison: 'Periodo comparativo',
  additional: 'Periodo adicional',
};

/**
 * 5. Distribución
 */
export const HISTORICAL_PREVIEW_DISTRIBUTION_CATEGORIES: Record<HistoricalPreviewDistributionCategory, string> = {
  favorable: 'Favorable',
  neutral: 'Neutral',
  unfavorable: 'Desfavorable',
};

export const HISTORICAL_PREVIEW_DISTRIBUTION_ACCESSIBILITY = {
  genericDescription: 'Distribución de respuestas clasificada por nivel de favorabilidad.',
} as const;

/**
 * 6. Estados
 */
export const HISTORICAL_PREVIEW_STATUS_COPY: Record<HistoricalPreviewStatus, string> = {
  'preview-ready': 'Resumen disponible.',
  'preview-limited': 'Parte de la información sintética no está disponible o no cumple las reglas requeridas para comparación completa.',
  'preview-empty': 'No existen datos sintéticos suficientes para mostrar la vista histórica.',
  'preview-error-simulated': 'La vista simulada no pudo prepararse de forma segura.',
};

/**
 * 7. Acciones
 */
export const HISTORICAL_PREVIEW_ACTIONS = {
  returnToProcessing: 'Volver al procesamiento simulado',
  returnToFiles: 'Volver a archivos',
  closePreview: 'Cerrar vista previa',
  continueToConfig: 'Continuar a configuración',
  continueToConfigExplanation: 'Esta acción aún no está disponible en esta versión del prototipo.',
} as const;

/**
 * 8. Capacidades y Segmentos
 */
export const HISTORICAL_PREVIEW_CAPABILITY_STATUS: Record<HistoricalPreviewCapabilityStatus, string> = {
  available: 'Disponibles',
  partial: 'Parciales',
  unavailable: 'No disponibles',
};

export const HISTORICAL_PREVIEW_SEGMENT_STATUS: Record<HistoricalPreviewSegmentStatus, string> = {
  available: 'Disponibles',
  unavailable: 'No disponibles',
  restricted: 'Restringidos',
};

/**
 * 9. Insights determinísticos
 * Se estructura el copy estable asociado a los tipos reales definidos en historicalPreviewTypes.ts
 */
export const HISTORICAL_PREVIEW_INSIGHTS_COPY: Record<
  HistoricalPreviewInsightType,
  Partial<Record<HistoricalPreviewDeltaDirection, string>>
> = {
  'favorability-variation': {
    positive: 'La favorabilidad aumentó entre los periodos comparados.',
    negative: 'La favorabilidad disminuyó entre los periodos comparados.',
    neutral: 'La favorabilidad se mantuvo estable entre los periodos comparados.',
  },
  'participation-variation': {
    positive: 'La participación aumentó entre los periodos comparados.',
    negative: 'La participación disminuyó entre los periodos comparados.',
    neutral: 'La participación se mantuvo estable entre los periodos comparados.',
  },
  'stability': {
    neutral: 'Los resultados se mantuvieron estables entre los periodos comparados.',
  },
};

/**
 * 10. Accesibilidad
 */
export const HISTORICAL_PREVIEW_ACCESSIBILITY_LABELS = {
  kpiSummary: 'Resumen de indicadores principales',
  positiveDirection: 'Dirección positiva',
  negativeDirection: 'Dirección negativa',
  noVariation: 'Sin variación',
  basePeriod: 'Periodo base',
  comparisonPeriod: 'Periodo comparativo',
  periodDistribution: 'Distribución por periodo',
  syntheticPeriodComparison: 'Comparación de dos periodos sintéticos',
  moduleUnavailable: 'Módulo no disponible',
  actionDisabled: 'Acción deshabilitada',
} as const;

/**
 * 11. Issues seguros
 */
export const HISTORICAL_PREVIEW_SAFE_ISSUES: Record<HistoricalPreviewIssueCode, string> = {
  CONTRACT_REJECTED: 'El contrato de datos para la vista histórica no fue aceptado de forma segura.',
  INVALID_METRICS: 'Los indicadores presentados no cumplen las reglas de consistencia.',
  MISSING_DATA: 'Faltan datos requeridos para construir la vista histórica completa.',
  INVALID_DISTRIBUTION: 'La distribución de respuestas no es válida o está incompleta.',
  ERR_INVALID_SYNTHETIC_MOCK: 'El modelo sintético suministrado no pudo ser procesado.',
};
