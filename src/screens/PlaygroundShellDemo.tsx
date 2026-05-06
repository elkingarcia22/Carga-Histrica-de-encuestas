import * as React from "react";
import { 
  PlaygroundSidebar,
  UbitsSubNav
} from "@/components/navigation";
import { UbitsIcon } from "@/icons";
import { UbitsLogo } from "@/components/ui/UbitsLogo";
import { getPlaygroundNavigation } from "@/config/playgroundNavigation";
import type { PlaygroundRole } from "@/config/playgroundNavigation";
import type { SubNavVariantKey } from "@/config/subNavNavigation";

/**
 * FINAL SHELL ARCHITECTURE: Integrated Sub-Nav
 * Syncing Sidebar selection with Top Sub-Nav variants.
 */
export const PlaygroundShellDemo: React.FC = () => {
  const [role] = React.useState<PlaygroundRole>("admin");
  const [activeSidebarId, setActiveSidebarId] = React.useState("inicio");
  const [activeTabId, setActiveTabId] = React.useState("home");
  const [isDark, setIsDark] = React.useState(false);

  // Global Theme Sync
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Get navigation items from centralized config
  const activeItems = getPlaygroundNavigation(role);

  // Mapping Sidebar Selection -> SubNav Variant
  const getSubNavVariant = (id: string): SubNavVariantKey => {
    switch (id) {
      case "aprendizaje": return "aprendizaje";
      case "desempeño": return "desempeno";
      case "encuestas": return "encuestas";
      case "tareas": return "tareas";
      case "reclutamiento": return "reclutamiento";
      case "empresa": return "empresa";
      case "diagnóstico": return "diagnostico";
      case "documentación": return "documentacion";
      default: return "template";
    }
  };

  const subNavVariant = getSubNavVariant(activeSidebarId);

  return (
    <div className="flex w-full min-h-screen bg-background font-sans transition-all duration-700 overflow-hidden">
      {/* 96px Rail Sidebar */}
      <PlaygroundSidebar 
        role={role === "creator" || role === "recruitment" ? "shared" : role}
        activeItemId={activeSidebarId}
        onItemSelect={(id: string) => {
          setActiveSidebarId(id);
          // Reset tab to first one on section change
          setActiveTabId(""); 
        }}
        items={activeItems}
        header={<UbitsLogo size={28} />}
        footer={
          <div className="flex flex-col items-center gap-4">
             {role === "admin" && (
               <>
                 <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <UbitsIcon name="code" size="sm" tone="inverse" />
                 </button>
                 <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <UbitsIcon name="help" size="sm" tone="inverse" />
                 </button>
               </>
             )}
             <button 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
             >
                <UbitsIcon name={isDark ? "sun" : "moon"} size="sm" tone="inverse" />
             </button>
             <div className="relative pt-2 group cursor-pointer">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 shadow-xl transition-transform group-hover:scale-110">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="User" />
                </div>
             </div>
          </div>
        }
      />

      {/* Main Content Area with 143px Margin */}
      <main className="flex-1 ml-[143px] flex flex-col px-8 pb-8 overflow-y-auto">
         {/* Sub-Nav Integration */}
         <div className="w-full max-w-7xl mx-auto mb-10 pt-4">
            <UbitsSubNav 
              variant={subNavVariant}
              activeTabId={activeTabId}
              onTabChange={(id) => setActiveTabId(id)}
              className="mb-12"
            />

            {/* Placeholder for Content Area */}
            <div className="min-h-[70vh] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl opacity-20 select-none">
              <UbitsLogo size={80} color={isDark ? "#1E293B" : "#cbd5e1"} />
              <div className="mt-4 text-center">
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/60">
                    Content Area • {activeSidebarId.toUpperCase()}
                 </p>
                 <p className="text-[10px] font-bold text-muted-foreground mt-1">
                    ACTIVE TAB: {activeTabId || "DEFAULT"}
                 </p>
              </div>
            </div>
         </div>
      </main>
    </div>
  );
};
