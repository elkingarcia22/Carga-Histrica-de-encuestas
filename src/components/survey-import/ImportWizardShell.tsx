
interface ImportWizardShellProps {
  header: React.ReactNode;
  steps: React.ReactNode;
  mainContent: React.ReactNode;
  summary: React.ReactNode;
  footer: React.ReactNode;
}

export function ImportWizardShell({
  header,
  steps,
  mainContent,
  summary,
  footer,
}: ImportWizardShellProps) {
  return (
    <div className="min-h-screen bg-muted/10 font-sans p-6 md:p-8">
      <div className="mx-auto max-w-6xl flex flex-col min-h-[calc(100vh-4rem)] bg-background border rounded-xl shadow-sm overflow-hidden">
        
        {/* Header Area */}
        <div className="px-6 md:px-10 pt-8">
          {header}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row p-6 md:p-10 gap-8 md:gap-12">
          
          {/* Stepper / Left Rail */}
          <aside className="w-full md:w-56 shrink-0">
            {steps}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {mainContent}
          </main>

          {/* Summary / Right Rail */}
          <aside className="w-full md:w-72 shrink-0">
            {summary}
          </aside>

        </div>

        {/* Footer Area */}
        <div className="px-6 md:px-10 pb-6 mt-auto">
          {footer}
        </div>

      </div>
    </div>
  );
}
