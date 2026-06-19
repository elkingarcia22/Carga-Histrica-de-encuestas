import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockChatSessions } from "./conversationalImportMock";

interface ChatHistorySidebarProps {
  onNewChat?: () => void;
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
}

export function ChatHistorySidebar({
  onNewChat,
  activeSessionId = "sess_1",
  onSelectSession,
}: ChatHistorySidebarProps) {
  return (
    <div className="w-72 bg-card border border-border rounded-2xl shadow-sm h-full flex flex-col font-sans overflow-hidden shrink-0">
      {/* Title Centered */}
      <div className="py-4 border-b text-center">
        <span className="text-sm font-semibold text-foreground">Mis chats</span>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {mockChatSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession?.(session.id)}
              className={`w-full flex flex-col items-start px-3 py-2.5 text-sm rounded-xl transition-colors ${
                isActive
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 w-full">
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate text-left flex-1">{session.title}</span>
              </div>
              <span className="text-[11px] text-muted-foreground/80 ml-6 mt-0.5">{session.date}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Button with Gradient */}
      <div className="p-4 border-t">
        <Button
          onClick={onNewChat}
          className="w-full justify-center gap-2 rounded-full bg-ai-gradient text-primary-foreground font-bold shadow-ai-premium hover:opacity-95 transition-all h-10 border-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo chat
        </Button>
      </div>
    </div>
  );
}
