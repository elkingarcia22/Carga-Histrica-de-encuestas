import type {
  DemoFixtureDataset,
  DemoFixtureSourceFile,
  DemoFixtureDimension,
  DemoFixtureQuestion,
  DemoFixtureQuestionDimensionMapping,
  DemoFixtureMetric,
  DemoFixtureDemographic,
  DemoFixtureSegment,
  DemoFixtureReviewDecision
} from './types';

const dimensions: DemoFixtureDimension[] = [
  'Liderazgo',
  'Comunicación',
  'Reconocimiento',
  'Desarrollo',
  'Bienestar',
  'Trabajo en equipo',
  'Compromiso',
  'Experiencia del colaborador',
  'eNPS',
  'Engagement'
].map((dim, idx) => ({
  id: `dim_${idx + 1}`,
  cycleId: 'qs_clima_2025',
  sourceLabel: dim,
  displayLabel: dim,
  normalizedLabel: dim.toLowerCase().replace(/ /g, '_'),
  sourceTrace: {
    sourceFileName: 'Resultdos Clima total QS 2025.xlsx',
    sourceLabel: dim,
    sourceKind: 'fixture_curated'
  },
  reviewState: 'pending'
}));

const climaQuestions = [
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
  'Entiendo cómo mi trabajo contribuye al éxito general.'
];

const engagementQuestions = [
  'Recomendaría esta organización como un buen lugar para trabajar.',
  'Raramente pienso en buscar otro empleo.',
  'Me inspira a dar lo mejor de mí todos los días.',
  'Siento un fuerte sentido de pertenencia.',
  'Veo un futuro a largo plazo en esta compañía.',
  'El trabajo que hago es significativo para mí.'
];

const enpsQuestions = [
  'En una escala del 0 al 10, ¿qué tan probable es que recomiende trabajar aquí?'
];

const generateQuestions = (labels: string[], type: 'likert' | 'engagement' | 'enps', offset: number, defaultDimId: string): { q: DemoFixtureQuestion[], m: DemoFixtureQuestionDimensionMapping[] } => {
  const q: DemoFixtureQuestion[] = [];
  const m: DemoFixtureQuestionDimensionMapping[] = [];
  
  labels.forEach((label, index) => {
    const qId = `q_${offset + index}`;
    q.push({
      id: qId,
      cycleId: 'qs_clima_2025',
      sourceLabel: label,
      displayLabel: label,
      normalizedLabel: label.toLowerCase().substring(0, 20),
      questionType: type,
      sourceTrace: {
        sourceFileName: 'Resultdos Clima total QS 2025.xlsx',
        sourceLabel: label,
        sourceKind: 'fixture_curated'
      },
      reviewState: 'pending'
    });
    
    // Assign dimensions (round robin for Clima to make it demo-ready)
    let dimId = defaultDimId;
    if (type === 'likert') {
      dimId = dimensions[index % 8].id; // Assign to first 8 dimensions
    }
    
    m.push({
      id: `m_${offset + index}`,
      cycleId: 'qs_clima_2025',
      questionId: qId,
      detectedDimensionId: dimId,
      mappingSource: 'fixture_curated',
      confidence: 100,
      reviewState: 'pending',
      sourceTrace: {
        sourceFileName: 'Resultdos Clima total QS 2025.xlsx',
        sourceLabel: label,
        sourceKind: 'fixture_curated'
      }
    });
  });
  
  return { q, m };
}

const climaRes = generateQuestions(climaQuestions, 'likert', 1, dimensions[0].id);
const engRes = generateQuestions(engagementQuestions, 'engagement', 31, dimensions[9].id);
const enpsRes = generateQuestions(enpsQuestions, 'enps', 37, dimensions[8].id);

const questions = [...climaRes.q, ...engRes.q, ...enpsRes.q];
const mappings = [...climaRes.m, ...engRes.m, ...enpsRes.m];

