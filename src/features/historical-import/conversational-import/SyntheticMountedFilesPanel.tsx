import { FileSpreadsheet, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SyntheticMountedSurveyFile, SyntheticMountNextAction } from "./conversationalImportTypes";

interface SyntheticMountedFilesPanelProps {
  files: SyntheticMountedSurveyFile[];
  boundaryNote?: string;
  nextActions?: SyntheticMountNextAction[];
  onReviewStructure?: () => void;
}

export function SyntheticMountedFilesPanel({ files, boundaryNote, nextActions, onReviewStructure }: SyntheticMountedFilesPanelProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {boundaryNote && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-border/50">
          <AlertTriangle className="w-4 h-4 shrink-0 text-muted-foreground" />
          <p>{boundaryNote}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map((file) => (
          <Card key={file.id} className="bg-card border-border shadow-sm">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="p-2 bg-muted rounded-md shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate" title={file.displayName}>
                  {file.displayName}
                </span>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-medium bg-muted px-1.5 py-0.5 rounded-sm">{file.periodLabel}</span>
                  <span className="capitalize">{file.surveyType}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-medium text-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {file.status === "staged" ? "Listo para revisión" : file.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Nota: Sintético
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nextActions && nextActions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {nextActions.map((action) => (
            <Button
              key={action.id}
              variant={action.actionType === "review_structure" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                if (action.actionType === "review_structure" && onReviewStructure) {
                  onReviewStructure();
                }
              }}
            >
              {action.label}
              {action.actionType === "review_structure" && <ArrowRight className="w-3 h-3 ml-2" />}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
