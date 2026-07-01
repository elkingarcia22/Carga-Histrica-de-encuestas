import type {
  ConversationalOverview,
  DimensionGroupEntry,
  NeedsReviewEntry,
  QuestionDetailView,
  SectionConfirmationState,
} from './questionScaleDimensionReviewMapper';
import type {
  QuestionReviewConversationResponse,
  ConversationSection,
  QuestionType,
  ScaleType,
  QuestionReviewItem,
} from './questionScaleDimensionReviewTypes';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  rating_scale: 'Escala de valoración',
  single_choice: 'Selección única',
  multiple_choice: 'Selección múltiple',
  open_text: 'Texto abierto',
  nps: 'NPS',
  enps: 'eNPS',
  matrix: 'Matriz',
  unknown: 'No determinado',
};

export const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  likert_5: 'Likert 5 puntos',
  likert_7: 'Likert 7 puntos',
  nps_0_10: 'NPS 0–10',
  binary_yes_no: 'Binaria Sí/No',
  frequency: 'Frecuencia',
  agreement: 'Acuerdo',
  custom: 'Personalizada',
  not_applicable: 'No aplica',
  unknown: 'No determinado',
};

function formatSuggestedCommands(commands: { command: string; description?: string }[]): string[] {
  return commands.map((cmd, idx) => {
    const text = cmd.command.charAt(0).toUpperCase() + cmd.command.slice(1);
    return `${idx + 1}. ${text}`;
  });
}

function generateId(prefix: string): string {
  return `${prefix}-response`;
}

export function getScaleDetailText(q: QuestionReviewItem): string {
  if (q.scaleType === 'likert_5') {
    return 'Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo';
  }
  if (q.scaleType === 'likert_7') {
    return 'Muy en desacuerdo · En desacuerdo · Algo en desacuerdo · Neutral · Algo de acuerdo · De acuerdo · Muy de acuerdo';
  }
  if (q.scaleType === 'nps_0_10') {
    return 'Detractores 0–6 · Pasivos 7–8 · Promotores 9–10';
  }
  if (q.scaleDetail.scaleAnchors && q.scaleDetail.scaleAnchors.length > 0) {
    return q.scaleDetail.scaleAnchors.join(' · ');
  }
  return 'N/A';
}

export function mapQuestionReviewOverviewToConversation(
  overview: ConversationalOverview,
  questions?: QuestionReviewItem[],
): QuestionReviewConversationResponse {
  const sections: ConversationSection[] = [];

  if (questions && questions.length > 0) {
    const dimensionsList: { dimensionName: string; list: QuestionReviewItem[] }[] = [];
    const dimMap = new Map<string, QuestionReviewItem[]>();

    questions.forEach(q => {
      const dimName = q.dimensionAssignment.source === 'not_assigned'
        ? 'Sin dimensión'
        : q.dimensionAssignment.dimensionName || 'Sin dimensión';
      if (!dimMap.has(dimName)) {
        dimMap.set(dimName, []);
        dimensionsList.push({ dimensionName: dimName, list: dimMap.get(dimName)! });
      }
      dimMap.get(dimName)!.push(q);
    });

    const lines: string[] = [];
    dimensionsList.forEach(grp => {
      lines.push(`Dimensión: ${grp.dimensionName}\n`);
      grp.list.forEach(q => {
        const qTypeLabel = QUESTION_TYPE_LABELS[q.questionType] || q.questionType;
        const sTypeLabel = SCALE_TYPE_LABELS[q.scaleType] || q.scaleType;
        const detailText = getScaleDetailText(q);
        lines.push(`P${q.displayIndex}. ${q.questionText}`);
        lines.push(`Tipo de pregunta: ${qTypeLabel}`);
        lines.push(`Tipo de escala: ${sTypeLabel}`);
        lines.push(`Detalle de escala: ${detailText}\n`);
      });
    });

    const joinedContent = lines.join('\n').trim();
    sections.push({
      type: 'summary',
      content: joinedContent,
    });
  } else if (overview.dimensionLines.length > 0) {
    sections.push({
      type: 'summary',
      content: 'Resumen:\n' + overview.dimensionLines.map(line => `- ${line}`).join('\n'),
    });
  }

  const suggestedCommands = questions && questions.length > 0
    ? [
        '1. Elegir una pregunta para modificar',
        '2. Escribir directamente qué quieres ajustar',
        '3. Continuar a Demográficos',
      ]
    : formatSuggestedCommands(overview.suggestedCommands);

  return {
    responseId: generateId('overview'),
    title: overview.headerText,
    intro: questions && questions.length > 0
      ? `Detecté ${questions.length} preguntas. Las agrupé por dimensión para que puedas revisar su configuración.`
      : overview.summaryLine,
    sections,
    suggestedTextCommands: suggestedCommands,
    status: overview.canConfirmSection ? 'ready' : 'needs_review',
  };
}

export function mapQuestionReviewDimensionGroupsToConversation(
  group: DimensionGroupEntry,
): QuestionReviewConversationResponse {
  const scaleLabels = group.scaleTypes.map(st => SCALE_TYPE_LABELS[st] || st).join(', ');
  
  const headerLines = [
    `Dimensión: ${group.dimensionName}`,
    `Preguntas: ${group.questionCount}`,
    `Escalas: ${scaleLabels}`,
    `Por revisar: ${group.needsReviewCount}`,
  ];

  const previewLines = group.questionsPreview.length > 0
    ? ['\nVista previa:', ...group.questionsPreview.map((p, i) => `- P${i + 1} · ${p}`)]
    : [];

  const content = [...headerLines, ...previewLines].join('\n');

  const commands = [
    { command: 'ver preguntas que requieren revisión' },
    { command: 'ver otra dimensión' },
    { command: 'confirmar esta sección' },
  ];

  return {
    responseId: generateId(`dimension-group-${group.dimensionId}`),
    sections: [
      {
        type: 'dimension_group',
        content,
      },
    ],
    suggestedTextCommands: formatSuggestedCommands(commands),
    status: 'info',
  };
}

