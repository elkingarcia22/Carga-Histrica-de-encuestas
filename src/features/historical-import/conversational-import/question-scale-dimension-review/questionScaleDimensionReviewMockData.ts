import type {
  QuestionReviewItem,
  ScaleDetail,
  DimensionAssignment,
  QuestionReviewStepSummary,
  DimensionSummary,
  ScaleTypeSummary,
  CriticalIssue,
  ConversationalCommandSuggestion,
  QuestionReviewMockDataset,
  ScaleType,
} from './questionScaleDimensionReviewTypes';

const likert5Scale: ScaleDetail = {
  scaleLabel: 'Likert 5 puntos',
  scaleValueRange: '1–5',
  scaleAnchors: [
    'Muy en desacuerdo',
    'En desacuerdo',
    'Neutral',
    'De acuerdo',
    'Muy de acuerdo',
  ],
  scoreDirection: 'positive_up',
  favorableValues: [4, 5],
  neutralValues: [3],
  unfavorableValues: [1, 2],
};

const npsScale: ScaleDetail = {
  scaleLabel: 'NPS 0–10',
  scaleValueRange: '0–10',
  scaleAnchors: ['0 a 10 · Detractores 0–6 · Pasivos 7–8 · Promotores 9–10'],
  scoreDirection: 'positive_up',
  favorableValues: [9, 10],
  neutralValues: [7, 8],
  unfavorableValues: [0, 1, 2, 3, 4, 5, 6],
};

const frequencyScale: ScaleDetail = {
  scaleLabel: 'Frecuencia',
  scaleValueRange: '1–5',
  scaleAnchors: ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'],
  scoreDirection: 'positive_up',
  favorableValues: [4, 5],
  neutralValues: [3],
  unfavorableValues: [1, 2],
};

const binaryScale: ScaleDetail = {
  scaleLabel: 'Binaria Sí/No',
  scaleValueRange: '0–1',
  scaleAnchors: ['No', 'Sí'],
  scoreDirection: 'positive_up',
  favorableValues: [1],
  neutralValues: [],
  unfavorableValues: [0],
};

const notApplicableScale: ScaleDetail = {
  scaleLabel: 'No aplica',
  scaleValueRange: 'N/A',
  scaleAnchors: [],
  scoreDirection: 'positive_up',
  favorableValues: [],
  neutralValues: [],
  unfavorableValues: [],
};

const makeDimension = (
  id: string,
  name: string,
  source: DimensionAssignment['source'] = 'detected_by_sheet',
  confidence: DimensionAssignment['confidence'] = 'high',
): DimensionAssignment => ({
  dimensionId: id,
  dimensionName: name,
  source,
  confidence,
});

const dimensions: Record<string, DimensionAssignment> = {
  liderazgo: makeDimension('dim_liderazgo', 'Liderazgo'),
  comunicacion: makeDimension('dim_comunicacion', 'Comunicación'),
  reconocimiento: makeDimension('dim_reconocimiento', 'Reconocimiento'),
  desarrollo: makeDimension('dim_desarrollo', 'Desarrollo'),
  bienestar: makeDimension('dim_bienestar', 'Bienestar'),
  trabajo_en_equipo: makeDimension('dim_trabajo_equipo', 'Trabajo en equipo'),
  compromiso: makeDimension('dim_compromiso', 'Compromiso'),
  experiencia: makeDimension('dim_experiencia', 'Experiencia del colaborador'),
  enps: makeDimension('dim_enps', 'eNPS'),
  engagement: makeDimension('dim_engagement', 'Engagement'),
  no_asignada: makeDimension('dim_no_asignada', 'Sin asignar', 'not_assigned', 'low'),
};

