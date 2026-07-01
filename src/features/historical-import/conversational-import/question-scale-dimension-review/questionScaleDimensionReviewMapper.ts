import type {
  QuestionReviewItem,
  QuestionType,
  ScaleType,
  ScaleDetail,
  DimensionAssignment,
  QuestionReviewStatus,
  QuestionReviewStepSummary,
  ConversationalCommandSuggestion,
  CriticalIssue,
} from './questionScaleDimensionReviewTypes';

export interface DimensionGroupEntry {
  dimensionId: string;
  dimensionName: string;
  questionCount: number;
  scaleTypes: ScaleType[];
  needsReviewCount: number;
  questionsPreview: string[];
}

export interface NeedsReviewEntry {
  questionId: string;
  displayIndex: number;
  questionText: string;
  questionType: QuestionType;
  scaleType: ScaleType;
  dimensionName: string;
  status: QuestionReviewStatus;
  reviewNotes?: string;
}

export interface QuestionDetailView {
  questionId: string;
  displayIndex: number;
  questionText: string;
  questionType: QuestionType;
  questionTypeLabel: string;
  scaleType: ScaleType;
  scaleTypeLabel: string;
  scaleDetail: ScaleDetail;
  scaleDetailAnchorsText: string;
  dimensionId: string;
  dimensionName: string;
  dimensionSource: DimensionAssignment['source'];
  status: QuestionReviewStatus;
  statusLabel: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  reviewNotes?: string;
}

export interface ConversationalOverview {
  headerText: string;
  summaryLine: string;
  dimensionLines: string[];
  totalQuestions: number;
  alignedCount: number;
  needsReviewCount: number;
  canConfirmSection: boolean;
  blockingIssues: string[];
  suggestedCommands: ConversationalCommandSuggestion[];
}

export interface SectionConfirmationState {
  canConfirmSection: boolean;
  blockingIssues: string[];
  needsReviewCount: number;
  uninterpretableCount: number;
  missingDimensionCount: number;
  missingQuestionTypeCount: number;
  missingScaleTypeCount: number;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  rating_scale: 'Escala de valoración',
  single_choice: 'Opción única',
  multiple_choice: 'Múltiples respuestas',
  open_text: 'Pregunta abierta',
  nps: 'NPS',
  enps: 'eNPS',
  matrix: 'Matriz',
  dropdown: 'Desplegable',
  unknown: 'No determinado',
};

const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  likert_5: 'Likert (escala de preferencias)',
  likert_7: 'Likert (escala de preferencias)',
  nps_0_10: 'NPS (recomendabilidad)',
  binary_yes_no: 'Binaria Sí/No',
  frequency: 'Frecuencia',
  agreement: 'Acuerdo',
  custom: 'Personalizada',
  not_applicable: 'No aplica',
  visual_stars: 'Visual por estrellas',
  visual_emotions: 'Visual por emociones',
  linear_scale: 'Escala lineal',
  likert_nom035: 'Likert (NOM 035)',
  unknown: 'No determinado',
};

const STATUS_LABELS: Record<QuestionReviewStatus, string> = {
  aligned: 'Alineada',
  needs_review: 'Requiere revisión',
  new_question: 'Nueva pregunta',
  uninterpretable: 'No interpretable',
  edited: 'Editada',
  confirmed: 'Confirmada',
};

function getScaleAnchorsText(detail: ScaleDetail): string {
  if (detail.scaleAnchors.length === 0) return 'N/A';
  return detail.scaleAnchors.join(' · ');
}

function buildSuggestedCommands(
  canConfirmSection: boolean,
): ConversationalCommandSuggestion[] {
  const commands: ConversationalCommandSuggestion[] = [
    {
      command: 'ver preguntas por dimensión',
      description: 'Muestra las preguntas agrupadas por dimensión',
    },
    {
      command: 'ver preguntas que requieren revisión',
      description: 'Muestra solo preguntas con estado needs_review o no interpretables',
    },
    {
      command: 'ver todas las preguntas en bloques',
      description: 'Muestra todas las preguntas organizadas en bloques',
    },
  ];
  if (canConfirmSection) {
    commands.push({
      command: 'confirmar esta sección',
      description: 'Confirma la sección 1/7 si no hay bloqueos críticos',
    });
  }
  return commands;
}

export function mapQuestionReviewToConversationalOverview(
  _questions: QuestionReviewItem[],
  summary: QuestionReviewStepSummary,
): ConversationalOverview {
  const dimLines = summary.questionsByDimension.map(
    d => `${d.dimensionName}: ${d.questionCount} preguntas · ${SCALE_TYPE_LABELS[d.scaleType]}`,
  );

  const blockingIssues: string[] = [];
  if (summary.needsReviewQuestions > 0) {
    blockingIssues.push(`${summary.needsReviewQuestions} pregunta(s) requieren revisión`);
  }
  if (summary.uninterpretableQuestions > 0) {
    blockingIssues.push(`${summary.uninterpretableQuestions} pregunta(s) no interpretables`);
  }

  return {
    headerText: '1/7 · Preguntas y escalas',
    summaryLine: `Detecté ${summary.totalQuestions} preguntas. Las organicé por dimensión y tipo de escala.`,
    dimensionLines: dimLines,
    totalQuestions: summary.totalQuestions,
    alignedCount: summary.alignedQuestions,
    needsReviewCount: summary.needsReviewQuestions,
    canConfirmSection: summary.canConfirmSection,
    blockingIssues,
    suggestedCommands: buildSuggestedCommands(summary.canConfirmSection),
  };
}

