import { ChatTimeline } from "./ChatTimeline";
import { MessageComposer } from "./MessageComposer";
import { DetectedStructurePanel } from "./DetectedStructurePanel";
import { ApprovalProgressTracker } from "./ApprovalProgressTracker";
import { ValidationActionPanel } from "./ValidationActionPanel";
import { mockMessages } from "./conversationalImportMock";
import { Badge } from "@/components/ui/badge";

export function ConversationalImportWorkspace() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none border-b px-6 py-4 bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Asistente de importación de encuestas</h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Sandbox sintético
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Carga archivos, revisa la estructura detectada y aprueba los datos antes de generar el comparativo.
        </p>
      </header>

      {/* Progress Tracker */}
      <ApprovalProgressTracker />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Chat Area */}
        <div className="flex flex-col flex-1 min-w-0 border-r">
          <ChatTimeline messages={mockMessages} />
          <ValidationActionPanel />
          <MessageComposer />
        </div>

        {/* Right Column: Structure Panel */}
        <div className="w-[400px] flex-none bg-muted/10 hidden lg:block">
          <DetectedStructurePanel />
        </div>
      </div>
    </div>
  );
}
