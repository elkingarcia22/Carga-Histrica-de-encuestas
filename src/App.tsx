import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UbitsToaster } from "@/components/feedback";
import { 
  Chip, 
  AIButton, 
  AILoader, 
  SaveIndicator 
} from "@/components/ai-interaction";
import { UbitsLogo } from "@/components/ui/UbitsLogo";

/**
 * PHASE 8.7B · TECHNICAL DEMO
 * Showcasing the Lightweight Status & AI Controls suite.
 */
function AIInteractionDemo() {
  const [selectedChips, setSelectedChips] = React.useState<string[]>(["filtro-1"]);
  const [isSaving, setIsSaving] = React.useState(false);

  const toggleChip = (id: string) => {
    setSelectedChips(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAction = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <header className="mb-12 flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <UbitsLogo size={32} />
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Starter Kit UBITS</h1>
            <p className="text-xs font-black text-ai-gradient uppercase tracking-widest">Phase 8.7B · AI Premium Identity</p>
          </div>
        </div>
        <SaveIndicator 
          status={isSaving ? "saving" : "saved"} 
          timestamp="hace 2 min" 
        />
      </header>

      <div className="mx-auto max-w-5xl space-y-16 pb-20">
        {/* Chips Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold border-l-4 border-ai-gradient pl-4">1. Chips & AI Tags</h2>
          <div className="flex flex-wrap gap-3">
            <Chip 
              label="Sugerencia IA" 
              tone="ai"
              icon="sparkles"
              onClick={() => toggleChip("ai-1")}
              selected={selectedChips.includes("ai-1")}
            />
            <Chip 
              label="Filtro Inteligente" 
              tone="ai"
              removable
              onRemove={() => console.log("removed")}
            />
            <Chip 
              label="Filtro Activo" 
              selected={selectedChips.includes("filtro-1")}
              onClick={() => toggleChip("filtro-1")}
              tone="primary"
            />
            <Chip 
              label="Con Contador" 
              count={12}
              tone="warning"
              selected={selectedChips.includes("filtro-3")}
              onClick={() => toggleChip("filtro-3")}
            />
            <Chip 
              label="Pequeño" 
              size="sm"
              tone="positive"
            />
          </div>
        </section>

        {/* AI Button Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold border-l-4 border-ai-gradient pl-4">2. AI Action Buttons (Unified variations)</h2>
          <div className="flex flex-col gap-8 p-8 rounded-2xl bg-slate-950/50 border border-ai-gradient/20">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Primary (Solid)</span>
                <AIButton 
                  label="Generar con IA" 
                  variant="primary" 
                  onClick={handleAction}
                  loading={isSaving}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Secondary (Outline)</span>
                <AIButton label="Sugerir más" variant="secondary" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Subtle (Ghost)</span>
                <AIButton label="Borrador" variant="subtle" />
              </div>
            </div>
            
            <div className="flex flex-wrap items-end gap-6 pt-6 border-t border-white/5">
              <AIButton 
                label="Analizar PDF" 
                variant="secondary"
                leftIcon="file"
              />
            </div>
          </div>
        </section>

        {/* AI Loaders Section */}
        <section className="space-y-8">
          <h2 className="text-lg font-bold border-l-4 border-ai-gradient pl-4">3. AI Feedback (Spark Identity)</h2>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-8">
              <div className="p-4 border rounded-xl bg-card/30">
                 <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">Inline AI Status</p>
                 <AILoader variant="inline" status="analyzing" />
              </div>
              <AILoader variant="block" status="thinking" />
            </div>
            <AILoader 
              variant="card" 
              status="generating" 
              progress={78}
              description="Sincronizando modelos generativos..."
            />
          </div>
        </section>

        {/* Persistence Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold border-l-4 border-primary pl-4">4. Persistence Indicators</h2>
          <div className="flex flex-wrap items-center gap-10 p-6 border rounded-2xl bg-card/20">
            <SaveIndicator status="idle" />
            <SaveIndicator status="saving" />
            <SaveIndicator status="saved" timestamp="ahora mismo" />
            <SaveIndicator status="error" label="Fallo de conexión" />
            <SaveIndicator status="offline" compact />
          </div>
        </section>
      </div>
      
      <footer className="mt-20 pt-8 border-t text-center text-muted-foreground">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">UBITS Design System • Phase 8.7B Certified</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <UbitsToaster />
      <AIInteractionDemo />
    </TooltipProvider>
  );
}

export default App;
