import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function MessageComposer() {
  return (
    <div className="relative border border-border bg-card rounded-2xl p-4 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm w-full">
      <textarea
        placeholder="Cuéntame qué encuesta quieres comparar o monta archivos sintéticos"
        className="w-full min-h-[144px] bg-transparent outline-none resize-none text-sm placeholder:text-muted-foreground/75 pr-12 text-foreground"
        disabled
      />
      <div className="absolute bottom-3 right-3">
        <Button
          size="icon"
          className="h-8 w-8 rounded-full bg-muted text-muted-foreground/75 cursor-not-allowed border-0 hover:bg-muted"
          disabled
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
