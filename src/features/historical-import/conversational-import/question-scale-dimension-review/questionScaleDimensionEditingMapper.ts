import type {
  QuestionReviewEditingIntent,
  QuestionType,
  ScaleType,
} from './questionScaleDimensionReviewTypes';

/**
 * Normalizes user text to lowercase, removes accents, and trims extra spaces.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}


/**
 * Parses a target QuestionType from text.
 */
function extractQuestionType(text: string): QuestionType | undefined {
  if (text.includes('enps')) return 'enps';
  if (text.includes('nps')) return 'nps';
  if (text.includes('abierta') || text.includes('texto')) return 'open_text';
  if (text.includes('escala de valoracion') || text.includes('valoracion')) return 'rating_scale';
  if (text.includes('opcion multiple') || text.includes('multiple') || text.includes('respuestas')) return 'multiple_choice';
  if (text.includes('opcion unica') || text.includes('unica')) return 'single_choice';
  if (text.includes('desplegable')) return 'dropdown';
  if (text.includes('matriz')) return 'matrix';
  return undefined;
}

/**
 * Parses a target ScaleType from text.
 */
function extractScaleType(text: string): ScaleType | undefined {
  if (text.includes('nom 035') || text.includes('nom035')) return 'likert_nom035';
  if (text.includes('likert (escala de preferencias)') || text.includes('preferencias') || text.includes('likert 5') || text.includes('likert 7')) return 'likert_5';
  if (text.includes('nps (recomendabilidad)') || text.includes('recomendabilidad') || text.includes('nps 0 a 10') || text.includes('nps 0-10')) return 'nps_0_10';
  if (text.includes('si no') || text.includes('binaria')) return 'binary_yes_no';
  if (text.includes('frecuencia')) return 'frequency';
  if (text.includes('acuerdo') || text.includes('agreement')) return 'agreement';
  if (text.includes('no aplica')) return 'not_applicable';
  if (text.includes('visual por estrellas') || text.includes('estrellas')) return 'visual_stars';
  if (text.includes('visual por emociones') || text.includes('emociones')) return 'visual_emotions';
  if (text.includes('escala lineal') || text.includes('lineal')) return 'linear_scale';
  if (text.includes('custom') || text.includes('personalizada')) return 'custom';
  return undefined;
}

/**
 * Parses scale detail anchors from text.
 */
function extractScaleDetailAnchors(text: string): string[] | undefined {
  if (text.includes('nom 035') || text.includes('nom035') || text.includes('siempre nunca')) {
    return ['Siempre', 'Casi siempre', 'Algunas veces', 'Casi nunca', 'Nunca'];
  }
  if (text.includes('frecuencia') || text.includes('nunca siempre')) {
    return ['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'];
  }
  if (text.includes('satisfecho')) {
    return ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'];
  }
  if (text.includes('acuerdo')) {
    return ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'];
  }
  if (text.includes('probabilidad')) {
    return ['Nada probable', 'Poco probable', 'Neutral', 'Probable', 'Muy probable'];
  }
  return undefined;
}

/**
 * Pure function that maps user text into a typed editing intent.
 */
