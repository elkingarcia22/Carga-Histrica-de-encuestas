import type { HistoricalPreviewScenario } from '@/lib/survey-import/historical-preview/historicalPreviewTypes';

export const historicalPreviewComparisonReady: HistoricalPreviewScenario = {
  scenarioId: 'historical-preview-comparison-ready',
  expectedStatus: 'preview-ready',
  isSynthetic: true,
  identity: {
    displayName: 'Encuesta de clima demo 2025',
    surveyTypeLabel: 'Clima organizacional',
    mode: 'aggregated-comparison',
    sourceLabel: 'Origen de datos sintético',
    periodCount: 2,
  },
  periods: [
    {
      periodId: 'synthetic-period-base',
      label: 'Q4 2024',
      shortLabel: 'Q4 24',
      chronologicalOrder: 1,
      role: 'base',
      isSynthetic: true,
      metrics: {
        favorability: 68,
        participationRate: 82,
        totalResponses: 100,
      },
      distribution: [
        { categoryId: 'favorable', percentage: 68.0, responseCount: 68, order: 1 },
        { categoryId: 'neutral', percentage: 20.0, responseCount: 20, order: 2 },
        { categoryId: 'unfavorable', percentage: 12.0, responseCount: 12, order: 3 },
      ],
    },
    {
      periodId: 'synthetic-period-comparison',
      label: 'Q1 2025',
      shortLabel: 'Q1 25',
      chronologicalOrder: 2,
      role: 'comparison',
      isSynthetic: true,
      metrics: {
        favorability: 74,
        participationRate: 85,
        totalResponses: 120,
      },
      distribution: [
        { categoryId: 'favorable', percentage: 74, responseCount: 89, order: 1 },
        { categoryId: 'neutral', percentage: 16, responseCount: 19, order: 2 },
        { categoryId: 'unfavorable', percentage: 10, responseCount: 12, order: 3 },
      ],
    },
  ],
  capabilities: [
    {
      capabilityId: 'cap-participation',
      label: 'participation',
      status: 'available',
      description: 'participation',
    },
    {
      capabilityId: 'cap-favorability',
      label: 'favorability',
      status: 'available',
      description: 'favorability',
    },
    {
      capabilityId: 'cap-area-comparison',
      label: 'area-comparison',
      status: 'available',
      description: 'area-comparison',
    },
  ],
  segments: {
    availableCount: 1,
    status: 'available',
    label: 'segments',
  },
  disclosure: {
    title: 'Vista histórica simulada',
    description: 'Representación mediante datos sintéticos. Los archivos no han sido leídos.',
    isPersistent: true,
  },
};

export const historicalPreviewLimited: HistoricalPreviewScenario = {
  scenarioId: 'historical-preview-limited',
  expectedStatus: 'preview-limited',
  isSynthetic: true,
  identity: {
    displayName: 'Encuesta de clima demo 2025',
    surveyTypeLabel: 'Clima organizacional',
    mode: 'aggregated-comparison',
    sourceLabel: 'Origen de datos sintético',
    periodCount: 1,
  },
  periods: [
    {
      periodId: 'synthetic-period-base',
      label: 'Q4 2024',
      shortLabel: 'Q4 24',
      chronologicalOrder: 1,
      role: 'base',
      isSynthetic: true,
      metrics: {
        favorability: 68,
        participationRate: 82,
        totalResponses: 100,
      },
      distribution: [
        { categoryId: 'favorable', percentage: 68.0, responseCount: 68, order: 1 },
        { categoryId: 'neutral', percentage: 20.0, responseCount: 20, order: 2 },
        { categoryId: 'unfavorable', percentage: 12.0, responseCount: 12, order: 3 },
      ],
    },
  ],
  capabilities: [
    {
      capabilityId: 'cap-participation',
      label: 'participation',
      status: 'available',
      description: 'participation',
    },
    {
      capabilityId: 'cap-favorability',
      label: 'favorability',
      status: 'available',
      description: 'favorability',
    },
    {
      capabilityId: 'cap-area-comparison',
      label: 'area-comparison',
      status: 'available',
      description: 'area-comparison',
    },
  ],
  segments: {
    availableCount: 1,
    status: 'available',
    label: 'segments',
  },
  disclosure: {
    title: 'Vista histórica simulada',
    description: 'Representación mediante datos sintéticos. Los archivos no han sido leídos.',
    isPersistent: true,
  },
};

export const historicalPreviewEmpty: HistoricalPreviewScenario = {
  scenarioId: 'historical-preview-empty',
  expectedStatus: 'preview-empty',
  isSynthetic: true,
  identity: {
    displayName: 'Encuesta de clima demo 2025',
    surveyTypeLabel: 'Clima organizacional',
    mode: 'aggregated-comparison',
    sourceLabel: 'Origen de datos sintético',
    periodCount: 0,
  },
  periods: [],
  capabilities: [],
  segments: {
    availableCount: 0,
    status: 'unavailable',
    label: 'segments',
  },
  disclosure: {
    title: 'Vista histórica simulada',
    description: 'Representación mediante datos sintéticos. Los archivos no han sido leídos.',
    isPersistent: true,
  },
};

export const historicalPreviewErrorSimulated: HistoricalPreviewScenario = {
  scenarioId: 'historical-preview-error-simulated',
  expectedStatus: 'preview-error-simulated',
  isSynthetic: true,
  identity: {
    displayName: 'Encuesta de clima demo 2025',
    surveyTypeLabel: 'Clima organizacional',
    mode: 'aggregated-comparison',
    sourceLabel: 'Origen de datos sintético',
    periodCount: 0,
  },
  periods: [],
  capabilities: [],
  segments: {
    availableCount: 0,
    status: 'unavailable',
    label: 'segments',
  },
  disclosure: {
    title: 'Vista histórica simulada',
    description: 'Representación mediante datos sintéticos. Los archivos no han sido leídos.',
    isPersistent: true,
  },
};
