
interface ImportWizardShellProps {
  header: React.ReactNode;
  steps: React.ReactNode;
  mainContent: React.ReactNode;
  summary?: React.ReactNode;
  footer: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onMouseEnterSidebar?: () => void;
}

export function ImportWizardShell({
  header,
  steps,
  mainContent,
  footer,
  onMouseEnterSidebar,
}: ImportWizardShellProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-background font-sans overflow-hidden">
      {/* Header Area */}
      <div className="px-6 md:px-10 pt-8 shrink-0">
        {header}
      </div>

      {/* Workspace Area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row p-6 md:p-10 gap-8 md:gap-12 overflow-hidden">
        
        {/* Stepper / Left Rail */}
        <aside
          className="w-full md:w-56 shrink-0 overflow-y-auto"
          onMouseEnter={onMouseEnterSidebar}
        >
          {steps}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-4 pr-2">
          {mainContent}
        </main>

        {/* Summary / Right Rail */}
        {/* NO_RIGHT_RAIL_IN_HISTORICAL_IMPORT_FLOW */}
        {/* Intentionally omitting the right rail as per architecture decision */}

      </div>

      {/* Footer Area */}
      <div className="px-6 md:px-10 py-4 border-t bg-background shrink-0 mt-auto w-full z-20">
        {footer}
      </div>

    </div>
  );
}