const files2025: DemoFixtureSourceFile[] = [
  {
    id: 'f_total_2025',
    fileName: 'Resultdos Clima total QS 2025.xlsx',
    cycleId: 'qs_clima_2025',
    fileRole: 'total_report',
    sheets: [
      { id: 'sh_25_1', fileId: 'f_total_2025', name: 'Clima', layout: 'aggregated_items_by_rows', detectedPurpose: 'resultados clima' },
      { id: 'sh_25_2', fileId: 'f_total_2025', name: 'Engagement', layout: 'aggregated_items_by_rows', detectedPurpose: 'resultados engagement' },
      { id: 'sh_25_3', fileId: 'f_total_2025', name: 'eNPS', layout: 'aggregated_items_by_rows', detectedPurpose: 'resultados enps' }
    ],
    privacyLevel: {
      containsDirectIdentifiers: false,
      containsPseudonymousIds: false,
      containsOpenText: false,
      containsRawResponses: false,
      containsAggregatedOnly: true,
      privacyRiskLevel: 'low',
      notes: 'No includes open text or raw rows in fixture'
    },
    sourceTrace: {
      sourceFileName: 'Resultdos Clima total QS 2025.xlsx',
      sourceLabel: 'Resultdos Clima total QS 2025.xlsx',
      sourceKind: 'fixture_curated'
    }
  }
];

const managementSegments = [
  'Agropecuario',
  'Administracion y finanzas',
  'Gerencia Comercial',
  'Gerencia General',
  'Gerencia Industrial',
  'Gerencia Marketing',
  'Gerencia Personas y Organizacion',
  'Gerencia Supply Chain'
];

managementSegments.forEach((seg, idx) => {
  const fId = `f_seg_${idx + 1}`;
  files2025.push({
    id: fId,
    fileName: `Resultados ${seg} 2025.xlsx`,
    cycleId: 'qs_clima_2025',
    fileRole: 'segment_report',
    segmentId: `seg_${idx + 2}`,
    sheets: [
      { id: `sh_25_seg_${idx}_1`, fileId: fId, name: 'Clima', layout: 'aggregated_items_by_rows', detectedPurpose: 'resultados clima segmento' },
      { id: `sh_25_seg_${idx}_2`, fileId: fId, name: 'Engagement', layout: 'aggregated_items_by_rows', detectedPurpose: 'resultados engagement segmento' },
      { id: `sh_25_seg_${idx}_3`, fileId: fId, name: 'eNPS', layout: 'aggregated_items_by_rows', detectedPurpose: 'resultados enps segmento' }
    ],
    privacyLevel: {
      containsDirectIdentifiers: false,
      containsPseudonymousIds: false,
      containsOpenText: false,
      containsRawResponses: false,
      containsAggregatedOnly: true,
      privacyRiskLevel: 'low',
      notes: 'No includes open text or raw rows in fixture'
    },
    sourceTrace: {
      sourceFileName: `Resultados ${seg} 2025.xlsx`,
      sourceLabel: `Resultados ${seg} 2025.xlsx`,
      sourceKind: 'fixture_curated'
    }
  });
});

