import type {
  PeriodComparisonInput,
  PeriodComparisonResult,
  PeriodComparisonIssue,
  MetricDelta,
  ComparisonDirection,
  ParticipationComparison,
  CompletionComparison,
  BlankAnswerComparison,
  DistributionComparison,
  QuestionComparison,
  LikertQuestionComparison,
  EnpsQuestionComparison,
  OpenTextQuestionComparison,
  ComparableEntityStatus
} from './comparisonTypes';

import type { QuestionMetrics } from '../metrics/metricsTypes';

function calculateMetricDelta(base: number, comparison: number, invertDirection = false): MetricDelta {
  const absoluteDelta = comparison - base;
  const relativeDelta = base === 0 ? null : absoluteDelta / base;

  let direction: ComparisonDirection = 'UNCHANGED';
  if (absoluteDelta > 0) {
    direction = invertDirection ? 'DECLINED' : 'IMPROVED';
  } else if (absoluteDelta < 0) {
    direction = invertDirection ? 'IMPROVED' : 'DECLINED';
  }

  return {
    baseValue: base,
    comparisonValue: comparison,
    absoluteDelta,
    relativeDelta,
    direction
  };
}

export function compareWorkbookPeriods(input: PeriodComparisonInput): PeriodComparisonResult {
  const issues: PeriodComparisonIssue[] = [];

  const isValidStatus = (status: string) =>
    status === 'METRICS_CALCULATED' || status === 'METRICS_CALCULATED_WITH_WARNINGS';

  if (!isValidStatus(input.base.status)) {
    return {
      status: 'COMPARISON_REJECTED',
      summary: null,
      participation: null,
      completion: null,
      blankAnswers: null,
      questionComparisons: {},
      issues: [{
        code: 'BASE_METRICS_NOT_READY',
        severity: 'ERROR',
        message: 'Base metrics are not in a valid calculated state'
      }]
    };
  }

  if (!isValidStatus(input.comparison.status)) {
    return {
      status: 'COMPARISON_REJECTED',
      summary: null,
      participation: null,
      completion: null,
      blankAnswers: null,
      questionComparisons: {},
      issues: [{
        code: 'COMPARISON_METRICS_NOT_READY',
        severity: 'ERROR',
        message: 'Comparison metrics are not in a valid calculated state'
      }]
    };
  }

  if (!input.base.questionMetrics || Object.keys(input.base.questionMetrics).length === 0) {
    return {
      status: 'COMPARISON_REJECTED',
      summary: null,
      participation: null,
      completion: null,
      blankAnswers: null,
      questionComparisons: {},
      issues: [{
        code: 'MISSING_BASE_QUESTION_METRICS',
        severity: 'ERROR',
        message: 'Base metrics do not contain question metrics'
      }]
    };
  }

  if (!input.comparison.questionMetrics || Object.keys(input.comparison.questionMetrics).length === 0) {
    return {
      status: 'COMPARISON_REJECTED',
      summary: null,
      participation: null,
      completion: null,
      blankAnswers: null,
      questionComparisons: {},
      issues: [{
        code: 'MISSING_COMPARISON_QUESTION_METRICS',
        severity: 'ERROR',
        message: 'Comparison metrics do not contain question metrics'
      }]
    };
  }

  const baseSummary = input.base.summary;
  const compSummary = input.comparison.summary;

  if (!baseSummary || !compSummary) {
     return {
      status: 'COMPARISON_REJECTED',
      summary: null,
      participation: null,
      completion: null,
      blankAnswers: null,
      questionComparisons: {},
      issues: [{
        code: 'COMPARISON_FAILED',
        severity: 'ERROR',
        message: 'Missing summary in metrics'
      }]
    };
  }

  const baseKeys = Object.keys(input.base.questionMetrics);
  const compKeys = Object.keys(input.comparison.questionMetrics);

  const comparableKeys = baseKeys.filter(k => compKeys.includes(k));
  const baseOnlyKeys = baseKeys.filter(k => !compKeys.includes(k));
  const compOnlyKeys = compKeys.filter(k => !baseKeys.includes(k));

  if (comparableKeys.length === 0) {
    return {
      status: 'COMPARISON_REJECTED',
      summary: null,
      participation: null,
      completion: null,
      blankAnswers: null,
      questionComparisons: {},
      issues: [{
        code: 'COMPARISON_FAILED',
        severity: 'ERROR',
        message: 'No comparable questions found between base and comparison periods'
      }]
    };
  }

  const participation: ParticipationComparison = {
    totalEligibleRespondents: calculateMetricDelta(baseSummary.totalEligibleRespondents, compSummary.totalEligibleRespondents),
    totalResponses: calculateMetricDelta(baseSummary.totalResponses, compSummary.totalResponses),
    participationRate: calculateMetricDelta(baseSummary.participationRate, compSummary.participationRate)
  };

  const completion: CompletionComparison = {
    completedResponses: calculateMetricDelta(baseSummary.completedResponses, compSummary.completedResponses),
    partialResponses: calculateMetricDelta(baseSummary.partialResponses, compSummary.partialResponses),
    completionRate: calculateMetricDelta(baseSummary.completionRate, compSummary.completionRate)
  };

  const blankAnswers: BlankAnswerComparison = {
    blankCount: calculateMetricDelta(baseSummary.blankAnswerCount, compSummary.blankAnswerCount, true),
    blankRate: calculateMetricDelta(baseSummary.blankAnswerRate, compSummary.blankAnswerRate, true)
  };

  const questionComparisons: Record<string, QuestionComparison> = {};

  const addUncomparable = (key: string, status: ComparableEntityStatus, baseM: QuestionMetrics | null, compM: QuestionMetrics | null) => {
    questionComparisons[key] = {
      questionId: baseM ? baseM.questionId : (compM ? compM.questionId : key),
      questionType: baseM ? baseM.questionType : (compM ? compM.questionType : 'OPEN_TEXT'),
      status,
      baseQuestionMetrics: baseM,
      comparisonQuestionMetrics: compM,
      blankRateDelta: null,
      nonBlankAnswerDelta: null,
      distributionDelta: []
    };
    if (status === 'BASE_ONLY') {
      issues.push({
        code: 'QUESTION_NOT_FOUND_IN_COMPARISON',
        severity: 'INFO',
        message: `Question ${key} found only in base`
      });
    } else {
      issues.push({
        code: 'QUESTION_NOT_FOUND_IN_BASE',
        severity: 'INFO',
        message: `Question ${key} found only in comparison`
      });
    }
  };

  baseOnlyKeys.forEach(k => addUncomparable(k, 'BASE_ONLY', input.base.questionMetrics[k], null));
  compOnlyKeys.forEach(k => addUncomparable(k, 'COMPARISON_ONLY', null, input.comparison.questionMetrics[k]));

  let totalComparableQuestions = 0;
  let overallImproved = 0;
  let overallDeclined = 0;

  for (const key of comparableKeys) {
    const baseQ = input.base.questionMetrics[key];
    const compQ = input.comparison.questionMetrics[key];

    if (baseQ.questionType !== compQ.questionType) {
      addUncomparable(key, 'NOT_COMPARABLE' as ComparableEntityStatus, baseQ, compQ);
      issues.push({
        code: 'QUESTION_TYPE_MISMATCH',
        severity: 'WARNING',
        message: `Question ${key} type mismatch: base is ${baseQ.questionType}, comparison is ${compQ.questionType}`
      });
      continue;
    }

    totalComparableQuestions++;

    const blankRateDelta = compQ.blankRate - baseQ.blankRate;
    const nonBlankAnswerDelta = compQ.nonBlankAnswers - baseQ.nonBlankAnswers;

    const baseValues = baseQ.distribution.map(d => d.value);
    const compValues = compQ.distribution.map(d => d.value);
    const allValues = Array.from(new Set([...baseValues, ...compValues]));

    const distributionDelta: DistributionComparison[] = allValues.map(val => {
      const bBucket = baseQ.distribution.find(d => d.value === val);
      const cBucket = compQ.distribution.find(d => d.value === val);
      const bCount = bBucket ? bBucket.count : 0;
      const cCount = cBucket ? cBucket.count : 0;
      const bRate = bBucket ? bBucket.rate : 0;
      const cRate = cBucket ? cBucket.rate : 0;
      return {
        value: val,
        baseCount: bCount,
        comparisonCount: cCount,
        countDelta: cCount - bCount,
        baseRate: bRate,
        comparisonRate: cRate,
        rateDelta: cRate - bRate
      };
    });

    let likertComparison: LikertQuestionComparison | undefined;
    if (baseQ.likertMetrics && compQ.likertMetrics) {
      const favorableRateDelta = compQ.likertMetrics.favorableRate - baseQ.likertMetrics.favorableRate;
      let dir: ComparisonDirection = 'UNCHANGED';
      if (favorableRateDelta > 0) { dir = 'IMPROVED'; overallImproved++; }
      else if (favorableRateDelta < 0) { dir = 'DECLINED'; overallDeclined++; }

      likertComparison = {
        averageScoreDelta: compQ.likertMetrics.averageScore - baseQ.likertMetrics.averageScore,
        favorableRateDelta,
        neutralRateDelta: compQ.likertMetrics.neutralRate - baseQ.likertMetrics.neutralRate,
        unfavorableRateDelta: compQ.likertMetrics.unfavorableRate - baseQ.likertMetrics.unfavorableRate,
        direction: dir
      };
    }

    let enpsComparison: EnpsQuestionComparison | undefined;
    if (baseQ.enpsMetrics && compQ.enpsMetrics) {
      const enpsScoreDelta = compQ.enpsMetrics.enpsScore - baseQ.enpsMetrics.enpsScore;
      let dir: ComparisonDirection = 'UNCHANGED';
      if (enpsScoreDelta > 0) { dir = 'IMPROVED'; overallImproved++; }
      else if (enpsScoreDelta < 0) { dir = 'DECLINED'; overallDeclined++; }

      enpsComparison = {
        enpsScoreDelta,
        promotersDelta: compQ.enpsMetrics.promotersCount - baseQ.enpsMetrics.promotersCount,
        passivesDelta: compQ.enpsMetrics.passivesCount - baseQ.enpsMetrics.passivesCount,
        detractorsDelta: compQ.enpsMetrics.detractorsCount - baseQ.enpsMetrics.detractorsCount,
        direction: dir
      };
    }

    let openTextComparison: OpenTextQuestionComparison | undefined;
    if (baseQ.openTextMetrics && compQ.openTextMetrics) {
      openTextComparison = {
        commentCountDelta: compQ.openTextMetrics.commentCount - baseQ.openTextMetrics.commentCount,
        averageLengthDelta: compQ.openTextMetrics.averageLength - baseQ.openTextMetrics.averageLength,
        blankRateDelta: (compQ.openTextMetrics.blankCount / (compQ.totalAnswers || 1)) - (baseQ.openTextMetrics.blankCount / (baseQ.totalAnswers || 1))
      };
    }

    questionComparisons[key] = {
      questionId: baseQ.questionId,
      questionType: baseQ.questionType,
      status: 'COMPARABLE',
      baseQuestionMetrics: baseQ,
      comparisonQuestionMetrics: compQ,
      blankRateDelta,
      nonBlankAnswerDelta,
      distributionDelta,
      likertComparison,
      enpsComparison,
      openTextComparison
    };
  }

  let overallDirection: ComparisonDirection = 'UNCHANGED';
  if (overallImproved > overallDeclined) {
    overallDirection = 'IMPROVED';
  } else if (overallDeclined > overallImproved) {
    overallDirection = 'DECLINED';
  }

  const participationRateDelta = compSummary.participationRate - baseSummary.participationRate;
  const completionRateDelta = compSummary.completionRate - baseSummary.completionRate;
  const blankAnswerRateDelta = compSummary.blankAnswerRate - baseSummary.blankAnswerRate;

  return {
    status: issues.some(i => i.severity === 'WARNING') ? 'COMPARISON_CALCULATED_WITH_WARNINGS' : 'COMPARISON_CALCULATED',
    summary: {
      baseWorkbookId: baseSummary.workbookId,
      comparisonWorkbookId: compSummary.workbookId,
      baseWorkbookKind: baseSummary.workbookKind,
      comparisonWorkbookKind: compSummary.workbookKind,
      totalComparableQuestions,
      totalBaseOnlyQuestions: baseOnlyKeys.length,
      totalComparisonOnlyQuestions: compOnlyKeys.length,
      participationRateDelta,
      completionRateDelta,
      blankAnswerRateDelta,
      overallDirection
    },
    participation,
    completion,
    blankAnswers,
    questionComparisons,
    issues
  };
}
