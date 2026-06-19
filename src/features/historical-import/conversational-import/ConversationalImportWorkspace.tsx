import { useState } from "react";
import { MessageComposer } from "./MessageComposer";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { ChatTimeline } from "./ChatTimeline";
import { ApprovalProgressTracker } from "./ApprovalProgressTracker";
import { InlineReviewPanel } from "./InlineReviewPanel";
import { DetectedStructurePanel } from "./DetectedStructurePanel";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "./conversationalImportTypes";
import {
  initialMessages,
  simulatedMountMessages,
  simulatedCompareMessages,
  simulatedFormatMessages,
  quickActionItems
} from "./conversationalImportMock";

export function ConversationalImportWorkspace() {
  const [chatStarted, setChatStarted] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "review">("chat");
  const [activeSessionId, setActiveSessionId] = useState("sess_1");

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const handleNewChat = () => {
    setChatStarted(false);
    setViewMode("chat");
    setMessages(initialMessages);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    if (id === "sess_1") {
      handleMountSynthetic();
    } else {
      setMessages([
        {
          id: `msg_session_${id}`,
          role: "assistant",
          type: "text",
          content: "Abriendo historial de chat... Este sandbox simula un registro histórico.",
          timestamp: new Date().toISOString(),
        }
      ]);
      setChatStarted(true);
      setViewMode("chat");
    }
  };

  const handleMountSynthetic = () => {
    setMessages(simulatedMountMessages());
    setChatStarted(true);
    setViewMode("chat");
  };

  const handleCompareClimate = () => {
    setMessages(simulatedCompareMessages());
    setChatStarted(true);
    setViewMode("chat");
  };

  const handleReviewStructure = () => {
    setChatStarted(true);
    setViewMode("review");
  };

  const handleExpectedFormat = () => {
    setMessages(simulatedFormatMessages());
    setChatStarted(true);
    setViewMode("chat");
  };

  return (
    <div className="flex h-screen w-screen bg-muted/30 p-6 gap-6 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <ChatHistorySidebar
        onNewChat={handleNewChat}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
      />

      {/* Main Workspace Card */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-full">
        {/* Header Superior Discreto */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-card">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground">Importación de encuestas</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Sandbox sintético
            </span>
          </div>
          {chatStarted && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === "chat" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setViewMode("chat")}
              >
                Chat
              </Button>
              <Button
                variant={viewMode === "review" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setViewMode("review")}
              >
                Revisar estructura
              </Button>
            </div>
          )}
        </div>

        {/* Outer Workspace Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {!chatStarted ? (
            /* Estado Inicial Centrado */
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
              <h2 className="text-3xl font-bold tracking-tight text-center mb-2 text-foreground">
                Hola, ¿qué encuesta quieres <span className="text-ai-gradient font-bold">comparar</span>?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Monta archivos sintéticos para revisar su estructura antes de generar el comparativo.
              </p>

              {/* Composer Grande */}
              <div className="w-full mb-8">
                <MessageComposer />
              </div>

              {/* Quick Actions pills/botones sobrios en fila */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {quickActionItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    onClick={() => {
                      if (item.id === "montar") handleMountSynthetic();
                      else if (item.id === "comparar") handleCompareClimate();
                      else if (item.id === "revisar") handleReviewStructure();
                      else if (item.id === "formato") handleExpectedFormat();
                    }}
                    className="px-4 py-2 h-auto text-sm font-medium border border-border rounded-xl bg-card hover:bg-muted transition-colors text-foreground shadow-sm"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            /* Estado Activo */
            viewMode === "chat" ? (
              <div className="flex-1 flex flex-col min-h-0">
                <ChatTimeline messages={messages} />
                <MessageComposer />
              </div>
            ) : (
              /* Vista secundaria de revisión inline y detected structure panel */
              <div className="flex-1 flex min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <ApprovalProgressTracker />
                  <InlineReviewPanel />
                </div>
                <div className="w-80 flex-none bg-muted/10 border-l border-border hidden lg:block overflow-y-auto">
                  <DetectedStructurePanel />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
