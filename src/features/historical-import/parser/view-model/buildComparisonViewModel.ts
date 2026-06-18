import type { ComparisonDirection } from '../comparison/comparisonTypes';
import type {
  ComparisonDashboardViewModel,
  ComparisonDisplayDirection,
  ComparisonDistributionRowViewModel,
  ComparisonEmptyStateViewModel,
  ComparisonKpiCardViewModel,
  ComparisonQuestionRowViewModel,
  ComparisonSemanticTone,
  ComparisonSummaryCardViewModel,
  ComparisonValueDisplay,
  ComparisonViewModelInput,
  ComparisonViewModelIssue,
  ComparisonViewModelResult,
  ComparisonViewModelStatus
} from './viewModelTypes';

export function buildComparisonViewModel(input: ComparisonViewModelInput): ComparisonViewModelResult {
  const result = input.comparisonResult;
  const issues: ComparisonViewModelIssue[] = [];

  if (result.status !== 'COMPARISON_CALCULATED' && result.status !== 'COMPARISON_CALCULATED_WITH_WARNINGS') {
    issues.push({
      code: 'COMPARISON_RESULT_NOT_READY',
      severity: 'ERROR',
      message: 'Comparison result is not ready or failed.'
    });
    return { status: 'VIEW_MODEL_REJECTED', dashboard: null, issues };
  }

  if (!result.summary) {
    issues.push({
      code: 'MISSING_COMPARISON_SUMMARY',
      severity: 'ERROR',
      message: 'Comparison summary is missing.'
    });
    return { status: 'VIEW_MODEL_REJECTED', dashboard: null, issues };
  }

  const questionIds = Object.keys(result.questionComparisons || {});
  if (questionIds.length === 0) {
    issues.push({
      code: 'MISSING_QUESTION_COMPARISONS',
      severity: 'ERROR',
      message: 'No question comparisons found.'
    });
    return { status: 'VIEW_MODEL_REJECTED', dashboard: null, issues };
  }

  const formatPercent = (val: number | null): ComparisonValueDisplay => {
    if (val === null) return { rawValue: null, displayValue: 'N/A', unit: '%' };
    const num = Number(val.toFixed(1));
    return { rawValue: val, displayValue: num.toString(), unit: '%' };
  };

  const formatCount = (val: number | null): ComparisonValueDisplay => {
    if (val === null) return { rawValue: null, displayValue: 'N/A', unit: '' };
    return { rawValue: val, displayValue: Math.round(val).toString(), unit: '' };
  };

  const mapDirection = (dir: ComparisonDirection): ComparisonDisplayDirection => {
    switch (dir) {
      case 'IMPROVED': return 'UP';
      case 'DECLINED': return 'DOWN';
      case 'UNCHANGED': return 'FLAT';
      case 'NOT_COMPARABLE': return 'NONE';
      default: return 'NONE';
    }
  };

  const mapTone = (dir: ComparisonDirection): ComparisonSemanticTone => {
    switch (dir) {
      case 'IMPROVED': return 'POSITIVE';
      case 'DECLINED': return 'NEGATIVE';
      case 'UNCHANGED': return 'NEUTRAL';
      case 'NOT_COMPARABLE': return 'MUTED';
      default: return 'NEUTRAL';
    }
  };

  const mapBlankRateTone = (delta: number | null): ComparisonSemanticTone => {
    if (delta === null) return 'MUTED';
    if (delta < 0) return 'POSITIVE';
    if (delta > 0) return 'WARNING';
    return 'NEUTRAL';
  };

  // Summary Cards
  const summaryCards: ComparisonSummaryCardViewModel[] = [
    {
      id: 'participation',
      label: 'Participación',
      primaryValue: formatPercent(result.participation?.participationRate.comparisonValue ?? null),
      secondaryValue: formatPercent(result.participation?.participationRate.baseValue ?? null),
      delta: formatPercent(result.participation?.participationRate.absoluteDelta ?? null),
      direction: mapDirection(result.participation?.participationRate.direction ?? 'NOT_COMPARABLE'),
      tone: mapTone(result.participation?.participationRate.direction ?? 'NOT_COMPARABLE'),
      helperText: 'Tasa de participación general'
    },
    {
      id: 'completion',
      label: 'Completitud',
      primaryValue: formatPercent(result.completion?.completionRate.comparisonValue ?? null),
      secondaryValue: formatPercent(result.completion?.completionRate.baseValue ?? null),
      delta: formatPercent(result.completion?.completionRate.absoluteDelta ?? null),
      direction: mapDirection(result.completion?.completionRate.direction ?? 'NOT_COMPARABLE'),
      tone: mapTone(result.completion?.completionRate.direction ?? 'NOT_COMPARABLE'),
      helperText: 'Tasa de completitud de respuestas'
    },
    {
      id: 'blank_answers',
      label: 'Blancos / sin respuesta',
      primaryValue: formatPercent(result.blankAnswers?.blankRate.comparisonValue ?? null),
      secondaryValue: formatPercent(result.blankAnswers?.blankRate.baseValue ?? null),
      delta: formatPercent(result.blankAnswers?.blankRate.absoluteDelta ?? null),
      direction: mapDirection(result.blankAnswers?.blankRate.direction ?? 'NOT_COMPARABLE'),
      tone: mapBlankRateTone(result.blankAnswers?.blankRate.absoluteDelta ?? null),
      helperText: 'Proporción de respuestas en blanco'
    },
    {
      id: 'comparable_questions',
      label: 'Preguntas comparables',
      primaryValue: formatCount(result.summary.totalComparableQuestions),
      secondaryValue: null,
      delta: null,
      direction: 'NONE',
      tone: 'INFO',
      helperText: `Base sólo: ${result.summary.totalBaseOnlyQuestions} | Comp sólo: ${result.summary.totalComparisonOnlyQuestions}`
    }
  ];

  // KPI Cards
  const kpiCards: ComparisonKpiCardViewModel[] = [
    {
      id: 'kpi_participation',
      label: 'participationRateDelta',
      delta: formatPercent(result.summary.participationRateDelta),
      direction: mapDirection(result.participation?.participationRate.direction ?? 'NOT_COMPARABLE'),
      tone: mapTone(result.participation?.participationRate.direction ?? 'NOT_COMPARABLE')
    },
    {
      id: 'kpi_completion',
      label: 'completionRateDelta',
      delta: formatPercent(result.summary.completionRateDelta),
      direction: mapDirection(result.completion?.completionRate.direction ?? 'NOT_COMPARABLE'),
      tone: mapTone(result.completion?.completionRate.direction ?? 'NOT_COMPARABLE')
    },
    {
      id: 'kpi_blank',
      label: 'blankAnswerRateDelta',
      delta: formatPercent(result.summary.blankAnswerRateDelta),
      direction: mapDirection(result.blankAnswers?.blankRate.direction ?? 'NOT_COMPARABLE'),
      tone: mapBlankRateTone(result.summary.blankAnswerRateDelta)
    },
    {
      id: 'kpi_comparable',
      label: 'totalComparableQuestions',
      delta: formatCount(result.summary.totalComparableQuestions),
      direction: 'NONE',
      tone: 'INFO'
    }
  ];

  const questionRows: ComparisonQuestionRowViewModel[] = [];
  const distributionRows: ComparisonDistributionRowViewModel[] = [];

  for (const qId of Object.keys(result.questionComparisons)) {
    const qComp = result.questionComparisons[qId];
    if (qComp.status !== 'COMPARABLE') continue;

    let baseValue: ComparisonValueDisplay | null = null;
    let comparisonValue: ComparisonValueDisplay | null = null;
    let deltaValue: ComparisonValueDisplay | null = null;
    let direction: ComparisonDirection = 'NOT_COMPARABLE';

    if (qComp.likertComparison) {
      baseValue = formatPercent(qComp.baseQuestionMetrics?.likertMetrics?.favorableRate ?? null);
      comparisonValue = formatPercent(qComp.comparisonQuestionMetrics?.likertMetrics?.favorableRate ?? null);
      deltaValue = formatPercent(qComp.likertComparison.favorableRateDelta);
      direction = qComp.likertComparison.direction;
    } else if (qComp.enpsComparison) {
      baseValue = formatCount(qComp.baseQuestionMetrics?.enpsMetrics?.enpsScore ?? null);
      comparisonValue = formatCount(qComp.comparisonQuestionMetrics?.enpsMetrics?.enpsScore ?? null);
      deltaValue = formatCount(qComp.enpsComparison.enpsScoreDelta);
      direction = qComp.enpsComparison.direction;
    } else if (qComp.openTextComparison) {
      baseValue = formatCount(qComp.baseQuestionMetrics?.openTextMetrics?.commentCount ?? null);
      comparisonValue = formatCount(qComp.comparisonQuestionMetrics?.openTextMetrics?.commentCount ?? null);
      deltaValue = formatCount(qComp.openTextComparison.commentCountDelta);
      direction = qComp.openTextComparison.commentCountDelta > 0 ? 'IMPROVED' : (qComp.openTextComparison.commentCountDelta < 0 ? 'DECLINED' : 'UNCHANGED');
    }

    const questionLabel = qComp.questionId;

    questionRows.push({
      questionId: qComp.questionId,
      questionLabel,
      questionType: qComp.questionType,
      baseValue,
      comparisonValue,
      deltaValue,
      direction: mapDirection(direction),
      tone: mapTone(direction),
      blankRateDelta: formatPercent(qComp.blankRateDelta),
      hasDistribution: qComp.distributionDelta.length > 0,
      hasLikertMetrics: !!qComp.likertComparison,
      hasEnpsMetrics: !!qComp.enpsComparison,
      hasOpenTextMetrics: !!qComp.openTextComparison
    });

    for (const dist of qComp.distributionDelta) {
      let dDir: ComparisonDirection = 'UNCHANGED';
      if (dist.rateDelta > 0) dDir = 'IMPROVED';
      else if (dist.rateDelta < 0) dDir = 'DECLINED';

      distributionRows.push({
        questionId: qComp.questionId,
        bucketLabel: dist.value,
        baseCount: dist.baseCount,
        comparisonCount: dist.comparisonCount,
        countDelta: formatCount(dist.countDelta),
        baseRate: formatPercent(dist.baseRate),
        comparisonRate: formatPercent(dist.comparisonRate),
        rateDelta: formatPercent(dist.rateDelta),
        direction: mapDirection(dDir),
        tone: 'NEUTRAL'
      });
    }
  }

  const emptyState: ComparisonEmptyStateViewModel | null = questionRows.length === 0 ? {
    title: 'No hay preguntas comparables',
    description: 'No se encontraron preguntas equivalentes entre ambos periodos.',
    recommendedActionLabel: 'Revisar mapeo de preguntas'
  } : null;

  const dashboard: ComparisonDashboardViewModel = {
    dashboardTitle: 'Comparativo de Periodos',
    dashboardSubtitle: `${result.summary.baseWorkbookKind} vs ${result.summary.comparisonWorkbookKind}`,
    summaryCards,
    kpiCards,
    questionRows,
    distributionRows,
    filters: {
      questionTypes: [
        { id: 'likert', label: 'Likert', value: 'LIKERT' },
        { id: 'enps', label: 'eNPS', value: 'ENPS' },
        { id: 'open', label: 'Abierta', value: 'OPEN_TEXT' },
        { id: 'multiple', label: 'Opción Múltiple', value: 'MULTIPLE_CHOICE' }
      ],
      directions: [
        { id: 'up', label: 'Mejoró', value: 'UP' },
        { id: 'down', label: 'Empeoró', value: 'DOWN' },
        { id: 'flat', label: 'Sin Cambios', value: 'FLAT' }
      ],
      tones: [
        { id: 'positive', label: 'Positivo', value: 'POSITIVE' },
        { id: 'negative', label: 'Negativo', value: 'NEGATIVE' },
        { id: 'neutral', label: 'Neutral', value: 'NEUTRAL' },
        { id: 'warning', label: 'Alerta', value: 'WARNING' }
      ]
    },
    emptyState,
    metadata: {
      baseWorkbookId: result.summary.baseWorkbookId,
      comparisonWorkbookId: result.summary.comparisonWorkbookId,
      totalComparableQuestions: result.summary.totalComparableQuestions,
      totalBaseOnlyQuestions: result.summary.totalBaseOnlyQuestions,
      totalComparisonOnlyQuestions: result.summary.totalComparisonOnlyQuestions,
      generatedAt: new Date().toISOString()
    }
  };

  const status: ComparisonViewModelStatus = issues.length > 0 ? 'VIEW_MODEL_READY_WITH_WARNINGS' : 'VIEW_MODEL_READY';

  return { status, dashboard, issues };
}
