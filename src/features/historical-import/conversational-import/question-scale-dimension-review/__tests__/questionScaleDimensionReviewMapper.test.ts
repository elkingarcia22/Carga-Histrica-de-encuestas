import { describe, it, expect } from 'vitest';
import { questionScaleDimensionReviewMockData37 } from '../questionScaleDimensionReviewMockData';
import {
  mapQuestionReviewToConversationalOverview,
  mapQuestionReviewToDimensionGroups,
  mapQuestionReviewToNeedsReviewList,
  mapQuestionReviewToQuestionDetail,
  mapQuestionReviewToScaleDetailText,
  mapQuestionReviewToSectionConfirmationState,
  type ConversationalOverview,
  type DimensionGroupEntry,
  type NeedsReviewEntry,
  type QuestionDetailView,
  type SectionConfirmationState,
} from '../questionScaleDimensionReviewMapper';
const { questions } = questionScaleDimensionReviewMockData37;
const { summary } = questionScaleDimensionReviewMockData37;

describe('mapQuestionReviewToConversationalOverview', () => {
  const overview: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);

  it('generates overview with total questions', () => {
    expect(overview.totalQuestions).toBe(37);
    expect(overview.summaryLine).toContain('37');
  });

  it('includes dimension lines with counts', () => {
    expect(overview.dimensionLines.length).toBeGreaterThan(0);
    overview.dimensionLines.forEach(line => {
      expect(line).toMatch(/preguntas/);
    });
  });

  it('includes suggested commands as text', () => {
    expect(overview.suggestedCommands.length).toBeGreaterThan(0);
    overview.suggestedCommands.forEach(cmd => {
      expect(typeof cmd.command).toBe('string');
      expect(typeof cmd.description).toBe('string');
    });
  });

  it('has proper header text', () => {
    expect(overview.headerText).toContain('1/7');
    expect(overview.headerText).toContain('Preguntas y escalas');
  });

  it('does not contain action payloads or buttons', () => {
    const json = JSON.stringify(overview);
    expect(json).not.toContain('onClick');
    expect(json).not.toContain('button');
    expect(json).not.toContain('action');
    expect(json).not.toContain('href');
  });
});

describe('mapQuestionReviewToDimensionGroups', () => {
  const groups: DimensionGroupEntry[] = mapQuestionReviewToDimensionGroups(questions);

  it('returns groups for every dimension', () => {
    expect(groups.length).toBeGreaterThanOrEqual(9);
  });

  it('each group has dimensionId and dimensionName', () => {
    groups.forEach(g => {
      expect(g.dimensionId).toBeTruthy();
      expect(g.dimensionName).toBeTruthy();
      expect(g.questionCount).toBeGreaterThan(0);
    });
  });

  it('includes scaleTypes array', () => {
    groups.forEach(g => {
      expect(g.scaleTypes.length).toBeGreaterThan(0);
    });
  });

  it('includes questionsPreview with at most 3 entries', () => {
    groups.forEach(g => {
      expect(g.questionsPreview.length).toBeLessThanOrEqual(3);
    });
  });

  it('has needsReviewCount for each group', () => {
    groups.forEach(g => {
      expect(typeof g.needsReviewCount).toBe('number');
      expect(g.needsReviewCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('total questions across groups matches 37', () => {
    const total = groups.reduce((acc, g) => acc + g.questionCount, 0);
    expect(total).toBe(37);
  });
});

describe('mapQuestionReviewToNeedsReviewList', () => {
  const needsReview: NeedsReviewEntry[] = mapQuestionReviewToNeedsReviewList(questions);

  it('returns empty array when all questions are aligned', () => {
    expect(needsReview).toHaveLength(0);
  });
});

describe('mapQuestionReviewToQuestionDetail', () => {
  it('returns detail for valid questionId', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_1');
    expect(detail).not.toBeNull();
    expect(detail!.questionId).toBe('q_1');
    expect(detail!.displayIndex).toBe(1);
  });

  it('returns detail for valid displayIndex', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, '1');
    expect(detail).not.toBeNull();
    expect(detail!.questionId).toBe('q_1');
  });

  it('returns null for non-existent questionId', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'nonexistent');
    expect(detail).toBeNull();
  });

  it('returns null for non-existent displayIndex', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, '999');
    expect(detail).toBeNull();
  });

  it('includes questionTypeLabel and scaleTypeLabel', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_1');
    expect(detail!.questionTypeLabel).toBe('Escala de valoración');
    expect(detail!.scaleTypeLabel).toBe('Likert (escala de preferencias)');
  });

  it('includes full question detail fields', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_1');
    expect(detail!.questionText).toBeTruthy();
    expect(detail!.dimensionId).toMatch(/^dim_/);
    expect(detail!.dimensionName).toBeTruthy();
    expect(detail!.statusLabel).toBe('Alineada');
  });

  it('returns NPS detail for eNPS question', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_36');
    expect(detail).not.toBeNull();
    expect(detail!.questionType).toBe('enps');
    expect(detail!.scaleType).toBe('nps_0_10');
    expect(detail!.scaleDetailAnchorsText).toContain('Promotores');
  });
});

