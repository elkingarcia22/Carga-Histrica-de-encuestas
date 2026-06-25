import type {
  ChatFoundationMessage,
  ChatFoundationCommonResponseKind,
  ChatFoundationSafetyCategory,
  ChatFoundationMessageTone,
  ChatFoundationAction,
  ChatFoundationMessageKind,
} from './chatFoundationTypes';

export interface ChatFoundationCommonResponseEntry {
  kind: ChatFoundationCommonResponseKind;
  tone: ChatFoundationMessageTone;
  message: string;
  suggestedActions?: ChatFoundationAction[];
  blocksFlow: boolean;
}

export interface ChatFoundationSafetyResponseEntry {
  category: ChatFoundationSafetyCategory;
  tone: ChatFoundationMessageTone;
  message: string;
  blocksFlow: boolean;
}

export const DEFAULT_CHAT_FOUNDATION_CONVERSATION_POLICY: Record<ChatFoundationCommonResponseKind, ChatFoundationCommonResponseEntry> = {
  ambiguous_input: {
    kind: 'ambiguous_input',
    tone: 'warning',
    message: 'No he entendido bien la instrucción. ¿Podrías reformularla?',
    blocksFlow: true,
  },
  invalid_option: {
    kind: 'invalid_option',
    tone: 'error',
    message: 'La opción seleccionada no es válida. Por favor elige una de las opciones disponibles.',
    blocksFlow: true,
  },
  confirmation_required: {
    kind: 'confirmation_required',
    tone: 'warning',
    message: 'Se requiere confirmación para continuar con esta acción.',
    blocksFlow: true,
  },
  cancelled: {
    kind: 'cancelled',
    tone: 'info',
    message: 'Operación cancelada. ¿En qué más puedo ayudarte?',
    blocksFlow: false,
  },
  restarted: {
    kind: 'restarted',
    tone: 'info',
    message: 'El flujo ha sido reiniciado. Comencemos de nuevo.',
    blocksFlow: false,
  },
  help: {
    kind: 'help',
    tone: 'info',
    message: 'Puedo ayudarte a preparar la carga histórica de encuestas, revisar inconsistencias y configurar las equivalencias. ¿Qué necesitas hacer?',
    blocksFlow: false,
  },
  safe_details_unavailable: {
    kind: 'safe_details_unavailable',
    tone: 'warning',
    message: 'No hay más detalles seguros disponibles para mostrar en este momento.',
    blocksFlow: false,
  },
  safety_block: {
    kind: 'safety_block',
    tone: 'error',
    message: 'Por razones de seguridad, no puedo completar esa acción.',
    blocksFlow: true,
  },
  out_of_scope: {
    kind: 'out_of_scope',
    tone: 'warning',
    message: 'Esa acción está fuera del alcance de mis capacidades actuales.',
    blocksFlow: true,
  },
};

export const DEFAULT_CHAT_FOUNDATION_SAFETY_POLICY: Record<ChatFoundationSafetyCategory, ChatFoundationSafetyResponseEntry> = {
  pii_request: {
    category: 'pii_request',
    tone: 'safety',
    message: 'No puedo mostrar datos personales, respuestas individuales, correos, nombres, IDs o filas crudas. Puedo mostrarte solo resultados agregados y seguros.',
    blocksFlow: true,
  },
  raw_rows_request: {
    category: 'raw_rows_request',
    tone: 'safety',
    message: 'No puedo mostrar filas crudas ni volcados completos del archivo. Puedo resumir la estructura detectada y los resultados agregados.',
    blocksFlow: true,
  },
  open_text_request: {
    category: 'open_text_request',
    tone: 'safety',
    message: 'No puedo exponer comentarios abiertos o respuestas textuales individuales. Puedo agrupar temas de forma segura si el flujo lo autoriza.',
    blocksFlow: true,
  },
  offensive_language: {
    category: 'offensive_language',
    tone: 'safety',
    message: 'No puedo ayudar a clasificar, etiquetar o procesar personas con lenguaje ofensivo, racista o discriminatorio. Reformula la instrucción usando criterios laborales o de segmentación permitidos.',
    blocksFlow: true,
  },
  racist_or_discriminatory_language: {
    category: 'racist_or_discriminatory_language',
    tone: 'safety',
    message: 'No puedo ayudar a clasificar, etiquetar o procesar personas con lenguaje ofensivo, racista o discriminatorio. Reformula la instrucción usando criterios laborales o de segmentación permitidos.',
    blocksFlow: true,
  },
  out_of_scope_action: {
    category: 'out_of_scope_action',
    tone: 'safety',
    message: 'Esa acción está fuera del alcance de mis capacidades actuales.',
    blocksFlow: true,
  },
  real_import_without_authorization: {
    category: 'real_import_without_authorization',
    tone: 'safety',
    message: 'La importación real todavía no está autorizada. Puedo continuar con una simulación sandbox o preparar el borrador del flujo.',
    blocksFlow: true,
  },
  api_connection_without_authorization: {
    category: 'api_connection_without_authorization',
    tone: 'safety',
    message: 'No estoy autorizado para realizar conexiones API externas directamente.',
    blocksFlow: true,
  },
  unknown: {
    category: 'unknown',
    tone: 'safety',
    message: 'Acción no permitida por políticas de seguridad.',
    blocksFlow: true,
  },
};