const files2024: DemoFixtureSourceFile[] = [
  {
    id: 'f_raw_2024',
    fileName: 'Resultados Encuesta de Clima 2024.xlsx',
    cycleId: 'qs_clima_2024',
    fileRole: 'raw_responses',
    sheets: [
      { id: 'sh_24_1', fileId: 'f_raw_2024', name: 'answers', layout: 'raw_responses_by_columns', detectedPurpose: 'raw answers' },
      { id: 'sh_24_2', fileId: 'f_raw_2024', name: 'Dimensions', layout: 'unknown', detectedPurpose: 'supporting catalog' },
      { id: 'sh_24_3', fileId: 'f_raw_2024', name: 'colaboradores', layout: 'unknown', detectedPurpose: 'supporting catalog' },
      { id: 'sh_24_4', fileId: 'f_raw_2024', name: 'Jerarquía', layout: 'unknown', detectedPurpose: 'supporting catalog' }
    ],
    privacyLevel: {
      containsDirectIdentifiers: false,
      containsPseudonymousIds: true,
      containsOpenText: false, // Omitted in fixture
      containsRawResponses: true,
      containsAggregatedOnly: false,
      privacyRiskLevel: 'medium',
      notes: 'contains responses by columns and pseudonymized ID; no individual values are included in the fixture'
    },
    sourceTrace: {
      sourceFileName: 'Resultados Encuesta de Clima 2024.xlsx',
      sourceLabel: 'Resultados Encuesta de Clima 2024.xlsx',
      sourceKind: 'fixture_curated'
    }
  }
];

const metrics: DemoFixtureMetric[] = [
  { type: 'negative_perception', label: 'Percepción Negativa' },
  { type: 'neutral_perception', label: 'Percepción Neutra' },
  { type: 'positive_perception', label: 'Percepción Positiva' },
  { type: 'total_responses', label: 'Total de respuestas' },
  { type: 'favorability', label: 'Favorabilidad' },
  { type: 'participation', label: 'Participación' },
  { type: 'enps_score', label: 'eNPS Score' },
  { type: 'promoters', label: 'Promotores' },
  { type: 'passives', label: 'Neutrales' },
  { type: 'detractors', label: 'Detractores' }
].map((m, idx) => ({
  id: `met_${idx + 1}`,
  cycleId: 'qs_clima_2025',
  metricType: m.type as DemoFixtureMetric['metricType'],
  sourceLabel: m.label,
  displayLabel: m.label,
  reviewState: 'pending',
  sourceTrace: {
    sourceFileName: 'Resultdos Clima total QS 2025.xlsx',
    sourceLabel: m.label,
    sourceKind: 'fixture_curated'
  }
}));

const demographics: DemoFixtureDemographic[] = [
  { type: 'management', label: 'Gerencia' },
  { type: 'area', label: 'Área' },
  { type: 'department', label: 'Departamento' },
  { type: 'role', label: 'Rol' },
  { type: 'seniority', label: 'Antigüedad' },
  { type: 'site', label: 'Sede' },
  { type: 'level', label: 'Nivel' }
].map((d, idx) => ({
  id: `demo_${idx + 1}`,
  cycleId: 'qs_clima_2025',
  demographicType: d.type as DemoFixtureDemographic['demographicType'],
  sourceLabel: d.label,
  displayLabel: d.label,
  isSegmentableByDefault: true,
  isSensitive: false,
  reviewState: 'pending',
  sourceTrace: {
    sourceFileName: 'Resultados Encuesta de Clima 2024.xlsx', // Likely comes from catalog
    sourceLabel: d.label,
    sourceKind: 'fixture_curated'
  }
}));

const segments: DemoFixtureSegment[] = [
  {
    id: 'seg_1',
    cycleId: 'qs_clima_2025',
    segmentType: 'cycle_total',
    sourceLabel: 'Total compañía',
    displayLabel: 'Total compañía',
    sourceFileIds: ['f_total_2025'],
    reviewState: 'pending',
    sourceTrace: {
      sourceFileName: 'Resultdos Clima total QS 2025.xlsx',
      sourceLabel: 'Total compañía',
      sourceKind: 'fixture_curated'
    }
  },
  ...managementSegments.map((seg, idx) => ({
    id: `seg_${idx + 2}`,
    cycleId: 'qs_clima_2025' as const,
    segmentType: 'management' as const,
    sourceLabel: seg,
    displayLabel: seg,
    sourceFileIds: [`f_seg_${idx + 1}`],
    reviewState: 'pending' as const,
    sourceTrace: {
      sourceFileName: `Resultados ${seg} 2025.xlsx`,
      sourceLabel: seg,
      sourceKind: 'fixture_curated'
    }
  }))
];

