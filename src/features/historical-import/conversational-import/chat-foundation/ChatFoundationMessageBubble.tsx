import React from 'react';
import { cn } from '@/lib/utils';
import { UbitsIcon } from '@/icons/UbitsIcon';
import { AILoader } from '@/components/ai-interaction/AILoader';
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

  // Base layout classes matching ChatTimeline: gap-3 and role-based direction
  const layoutClasses = cn(
    'flex gap-3 w-full',
    isUser ? 'flex-row-reverse' : 'flex-row',
    className
  );

  // Bubble style classes matching ChatTimeline
  const bubbleClasses = cn(
    'text-sm leading-relaxed min-w-0',
    // User style: rounded-2xl px-4 py-2.5 bg-muted text-foreground
    isUser && 'rounded-2xl px-4 py-2.5 bg-muted text-foreground max-w-2xl',
    // Assistant style:
    isAssistant && !isThinking && (kind === 'plain_text' || kind === 'handoff') && 'text-foreground/90 pl-1 mt-1 w-full max-w-2xl',
    isAssistant && !isThinking && (kind === 'warning' || tone === 'warning') && 'w-full bg-muted border border-border rounded-xl p-3 text-foreground max-w-2xl',
    isAssistant && !isThinking && (kind === 'error' || tone === 'error' || tone === 'safety') && 'w-full bg-muted border border-border rounded-xl p-3 text-foreground max-w-2xl',
    isAssistant && !isThinking && (kind === 'confirmation' || tone === 'success') && 'w-full bg-muted border border-border rounded-xl p-3 text-foreground max-w-2xl',
    isAssistant && !isThinking && kind === 'structured' && 'text-foreground/90 pl-1 mt-1 w-full max-w-2xl',
    isAssistant && !isThinking && kind === 'safe_details' && 'w-full max-w-2xl',
    // System style
    isSystem && 'bg-transparent text-muted-foreground italic max-w-full text-center border-none p-2 mx-auto'
  );

  return (
    <div className={layoutClasses}>
      {/* Avatar column */}
      {showAvatar && !isSystem && (
        <div className="flex-shrink-0 mt-0.5">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full shadow-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-ai-gradient text-primary-foreground"
          )}>
            {isUser ? (
              <UbitsIcon name="users" size="sm" tone="inverse" />
            ) : (
              <UbitsIcon name="sparkles" size="sm" tone="inverse" />
            )}
          </div>
        </div>
      )}

      {/* Message content */}
      <div className={cn("flex flex-col gap-1 flex-1 min-w-0", isUser ? "items-end" : "items-start")}>
        <div className={bubbleClasses}>
          {isThinking ? (
            <div className="w-full">
              <AILoader variant="inline" label={content || "Pensando..."} className="my-2 ml-1" />
            </div>
          ) : (
            <>
              {/* Header for warning/error/handoff inside Card-styled assistant messages */}
              {isAssistant && (kind === 'warning' || tone === 'warning') && (
                <div className="flex items-center gap-2 mb-2 font-semibold text-warning">
                  <UbitsIcon name="warning" size="sm" tone="warning" />
                  <span>Advertencia</span>
                </div>
              )}
              {isAssistant && (kind === 'error' || tone === 'error') && (
                <div className="flex items-center gap-2 mb-2 font-semibold text-destructive">
                  <UbitsIcon name="error" size="sm" tone="negative" />
                  <span>Error</span>
                </div>
              )}
              {isAssistant && tone === 'safety' && (
                <div className="flex items-center gap-2 mb-2 font-semibold text-muted-foreground">
                  <UbitsIcon name="warning" size="sm" tone="muted" />
                  <span>Seguridad</span>
                </div>
              )}
              {isAssistant && kind === 'handoff' && (
                <div className="flex items-center gap-2 mb-2 font-semibold text-primary">
                  <UbitsIcon name="arrowRight" size="sm" tone="primary" />
                  <span>Siguiente Paso</span>
                </div>
              )}
              {isAssistant && (kind === 'confirmation' || tone === 'success') && (
                <div className="flex items-center gap-2 mb-2 font-semibold text-success">
                  <UbitsIcon name="success" size="sm" tone="positive" />
                  <span>Confirmación</span>
                </div>
              )}

              {kind === 'safe_details' && isAssistant ? (
                <div className="bg-muted border border-border p-3 rounded-xl text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words w-full">
                  {children || content}
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {children || content}
                </div>
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        {metadata?.showTimestamp !== false && (
          <span className="text-xs text-muted-foreground mt-1 pl-1">
            {message.id.includes('demo') ? '12:00' : '12:00'}
          </span>
        )}
      </div>
    </div>
  );
}
