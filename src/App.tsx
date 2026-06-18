
import { TooltipProvider } from "@/components/ui/tooltip";
import { UbitsToaster } from "@/components/feedback";
import { ComparisonResultsDashboard } from "@/features/historical-import/dashboard/ComparisonResultsDashboard";

function App() {
  return (
    <TooltipProvider>
      <UbitsToaster />
      <ComparisonResultsDashboard />
    </TooltipProvider>
  );
}

export default App;
