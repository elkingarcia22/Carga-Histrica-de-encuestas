export type ConversationalIntent =
  | "skip_current_section"
  | "approve_structure_and_review_results"
  | "start_structure_name_adjustment"
  | "show_selected_scope_files"
  | "show_review_menu"
  | "open_draft_preview"
  | "strict_confirmation_approve"
  | "strict_confirmation_cancel"
  | "ambiguous_confirmation"
  | "cancel_adjustment"
  | "cancel_import"
  | "select_scope_1"
  | "select_scope_2"
  | "select_scope_3"
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
    "ninguno", "no", "no quiero cambiar nada", "dejalo igual", "asi esta bien",
    "no hay cambios", "no modificar", "pasar", "saltar", "omitir", "continuar", "seguir"
  ],
  approve_structure_and_review_results: [
    "1", "aprobar", "aprobar estructura", "confirmar estructura", "todo bien", "sin cambios",
    "ninguna", "no quiero modificar", "dejar igual", "aprobar todo", "confirmar todo",
    "todo aprobado", "aprobar como esta", "confirmar como esta", "sin cambios aprobar",
    "no modificar y aprobar"
  ],
  start_structure_name_adjustment: [
    "2", "ajustar", "editar", "cambiar nombres", "ajustar nombres", "dimensiones", "preguntas", "ajustar etiquetas"
  ],
  show_selected_scope_files: [
    "3", "archivos", "ver archivos", "archivos usados"
  ],
  show_review_menu: [
    "menu", "volver", "volver al menu", "que puedo hacer", "ayuda", "opciones"
  ],
  open_draft_preview: [
    "preview", "ver preview", "ver preview del borrador", "borrador",
    "previsualizar borrador", "vista previa del borrador", "7"
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
    "4", "cancelar importacion", "cancelar carga", "cancelar proceso", "empezar de nuevo", "reiniciar", "9"
  ],
  select_scope_1: [
    "1", "01", "opcion 1", "uno", "primera", "primer opcion", "primera opcion", "2025", "clima 2025", "qs clima 2025"
  ],
  select_scope_2: [
    "2", "02", "opcion 2", "dos", "segunda", "segunda opcion", "2024", "clima 2024", "qs clima 2024"
  ],
  select_scope_3: [
    "3", "03", "opcion 3", "tres", "tercera", "todo", "ambas", "ambos", "multiciclo", "procesar todo", "todo junto", "carga historica"
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
