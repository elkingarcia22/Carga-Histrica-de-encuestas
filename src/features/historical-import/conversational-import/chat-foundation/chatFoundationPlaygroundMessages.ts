import type { ChatFoundationMessage } from "./chatFoundationTypes";
import {
  createChatFoundationCommonResponseMessage,
  createChatFoundationSafetyResponseMessage
} from "./chatFoundationConversationPolicy";
import { createChatFoundationThinkingMessage } from "./chatFoundationThinkingBehavior";

export const chatFoundationPlaygroundMessages: ChatFoundationMessage[] = [
  {
    id: "demo-user-plain",
    role: "user",
    kind: "plain_text",
    status: "delivered",
    tone: "neutral",
    content: "Hola, necesito subir una encuesta de clima laboral.",
  },
  createChatFoundationThinkingMessage({
    id: "demo-assistant-thinking",
    content: "Analizando intención y formato de encuesta..."
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
  {
    id: "demo-assistant-structured",
    role: "assistant",
    kind: "structured",
    status: "delivered",
    tone: "neutral",
    content: "He analizado tu intención. ¿Quieres continuar con el mapeo de estas columnas?\n\n- Nombre\n- Área\n- Puntuación",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },
  {
    id: "demo-assistant-confirmation",
    role: "assistant",
    kind: "confirmation",
    status: "delivered",
    tone: "success",
    content: "Se ha configurado la importación de 'Encuesta Clima Q3'.",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },
  createChatFoundationCommonResponseMessage(
    "demo-assistant-warning",
    "ambiguous_input",
    undefined,
    "El archivo tiene algunas columnas que no pude mapear automáticamente. Revisa el paso de mapeo."
  ),
  createChatFoundationCommonResponseMessage(
    "demo-assistant-error",
    "invalid_option",
    undefined,
    "Hubo un error al procesar el archivo. Asegúrate de que no esté corrupto."
  ),
  {
    id: "demo-assistant-safe-details",
    role: "assistant",
    kind: "safe_details",
    status: "delivered",
    tone: "info",
    content: JSON.stringify({
      summary: "Resultados del análisis de estructura",
      details: "Se detectaron 5 columnas de texto, 2 numéricas y 1 de fecha. La cabecera está en la fila 1.",
    }),
    metadata: { showAvatar: true, showAssistantIcon: true },
  },
  {
    id: "demo-assistant-handoff",
    role: "assistant",
    kind: "handoff",
    status: "delivered",
    tone: "neutral",
    content: "Te estoy redirigiendo a la pantalla de revisión de campos...",
    metadata: { showAvatar: true, showAssistantIcon: true },
  },
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-pii",
    "pii_request",
    undefined,
    "Se ha detectado información personal identificable en los datos de la encuesta."
  ),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-raw-rows",
    "raw_rows_request",
    undefined,
    "Por políticas de seguridad, no puedo mostrar los datos crudos de los empleados."
  ),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-offensive",
    "offensive_language",
    undefined,
    "Por favor, mantén un lenguaje respetuoso en tus mensajes."
  ),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-out-of-scope",
    "out_of_scope_action",
    undefined,
    "Lo siento, solo puedo ayudarte con temas relacionados a la importación de encuestas."
  ),
  createChatFoundationSafetyResponseMessage(
    "demo-assistant-unauthorized-import",
    "real_import_without_authorization",
    undefined,
    "No tienes permisos suficientes para realizar esta importación."
  )
];