export function getChatFoundationCommonResponse(
  kind: string,
  policy: Record<ChatFoundationCommonResponseKind, ChatFoundationCommonResponseEntry> = DEFAULT_CHAT_FOUNDATION_CONVERSATION_POLICY
): ChatFoundationCommonResponseEntry {
  const entry = policy[kind as ChatFoundationCommonResponseKind];
  if (entry !== undefined) {
    return {
      kind: entry.kind,
      tone: entry.tone,
      message: entry.message,
      suggestedActions: entry.suggestedActions ? [...entry.suggestedActions] : undefined,
      blocksFlow: entry.blocksFlow,
    };
  }
  const fallback = policy['out_of_scope'];
  return {
    kind: fallback.kind,
    tone: fallback.tone,
    message: fallback.message,
    suggestedActions: fallback.suggestedActions ? [...fallback.suggestedActions] : undefined,
    blocksFlow: fallback.blocksFlow,
  };
}

export function getChatFoundationSafetyResponse(
  category: string,
  policy: Record<ChatFoundationSafetyCategory, ChatFoundationSafetyResponseEntry> = DEFAULT_CHAT_FOUNDATION_SAFETY_POLICY
): ChatFoundationSafetyResponseEntry {
  const entry = policy[category as ChatFoundationSafetyCategory];
  if (entry !== undefined) {
    return {
      category: entry.category,
      tone: entry.tone,
      message: entry.message,
      blocksFlow: entry.blocksFlow,
    };
  }
  const fallback = policy['unknown'];
  return {
    category: fallback.category,
    tone: fallback.tone,
    message: fallback.message,
    blocksFlow: fallback.blocksFlow,
  };
}

export function createChatFoundationCommonResponseMessage(
  id: string,
  kind: ChatFoundationCommonResponseKind,
  policy?: Record<ChatFoundationCommonResponseKind, ChatFoundationCommonResponseEntry>,
  overrideMessage?: string
): ChatFoundationMessage {
  const responseEntry = getChatFoundationCommonResponse(kind, policy);

  let messageKind: ChatFoundationMessageKind = 'plain_text';
  if (responseEntry.tone === 'warning') messageKind = 'warning';
  if (responseEntry.tone === 'error') messageKind = 'error';
  if (kind === 'confirmation_required') messageKind = 'confirmation';
  if (kind === 'safe_details_unavailable') messageKind = 'safe_details';

  return {
    id,
    role: 'assistant',
    kind: messageKind,
    status: 'delivered',
    tone: responseEntry.tone,
    content: overrideMessage !== undefined ? overrideMessage : responseEntry.message,
    metadata: {
      showAvatar: true,
      showAssistantIcon: true,
    },
  };
}

export function createChatFoundationSafetyResponseMessage(
  id: string,
  category: ChatFoundationSafetyCategory,
  policy?: Record<ChatFoundationSafetyCategory, ChatFoundationSafetyResponseEntry>,
  overrideMessage?: string
): ChatFoundationMessage {
  const responseEntry = getChatFoundationSafetyResponse(category, policy);

  return {
    id,
    role: 'assistant',
    kind: 'warning',
    status: responseEntry.blocksFlow ? 'blocked' : 'delivered',
    tone: 'safety',
    content: overrideMessage !== undefined ? overrideMessage : responseEntry.message,
    metadata: {
      showAvatar: true,
      showAssistantIcon: true,
    },
  };
}
