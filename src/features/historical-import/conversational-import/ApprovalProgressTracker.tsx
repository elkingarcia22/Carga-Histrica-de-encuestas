import { mockApprovalBlocks } from "./conversationalImportMock";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export function ApprovalProgressTracker() {
  return (
    <div className="flex gap-4 items-center p-4 border-b bg-muted/30 overflow-x-auto whitespace-nowrap">
      {mockApprovalBlocks.map((block, index) => (
        <div key={block.id} className="flex items-center gap-2">
          {block.status === "approved" ? (
            <CheckCircle2 size={18} className="text-primary" />
          ) : block.warningCount > 0 ? (
            <AlertCircle size={18} className="text-yellow-600" />
          ) : (
            <Circle size={18} className="text-muted-foreground" />
          )}
          <span className={`text-sm font-medium ${
            block.status === "approved" ? "text-foreground" : "text-muted-foreground"
          }`}>
            {block.name}
          </span>
          {index < mockApprovalBlocks.length - 1 && (
            <div className="w-4 h-[1px] bg-border ml-2" />
          )}
        </div>
      ))}
    </div>
  );
}
