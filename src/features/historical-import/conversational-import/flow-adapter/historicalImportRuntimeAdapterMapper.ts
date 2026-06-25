import type { ChatMessage } from "../conversationalImportTypes";
import type {
  ChatFoundationMessage,
  ChatFoundationMessageKind,
  ChatFoundationMessageTone,
  ChatFoundationMessageStatus
} from "../chat-foundation/chatFoundationTypes";

/**
 * Pure function to map a workspace ChatMessage to ChatFoundationMessage.
 * This is deterministic, pure, and has no side effects (no Dates, no Math.random, no localStorage).
 * It preserves the exact content while mapping it to the formal Chat Foundation UI types.
 */
export function mapRuntimeMessageToChatFoundation(
  msg: ChatMessage
): ChatFoundationMessage {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isUser) {
    return {
      id: msg.id,
      role: "user",
      kind: "plain_text",
      status: "delivered",
      tone: "neutral",
      content: msg.content,
      metadata: {
        showAvatar: false,
        showTimestamp: true
      }
    };
  }

  if (isSystem) {
    return {
      id: msg.id,
      role: "system",
      kind: "plain_text",
      status: "delivered",
      tone: "neutral",
      content: msg.content
    };
  }

  let kind: ChatFoundationMessageKind;
  let tone: ChatFoundationMessageTone;
  let status: ChatFoundationMessageStatus = "delivered";



  // Assistant mapping based on message type
  switch (msg.type) {
    case "analysis_progress":
      kind = "thinking";
      status = "thinking";
      tone = "neutral";
      break;

    case "warning":
    case "decision_request":
    case "parser_structural_summary":
    case "approval_request":
    case "correction":
      kind = "warning";
      tone = "warning";
      break;

    case "sandbox_files_selected":
      kind = "confirmation";
      tone = "success";
      break;

    case "contract_summary":
      kind = "handoff";
      tone = "success";
      break;

    case "guided_review_step":
    case "demographics_guided_review":
    case "analysis_summary_blocks":
      kind = "structured";
      tone = "neutral";
      break;

    default:
      kind = "plain_text";
      tone = "neutral";
  }

  // Heuristic: if content contains (Detalles) or details marker, render as safe_details
  if (msg.content && msg.content.includes("(Detalles)")) {
    kind = "safe_details";
    tone = "info";
  }

  return {
    id: msg.id,
    role: "assistant",
    kind,
    status,
    tone,
    content: msg.content,
    metadata: {
      showAvatar: true,
      showAssistantIcon: false, // Ensure avatar is gradient only without inner icon
      showTimestamp: true
    }
  };
}
