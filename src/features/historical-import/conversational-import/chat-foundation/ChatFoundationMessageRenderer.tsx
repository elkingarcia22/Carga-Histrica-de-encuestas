
import type { ChatFoundationMessage } from './chatFoundationTypes';
import { ChatFoundationMessageBubble } from './ChatFoundationMessageBubble';

export interface ChatFoundationMessageRendererProps {
  message: ChatFoundationMessage;
  className?: string;
}

export function ChatFoundationMessageRenderer({
  message,
  className,
}: ChatFoundationMessageRendererProps) {
  // If we had a markdown parser, we would conditionally use it based on message.metadata.allowSafeMarkdown
  // Since we don't, we just pass the text to the bubble which will render it with whitespace-pre-wrap

  return (
    <ChatFoundationMessageBubble message={message} className={className} />
  );
}
