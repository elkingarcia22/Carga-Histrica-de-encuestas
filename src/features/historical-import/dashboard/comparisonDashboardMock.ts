import type { ComparisonViewModelResult } from '../parser/view-model/viewModelTypes';

export const mockDashboardResult: ComparisonViewModelResult = {
  status: 'VIEW_MODEL_READY',
  issues: [],
  dashboard: {
    dashboardTitle: 'Comparativo de encuestas',
    dashboardSubtitle: 'Compara resultados entre una encuesta base y una encuesta comparativa usando datos sintéticos validados. (Sandbox sintético)',
    summaryCards: [
      {
        id: 'participation',
        label: 'Participación',
        primaryValue: { rawValue: 0.85, displayValue: '85%', unit: '%' },
        secondaryValue: { rawValue: 0.80, displayValue: '80%', unit: '%' },
        delta: { rawValue: 0.05, displayValue: '+5%', unit: '%' },
        direction: 'UP',
        tone: 'POSITIVE',
        helperText: null
      },
      {
        id: 'completion',
        label: 'Completitud',
        primaryValue: { rawValue: 0.95, displayValue: '95%', unit: '%' },
        secondaryValue: { rawValue: 0.90, displayValue: '90%', unit: '%' },
        delta: { rawValue: 0.05, displayValue: '+5%', unit: '%' },
        direction: 'UP',
        tone: 'POSITIVE',
        helperText: null
      },
      {
        id: 'blanks',
        label: 'Blancos / sin respuesta',
        primaryValue: { rawValue: 0.05, displayValue: '5%', unit: '%' },
        secondaryValue: { rawValue: 0.10, displayValue: '10%', unit: '%' },
        delta: { rawValue: -0.05, displayValue: '-5%', unit: '%' },
        direction: 'DOWN',
        tone: 'POSITIVE',
        helperText: null
      },
      {
        id: 'comparable_questions',
        label: 'Preguntas comparables',
        primaryValue: { rawValue: 16, displayValue: '16', unit: 'q' },
        secondaryValue: null,
        delta: null,
        direction: 'NONE',
        tone: 'INFO',
        helperText: null
      }
    ],
    kpiCards: [
      {
        id: 'enps',
        label: 'eNPS General',
        delta: { rawValue: 10, displayValue: '+10', unit: 'pts' },
        direction: 'UP',
        tone: 'POSITIVE'
      }
    ],
    questionRows: Array.from({ length: 16 }).map((_, i) => ({
      questionId: `Q-COMP-${String(i + 1).padStart(3, '0')}`,
      questionLabel: `Pregunta comparable ${i + 1}`,
      questionType: 'LIKERT',
      baseValue: { rawValue: 4.1 + i * 0.01, displayValue: (4.1 + i * 0.01).toFixed(1), unit: 'avg' },
      comparisonValue: { rawValue: 4.0 + i * 0.01, displayValue: (4.0 + i * 0.01).toFixed(1), unit: 'avg' },
      deltaValue: { rawValue: 0.1, displayValue: '+0.1', unit: 'avg' },
      direction: 'UP',
      tone: i % 2 === 0 ? 'POSITIVE' : 'NEGATIVE',
      blankRateDelta: { rawValue: 0.0, displayValue: '0%', unit: '%' },
      hasDistribution: true,
      hasLikertMetrics: true,
      hasEnpsMetrics: false,
      hasOpenTextMetrics: false
    })),
    distributionRows: [
      {
        questionId: 'Q-COMP-001',
        bucketLabel: 'Totalmente de acuerdo',
        baseCount: 50,
        comparisonCount: 40,
        countDelta: { rawValue: 10, displayValue: '+10', unit: 'n' },
        baseRate: { rawValue: 0.5, displayValue: '50%', unit: '%' },
        comparisonRate: { rawValue: 0.4, displayValue: '40%', unit: '%' },
        rateDelta: { rawValue: 0.1, displayValue: '+10%', unit: '%' },
        direction: 'UP',
        tone: 'POSITIVE'
      }
    ],
    filters: {
      questionTypes: [
        { id: 'likert', label: 'Likert', value: 'LIKERT' },
        { id: 'enps', label: 'eNPS', value: 'ENPS' }
      ],
      directions: [
        { id: 'up', label: 'Mejora', value: 'UP' },
        { id: 'down', label: 'Empeora', value: 'DOWN' }
      ],
      tones: [
        { id: 'positive', label: 'Positivo', value: 'POSITIVE' },
        { id: 'negative', label: 'Negativo', value: 'NEGATIVE' }
      ]
    },
    emptyState: null,
    metadata: {
      baseWorkbookId: 'wb-base',
      comparisonWorkbookId: 'wb-comp',
      totalComparableQuestions: 16,
      totalBaseOnlyQuestions: 1,
      totalComparisonOnlyQuestions: 1,
      generatedAt: new Date().toISOString()
    }
  }
};
