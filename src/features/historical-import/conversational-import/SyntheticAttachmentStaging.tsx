import { FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SyntheticAttachmentStaging() {
  return (
    <div className="flex flex-col gap-2">
      <Card className="flex items-center gap-3 p-3 bg-muted border-border">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">encuesta-clima-2024-sintetica.xlsx</span>
          <span className="text-xs text-muted-foreground">1.2 MB • Sandbox sintético</span>
        </div>
      </Card>
      <Card className="flex items-center gap-3 p-3 bg-muted border-border">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">encuesta-clima-2025-sintetica.xlsx</span>
          <span className="text-xs text-muted-foreground">1.4 MB • Sandbox sintético</span>
        </div>
      </Card>
    </div>
  );
}
