
interface ImportWizardShellProps {
  header: React.ReactNode;
  steps: React.ReactNode;
  mainContent: React.ReactNode;
  summary: React.ReactNode;
  footer: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onMouseEnterSidebar?: () => void;
}

export function ImportWizardShell({
  header,
  steps,
  mainContent,
  summary,
  footer,
  isCollapsed = false,
  onToggleCollapse,
  onMouseEnterSidebar,
}: ImportWizardShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 font-sans flex flex-col overflow-hidden">
      
      {/* Main Area: Sidebar + Scroll Content */}
      <div className="flex-1 min-h-0 flex flex-row gap-0">
        
        {/* Stepper / Left Sidebar */}
        <aside 
          className={`shrink-0 h-full bg-transparent pt-8 flex flex-col transition-all duration-300 hidden md:flex ${isCollapsed ? 'w-16' : 'w-64'}`}
          onMouseEnter={onMouseEnterSidebar}
        >
          {steps}
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          
          {/* Header */}
          <div className="px-8 pt-8">
            {header}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="flex flex-col gap-8">
              
              {/* Main Content */}
              <main className="min-w-0">
                {mainContent}
              </main>

              {/* Summary / Right Rail */}
              {summary && (
                <aside className="w-full">
                  {summary}
                </aside>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Footer spanning 100% width */}
      <div className="px-6 py-4 border-t bg-background shrink-0 flex items-center justify-between">
        {footer}
      </div>

    </div>
  );
}
