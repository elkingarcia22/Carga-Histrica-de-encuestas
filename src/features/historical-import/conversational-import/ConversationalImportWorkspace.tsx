import { useState } from "react";
import { ChatTimeline } from "./ChatTimeline";
import { MessageComposer } from "./MessageComposer";
import { DetectedStructurePanel } from "./DetectedStructurePanel";
import { ApprovalProgressTracker } from "./ApprovalProgressTracker";
import { ValidationActionPanel } from "./ValidationActionPanel";
import { mockMessages } from "./conversationalImportMock";
import { Badge } from "@/components/ui/badge";
import { InlineReviewPanel } from "./InlineReviewPanel";
import { MessageSquare, ListChecks } from "lucide-react";

export function ConversationalImportWorkspace() {
  const [activeTab, setActiveTab] = useState<"chat" | "review">("review");

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none border-b px-6 py-4 bg-card flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Asistente de importación de encuestas</h1>
            <Badge variant="secondary">
              Sandbox sintético
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Carga archivos, revisa la estructura detectada y aprueba los datos antes de generar el comparativo.
          </p>
        </div>
      </header>

      {/* Progress Tracker */}
      <ApprovalProgressTracker />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Chat Area & Review */}
        <div className="flex flex-col flex-1 min-w-0 border-r">
          <div className="flex-1 flex flex-col h-full min-h-0">
            <div className="px-4 py-2 border-b bg-muted/5 flex gap-2">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "chat" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Asistente
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "review" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListChecks className="h-4 w-4" />
                Revisión de Estructura
              </button>
            </div>

            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col min-h-0 m-0">
                <ChatTimeline messages={mockMessages} />
                <ValidationActionPanel />
                <MessageComposer />
              </div>
            )}

            {activeTab === "review" && (
              <div className="flex-1 min-h-0 m-0 overflow-hidden flex flex-col">
                <InlineReviewPanel />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structure Panel */}
        <div className="w-96 flex-none bg-muted/10 hidden lg:block">
          <DetectedStructurePanel />
        </div>
      </div>
    </div>
  );
}