export function mapQuestionReviewNeedsReviewToConversation(
  needsReviewList: NeedsReviewEntry[],
): QuestionReviewConversationResponse {
  if (needsReviewList.length === 0) {
    return {
      responseId: generateId('needs-review-empty'),
      intro: 'No hay preguntas que requieran revisión.',
      sections: [],
      suggestedTextCommands: formatSuggestedCommands([
        { command: 'ver resumen de preguntas' },
        { command: 'confirmar esta sección' },
      ]),
      status: 'ready',
    };
  }

  const sections: ConversationSection[] = needsReviewList.map(q => {
    const qType = QUESTION_TYPE_LABELS[q.questionType] || q.questionType;
    const sType = SCALE_TYPE_LABELS[q.scaleType] || q.scaleType;
    const notes = q.reviewNotes ? ` · Notas: ${q.reviewNotes}` : '';
    
    return {
      type: 'needs_review',
      content: `Pregunta ${q.displayIndex}: "${q.questionText}"\nDetalle: ${qType} · ${sType} · ${q.dimensionName}${notes}`,
    };
  });

  return {
    responseId: generateId('needs-review-list'),
    intro: `Encontré ${needsReviewList.length} pregunta(s) que requieren revisión:`,
    sections,
    suggestedTextCommands: formatSuggestedCommands([
      { command: `ver detalle de la pregunta ${needsReviewList[0]?.displayIndex || 1}` },
      { command: 'ver todas las preguntas por revisar' },
      { command: 'ver resumen de preguntas' },
    ]),
    status: 'needs_review',
  };
}

export function mapQuestionReviewQuestionDetailToConversation(
  detail: QuestionDetailView,
): QuestionReviewConversationResponse {
  const contentLines = [
    `Pregunta ${detail.displayIndex}`,
    `Texto: "${detail.questionText}"`,
    `Tipo de pregunta: ${detail.questionTypeLabel}`,
    `Tipo de escala: ${detail.scaleTypeLabel}`,
  ];

  // Map detailed scale text as requested
  if (detail.scaleType === 'likert_5') {
    contentLines.push('Detalle: Muy en desacuerdo · En desacuerdo · Neutral · De acuerdo · Muy de acuerdo');
  } else if (detail.scaleType === 'nps_0_10') {
    contentLines.push('Detalle: 0 a 10 · Detractores 0–6 · Pasivos 7–8 · Promotores 9–10');
  } else if (detail.scaleDetailAnchorsText && detail.scaleDetailAnchorsText !== 'N/A') {
    contentLines.push(`Detalle: ${detail.scaleDetailAnchorsText}`);
  }

  contentLines.push(`Dimensión: ${detail.dimensionName}`);
  contentLines.push(`Estado: ${detail.statusLabel}`);

  if (detail.reviewNotes) {
    contentLines.push(`Notas: ${detail.reviewNotes}`);
  }

  const commands = [
    { command: 'confirmar esta pregunta' },
    { command: 'cambiar dimensión' },
    { command: 'cambiar tipo de escala' },
    { command: 'ver otra pregunta' },
  ];

  return {
    responseId: generateId(`question-detail-${detail.questionId}`),
    sections: [
      {
        type: 'question_detail',
        content: contentLines.join('\n'),
      },
    ],
    suggestedTextCommands: formatSuggestedCommands(commands),
    status: detail.status === 'needs_review' || detail.status === 'uninterpretable' ? 'needs_review' : 'info',
  };
}

export function mapQuestionReviewConfirmationStateToConversation(
  state: SectionConfirmationState,
): QuestionReviewConversationResponse {
  if (state.canConfirmSection) {
    return {
      responseId: generateId('confirmation-state-ready'),
      intro: 'La sección está lista para confirmación.',
      sections: [
        {
          type: 'confirmation_state',
          content: 'Todos los requisitos están cumplidos.',
        },
      ],
      suggestedTextCommands: formatSuggestedCommands([
        { command: 'confirmar esta sección' },
        { command: 'ver resumen de preguntas' },
        { command: 'ver preguntas por dimensión' },
      ]),
      status: 'ready',
    };
  }

  const issuesLines = state.blockingIssues.map(issue => `- ${issue}`);
  const content = `Bloqueos:\n${issuesLines.join('\n')}`;

  const commands = [];
  if (state.needsReviewCount > 0 || state.uninterpretableCount > 0) {
    commands.push({ command: 'ver preguntas que requieren revisión' });
  }
  if (state.missingDimensionCount > 0) {
    commands.push({ command: 'ver preguntas sin dimensión' });
  }
  commands.push({ command: 'ver detalle de una pregunta' });

  return {
    responseId: generateId('confirmation-state-blocked'),
    intro: 'Todavía hay preguntas por revisar antes de confirmar esta sección.',
    sections: [
      {
        type: 'warning',
        content,
      },
    ],
    suggestedTextCommands: formatSuggestedCommands(commands),
    status: 'needs_review',
  };
}
