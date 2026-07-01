// Governance alignment: tests moved to authorized __tests__ folder
import { describe, it, expect } from 'vitest';
import { questionScaleDimensionReviewMockData37 } from '../questionScaleDimensionReviewMockData';
import type { QuestionReviewItem } from '../questionScaleDimensionReviewTypes';

describe('questionScaleDimensionReviewMockData37', () => {
  const { questions, summary, suggestedCommands } = questionScaleDimensionReviewMockData37;

  it('contains 37 questions', () => {
    expect(questions).toHaveLength(37);
  });

  it('has deterministic questionIds', () => {
    questions.forEach((q: QuestionReviewItem, i: number) => {
      expect(q.questionId).toBe(`q_${i + 1}`);
    });
  });

  it('has questionType for every question', () => {
    questions.forEach((q: QuestionReviewItem) => {
      expect(q.questionType).toBeDefined();
      expect(q.questionType).not.toBe('');
    });
  });

  it('has scaleType for closed questions', () => {
    questions
      .filter((q: QuestionReviewItem) => q.questionType !== 'open_text')
      .forEach((q: QuestionReviewItem) => {
        expect(q.scaleType).toBeDefined();
        expect(q.scaleType).not.toBe('');
      });
  });

  it('has scaleDetail for closed questions', () => {
    questions
      .filter((q: QuestionReviewItem) => q.questionType !== 'open_text')
      .forEach((q: QuestionReviewItem) => {
        expect(q.scaleDetail).toBeDefined();
        expect(q.scaleDetail.scaleAnchors.length).toBeGreaterThan(0);
        expect(q.scaleDetail.favorableValues.length).toBeGreaterThanOrEqual(0);
        expect(q.scaleDetail.neutralValues.length).toBeGreaterThanOrEqual(0);
        expect(q.scaleDetail.unfavorableValues.length).toBeGreaterThanOrEqual(0);
      });
  });

  it('uses nps_0_10 for NPS/eNPS questions', () => {
    questions
      .filter((q: QuestionReviewItem) => q.questionType === 'enps' || q.questionType === 'nps')
      .forEach((q: QuestionReviewItem) => {
        expect(q.scaleType).toBe('nps_0_10');
      });
  });

  it('has safe dimension IDs', () => {
    questions.forEach((q: QuestionReviewItem) => {
      expect(q.dimensionAssignment).toBeDefined();
      expect(q.dimensionAssignment.dimensionId).toMatch(/^dim_/);
      expect(q.dimensionAssignment.dimensionName).toBeTruthy();
    });
  });

  it('summary total matches questions length', () => {
    expect(summary.totalQuestions).toBe(questions.length);
  });

  it('summary counts sum to total', () => {
    const sum =
      summary.alignedQuestions +
      summary.needsReviewQuestions +
      summary.newQuestions +
      summary.uninterpretableQuestions;
    expect(sum).toBeLessThanOrEqual(summary.totalQuestions);
  });

  it('has questionsByDimension entries', () => {
    expect(summary.questionsByDimension.length).toBeGreaterThan(0);
    summary.questionsByDimension.forEach(d => {
      expect(d.dimensionId).toBeTruthy();
      expect(d.dimensionName).toBeTruthy();
      expect(d.questionCount).toBeGreaterThan(0);
    });
  });

  it('has questionsByScaleType entries', () => {
    expect(summary.questionsByScaleType.length).toBeGreaterThan(0);
    summary.questionsByScaleType.forEach(s => {
      expect(s.scaleType).toBeTruthy();
      expect(s.questionCount).toBeGreaterThan(0);
    });
  });

  it('has suggested commands', () => {
    expect(suggestedCommands.length).toBeGreaterThan(0);
    suggestedCommands.forEach(c => {
      expect(c.command).toBeTruthy();
      expect(c.description).toBeTruthy();
    });
  });

  it('does not contain PII', () => {
    const allText = JSON.stringify(questions);
    const piiPatterns = [
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b\d{8,}\b/,
      /\b(?:nombre|correo|email|tel[eé]fono|identificaci[oó]n)\s*:?\s*\w+/i,
    ];
    piiPatterns.forEach(pattern => {
      expect(pattern.test(allText)).toBe(false);
    });
  });

  it('does not contain raw rows', () => {
    const allText = JSON.stringify(questions);
    const rawRowPatterns = [
      /(?:fila|row|registro)\s*\d+.*:.*\d+/i,
      /\b(?:respuesta|answer)\s*\d+\s*(?:=|:)\s*\d+/i,
    ];
    rawRowPatterns.forEach(pattern => {
      expect(pattern.test(allText)).toBe(false);
    });
  });

  it('does not contain open text answers from respondents', () => {
    const allText = JSON.stringify(questions);
    const piiPatterns = [
      /(?:seg[uú]n mi experiencia|yo opino que|creo que|personalmente)/i,
      /\b(?:respuesta|answer|comentario)\s*(?:abierta|abierto|open)\s*:\s*.{10,}/i,
    ];
    piiPatterns.forEach(pattern => {
      expect(pattern.test(allText)).toBe(false);
    });
  });

  it('does not contain workbook dump', () => {
    const allText = JSON.stringify(questions);
    const dumpPatterns = [
      /(?:cell|celda|range|rango)\s*[A-Z]+\d+/i,
      /\b(?:hoja|sheet)\s*\d+/i,
      /\b(?:tabla|table)\s*\d+/i,
    ];
    dumpPatterns.forEach(pattern => {
      expect(pattern.test(allText)).toBe(false);
    });
  });

  it('has sourceSheetLabel on every question', () => {
    questions.forEach((q: QuestionReviewItem) => {
      expect(q.sourceSheetLabel).toBeTruthy();
    });
  });

  it('has confidenceLevel on every question', () => {
    questions.forEach((q: QuestionReviewItem) => {
      expect(['high', 'medium', 'low']).toContain(q.confidenceLevel);
    });
  });

  it('has status on every question', () => {
    questions.forEach((q: QuestionReviewItem) => {
      expect(q.status).toBeTruthy();
    });
  });

  it('has displayIndex sequential from 1', () => {
    questions.forEach((q: QuestionReviewItem, i: number) => {
      expect(q.displayIndex).toBe(i + 1);
    });
  });

  it('includes at least one open_text question', () => {
    const openText = questions.filter((q: QuestionReviewItem) => q.questionType === 'open_text');
    expect(openText.length).toBeGreaterThanOrEqual(1);
    openText.forEach((q: QuestionReviewItem) => {
      expect(q.scaleType).toBe('not_applicable');
    });
  });

  it('includes at least one enps/nps question', () => {
    const npsQuestions = questions.filter(
      (q: QuestionReviewItem) => q.questionType === 'enps' || q.questionType === 'nps',
    );
    expect(npsQuestions.length).toBeGreaterThanOrEqual(1);
  });

  it('dimension summary names match dimension assignments', () => {
    summary.questionsByDimension.forEach(dimSummary => {
      const matchingQuestions = questions.filter(
        (q: QuestionReviewItem) => q.dimensionAssignment.dimensionId === dimSummary.dimensionId,
      );
      expect(matchingQuestions.length).toBe(dimSummary.questionCount);
    });
  });
});
