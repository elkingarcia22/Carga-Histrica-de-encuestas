import type {
  ChatFoundationThinkingPolicy,
  ChatFoundationMessage,
  ChatFoundationRole,
} from './chatFoundationTypes';

export const DEFAULT_CHAT_FOUNDATION_THINKING_POLICY: ChatFoundationThinkingPolicy = {
  enabled: true,
  showBeforeAssistantReply: true,
  minimumVisibleMs: 350,
  appliesToStates: [],
};

export interface ChatFoundationThinkingMessageInput {
  id: string;
  content?: string;
  policy?: Partial<ChatFoundationThinkingPolicy>;
}

export function createChatFoundationThinkingMessage(
  input: ChatFoundationThinkingMessageInput
): ChatFoundationMessage {
  return {
    id: input.id,
    role: 'assistant',
    kind: 'thinking',
    status: 'thinking',
    tone: 'info',
    content: input.content ?? 'Pensando...',
    metadata: {
      showAvatar: true,
      showAssistantIcon: true,
    },
  };
}

export function shouldShowThinkingBeforeAssistantReply(
  policy: ChatFoundationThinkingPolicy,
  stateId: string,
  nextRole: ChatFoundationRole
): boolean {
  if (!policy.enabled) return false;
  if (!policy.showBeforeAssistantReply) return false;
  if (nextRole !== 'assistant') return false;

  if (policy.appliesToStates.length === 0) return true;

  return policy.appliesToStates.includes(stateId);
}

export function normalizeChatFoundationThinkingPolicy(
  partialPolicy?: Partial<ChatFoundationThinkingPolicy>
): ChatFoundationThinkingPolicy {
  if (!partialPolicy) {
    return { ...DEFAULT_CHAT_FOUNDATION_THINKING_POLICY };
  }

  return {
    enabled: partialPolicy.enabled ?? DEFAULT_CHAT_FOUNDATION_THINKING_POLICY.enabled,
    showBeforeAssistantReply:
      partialPolicy.showBeforeAssistantReply ??
      DEFAULT_CHAT_FOUNDATION_THINKING_POLICY.showBeforeAssistantReply,
    minimumVisibleMs:
      partialPolicy.minimumVisibleMs ?? DEFAULT_CHAT_FOUNDATION_THINKING_POLICY.minimumVisibleMs,
    appliesToStates:
      partialPolicy.appliesToStates ?? [...DEFAULT_CHAT_FOUNDATION_THINKING_POLICY.appliesToStates],
  };
}
