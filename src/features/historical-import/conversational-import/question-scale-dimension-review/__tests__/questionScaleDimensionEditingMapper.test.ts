// Governance alignment: tests moved to authorized __tests__ folder
import { describe, it, expect } from 'vitest';
import {
  mapQuestionReviewUserTextToEditingIntent,
  parseQuestionSelection,
} from '../questionScaleDimensionEditingMapper';

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
    expect(result.intent).toBe('invalid_input');
    expect(result.targetQuestionDisplayIndex).toBe(3);
    expect(result.clarificationPrompt).toContain('Las dimensiones están bloqueadas');
  });

  it('interprets "asigna la pregunta 5 a Compromiso"', () => {
    const result = mapQuestionReviewUserTextToEditingIntent('asigna la pregunta 5 a Compromiso');
    expect(result.intent).toBe('invalid_input');
    expect(result.targetQuestionDisplayIndex).toBe(5);
    expect(result.clarificationPrompt).toContain('Las dimensiones están bloqueadas');
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
    expect(result2.intent).toBe('invalid_input');
    expect(result2.targetQuestionDisplayIndex).toBe(3);
    expect(result2.clarificationPrompt).toContain('Las dimensiones están bloqueadas');
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

  describe('parseQuestionSelection robust parsing', () => {
    it('interprets number only "28"', () => {
      const res = parseQuestionSelection('28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "pregunta 28"', () => {
      const res = parseQuestionSelection('pregunta 28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets typo "preguta 28"', () => {
      const res = parseQuestionSelection('preguta 28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "p28"', () => {
      const res = parseQuestionSelection('p28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "P28"', () => {
      const res = parseQuestionSelection('P28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "pregunta #28"', () => {
      const res = parseQuestionSelection('pregunta #28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "modificar pregunta 28"', () => {
      const res = parseQuestionSelection('modificar pregunta 28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "editar la pregunta 28"', () => {
      const res = parseQuestionSelection('editar la pregunta 28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('interprets "quiero cambiar la pregunta 28"', () => {
      const res = parseQuestionSelection('quiero cambiar la pregunta 28', 37);
      expect(res.valid).toBe(true);
      expect(res.questionNumber).toBe(28);
    });

    it('retains state and requests valid range when out of range (e.g. "pregunta 99")', () => {
      const res = parseQuestionSelection('pregunta 99', 37);
      expect(res.valid).toBe(false);
      expect(res.questionNumber).toBeUndefined();
      expect(res.errorMsg).toBe('No encontré la pregunta 99. Responde con un número entre 1 y 37.');
    });

    it('retains state and requests valid number on invalid text (e.g. no digits)', () => {
      const res = parseQuestionSelection('hello world', 37);
      expect(res.valid).toBe(false);
      expect(res.questionNumber).toBeUndefined();
      expect(res.errorMsg).toBe('No pude identificar la pregunta. Responde con el número de pregunta que quieres modificar, por ejemplo: 28.');
    });
  });

  describe('UBITS taxonomy free-text parsing', () => {
    it('interprets "cambia la pregunta 5 a pregunta abierta"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('cambia la pregunta 5 a pregunta abierta');
      expect(result.intent).toBe('change_question_type');
      expect(result.targetQuestionDisplayIndex).toBe(5);
      expect(result.targetQuestionType).toBe('open_text');
    });

    it('interprets "la pregunta 8 debe ser opción única"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 8 debe ser opción única');
      expect(result.intent).toBe('change_question_type');
      expect(result.targetQuestionDisplayIndex).toBe(8);
      expect(result.targetQuestionType).toBe('single_choice');
    });

    it('interprets "la pregunta 9 debe ser múltiples respuestas"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 9 debe ser múltiples respuestas');
      expect(result.intent).toBe('change_question_type');
      expect(result.targetQuestionDisplayIndex).toBe(9);
      expect(result.targetQuestionType).toBe('multiple_choice');
    });

    it('interprets "la pregunta 10 es desplegable"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('la pregunta 10 es desplegable');
      expect(result.intent).toBe('change_question_type');
      expect(result.targetQuestionDisplayIndex).toBe(10);
      expect(result.targetQuestionType).toBe('dropdown');
    });

    it('interprets "usa NPS recomendabilidad"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('pregunta 7 usa NPS recomendabilidad');
      expect(result.intent).toBe('change_scale_type');
      expect(result.targetQuestionDisplayIndex).toBe(7);
      expect(result.targetScaleType).toBe('nps_0_10');
    });

    it('interprets "la escala debe ser visual por estrellas"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('la escala de la pregunta 3 debe ser visual por estrellas');
      expect(result.intent).toBe('change_scale_type');
      expect(result.targetQuestionDisplayIndex).toBe(3);
      expect(result.targetScaleType).toBe('visual_stars');
    });

    it('interprets "cambia la escala a visual por emociones"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('cambia la escala de la pregunta 4 a visual por emociones');
      expect(result.intent).toBe('change_scale_type');
      expect(result.targetQuestionDisplayIndex).toBe(4);
      expect(result.targetScaleType).toBe('visual_emotions');
    });

    it('interprets "usa escala lineal"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('pregunta 12 usa escala lineal');
      expect(result.intent).toBe('change_scale_type');
      expect(result.targetQuestionDisplayIndex).toBe(12);
      expect(result.targetScaleType).toBe('linear_scale');
    });

    it('interprets "usa Likert NOM 035"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('pregunta 15 usa Likert NOM 035');
      expect(result.intent).toBe('change_scale_type');
      expect(result.targetQuestionDisplayIndex).toBe(15);
      expect(result.targetScaleType).toBe('likert_nom035');
    });

    it('interprets "tipo de valoración acuerdo"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('pregunta 5 tipo de valoración acuerdo');
      expect(result.intent).toBe('change_scale_detail');
      expect(result.targetQuestionDisplayIndex).toBe(5);
      expect(result.targetScaleDetailAnchors).toEqual(['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo']);
    });

    it('interprets "usa frecuencia nunca siempre"', () => {
      const result = mapQuestionReviewUserTextToEditingIntent('pregunta 2 usa frecuencia nunca siempre');
      expect(result.intent).toBe('change_scale_detail');
      expect(result.targetQuestionDisplayIndex).toBe(2);
      expect(result.targetScaleDetailAnchors).toEqual(['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre']);
    });
  });
});