const decisions: DemoFixtureReviewDecision[] = [
  {
    id: 'dec_1',
    cycleId: 'qs_clima_2025',
    title: 'Confirmar dimensiones curadas del fixture',
    description: 'Revisar las dimensiones detectadas en los archivos para asegurar que coinciden con el modelo esperado.',
    entityType: 'dimension',
    entityId: 'dim_1',
    decisionType: 'confirm_dimension',
    severity: 'medium',
    recommendedAction: 'Revisar manual y confirmar',
    reviewState: 'pending'
  },
  {
    id: 'dec_2',
    cycleId: 'qs_clima_2025',
    title: 'Confirmar mapeo pregunta -> dimensión',
    description: 'Verificar la asignación de preguntas a cada dimensión del modelo.',
    entityType: 'mapping',
    entityId: 'm_1',
    decisionType: 'confirm_question_dimension_mapping',
    severity: 'blocking',
    recommendedAction: 'Aprobar mapeo automático o ajustar manualmente',
    reviewState: 'pending'
  },
  {
    id: 'dec_3',
    cycleId: 'qs_clima_2025',
    title: 'Confirmar archivos por gerencia como cortes del ciclo 2025',
    description: 'Validar que los archivos de segmentos detectados corresponden efectivamente a cortes de la misma encuesta principal.',
    entityType: 'segment',
    entityId: 'seg_2',
    decisionType: 'confirm_segment',
    severity: 'medium',
    recommendedAction: 'Confirmar agrupación de segmentos',
    reviewState: 'pending'
  },
  {
    id: 'dec_4',
    cycleId: 'qs_clima_2025',
    title: 'Confirmar demográficos seguros para segmentación',
    description: 'Validar los cortes demográficos propuestos y su uso en cruces de datos.',
    entityType: 'demographic',
    entityId: 'demo_1',
    decisionType: 'confirm_demographic',
    severity: 'high',
    recommendedAction: 'Confirmar que estos demográficos son aptos para reportes agregados',
    reviewState: 'pending'
  },
  {
    id: 'dec_5',
    cycleId: 'qs_clima_2024',
    title: 'Confirmar tratamiento de ID seudonimizado en 2024',
    description: 'El archivo contiene raw responses con identificadores. Confirmar que no se usará a nivel individual.',
    entityType: 'privacy',
    entityId: 'f_raw_2024',
    decisionType: 'confirm_privacy',
    severity: 'blocking',
    recommendedAction: 'Revisar política de anonimización',
    reviewState: 'pending'
  },
  {
    id: 'dec_6',
    cycleId: 'qs_clima_2025',
    title: 'Confirmar métricas agregadas disponibles',
    description: 'Validar las métricas de percepción y favorabilidad detectadas en los resultados agregados.',
    entityType: 'metric',
    entityId: 'met_1',
    decisionType: 'confirm_metric',
    severity: 'medium',
    recommendedAction: 'Confirmar métricas calculables',
    reviewState: 'pending'
  }
];

export const qsClimaDemoFixture: DemoFixtureDataset = {
  fixtureMode: 'demo_fixture',
  fixtureScope: 'qs_clima_2024_2025',
  surveyCycles: ['qs_clima_2024', 'qs_clima_2025'],
  sourceLayer: {
    files: [...files2025, ...files2024],
    dimensions,
    questions,
    mappings,
    metrics,
    demographics,
    segments,
    decisions
  },
  overlayLayer: {
    actions: []
  },
  privacyBoundary: {
    realResponsesIncluded: false,
    openTextIncluded: false,
    piiIncluded: false,
    rawRowsIncluded: false,
    workbookDumpIncluded: false,
    apiConnected: false,
    storageConnected: false,
    claudeConnected: false
  }
};

export const qsClimaDemoMetadata = {
  aggregatedParticipationCount: 2730
};
