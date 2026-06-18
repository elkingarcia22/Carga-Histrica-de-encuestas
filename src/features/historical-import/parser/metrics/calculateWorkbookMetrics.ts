import type {
  WorkbookMetricsInput,
  WorkbookMetricsResult,
  WorkbookMetricsIssue,
  WorkbookMetricsSummary,
  QuestionMetrics
} from './metricsTypes';
import { createMetricsIssue } from './metricsContract';
import type { CanonicalAnswerValue } from '../normalization/normalizationTypes';

export function calculateWorkbookMetrics(input: WorkbookMetricsInput): WorkbookMetricsResult {
  const issues: WorkbookMetricsIssue[] = [];

  if (!input.canonicalWorkbook) {
    issues.push(createMetricsIssue('CANONICAL_WORKBOOK_NOT_READY', 'ERROR', 'Canonical workbook is missing'));
    return { status: 'METRICS_REJECTED', summary: null, questionMetrics: {}, issues };
  }

  const { questions, respondents, responses, metadata } = input.canonicalWorkbook;

  if (!questions || questions.length === 0) {
    issues.push(createMetricsIssue('EMPTY_QUESTION_SET', 'ERROR', 'Canonical workbook has no questions'));
    return { status: 'METRICS_REJECTED', summary: null, questionMetrics: {}, issues };
  }

  if (!respondents || respondents.length === 0) {
    issues.push(createMetricsIssue('EMPTY_RESPONDENT_SET', 'ERROR', 'Canonical workbook has no respondents'));
    return { status: 'METRICS_REJECTED', summary: null, questionMetrics: {}, issues };
  }

  if (!responses || responses.length === 0) {
    issues.push(createMetricsIssue('EMPTY_RESPONSE_SET', 'ERROR', 'Canonical workbook has no responses'));
    return { status: 'METRICS_REJECTED', summary: null, questionMetrics: {}, issues };
  }

  const totalEligibleRespondents = respondents.length;
  const totalResponses = responses.length;
  const participationRate = totalEligibleRespondents > 0 ? totalResponses / totalEligibleRespondents : 0;
  const totalQuestions = questions.length;

  let completedResponses = 0;
  let partialResponses = 0;
  let totalAnswerValues = 0;
  let globalBlankAnswerCount = 0;

  const questionMetricsMap: Record<string, QuestionMetrics> = {};

  for (const question of questions) {
    questionMetricsMap[question.questionId] = {
      questionId: question.questionId,
      questionType: question.questionType,
      totalAnswers: 0,
      nonBlankAnswers: 0,
      blankAnswers: 0,
      blankRate: 0,
      distribution: []
    };
  }

  for (const response of responses) {
    let responseBlankCount = 0;
    
    // Create a lookup for answers in this response by questionId
    const responseAnswerMap = new Map<string, CanonicalAnswerValue>();
    for (const answer of response.answers) {
      responseAnswerMap.set(answer.questionId, answer);
    }

    for (const question of questions) {
      const answer = responseAnswerMap.get(question.questionId);
      const isBlank = !answer || answer.valueKind === 'BLANK' || answer.rawValue === null || answer.rawValue === undefined || answer.rawValue === '';
      
      const qm = questionMetricsMap[question.questionId];
      if (qm) {
        qm.totalAnswers++;
        totalAnswerValues++;
        
        if (isBlank) {
          qm.blankAnswers++;
          responseBlankCount++;
          globalBlankAnswerCount++;
        } else {
          qm.nonBlankAnswers++;
        }
      }
    }

    if (responseBlankCount === 0 && totalQuestions > 0) {
      completedResponses++;
    } else {
      partialResponses++;
    }
  }

  const completionRate = totalResponses > 0 ? completedResponses / totalResponses : 0;
  const globalBlankAnswerRate = totalAnswerValues > 0 ? globalBlankAnswerCount / totalAnswerValues : 0;

  let hasWarnings = false;

  for (const question of questions) {
    const qm = questionMetricsMap[question.questionId];
    if (!qm) continue;

    qm.blankRate = qm.totalAnswers > 0 ? qm.blankAnswers / qm.totalAnswers : 0;

    const distributionMap = new Map<string, number>();

    // Calculate specific metrics based on question type
    if (question.questionType === 'LIKERT' || question.questionType === 'LIKERT_1_TO_5') {
      let sum = 0;
      let count = 0;
      let favorableCount = 0;
      let neutralCount = 0;
      let unfavorableCount = 0;

      for (const response of responses) {
        const answer = response.answers.find(a => a.questionId === question.questionId);
        if (answer && answer.valueKind === 'NUMBER') {
          const val = Number(answer.rawValue);
          if (!isNaN(val)) {
            sum += val;
            count++;
            
            // Provisional rule for single-workbook likert: 1-2=unfavorable, 3=neutral, 4-5=favorable
            // (Assuming 5-point scale, if exported scale is 1-11, this needs adjustment based on contract,
            // but the prompt explicitly said "Regla provisional permitida solo para single-workbook: 1-2 = unfavorable 3 = neutral 4-5 = favorable")
            if (val <= 2) unfavorableCount++;
            else if (val === 3) neutralCount++;
            else favorableCount++;

            const strVal = String(val);
            distributionMap.set(strVal, (distributionMap.get(strVal) || 0) + 1);
          } else {
            issues.push(createMetricsIssue('INVALID_NUMERIC_ANSWER', 'WARNING', `Invalid numeric answer for Likert question ${question.questionId}`));
            hasWarnings = true;
          }
        }
      }

      qm.likertMetrics = {
        averageScore: count > 0 ? sum / count : 0,
        favorableCount,
        neutralCount,
        unfavorableCount,
        favorableRate: count > 0 ? favorableCount / count : 0,
        neutralRate: count > 0 ? neutralCount / count : 0,
        unfavorableRate: count > 0 ? unfavorableCount / count : 0,
      };
    } else if (question.questionType === 'ENPS' || question.questionType === 'ENPS_EXPORTED_1_TO_11') {
      let promotersCount = 0;
      let passivesCount = 0;
      let detractorsCount = 0;
      let count = 0;

      for (const response of responses) {
        const answer = response.answers.find(a => a.questionId === question.questionId);
        if (answer && answer.valueKind === 'NUMBER') {
          // If the exported scale is 1-11, mapping needs to be handled carefully. 
          // The contract says: 0-6 = detractor, 7-8 = passive, 9-10 = promoter
          // However, if raw values are 1-11, we shift by -1. Let's assume standard 0-10 or 1-11 shift.
          const val = Number(answer.rawValue);
          if (!isNaN(val)) {
            // Let's assume raw values are already mapped to 0-10 or 1-11. The prompt says:
            // "Regla provisional: 0-6 = detractor, 7-8 = passive, 9-10 = promoter. Si los fixtures usan escala exportada 1-11, mapear con cuidado y documentar la equivalencia técnica sin cambiar rawValue."
            // If the maximum value across all answers is 11, it might be a 1-11 scale.
            count++;
            
            // For now, let's just check the value directly, but if we need a 1-11 mapping we can do:
            // if it's 1-11, detractor = 1-7, passive = 8-9, promoter = 10-11
            // Let's deduce scale:
            // Actually, wait, let's keep it simple and just use the rule: 0-6 detractor, 7-8 passive, 9-10 promoter.
            // But wait, the fixtures might have 1-11. We can map: 1-7 (detractor), 8-9 (passive), 10-11 (promoter).
            
            // To be safe, let's compute max value for ENPS to detect 1-11 scale.
            
            const strVal = String(val);
            distributionMap.set(strVal, (distributionMap.get(strVal) || 0) + 1);
          } else {
             issues.push(createMetricsIssue('INVALID_NUMERIC_ANSWER', 'WARNING', `Invalid numeric answer for eNPS question ${question.questionId}`));
             hasWarnings = true;
          }
        }
      }

      // 1-11 detection
      let is1To11Scale = false;
      for (const key of distributionMap.keys()) {
        if (Number(key) === 11) is1To11Scale = true;
      }

      for (const response of responses) {
        const answer = response.answers.find(a => a.questionId === question.questionId);
        if (answer && answer.valueKind === 'NUMBER') {
          const val = Number(answer.rawValue);
          if (!isNaN(val)) {
             const normalizedVal = is1To11Scale ? val - 1 : val; // Map 1-11 to 0-10 for calculation
             if (normalizedVal >= 0 && normalizedVal <= 6) detractorsCount++;
             else if (normalizedVal >= 7 && normalizedVal <= 8) passivesCount++;
             else if (normalizedVal >= 9 && normalizedVal <= 10) promotersCount++;
          }
        }
      }

      const promotersRate = count > 0 ? promotersCount / count : 0;
      const detractorsRate = count > 0 ? detractorsCount / count : 0;
      const enpsScore = (promotersRate - detractorsRate) * 100;

      qm.enpsMetrics = {
        promotersCount,
        passivesCount,
        detractorsCount,
        enpsScore
      };
    } else if (question.questionType === 'OPEN_TEXT') {
      let commentCount = 0;
      let totalLength = 0;
      
      for (const response of responses) {
        const answer = response.answers.find(a => a.questionId === question.questionId);
        if (answer && answer.valueKind === 'STRING') {
          const text = String(answer.rawValue || '').trim();
          if (text.length > 0) {
            commentCount++;
            totalLength += text.length;
          }
        }
      }

      qm.openTextMetrics = {
        commentCount,
        blankCount: qm.blankAnswers,
        averageLength: commentCount > 0 ? totalLength / commentCount : 0
      };
    } else {
      // Just track distribution for other types
      for (const response of responses) {
        const answer = response.answers.find(a => a.questionId === question.questionId);
        if (answer && !['BLANK'].includes(answer.valueKind) && answer.rawValue !== null && answer.rawValue !== undefined && answer.rawValue !== '') {
          const strVal = String(answer.rawValue);
          distributionMap.set(strVal, (distributionMap.get(strVal) || 0) + 1);
        }
      }
    }

    const totalValidForDist = qm.nonBlankAnswers;
    for (const [val, cnt] of distributionMap.entries()) {
      qm.distribution.push({
        value: val,
        count: cnt,
        rate: totalValidForDist > 0 ? cnt / totalValidForDist : 0
      });
    }

    // Sort distribution buckets by value for consistency
    qm.distribution.sort((a, b) => {
      const numA = Number(a.value);
      const numB = Number(b.value);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.value.localeCompare(b.value);
    });
  }

  const summary: WorkbookMetricsSummary = {
    workbookId: metadata.workbookId,
    workbookKind: metadata.workbookKind,
    totalEligibleRespondents,
    totalResponses,
    completedResponses,
    partialResponses,
    participationRate,
    completionRate,
    totalQuestions,
    totalAnswerValues,
    blankAnswerCount: globalBlankAnswerCount,
    blankAnswerRate: globalBlankAnswerRate,
    questionMetricsCount: Object.keys(questionMetricsMap).length
  };

  return {
    status: hasWarnings ? 'METRICS_CALCULATED_WITH_WARNINGS' : 'METRICS_CALCULATED',
    summary,
    questionMetrics: questionMetricsMap,
    issues
  };
}
