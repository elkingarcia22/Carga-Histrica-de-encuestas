
import { TooltipProvider } from "@/components/ui/tooltip";
import { UbitsToaster } from "@/components/feedback";
import { ConversationalImportWorkspace } from "@/features/historical-import/conversational-import";
import { ChatFoundationVisualPlayground } from "@/features/historical-import/conversational-import/chat-foundation";

// Playground Toggle - read from env variable or dedicated mode
const SHOW_CHAT_FOUNDATION_PLAYGROUND =
  import.meta.env.VITE_CHAT_FOUNDATION_PLAYGROUND === "true" ||
  import.meta.env.MODE === "chat-foundation";

function App() {
  if (SHOW_CHAT_FOUNDATION_PLAYGROUND) {
    return <ChatFoundationVisualPlayground />;
  }

  return (
    <TooltipProvider>
      <UbitsToaster />
      <ConversationalImportWorkspace />
    </TooltipProvider>
  );
}

export default App;
