/**
 * Contratos locales serializables para Historical Preview Simulated.
 * Estos tipos definen las estructuras determinísticas para el fixture sintético,
 * el modelo compacto de UI y el resultado del adaptador.
 *
 * RESTRICCIONES:
 * - Typescript estricto.
 * - Compatible con verbatimModuleSyntax.
 * - Interfaces y propiedades readonly.
 * - Arrays readonly.
 * - Uniones literales cerradas.
 * - Sin imports runtime, clases, enums, React, objetos Error o binarios.
 */

/**
 * 1. Estados principales
 */
export type HistoricalPreviewStatus =
  | 'preview-ready'
  | 'preview-limited'
  | 'preview-empty'
  | 'preview-error-simulated';

/**
 * 2. IDs de escenario
 */
export type HistoricalPreviewScenarioId =
  | 'historical-preview-comparison-ready'
  | 'historical-preview-limited'
  | 'historical-preview-empty'
  | 'historical-preview-error-simulated';

/**
 * 3. Roles de periodo
 */
export type HistoricalPreviewPeriodRole =
  | 'base'
  | 'comparison'
  | 'additional';

/**
 * 4. Disponibilidad
 */
export type HistoricalPreviewAvailability =
  | 'available'
  | 'partial'
  | 'unavailable';

/**
 * 5. Categorías de distribución
 */
export type HistoricalPreviewDistributionCategory =
  | 'favorable'
  | 'neutral'
  | 'unfavorable';

/**
 * 6. Delta
 */
export type HistoricalPreviewDeltaDirection =
  | 'positive'
  | 'negative'
  | 'neutral';

export type HistoricalPreviewDeltaUnit = 'percentage-points';

/**
 * 7. Capacidades
 */
export type HistoricalPreviewCapabilityStatus = HistoricalPreviewAvailability;

/**
 * 8. Segmentos
 */
export type HistoricalPreviewSegmentStatus =
  | 'available'
  | 'unavailable'
  | 'restricted';

/**
 * 9. Insights
 */
export type HistoricalPreviewInsightType =
  | 'favorability-variation'
  | 'participation-variation'
  | 'stability';

export type HistoricalPreviewInsightSeverity =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

/**
 * 10. Identidad de encuesta
 */
export interface HistoricalPreviewSurveyIdentity {
  readonly displayName: string;
  readonly surveyTypeLabel: string;
  readonly mode: 'aggregated-comparison';
  readonly sourceLabel: string;
  readonly periodCount: number;
}

/**
 * 11. Métricas de periodo
 */
export interface HistoricalPreviewPeriodMetrics {
  readonly favorability: number | null;
  readonly participationRate: number | null;
  readonly totalResponses: number | null;
}

/**
 * 12. Distribución
 */
export interface HistoricalPreviewDistributionItem {
  readonly categoryId: HistoricalPreviewDistributionCategory;
  readonly percentage: number;
  readonly responseCount: number;
  readonly order: number;
}

/**
 * 13. Periodo
 */
export interface HistoricalPreviewPeriod {
  readonly periodId: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly chronologicalOrder: number;
  readonly role: HistoricalPreviewPeriodRole;
  readonly isSynthetic: boolean;
  readonly metrics: HistoricalPreviewPeriodMetrics;
  readonly distribution: readonly HistoricalPreviewDistributionItem[];
}

/**
 * 14. Delta de favorabilidad
 */
export interface HistoricalPreviewFavorabilityDelta {
  readonly value: number;
  readonly unit: HistoricalPreviewDeltaUnit;
  readonly direction: HistoricalPreviewDeltaDirection;
  readonly basePeriodId: string;
  readonly comparisonPeriodId: string;
}

/**
 * 15. Tendencia
 */
export interface HistoricalPreviewTrendPoint {
  readonly periodId: string;
  readonly label: string;
  readonly favorability: number | null;
  readonly participationRate: number | null;
  readonly order: number;
}

/**
 * 16. Capacidad
 */
export interface HistoricalPreviewCapability {
  readonly capabilityId: string;
  readonly label: string;
  readonly status: HistoricalPreviewCapabilityStatus;
  readonly description: string; // Puede ser clave de configuración
}

/**
 * 17. Segmentos
 */
export interface HistoricalPreviewSegmentSummary {
  readonly availableCount: number;
  readonly status: HistoricalPreviewSegmentStatus;
  readonly label: string; // Puede ser clave de configuración
}

/**
 * 18. Insight
 */
export interface HistoricalPreviewInsight {
  readonly insightId: string;
  readonly type: HistoricalPreviewInsightType;
  readonly severity: HistoricalPreviewInsightSeverity;
  readonly isSynthetic: boolean;
  readonly messageKey: string;
  readonly referenceValue?: number;
}

/**
 * 19. Disclosure
 */
export interface HistoricalPreviewDisclosure {
  readonly title: string;
  readonly description: string;
  readonly isPersistent: boolean;
}

/**
 * 20. Issues seguros
 */
export type HistoricalPreviewIssueSeverity = 'warning' | 'error';
export type HistoricalPreviewIssueModule = 'adapter' | 'contract' | 'metrics';
export type HistoricalPreviewIssueCode =
  | 'CONTRACT_REJECTED'
  | 'INVALID_METRICS'
  | 'MISSING_DATA'
  | 'INVALID_DISTRIBUTION'
  | 'ERR_INVALID_SYNTHETIC_MOCK';

export interface HistoricalPreviewIssue {
  readonly code: HistoricalPreviewIssueCode;
  readonly severity: HistoricalPreviewIssueSeverity;
  readonly module: HistoricalPreviewIssueModule;
  readonly safeMessageKey: string;
}

/**
 * 21. HistoricalPreviewScenario
 * Representa el fixture sintético ejecutable.
 */
export interface HistoricalPreviewScenario {
  readonly scenarioId: HistoricalPreviewScenarioId;
  readonly expectedStatus: HistoricalPreviewStatus;
  readonly isSynthetic: true;
  readonly identity: HistoricalPreviewSurveyIdentity;
  readonly periods: readonly HistoricalPreviewPeriod[];
  readonly capabilities: readonly HistoricalPreviewCapability[];
  readonly segments: HistoricalPreviewSegmentSummary;
  readonly disclosure: HistoricalPreviewDisclosure;
}

/**
 * 22. HistoricalPreviewModel
 * Representa el modelo compacto final para UI.
 */
export interface HistoricalPreviewModel {
  readonly previewId: string;
  readonly scenarioId: HistoricalPreviewScenarioId;
  readonly isSynthetic: boolean;
  readonly status: HistoricalPreviewStatus;
  readonly survey: HistoricalPreviewSurveyIdentity | null;
  readonly periods: readonly HistoricalPreviewPeriod[];
  readonly favorabilityDelta: HistoricalPreviewFavorabilityDelta | null;
  readonly trend: readonly HistoricalPreviewTrendPoint[];
  readonly capabilities: readonly HistoricalPreviewCapability[];
  readonly segments: HistoricalPreviewSegmentSummary | null;
  readonly insights: readonly HistoricalPreviewInsight[];
  readonly disclosure: HistoricalPreviewDisclosure | null;
}

/**
 * 23. Input del adapter
 */
export interface HistoricalPreviewAdapterInput {
  readonly scenarioId: HistoricalPreviewScenarioId;
}

/**
 * 24. Resultado del adapter
 */
export type HistoricalPreviewAdapterResult =
  | { readonly status: 'success'; readonly model: HistoricalPreviewModel }
  | { readonly status: 'failure'; readonly issue: HistoricalPreviewIssue };