export function mapQuestionReviewUserTextToEditingIntent(
  userText: string,
  canConfirmSection: boolean = false
): QuestionReviewEditingIntent {
  const sanitized = normalizeText(userText);
  const rawUserTextSanitized = sanitized;

  // 1. Strict number check for alias mapping
  const numberMatch = sanitized.match(/^(\d+)$/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10);
    if (num === 1) {
      return {
        intent: 'view_by_dimension',
        rawUserTextSanitized,
        confidence: 'high',
      };
    } else if (num === 2) {
      return {
        intent: 'view_needs_review',
        rawUserTextSanitized,
        confidence: 'high',
      };
    } else if (num === 3) {
      return {
        intent: 'view_all_questions_in_blocks',
        rawUserTextSanitized,
        confidence: 'high',
      };
    } else if (num === 4 && canConfirmSection) {
      return {
        intent: 'confirm_section',
        rawUserTextSanitized,
        confidence: 'high',
      };
    } else {
      const maxRange = canConfirmSection ? 4 : 3;
      return {
        intent: 'invalid_input',
        rawUserTextSanitized,
        confidence: 'low',
        clarificationPrompt: `El número ${num} está fuera de rango. Por favor selecciona una opción válida del 1 al ${maxRange}.`,
      };
    }
  }

  // Block viewing and pagination intents
  if (sanitized === 'ver todas las preguntas en bloques' || sanitized === 'ver preguntas en bloques' || sanitized === 'preguntas en bloques') {
    return {
      intent: 'view_all_questions_in_blocks',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }
  if (sanitized === 'ver siguiente bloque' || sanitized === 'siguiente bloque' || sanitized === 'siguiente') {
    return {
      intent: 'view_next_block',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }
  if (sanitized === 'ver bloque anterior' || sanitized === 'bloque anterior' || sanitized === 'ver anterior bloque' || sanitized === 'anterior') {
    return {
      intent: 'view_prev_block',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }

  // View intents
  if (sanitized === 'ver resumen') {
    return {
      intent: 'view_overview',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }
  if (sanitized === 'ver preguntas por dimension') {
    return {
      intent: 'view_by_dimension',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }
  if (sanitized === 'ver preguntas que requieren revision' || sanitized === 'ver preguntas por revisar') {
    return {
      intent: 'view_needs_review',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }
  if (sanitized === 'ver preguntas') {
    return {
      intent: 'view_overview', // default fallback or maybe view_overview
      rawUserTextSanitized,
      confidence: 'medium',
    };
  }

  // Question specific view
  const viewQuestionMatch = sanitized.match(/ver (?:detalle de la |la )?pregunta (\d+)/);
  if (viewQuestionMatch) {
    return {
      intent: 'view_question_detail',
      targetQuestionDisplayIndex: parseInt(viewQuestionMatch[1], 10),
      rawUserTextSanitized,
      confidence: 'high',
    };
  }

  // Change dimension
  const changeDimMatch = sanitized.match(/(?:cambia la dimension de la|asigna la) pregunta (\d+)/);
  const changeDimMatch2 = sanitized.match(/la pregunta (\d+) pertenece a (.+)/);
  if (changeDimMatch || changeDimMatch2) {
    const idx = changeDimMatch ? parseInt(changeDimMatch[1], 10) : parseInt(changeDimMatch2![1], 10);
    return {
      intent: 'invalid_input',
      targetQuestionDisplayIndex: idx,
      rawUserTextSanitized,
      confidence: 'high',
      clarificationPrompt: 'Las dimensiones están bloqueadas en este paso. Puedes ajustar tipo de pregunta, tipo de escala o detalle de escala.',
    };
  }

  // Free-text parser blocks for UBITS taxonomy
  const qNumMatch = sanitized.match(/(?:pregunta|preguta|p|#)\s*(\d+)/i);
  const targetIdx = qNumMatch ? parseInt(qNumMatch[1], 10) : undefined;

  if (sanitized.includes('valoracion') || sanitized.includes('acuerdo') || sanitized.includes('satisfecho') || sanitized.includes('probabilidad') || (sanitized.includes('frecuencia') && !sanitized.includes('escala'))) {
    const anchors = extractScaleDetailAnchors(sanitized);
    if (anchors && targetIdx) {
      return {
        intent: 'change_scale_detail',
        targetQuestionDisplayIndex: targetIdx,
        targetScaleDetailAnchors: anchors,
        rawUserTextSanitized,
        confidence: 'high',
      };
    }
  }

  if (sanitized.includes('abierta') || sanitized.includes('texto') || sanitized.includes('unica') || sanitized.includes('multiple') || sanitized.includes('desplegable') || sanitized.includes('valoracion') || sanitized.includes('rating') || sanitized.includes('respuestas')) {
    const qType = extractQuestionType(sanitized);
    if (qType && targetIdx) {
      return {
        intent: 'change_question_type',
        targetQuestionDisplayIndex: targetIdx,
        targetQuestionType: qType,
        rawUserTextSanitized,
        confidence: 'high',
      };
    }
  }

  if (sanitized.includes('likert') || sanitized.includes('nps') || sanitized.includes('estrellas') || sanitized.includes('emociones') || sanitized.includes('lineal') || sanitized.includes('nom 035') || sanitized.includes('nom035')) {
    const sType = extractScaleType(sanitized);
    if (sType && targetIdx) {
      return {
        intent: 'change_scale_type',
        targetQuestionDisplayIndex: targetIdx,
        targetScaleType: sType,
        rawUserTextSanitized,
        confidence: 'high',
      };
    }
  }

  // Change question type "la pregunta X es [tipo]"
  const changeTypeMatch = sanitized.match(/la pregunta (\d+) es (.+)/);
  if (changeTypeMatch && !sanitized.includes('pertenece a')) {
    // If it mentions scale or dimension it might be something else
    if (!sanitized.includes('dimension') && (!sanitized.includes('escala') || sanitized.includes('escala de valoracion'))) {
      const qType = extractQuestionType(sanitized);
      if (qType) {
        return {
          intent: 'change_question_type',
          targetQuestionDisplayIndex: parseInt(changeTypeMatch[1], 10),
          targetQuestionType: qType,
          rawUserTextSanitized,
          confidence: 'high',
        };
      }
    }
  }

  // Change scale type
  const changeScaleMatch = sanitized.match(/(?:ajusta|cambia) la escala de la pregunta (\d+)/);
  if (changeScaleMatch) {
    const sType = extractScaleType(sanitized);
    if (sType) {
      return {
        intent: 'change_scale_type',
        targetQuestionDisplayIndex: parseInt(changeScaleMatch[1], 10),
        targetScaleType: sType,
        rawUserTextSanitized,
        confidence: 'high',
      };
    } else {
        return {
            intent: 'ambiguous_input',
            rawUserTextSanitized,
            confidence: 'low',
            clarificationPrompt: 'No se pudo identificar el tipo de escala. Por favor especifica una escala valida (ej: likert 5, nps, frecuencia).'
        };
    }
  }

  // Another form for scale: "la pregunta 9 usa NPS 0 a 10"
  const changeScaleMatch2 = sanitized.match(/la pregunta (\d+) usa (.+)/);
  if (changeScaleMatch2) {
    const sType = extractScaleType(sanitized);
    if (sType) {
      return {
        intent: 'change_scale_type',
        targetQuestionDisplayIndex: parseInt(changeScaleMatch2[1], 10),
        targetScaleType: sType,
        rawUserTextSanitized,
        confidence: 'high',
      };
    }
  }

  // Confirm section
  if (sanitized === 'confirma esta seccion' || sanitized === 'confirmar esta seccion') {
    return {
      intent: 'confirm_section',
      rawUserTextSanitized,
      confidence: 'high',
    };
  }

  // Confirm question
  const confirmMatch = sanitized.match(/(?:confirma|confirmar) (?:la )?pregunta (\d+)/);
  if (confirmMatch) {
    return {
      intent: 'confirm_question',
      targetQuestionDisplayIndex: parseInt(confirmMatch[1], 10),
      rawUserTextSanitized,
      confidence: 'high',
    };
  }

  // Ambiguous input check
  if (sanitized.includes('cambia la escala') || sanitized.includes('corrige la pregunta') || sanitized.includes('eso esta mal')) {
    return {
      intent: 'ambiguous_input',
      rawUserTextSanitized,
      confidence: 'low',
      clarificationPrompt: 'Por favor especifica el numero de la pregunta que deseas modificar.',
    };
  }

  // Invalid
  return {
    intent: 'invalid_input',
    rawUserTextSanitized,
    confidence: 'low',
    clarificationPrompt: 'No entendi el comando. Puedes intentar decir "ver resumen" o "ver pregunta X".',
  };
}

/**
 * Robustly parses the question selection from user text.
 */
export function parseQuestionSelection(
  text: string,
  totalQuestions: number
): {
  valid: boolean;
  questionNumber?: number;
  errorMsg?: string;
} {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Regex patterns to capture the question number
  const patterns = [
    /(?:pregunta|preguta|p|#)\s*(\d+)/i, // e.g. pregunta 28, preguta 28, p28, #28
    /\b(\d+)\b/                           // e.g. 28 as a standalone word
  ];

  let num: number | null = null;
  for (const regex of patterns) {
    const match = normalized.match(regex);
    if (match) {
      num = parseInt(match[1], 10);
      break;
    }
  }

  // Fallback: search for any sequence of digits in the text
  if (num === null) {
    const fallbackMatch = normalized.match(/\d+/);
    if (fallbackMatch) {
      num = parseInt(fallbackMatch[0], 10);
    }
  }

  if (num === null) {
    return {
      valid: false,
      errorMsg: 'No pude identificar la pregunta. Responde con el número de pregunta que quieres modificar, por ejemplo: 28.',
    };
  }

  if (num < 1 || num > totalQuestions) {
    return {
      valid: false,
      errorMsg: `No encontré la pregunta ${num}. Responde con un número entre 1 y ${totalQuestions}.`,
    };
  }

  return {
    valid: true,
    questionNumber: num,
  };
}
