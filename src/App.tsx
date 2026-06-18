
import { TooltipProvider } from "@/components/ui/tooltip";
import { UbitsToaster } from "@/components/feedback";
import { ConversationalImportWorkspace } from "@/features/historical-import/conversational-import";

function App() {
  return (
    <TooltipProvider>
      <UbitsToaster />
      <ConversationalImportWorkspace />
    </TooltipProvider>
  );
}

export default App;
