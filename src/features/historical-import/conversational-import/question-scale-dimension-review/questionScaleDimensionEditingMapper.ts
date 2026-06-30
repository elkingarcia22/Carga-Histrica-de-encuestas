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
 * Parses a target dimension from text.
 * Simple heuristic: 'a [dimension]' or 'es [dimension]' or 'pertenece a [dimension]'
 * We will just try to capture everything after ' a ' or ' es '.
 */
function extractDimension(text: string): string | undefined {
  const match = text.match(/(?:a|es|pertenece a)\s+([a-z\s]+)$/i);
  if (match && match[1]) {
    const dim = match[1].trim();
    if (dim !== 'la' && dim !== 'pregunta' && dim !== 'escala' && dim !== 'dimension') {
      return match[1].trim();
    }
  }
  return undefined;
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
  userText: string
): QuestionReviewEditingIntent {
  const sanitized = normalizeText(userText);
  const rawUserTextSanitized = sanitized;

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
  if (changeDimMatch) {
    const targetDimensionName = extractDimension(sanitized) || 'Unknown Dimension'; // Basic fallback if hard to parse, but let's try a better capture
    let dimName = targetDimensionName;
    const toMatch = sanitized.match(/ a (.+)$/);
    if (toMatch && toMatch[1]) {
      dimName = toMatch[1].trim();
    } else {
        const toMatch2 = sanitized.match(/pertenece a (.+)$/);
        if (toMatch2 && toMatch2[1]) dimName = toMatch2[1].trim();
    }

    // Capitalize dimension correctly if we can, or just keep raw
    // since we don't have mock data here
    
    // Quick title case function to pass test
    const titleCaseDimName = dimName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    
    return {
      intent: 'change_question_dimension',
      targetQuestionDisplayIndex: parseInt(changeDimMatch[1], 10),
      targetDimensionName: titleCaseDimName,
      rawUserTextSanitized,
      confidence: 'high',
    };
  }

  // Also support "la pregunta X pertenece a Y"
  const changeDimMatch2 = sanitized.match(/la pregunta (\d+) pertenece a (.+)/);
  if (changeDimMatch2) {
      const dimName = changeDimMatch2[2].trim();
      const titleCaseDimName = dimName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      return {
          intent: 'change_question_dimension',
          targetQuestionDisplayIndex: parseInt(changeDimMatch2[1], 10),
          targetDimensionName: titleCaseDimName,
          rawUserTextSanitized,
          confidence: 'high'
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