describe('mapQuestionReviewToScaleDetailText', () => {
  it('returns scale detail for Likert 5 question', () => {
    const text: string | null = mapQuestionReviewToScaleDetailText(questions, 'q_1');
    expect(text).not.toBeNull();
    expect(text).toContain('Escala de valoración');
    expect(text).toContain('Likert (escala de preferencias)');
    expect(text).toContain('Muy en desacuerdo');
  });

  it('returns scale detail for NPS question', () => {
    const text: string | null = mapQuestionReviewToScaleDetailText(questions, 'q_36');
    expect(text).not.toBeNull();
    expect(text).toContain('eNPS');
    expect(text).toContain('NPS (recomendabilidad)');
    expect(text).toContain('Detractores');
    expect(text).toContain('Promotores');
  });

  it('returns null for non-existent question', () => {
    const text: string | null = mapQuestionReviewToScaleDetailText(questions, 'nonexistent');
    expect(text).toBeNull();
  });
});

describe('mapQuestionReviewToSectionConfirmationState', () => {
  const state: SectionConfirmationState = mapQuestionReviewToSectionConfirmationState(questions);

  it('indicates section can be confirmed when no issues', () => {
    expect(state.canConfirmSection).toBe(true);
    expect(state.blockingIssues).toHaveLength(0);
  });

  it('reports zero counts for all issue types', () => {
    expect(state.needsReviewCount).toBe(0);
    expect(state.uninterpretableCount).toBe(0);
    expect(state.missingDimensionCount).toBe(0);
    expect(state.missingQuestionTypeCount).toBe(0);
    expect(state.missingScaleTypeCount).toBe(0);
  });
});

describe('Privacy and safety', () => {
  it('overview output does not contain PII', () => {
    const overview: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);
    const json = JSON.stringify(overview);
    const piiPatterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    ];
    piiPatterns.forEach(p => expect(p.test(json)).toBe(false));
  });

  it('overview output does not contain raw rows', () => {
    const overview: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);
    const json = JSON.stringify(overview);
    expect(json).not.toContain('raw_rows');
    expect(json).not.toContain('fila');
  });

  it('overview output does not contain open text answers', () => {
    const overview: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);
    const json = JSON.stringify(overview);
    expect(json).not.toContain('respuesta abierta');
    expect(json).not.toContain('open_text_answer');
  });

  it('overview output does not contain workbook dump', () => {
    const overview: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);
    const json = JSON.stringify(overview);
    expect(json).not.toContain('workbook');
    expect(json).not.toContain('workbook_dump');
  });

  it('question detail output does not contain PII', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_1');
    const json = JSON.stringify(detail);
    const piiPatterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    ];
    piiPatterns.forEach(p => expect(p.test(json)).toBe(false));
  });

  it('dimension groups output does not contain PII', () => {
    const groups: DimensionGroupEntry[] = mapQuestionReviewToDimensionGroups(questions);
    const json = JSON.stringify(groups);
    const piiPatterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    ];
    piiPatterns.forEach(p => expect(p.test(json)).toBe(false));
  });
});

describe('Determinism and immutability', () => {
  it('produces same output for same input', () => {
    const result1: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);
    const result2: ConversationalOverview = mapQuestionReviewToConversationalOverview(questions, summary);
    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
  });

  it('does not mutate input questions array', () => {
    const originalLength = questions.length;
    const originalIds = questions.map(q => q.questionId);
    mapQuestionReviewToDimensionGroups(questions);
    expect(questions.length).toBe(originalLength);
    expect(questions.map(q => q.questionId)).toEqual(originalIds);
  });

  it('does not mutate input summary', () => {
    const originalTotal = summary.totalQuestions;
    mapQuestionReviewToConversationalOverview(questions, summary);
    expect(summary.totalQuestions).toBe(originalTotal);
  });

  it('no Date.now() or Math.random() dependency', () => {
    const result1 = JSON.stringify(mapQuestionReviewToConversationalOverview(questions, summary));
    const result2 = JSON.stringify(mapQuestionReviewToConversationalOverview(questions, summary));
    expect(result1).toBe(result2);
  });
});

describe('Scale detection edge cases', () => {
  it('returns correct Likert anchors', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_1');
    expect(detail!.scaleDetailAnchorsText).toBe(
      'Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo',
    );
  });

  it('shows open_text as not_applicable scale', () => {
    const detail: QuestionDetailView | null = mapQuestionReviewToQuestionDetail(questions, 'q_37');
    expect(detail).not.toBeNull();
    expect(detail!.questionType).toBe('open_text');
    expect(detail!.scaleType).toBe('not_applicable');
  });
});