export function mapQuestionReviewToDimensionGroups(
  questions: QuestionReviewItem[],
): DimensionGroupEntry[] {
  const dimMap = new Map<string, { name: string; scales: Set<ScaleType>; needsReview: number; previews: string[] }>();

  questions.forEach(q => {
    const dimId = q.dimensionAssignment.dimensionId;
    if (!dimMap.has(dimId)) {
      dimMap.set(dimId, {
        name: q.dimensionAssignment.dimensionName,
        scales: new Set(),
        needsReview: 0,
        previews: [],
      });
    }
    const entry = dimMap.get(dimId)!;
    entry.scales.add(q.scaleType);
    if (q.status === 'needs_review' || q.status === 'uninterpretable') {
      entry.needsReview++;
    }
    if (entry.previews.length < 3) {
      entry.previews.push(q.questionText);
    }
  });

  return Array.from(dimMap.entries()).map(([dimensionId, entry]) => ({
    dimensionId,
    dimensionName: entry.name,
    questionCount: questions.filter(q => q.dimensionAssignment.dimensionId === dimensionId).length,
    scaleTypes: Array.from(entry.scales),
    needsReviewCount: entry.needsReview,
    questionsPreview: entry.previews,
  }));
}

export function mapQuestionReviewToNeedsReviewList(
  questions: QuestionReviewItem[],
): NeedsReviewEntry[] {
  const needsReview = questions.filter(
    q =>
      q.status === 'needs_review' ||
      q.status === 'uninterpretable' ||
      q.status === 'new_question' ||
      q.questionType === 'unknown',
  );

  if (needsReview.length === 0) {
    return [];
  }

  return needsReview.map(q => ({
    questionId: q.questionId,
    displayIndex: q.displayIndex,
    questionText: q.questionText,
    questionType: q.questionType,
    scaleType: q.scaleType,
    dimensionName: q.dimensionAssignment.dimensionName,
    status: q.status,
    reviewNotes: q.reviewNotes,
  }));
}

export function mapQuestionReviewToQuestionDetail(
  questions: QuestionReviewItem[],
  identifier: string,
): QuestionDetailView | null {
  const q = questions.find(
    item => item.questionId === identifier || item.displayIndex === Number(identifier),
  );

  if (!q) return null;

  return {
    questionId: q.questionId,
    displayIndex: q.displayIndex,
    questionText: q.questionText,
    questionType: q.questionType,
    questionTypeLabel: QUESTION_TYPE_LABELS[q.questionType],
    scaleType: q.scaleType,
    scaleTypeLabel: SCALE_TYPE_LABELS[q.scaleType],
    scaleDetail: q.scaleDetail,
    scaleDetailAnchorsText: getScaleAnchorsText(q.scaleDetail),
    dimensionId: q.dimensionAssignment.dimensionId,
    dimensionName: q.dimensionAssignment.dimensionName,
    dimensionSource: q.dimensionAssignment.source,
    status: q.status,
    statusLabel: STATUS_LABELS[q.status],
    confidenceLevel: q.confidenceLevel,
    reviewNotes: q.reviewNotes,
  };
}

export function mapQuestionReviewToScaleDetailText(
  questions: QuestionReviewItem[],
  identifier: string,
): string | null {
  const q = questions.find(
    item => item.questionId === identifier || item.displayIndex === Number(identifier),
  );

  if (!q) return null;

  const anchorsText = getScaleAnchorsText(q.scaleDetail);

  return [
    `Tipo de pregunta: ${QUESTION_TYPE_LABELS[q.questionType]}`,
    `Tipo de escala: ${SCALE_TYPE_LABELS[q.scaleType]}`,
    `Rango: ${q.scaleDetail.scaleValueRange}`,
    anchorsText ? `Detalle: ${anchorsText}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function mapQuestionReviewToSectionConfirmationState(
  questions: QuestionReviewItem[],
): SectionConfirmationState {
  const criticalIssues = collectCriticalIssues(questions);

  return {
    canConfirmSection: criticalIssues.length === 0,
    blockingIssues: criticalIssues.map(c => c.description),
    needsReviewCount: questions.filter(q => q.status === 'needs_review').length,
    uninterpretableCount: questions.filter(q => q.status === 'uninterpretable').length,
    missingDimensionCount: questions.filter(q => q.dimensionAssignment.source === 'not_assigned').length,
    missingQuestionTypeCount: questions.filter(q => q.questionType === 'unknown').length,
    missingScaleTypeCount: questions.filter(
      q => q.scaleType === 'unknown' && q.questionType !== 'open_text',
    ).length,
  };
}

function collectCriticalIssues(questions: QuestionReviewItem[]): CriticalIssue[] {
  const issues: CriticalIssue[] = [];

  questions.forEach(q => {
    if (q.questionType === 'unknown') {
      issues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'missing_question_type',
        description: `Pregunta #${q.displayIndex}: tipo de pregunta no definido`,
      });
    }
    if (q.scaleType === 'unknown' && q.questionType !== 'open_text') {
      issues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'missing_scale_type',
        description: `Pregunta #${q.displayIndex}: escala no asignada`,
      });
    }
    if (q.dimensionAssignment.source === 'not_assigned') {
      issues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'missing_dimension',
        description: `Pregunta #${q.displayIndex}: dimensión no asignada`,
      });
    }
    if (q.status === 'uninterpretable') {
      issues.push({
        questionId: q.questionId,
        displayIndex: q.displayIndex,
        issueType: 'uninterpretable',
        description: `Pregunta #${q.displayIndex}: no interpretable`,
      });
    }
  });

  return issues;
}
