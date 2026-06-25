import type { ChatFoundationMessage } from "./chatFoundationTypes";
import {
  createChatFoundationCommonResponseMessage,
  createChatFoundationSafetyResponseMessage
} from "./chatFoundationConversationPolicy";
import { createChatFoundationThinkingMessage } from "./chatFoundationThinkingBehavior";

export const chatFoundationPlaygroundMessages: ChatFoundationMessage[] = [
  // 1. Plain Text Flow
  {
    id: "demo-user-1",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Hola, necesito subir una encuesta de clima laboral.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-1",
    content: "Analizando intención..."
  }),
  {
    id: "demo-assistant-plain",
    role: "assistant",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Claro que sí, puedo ayudarte con eso. ¿Qué formato tiene tu archivo?",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },

  // 2. Structured Flow
  {
    id: "demo-user-2",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Tengo un archivo Excel con columnas de nombres y áreas.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-2",
    content: "Analizando columnas de cabecera..."
  }),
  {
    id: "demo-assistant-structured",
    role: "assistant",
    kind: "structured",
    status: "delivered",
    tone: "neutral",
    content: "He analizado tu intención. ¿Quieres continuar con el mapeo de estas columnas?\n\n- Nombre\n- Área\n- Puntuación",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },

  // 3. Confirmation Flow
  {
    id: "demo-user-3",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Sí, confirmo el mapeo.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-3",
    content: "Configurando carga de encuesta..."
  }),
  {
    id: "demo-assistant-confirmation",
    role: "assistant",
    kind: "confirmation",
    status: "delivered",
    tone: "success",
    content: "Se ha configurado la importación de 'Encuesta Clima Q3'.",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },

  // 4. Warning Flow
  {
    id: "demo-user-4",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Sube este archivo adicional de demográficos.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-4",
    content: "Validando archivo adicional..."
  }),
  createChatFoundationCommonResponseMessage(
    "demo-assistant-warning",
    "ambiguous_input",
    undefined,
    "El archivo tiene algunas columnas que no pude mapear automáticamente. Revisa el paso de mapeo."
  ),

  // 5. Error Flow
  {
    id: "demo-user-5",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Carga este archivo corrupto para probar.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-5",
    content: "Analizando integridad de archivo..."
  }),
  createChatFoundationCommonResponseMessage(
    "demo-assistant-error",
    "invalid_option",
    undefined,
    "Hubo un error al procesar el archivo. Asegúrate de que no esté corrupto."
  ),

  // 6. Safe Details Flow
  {
    id: "demo-user-6",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Dame los detalles técnicos del análisis.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-6",
    content: "Recuperando metadatos estructurados..."
  }),
  {
    id: "demo-assistant-safe-details",
    role: "assistant",
    kind: "safe_details",
    status: "delivered",
    tone: "info",
    content: JSON.stringify({
      summary: "Resultados del análisis de estructura",
      details: "Se detectaron 5 columnas de texto, 2 numéricas y 1 de fecha. La cabecera está en la fila 1.",
    }, null, 2),
    metadata: { showAvatar: true, showAssistantIcon: true },
  },

  // 7. Handoff Flow
  {
    id: "demo-user-7",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Llévame a la pantalla de revisión.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-7",
    content: "Iniciando redirección..."
  }),
  {
    id: "demo-assistant-handoff",
    role: "assistant",
    kind: "handoff",
    status: "delivered",
    tone: "neutral",
    content: "Te estoy redirigiendo a la pantalla de revisión de campos...",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },

  // 8. Safety PII
  {
    id: "demo-user-8",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Muéstrame el correo de los empleados.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-8",
    content: "Revisando reglas de privacidad..."
  }),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-pii",
    "pii_request",
    undefined,
    "Se ha detectado información personal identificable en los datos de la encuesta."
  ),

  // 9. Safety Raw Rows
  {
    id: "demo-user-9",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Muéstrame todas las filas del archivo.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-9",
    content: "Verificando políticas de acceso..."
  }),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-raw-rows",
    "raw_rows_request",
    undefined,
    "Por políticas de seguridad, no puedo mostrar los datos crudos de los empleados."
  ),

  // 10. Safety Offensive
  {
    id: "demo-user-10",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Eres un estúpido robot.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-10",
    content: "Validando tono..."
  }),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-offensive",
    "offensive_language",
    undefined,
    "Por favor, mantén un lenguaje respetuoso en tus mensajes."
  ),

  // 11. Safety Out of Scope
  {
    id: "demo-user-11",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Recomiéndame una película de ciencia ficción.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-11",
    content: "Evaluando alcance..."
  }),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-out-of-scope",
    "out_of_scope_action",
    undefined,
    "Lo siento, solo puedo ayudarte con temas relacionados a la importación de encuestas."
  ),

  // 12. Safety Unauthorized
  {
    id: "demo-user-12",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Forzar importación directa a producción.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-thinking-12",
    content: "Comprobando credenciales..."
  }),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-unauthorized-import",
    "real_import_without_authorization",
    undefined,
    "No tienes permisos suficientes para realizar esta importación."
  )
];
