import { describe, it, expect } from 'vitest';
import { mapQuestionReviewUserTextToEditingIntent } from '../questionScaleDimensionEditingMapper';

describe('questionScaleDimensionEditingMapper', () => {
  it('interprets "ver resumen"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('ver resumen');
    expect(result.intent).toBe('view_overview');
  });

  it('interprets "ver preguntas por dimensión"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('ver preguntas por dimensión');
    expect(result.intent).toBe('view_by_dimension');
  });

  it('interprets "ver preguntas que requieren revisión"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('ver preguntas que requieren revisión');
    expect(result.intent).toBe('view_needs_review');
  });

  it('interprets "ver pregunta 3"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('ver pregunta 3');
    expect(result.intent).toBe('view_question_detail');
    expect(result.targetQuestionDisplayIndex).toBe(3);
  });

  it('interprets "cambia la dimensión de la pregunta 3 a Liderazgo"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('cambia la dimensión de la pregunta 3 a Liderazgo');
    expect(result.intent).toBe('change_question_dimension');
    expect(result.targetQuestionDisplayIndex).toBe(3);
    expect(result.targetDimensionName).toBe('Liderazgo');
  });

  it('interprets "asigna la pregunta 5 a Compromiso"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('asigna la pregunta 5 a Compromiso');
    expect(result.intent).toBe('change_question_dimension');
    expect(result.targetQuestionDisplayIndex).toBe(5);
    expect(result.targetDimensionName).toBe('Compromiso');
  });

  it('interprets "la pregunta 8 es NPS"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 8 es NPS');
    expect(result.intent).toBe('change_question_type');
    expect(result.targetQuestionDisplayIndex).toBe(8);
    expect(result.targetQuestionType).toBe('nps');
  });

  it('interprets "la pregunta 10 es abierta"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 10 es abierta');
    expect(result.intent).toBe('change_question_type');
    expect(result.targetQuestionDisplayIndex).toBe(10);
    expect(result.targetQuestionType).toBe('open_text');
  });

  it('interprets "la pregunta 12 es escala de valoración"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 12 es escala de valoración');
    expect(result.intent).toBe('change_question_type');
    expect(result.targetQuestionDisplayIndex).toBe(12);
    expect(result.targetQuestionType).toBe('rating_scale');
  });

  it('interprets "ajusta la escala de la pregunta 5 a Likert 5"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('ajusta la escala de la pregunta 5 a Likert 5');
    expect(result.intent).toBe('change_scale_type');
    expect(result.targetQuestionDisplayIndex).toBe(5);
    expect(result.targetScaleType).toBe('likert_5');
  });

  it('interprets "la pregunta 9 usa NPS 0 a 10"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 9 usa NPS 0 a 10');
    expect(result.intent).toBe('change_scale_type');
    expect(result.targetQuestionDisplayIndex).toBe(9);
    expect(result.targetScaleType).toBe('nps_0_10');
  });

  it('interprets "cambia la escala de la pregunta 11 a frecuencia"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('cambia la escala de la pregunta 11 a frecuencia');
    expect(result.intent).toBe('change_scale_type');
    expect(result.targetQuestionDisplayIndex).toBe(11);
    expect(result.targetScaleType).toBe('frequency');
  });

  it('interprets "confirma la pregunta 4"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('confirma la pregunta 4');
    expect(result.intent).toBe('confirm_question');
    expect(result.targetQuestionDisplayIndex).toBe(4);
  });

  it('interprets "confirma esta sección"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('confirma esta sección');
    expect(result.intent).toBe('confirm_section');
  });

  it('handles mayusculas, tildes y espacios extra', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('  Ver    REsUMen  ');
    expect(result.intent).toBe('view_overview');

    const result2 = mapQuestionReviewUserTextToEditingIntent('cAmBia lA DimensiÓn de la prEgUnta 3 a LideRAzgo');
    expect(result2.intent).toBe('change_question_dimension');
    expect(result2.targetQuestionDisplayIndex).toBe(3);
    // Because of normalization and title case
    expect(result2.targetDimensionName).toBe('Liderazgo');
  });

  it('returns invalid_input para texto no interpretable', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('hello world foo bar');
    expect(result.intent).toBe('invalid_input');
  });

  it('returns ambiguous_input cuando falta target', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('cambia la escala');
    expect(result.intent).toBe('ambiguous_input');

    const result2 = mapQuestionReviewUserTextToEditingIntent('corrige la pregunta');
    expect(result2.intent).toBe('ambiguous_input');

    const result3 = mapQuestionReviewUserTextToEditingIntent('eso está mal');
    expect(result3.intent).toBe('ambiguous_input');
  });

  it('interprets numbered commands as aliases correctly', () => {
    const r1 = mapQuestionReviewUserTextToEditingIntent('1');
    expect(r1.intent).toBe('view_by_dimension');

    const r2 = mapQuestionReviewUserTextToEditingIntent('2');
    expect(r2.intent).toBe('view_needs_review');

    const r3 = mapQuestionReviewUserTextToEditingIntent('3');
    expect(r3.intent).toBe('view_all_questions_in_blocks');

    // 4 should confirm section if canConfirmSection is true
    const r4True = mapQuestionReviewUserTextToEditingIntent('4', true);
    expect(r4True.intent).toBe('confirm_section');

    // 4 should be out of range if canConfirmSection is false
    const r4False = mapQuestionReviewUserTextToEditingIntent('4', false);
    expect(r4False.intent).toBe('invalid_input');
    expect(r4False.clarificationPrompt).toContain('fuera de rango');
    expect(r4False.clarificationPrompt).toContain('1 al 3');

    // Any other number out of range
    const rOutOfRange = mapQuestionReviewUserTextToEditingIntent('5', true);
    expect(rOutOfRange.intent).toBe('invalid_input');
    expect(rOutOfRange.clarificationPrompt).toContain('fuera de rango');
    expect(rOutOfRange.clarificationPrompt).toContain('1 al 4');
  });

  it('interprets ver todas las preguntas en bloques and pagination commands', () => {
    const r1 = mapQuestionReviewUserTextToEditingIntent('ver todas las preguntas en bloques');
    expect(r1.intent).toBe('view_all_questions_in_blocks');

    const r2 = mapQuestionReviewUserTextToEditingIntent('ver siguiente bloque');
    expect(r2.intent).toBe('view_next_block');

    const r3 = mapQuestionReviewUserTextToEditingIntent('ver bloque anterior');
    expect(r3.intent).toBe('view_prev_block');
  });

  it('does not invent questionId nor displayIndex', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('ver resumen');
    expect(result.targetQuestionId).toBeUndefined();
    expect(result.targetQuestionDisplayIndex).toBeUndefined();
  });

  it('does not apply state changes and is deterministic', () => {
    // Pure function check
    const r1 = mapQuestionReviewUserTextToEditingIntent('ver pregunta 3');
    const r2 = mapQuestionReviewUserTextToEditingIntent('ver pregunta 3');
    expect(r1).toEqual(r2);
  });
});
