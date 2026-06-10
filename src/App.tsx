
import { TooltipProvider } from "@/components/ui/tooltip";
import { UbitsToaster } from "@/components/feedback";
import { SurveyImportUploadScreen } from "@/screens/survey-import/SurveyImportUploadScreen";

function App() {
  return (
    <TooltipProvider>
      <UbitsToaster />
      <SurveyImportUploadScreen />
    </TooltipProvider>
  );
}

export default App;