const climaTexts: string[] = [
  'Mi líder comunica claramente los objetivos del equipo.',
  'Recibo retroalimentación útil para mejorar mi trabajo.',
  'Tengo claridad sobre lo que se espera de mí.',
  'Me siento reconocido por mis aportes.',
  'Cuento con oportunidades para desarrollarme.',
  'Siento que mi carga de trabajo es sostenible.',
  'Existe colaboración entre áreas.',
  'Me siento orgulloso de pertenecer a la organización.',
  'El clima de respeto es promovido constantemente.',
  'Se fomenta el balance entre vida personal y laboral.',
  'Mi opinión cuenta en las decisiones del equipo.',
  'La comunicación interna es transparente y oportuna.',
  'Los líderes son accesibles y cercanos.',
  'Se reconocen los esfuerzos adicionales en los proyectos.',
  'Contamos con las herramientas necesarias para trabajar.',
  'Los procesos de evaluación de desempeño son justos.',
  'El ambiente físico o remoto es adecuado para mis tareas.',
  'Se fomenta la innovación y nuevas ideas.',
  'Siento que mi rol tiene impacto en el propósito de la compañía.',
  'Existen programas de beneficios que valoro.',
  'Las reuniones de equipo son productivas.',
  'Recibo apoyo de mis compañeros cuando lo necesito.',
  'La empresa se preocupa por mi salud mental y bienestar.',
  'Siento confianza hacia la dirección general.',
  'Se celebran los logros del equipo regularmente.',
  'Tengo oportunidades de movilidad interna.',
  'El trato es equitativo para todos los colaboradores.',
  'La empresa apoya el desarrollo de nuevas habilidades.',
  'Me siento escuchado cuando planteo inquietudes.',
];

const engagementTexts: string[] = [
  'Recomendaría esta organización como un buen lugar para trabajar.',
  'Raramente pienso en buscar otro empleo.',
  'Me inspira a dar lo mejor de mí todos los días.',
  'Siento un fuerte sentido de pertenencia.',
  'Veo un futuro a largo plazo en esta compañía.',
  'El trabajo que hago es significativo para mí.',
];

const enpsText: string =
  'En una escala del 0 al 10, ¿qué tan probable es que recomiende trabajar aquí?';

const openTextQuestionText: string =
  '¿Qué sugerencias tienes para mejorar el ambiente laboral?';

const dimIds = [
  'liderazgo',
  'comunicacion',
  'reconocimiento',
  'desarrollo',
  'bienestar',
  'trabajo_en_equipo',
  'compromiso',
  'experiencia',
];

const buildQuestions = (): QuestionReviewItem[] => {
  const items: QuestionReviewItem[] = [];
  let idx = 1;

  climaTexts.forEach((text, i) => {
    const dimKey = dimIds[i % dimIds.length];
    items.push({
      questionId: `q_${idx}`,
      displayIndex: idx,
      questionText: text,
      questionType: 'rating_scale',
      scaleType: 'likert_5',
      scaleDetail: likert5Scale,
      dimensionAssignment: dimensions[dimKey],
      status: 'aligned',
      sourceSheetLabel: 'Clima',
      confidenceLevel: 'high',
    });
    idx++;
  });

  engagementTexts.forEach((text, i) => {
    const dimKey = i < 3 ? 'compromiso' : 'engagement';
    const isFrequency = i === 1;
    const isBinary = i === 2;
    items.push({
      questionId: `q_${idx}`,
      displayIndex: idx,
      questionText: text,
      questionType: 'rating_scale',
      scaleType: isFrequency ? 'frequency' : isBinary ? 'binary_yes_no' : 'likert_5',
      scaleDetail: isFrequency ? frequencyScale : isBinary ? binaryScale : likert5Scale,
      dimensionAssignment: dimensions[dimKey],
      status: 'aligned',
      sourceSheetLabel: 'Engagement',
      confidenceLevel: 'high',
    });
    idx++;
  });

  items.push({
    questionId: `q_${idx}`,
    displayIndex: idx,
    questionText: enpsText,
    questionType: 'enps',
    scaleType: 'nps_0_10',
    scaleDetail: npsScale,
    dimensionAssignment: dimensions['enps'],
    status: 'aligned',
    sourceSheetLabel: 'eNPS',
    confidenceLevel: 'high',
  });
  idx++;

  items.push({
    questionId: `q_${idx}`,
    displayIndex: idx,
    questionText: openTextQuestionText,
    questionType: 'open_text',
    scaleType: 'not_applicable',
    scaleDetail: notApplicableScale,
    dimensionAssignment: dimensions['bienestar'],
    status: 'aligned',
    sourceSheetLabel: 'Clima',
    confidenceLevel: 'medium',
  });

  return items;
};

