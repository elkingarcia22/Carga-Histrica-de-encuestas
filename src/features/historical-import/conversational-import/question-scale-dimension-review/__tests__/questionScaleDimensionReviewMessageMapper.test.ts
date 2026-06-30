import { describe, it, expect } from 'vitest';
import {
  mapQuestionReviewOverviewToConversation,
  mapQuestionReviewDimensionGroupsToConversation,
  mapQuestionReviewNeedsReviewToConversation,
  mapQuestionReviewQuestionDetailToConversation,
  mapQuestionReviewConfirmationStateToConversation,
} from '../questionScaleDimensionReviewMessageMapper';
import {
  ConversationalOverview,
  DimensionGroupEntry,
  NeedsReviewEntry,
  QuestionDetailView,
  SectionConfirmationState,
} from '../questionScaleDimensionReviewMapper';

describe('questionScaleDimensionReviewMessageMapper', () => {
  describe('mapQuestionReviewOverviewToConversation', () => {
    it('generates an overview with summary and suggested commands', () => {
      const overview: ConversationalOverview = {
        headerText: '1/7 · Preguntas y escalas',
        summaryLine: 'Detecté 37 preguntas. Las organicé por dimensión y tipo de escala.',
        dimensionLines: ['Liderazgo: 8 preguntas · Likert 5 puntos'],
        totalQuestions: 37,
        alignedCount: 30,
        needsReviewCount: 7,
        canConfirmSection: false,
        blockingIssues: ['7 pregunta(s) requieren revisión'],
        suggestedCommands: [
          { command: 'ver preguntas por dimensión' },
          { command: 'ver preguntas que requieren revisión' },
        ],
      };

      const result = mapQuestionReviewOverviewToConversation(overview);
      
      expect(result.responseId).toMatch(/^overview-response$/);
      expect(result.title).toBe('1/7 · Preguntas y escalas');
      expect(result.intro).toBe('Detecté 37 preguntas. Las organicé por dimensión y tipo de escala.');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('summary');
      expect(result.sections[0].content).toContain('Resumen:\n- Liderazgo: 8 preguntas · Likert 5 puntos');
      expect(result.suggestedTextCommands).toEqual([
        '1. Ver preguntas por dimensión',
        '2. Ver preguntas que requieren revisión',
      ]);
      expect(result.status).toBe('needs_review');
    });

    it('handles overview without dimensions and can confirm', () => {
      const overview: ConversationalOverview = {
        headerText: '1/7 · Preguntas y escalas',
        summaryLine: 'Detecté 5 preguntas.',
        dimensionLines: [],
        totalQuestions: 5,
        alignedCount: 5,
        needsReviewCount: 0,
        canConfirmSection: true,
        blockingIssues: [],
        suggestedCommands: [{ command: 'confirmar esta sección' }],
      };

      const result = mapQuestionReviewOverviewToConversation(overview);
      expect(result.sections).toHaveLength(0); // No dimensions
      expect(result.status).toBe('ready');
      expect(result.suggestedTextCommands).toEqual(['1. Confirmar esta sección']);
    });
  });

  describe('mapQuestionReviewDimensionGroupsToConversation', () => {
    it('generates a conversation for dimension group with limits on preview', () => {
      const group: DimensionGroupEntry = {
        dimensionId: 'dim-liderazgo',
        dimensionName: 'Liderazgo',
        questionCount: 8,
        scaleTypes: ['likert_5'],
        needsReviewCount: 1,
        questionsPreview: ['Pregunta 1', 'Pregunta 2', 'Pregunta 3'],
      };

      const result = mapQuestionReviewDimensionGroupsToConversation(group);
      
      expect(result.status).toBe('info');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('dimension_group');
      
      const content = result.sections[0].content;
      expect(content).toContain('Dimensión: Liderazgo');
      expect(content).toContain('Preguntas: 8');
      expect(content).toContain('Escalas: Likert 5 puntos');
      expect(content).toContain('Por revisar: 1');
      expect(content).toContain('Vista previa:\n- P1 · Pregunta 1\n- P2 · Pregunta 2\n- P3 · Pregunta 3');
      
      expect(result.suggestedTextCommands).toEqual([
        '1. Ver preguntas que requieren revisión',
        '2. Ver otra dimensión',
        '3. Confirmar esta sección',
      ]);
    });

    it('handles dimension group with no previews gracefully', () => {
      const group: DimensionGroupEntry = {
        dimensionId: 'dim-liderazgo',
        dimensionName: 'Liderazgo',
        questionCount: 8,
        scaleTypes: ['likert_5', 'nps_0_10'],
        needsReviewCount: 0,
        questionsPreview: [],
      };

      const result = mapQuestionReviewDimensionGroupsToConversation(group);
      const content = result.sections[0].content;
      expect(content).not.toContain('Vista previa:');
      expect(content).toContain('Escalas: Likert 5 puntos, NPS 0–10');
    });
  });

  describe('mapQuestionReviewNeedsReviewToConversation', () => {
    it('generates message for list of questions that need review', () => {
      const list: NeedsReviewEntry[] = [
        {
          questionId: 'q1',
          displayIndex: 3,
          questionText: 'Test q',
          questionType: 'rating_scale',
          scaleType: 'likert_5',
          dimensionName: 'Liderazgo',
          status: 'needs_review',
        },
      ];

      const result = mapQuestionReviewNeedsReviewToConversation(list);
      expect(result.status).toBe('needs_review');
      expect(result.intro).toBe('Encontré 1 pregunta(s) que requieren revisión:');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('needs_review');
      expect(result.sections[0].content).toContain('Pregunta 3: "Test q"\nDetalle: Escala de valoración · Likert 5 puntos · Liderazgo');
      
      expect(result.suggestedTextCommands[0]).toBe('1. Ver detalle de la pregunta 3');
    });

    it('generates correct message when list is empty', () => {
      const result = mapQuestionReviewNeedsReviewToConversation([]);
      expect(result.status).toBe('ready');
      expect(result.intro).toBe('No hay preguntas que requieran revisión.');
      expect(result.sections).toHaveLength(0);
    });
  });

  describe('mapQuestionReviewQuestionDetailToConversation', () => {
    it('generates detail for a specific question (likert)', () => {
      const detail: QuestionDetailView = {
        questionId: 'q3',
        displayIndex: 3,
        questionText: 'Me siento orgulloso de trabajar aquí',
        questionType: 'rating_scale',
        questionTypeLabel: 'Escala de valoración',
        scaleType: 'likert_5',
        scaleTypeLabel: 'Likert 5 puntos',
        scaleDetail: {
          scaleLabel: '',
          scaleValueRange: '1-5',
          scaleAnchors: ['1', '2', '3', '4', '5'],
          scoreDirection: 'positive_up',
          favorableValues: [4, 5],
          neutralValues: [3],
          unfavorableValues: [1, 2],
        },
        scaleDetailAnchorsText: '1 · 2 · 3 · 4 · 5',
        dimensionId: 'dim-1',
        dimensionName: 'Compromiso',
        dimensionSource: 'detected_by_column',
        status: 'aligned',
        statusLabel: 'Alineada',
        confidenceLevel: 'high',
      };

      const result = mapQuestionReviewQuestionDetailToConversation(detail);
      expect(result.status).toBe('info');
      expect(result.sections[0].content).toContain('Pregunta 3\nTexto: "Me siento orgulloso de trabajar aquí"');
      expect(result.sections[0].content).toContain('Detalle: Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo');
      expect(result.sections[0].content).toContain('Dimensión: Compromiso');
      expect(result.sections[0].content).toContain('Estado: Alineada');
    });

    it('generates detail for an nps question', () => {
      const detail: QuestionDetailView = {
        questionId: 'q4',
        displayIndex: 4,
        questionText: 'Recomendaría esta empresa',
        questionType: 'nps',
        questionTypeLabel: 'NPS',
        scaleType: 'nps_0_10',
        scaleTypeLabel: 'NPS 0–10',
        scaleDetail: {
          scaleLabel: '',
          scaleValueRange: '0-10',
          scaleAnchors: [],
          scoreDirection: 'positive_up',
          favorableValues: [9, 10],
          neutralValues: [7, 8],
          unfavorableValues: [0, 1, 2, 3, 4, 5, 6],
        },
        scaleDetailAnchorsText: 'N/A',
        dimensionId: 'dim-2',
        dimensionName: 'eNPS',
        dimensionSource: 'inferred_by_dictionary',
        status: 'needs_review',
        statusLabel: 'Requiere revisión',
        confidenceLevel: 'low',
        reviewNotes: 'No estamos seguros',
      };

      const result = mapQuestionReviewQuestionDetailToConversation(detail);
      expect(result.status).toBe('needs_review');
      expect(result.sections[0].content).toContain('Detalle: 0 a 10 · Detractores 0–6 · Pasivos 7–8 · Promotores 9–10');
      expect(result.sections[0].content).toContain('Notas: No estamos seguros');
    });
  });

  describe('mapQuestionReviewConfirmationStateToConversation', () => {
    it('returns ready state if no blocking issues', () => {
      const state: SectionConfirmationState = {
        canConfirmSection: true,
        blockingIssues: [],
        needsReviewCount: 0,
        uninterpretableCount: 0,
        missingDimensionCount: 0,
        missingQuestionTypeCount: 0,
        missingScaleTypeCount: 0,
      };

      const result = mapQuestionReviewConfirmationStateToConversation(state);
      expect(result.status).toBe('ready');
      expect(result.intro).toBe('La sección está lista para confirmación.');
      expect(result.sections[0].type).toBe('confirmation_state');
      expect(result.suggestedTextCommands).toContain('1. Confirmar esta sección');
    });

    it('returns warning state if there are blocking issues', () => {
      const state: SectionConfirmationState = {
        canConfirmSection: false,
        blockingIssues: ['1 pregunta(s) requieren revisión'],
        needsReviewCount: 1,
        uninterpretableCount: 0,
        missingDimensionCount: 0,
        missingQuestionTypeCount: 0,
        missingScaleTypeCount: 0,
      };

      const result = mapQuestionReviewConfirmationStateToConversation(state);
      expect(result.status).toBe('needs_review');
      expect(result.intro).toBe('Todavía hay preguntas por revisar antes de confirmar esta sección.');
      expect(result.sections[0].type).toBe('warning');
      expect(result.sections[0].content).toContain('Bloqueos:\n- 1 pregunta(s) requieren revisión');
      expect(result.suggestedTextCommands[0]).toBe('1. Ver preguntas que requieren revisión');
    });
  });
});
