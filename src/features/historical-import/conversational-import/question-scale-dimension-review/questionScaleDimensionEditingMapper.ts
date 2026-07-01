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
  if (text.includes('nps')) return 'nps';
  if (text.includes('enps')) return 'enps';
  if (text.includes('abierta') || text.includes('texto')) return 'open_text';
  if (text.includes('escala de valoracion') || text.includes('valoracion')) return 'rating_scale';
  if (text.includes('opcion multiple') || text.includes('multiple')) return 'multiple_choice';
  if (text.includes('opcion unica') || text.includes('unica')) return 'single_choice';
  if (text.includes('matriz')) return 'matrix';
  return undefined;
}

/**
 * Parses a target ScaleType from text.
 */
function extractScaleType(text: string): ScaleType | undefined {
  if (text.includes('likert 5')) return 'likert_5';
  if (text.includes('likert 7')) return 'likert_7';
  if (text.includes('nps 0 a 10') || text.includes('nps 0-10')) return 'nps_0_10';
  if (text.includes('si no') || text.includes('binaria')) return 'binary_yes_no';
  if (text.includes('frecuencia')) return 'frequency';
  if (text.includes('acuerdo') || text.includes('agreement')) return 'agreement';
  if (text.includes('no aplica')) return 'not_applicable';
  if (text.includes('custom') || text.includes('personalizada')) return 'custom';
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
