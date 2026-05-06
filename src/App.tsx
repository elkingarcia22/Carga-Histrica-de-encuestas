import { TooltipProvider } from "@/components/ui/tooltip"
import { UbitsToaster } from "@/components/feedback"
import { PlaygroundShellDemo } from "@/screens/PlaygroundShellDemo"

/**
 * ROOT APPLICATION COMPONENT
 * Focused exclusively on the high-fidelity Playground Shell architecture.
 * This is the sole entry point for the project's development.
 */
function App() {
  return (
    <TooltipProvider>
      <UbitsToaster />
      <PlaygroundShellDemo />
    </TooltipProvider>
  )
}

export default App