const calculateSummary = (questions: QuestionReviewItem[]): QuestionReviewStepSummary => {
  const totalQuestions = questions.length;
  const alignedQuestions = questions.filter(q => q.status === 'aligned').length;
  const needsReviewQuestions = questions.filter(q => q.status === 'needs_review').length;
  const newQuestions = questions.filter(q => q.status === 'new_question').length;
  const uninterpretableQuestions = questions.filter(q => q.status === 'uninterpretable').length;

  const dimMap = new Map<string, { name: string; count: number; scale: string }>();
  const scaleMap = new Map<string, number>();
  const criticalIssues: CriticalIssue[] = [];

  questions.forEach(q => {
    const dimKey = q.dimensionAssignment.dimensionId;
    if (dimMap.has(dimKey)) {
      const entry = dimMap.get(dimKey)!;
      entry.count++;
    } else {
      dimMap.set(dimKey, {
        name: q.dimensionAssignment.dimensionName,
        count: 1,
        scale: q.scaleType,
      });
    }

    const scaleKey = q.scaleType;
    scaleMap.set(scaleKey, (scaleMap.get(scaleKey) || 0) + 1);

    if (q.questionType === 'unknown') {
      criticalIssues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'missing_question_type',
        description: `Pregunta #${q.displayIndex}: tipo de pregunta no definido`,
      });
    }
    if (q.scaleType === 'unknown' && q.questionType !== 'open_text') {
      criticalIssues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'missing_scale_type',
        description: `Pregunta #${q.displayIndex}: escala no asignada`,
      });
    }
    if (q.dimensionAssignment.source === 'not_assigned') {
      criticalIssues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'missing_dimension',
        description: `Pregunta #${q.displayIndex}: dimensión no asignada`,
      });
    }
    if (q.status === 'uninterpretable') {
      criticalIssues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'uninterpretable',
        description: `Pregunta #${q.displayIndex}: no interpretable`,
      });
    }
    if (q.status === 'needs_review') {
      criticalIssues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'needs_review',
        description: `Pregunta #${q.displayIndex}: requiere revisión`,
      });
    }
  });

  const questionsByDimension: DimensionSummary[] = Array.from(dimMap.entries()).map(
    ([dimensionId, entry]) => ({
      dimensionId,
      dimensionName: entry.name,
      questionCount: entry.count,
      scaleType: entry.scale as ScaleType,
    }),
  );

  const questionsByScaleType: ScaleTypeSummary[] = Array.from(scaleMap.entries()).map(
    ([scaleType, questionCount]) => ({
      scaleType: scaleType as ScaleType,
      questionCount,
    }),
  );

  const canConfirmSection =
    criticalIssues.length === 0 &&
    questions.every(q => q.questionType !== 'unknown') &&
    questions
      .filter(q => q.questionType !== 'open_text')
      .every(q => q.scaleType !== 'unknown' && q.scaleType !== 'not_applicable');

  return {
    totalQuestions,
    alignedQuestions,
    needsReviewQuestions,
    newQuestions,
    uninterpretableQuestions,
    questionsByDimension,
    questionsByScaleType,
    criticalIssues,
    canConfirmSection,
  };
};

const suggestedCommands: ConversationalCommandSuggestion[] = [
  {
    command: 'ver preguntas por dimensión',
    description: 'Muestra las preguntas agrupadas por dimensión',
  },
  {
    command: 'ver preguntas que requieren revisión',
    description: 'Muestra solo preguntas con estado needs_review',
  },
  {
    command: 'ver todas las preguntas en bloques',
    description: 'Muestra todas las preguntas organizadas en bloques',
  },
  {
    command: 'confirmar esta sección',
    description: 'Confirma la sección 1/7 si no hay bloqueos críticos',
  },
];

export const questionScaleDimensionReviewMockData37: QuestionReviewMockDataset = (() => {
  const questions = buildQuestions();
  const summary = calculateSummary(questions);
  return {
    questions,
    summary,
    suggestedCommands,
  };
})();
