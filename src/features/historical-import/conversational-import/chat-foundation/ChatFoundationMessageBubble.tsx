import React from 'react';
import { cn } from '@/lib/utils';
import { UbitsIcon } from '@/icons/UbitsIcon';
import type { ChatFoundationMessage } from './chatFoundationTypes';

export interface ChatFoundationMessageBubbleProps {
  message: ChatFoundationMessage;
  children?: React.ReactNode;
  className?: string;
}

export function ChatFoundationMessageBubble({
  message,
  children,
  className,
}: ChatFoundationMessageBubbleProps) {
  const { role, kind, status, tone, content, metadata } = message;

  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const isSystem = role === 'system';

  const showAvatar = metadata?.showAvatar ?? isAssistant;
  const isThinking = kind === 'thinking' || status === 'thinking';

  // Base layout classes
  const layoutClasses = cn(
    'flex w-full gap-4 max-w-4xl mx-auto',
    isUser ? 'flex-row-reverse' : 'flex-row',
    className
  );

  // Bubble style classes
  const bubbleClasses = cn(
    'relative px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%]',
    // User style
    isUser && 'bg-primary text-primary-foreground rounded-br-none',
    // Assistant style
    isAssistant && 'bg-muted/50 text-foreground rounded-bl-none border border-border/50',
    // System style
    isSystem && 'bg-transparent text-muted-foreground italic max-w-full text-center border-none p-2 mx-auto',
    // Tone overrides for assistant
    isAssistant && tone === 'warning' && 'bg-warning/10 border-warning/20 text-warning-foreground',
    isAssistant && tone === 'error' && 'bg-destructive/10 border-destructive/20 text-destructive',
    isAssistant && tone === 'success' && 'bg-success/10 border-success/20 text-success-foreground',
    isAssistant && tone === 'safety' && 'bg-muted border-muted-foreground/20 text-muted-foreground font-medium'
  );

  return (
    <div className={layoutClasses}>
      {/* Avatar column */}
      {showAvatar && !isSystem && (
        <div className="flex-shrink-0 mt-auto mb-1">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full shadow-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary border border-primary/20"
          )}>
            {isUser ? (
              <UbitsIcon name="users" size="sm" />
            ) : (
              <UbitsIcon name="sparkles" size="sm" />
            )}
          </div>
        </div>
      )}

      {/* Message content */}
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start", "min-w-0")}>
        <div className={bubbleClasses}>
          {/* Header for warning/error/handoff */}
          {isAssistant && kind === 'warning' && (
            <div className="flex items-center gap-2 mb-2 font-semibold text-warning-foreground">
              <UbitsIcon name="warning" size="sm" tone="warning" />
              <span>Advertencia</span>
            </div>
          )}
          {isAssistant && kind === 'error' && (
            <div className="flex items-center gap-2 mb-2 font-semibold text-destructive">
              <UbitsIcon name="error" size="sm" tone="negative" />
              <span>Error</span>
            </div>
          )}
          {isAssistant && kind === 'handoff' && (
            <div className="flex items-center gap-2 mb-2 font-semibold text-primary">
              <UbitsIcon name="arrowRight" size="sm" tone="primary" />
              <span>Siguiente Paso</span>
            </div>
          )}
          {isAssistant && kind === 'confirmation' && (
            <div className="flex items-center gap-2 mb-2 font-semibold text-success-foreground">
              <UbitsIcon name="success" size="sm" tone="positive" />
              <span>Confirmación</span>
            </div>
          )}

          {isThinking ? (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <UbitsIcon name="sparkles" size="sm" tone="muted" />
              <span>Pensando...</span>
            </div>
          ) : kind === 'safe_details' && isAssistant ? (
            <div className="bg-background/50 p-3 rounded-md border border-border text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
              {children || content}
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {children || content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
