import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

export function MessageComposer() {
  return (
    <div className="flex items-center gap-2 p-4 border-t bg-background">
      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" disabled>
        <Paperclip size={20} />
      </Button>
      <Input 
        placeholder="Escribe un mensaje al asistente..." 
        className="flex-1"
        disabled
      />
      <Button size="icon" className="shrink-0" disabled>
        <Send size={18} />
      </Button>
    </div>
  );
}
