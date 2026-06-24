export type ConversationalIntent =
  | "skip_current_section"
  | "approve_structure"
  | "show_review_menu"
  | "open_draft_preview"
  | "strict_confirmation_approve"
  | "strict_confirmation_cancel"
  | "ambiguous_confirmation"
  | "cancel_adjustment"
  | "cancel_import"
  | "unknown";

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, " "); // Collapse multiple spaces
}

const INTENT_DICTIONARY: Record<ConversationalIntent, string[]> = {
  skip_current_section: [
    "ninguna", "ninguno", "no", "no quiero modificar", "no quiero cambiar nada",
    "dejar igual", "dejalo igual", "todo bien", "asi esta bien", "sin cambios",
    "no hay cambios", "no modificar", "pasar", "saltar", "omitir", "continuar", "seguir"
  ],
  approve_structure: [
    "aprobar estructura", "confirmar estructura", "aprobar todo", "confirmar todo",
    "todo aprobado", "aprobar como esta", "confirmar como esta", "sin cambios aprobar",
    "no modificar y aprobar"
  ],
  show_review_menu: [
    "menu", "volver", "volver al menu", "que puedo hacer", "ayuda", "opciones"
  ],
  open_draft_preview: [
    "preview", "ver preview", "ver preview del borrador", "borrador",
    "previsualizar borrador", "vista previa del borrador"
  ],
  strict_confirmation_approve: [
    "aprobar"
  ],
  strict_confirmation_cancel: [
    "cancelar"
  ],
  ambiguous_confirmation: [
    "si", "ok", "dale", "correcto", "confirmo", "listo", "bueno", "va", "perfecto"
  ],
  cancel_adjustment: [
    "cancelar", "cancelar ajuste", "cancelar cambio"
  ],
  cancel_import: [
    "cancelar importacion", "cancelar carga", "cancelar proceso", "empezar de nuevo", "reiniciar"
  ],
  unknown: []
};

export function detectIntent(input: string): ConversationalIntent {
  const normalized = normalizeText(input);

  for (const [intent, phrases] of Object.entries(INTENT_DICTIONARY)) {
    if (phrases.includes(normalized)) {
      return intent as ConversationalIntent;
    }
  }

  return "unknown";
}
