import type { ChatMessage } from "./conversationalImportTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Loader2, FileText, Users, Database, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SyntheticAttachmentStaging } from "./SyntheticAttachmentStaging";
import { ApprovedContractSummary } from "./ApprovedContractSummary";
import { SyntheticMountedFilesPanel } from "./SyntheticMountedFilesPanel";

interface ChatTimelineProps {
  onAction?: (actionType: string) => void;
  messages: ChatMessage[];
}

export function ChatTimeline({ messages, onAction }: ChatTimelineProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`flex flex-col gap-2 max-w-2xl ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}>
              {msg.type === "text" && (
                <div className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  {msg.content}
                </div>
              )}

              {msg.type === "file_staging" && (
                <div className="w-full">
                  <div className="rounded-lg px-3 py-2 text-sm bg-muted mb-2">
                    {msg.content}
                  </div>
                  <SyntheticAttachmentStaging />
                </div>
              )}

              {msg.type === "structure_summary" && (
                <Card className="w-full">
                  <CardContent className="p-3 text-sm text-muted-foreground">
                    {msg.content}
                  </CardContent>
                </Card>
              )}

              {msg.type === "warning" && (
                <Card className="w-full bg-muted border-border">
                  <CardContent className="p-3 text-sm text-foreground">
                    {msg.content}
                  </CardContent>
                </Card>
              )}

              {msg.type === "approval_request" && (
                <Card className="w-full bg-muted border-border">
                  <CardContent className="p-3 text-sm text-foreground">
                    {msg.content}
                  </CardContent>
                </Card>
              )}


              {msg.type === "synthetic_file_mount_summary" && (
                <div className="w-full">
                  <div className="rounded-lg px-3 py-2 text-sm bg-muted mb-3">
                    {msg.content}
                  </div>
                  <SyntheticMountedFilesPanel
                    files={msg.files || []}
                    boundaryNote={msg.boundaryNote}
                    nextActions={msg.nextActions}
                    onAction={onAction}
                  />
                </div>
              )}

              {msg.type === "guided_review_step" && (
                <div className="w-full">
                  <div className="rounded-lg px-3 py-2 text-sm bg-muted mb-3 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.nextActions && msg.nextActions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.nextActions.map((action) => (
                        <Button
                          key={action.id}
                          variant={
                            action.actionType === "approve_files" ||
                            action.actionType === "approve_demographics" ||
                            action.actionType === "approve_dimensions" ||
                            action.actionType === "approve_questions" ||
                            action.actionType === "approve_mappings" ||
                            action.actionType === "approve_automatic_mappings" ||
                            action.actionType === "approve_contract"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            if (onAction) {
                              onAction(action.actionType);
                            }
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.type === "contract_summary" && (
                <div className="w-full">
                   <div className="rounded-lg px-3 py-2 text-sm bg-muted mb-2">
                    {msg.content}
                  </div>
                  <ApprovedContractSummary />
                </div>
              )}

              {msg.type === "analysis_progress" && (
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm bg-muted border border-border animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">{msg.content}</span>
                </div>
              )}

              {msg.type === "analysis_summary_blocks" && (
                <div className="w-full flex flex-col gap-3">
                  <div className="rounded-lg px-4 py-3 text-sm bg-muted whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.visualBlocks && msg.visualBlocks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.visualBlocks.map((block, idx) => {
                        const Icon = block.icon === "file" ? FileText :
                                     block.icon === "users" ? Users :
                                     block.icon === "database" ? Database :
                                     block.icon === "arrow_right" ? ArrowRight : FileText;
                        return (
                          <Card key={idx} className="bg-card border-border shadow-sm">
                            <CardContent className="p-3 flex items-start gap-3">
                              <div className="mt-0.5 shrink-0 text-primary bg-primary/10 p-1.5 rounded-md">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-sm text-foreground">{block.title}</span>
                                <span className="text-xs text-muted-foreground leading-snug">{block.description}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {msg.type === "demographics_guided_review" && (
                <div className="w-full flex flex-col gap-3">
                  <div className="rounded-lg px-4 py-3 text-sm bg-muted whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: "Gerencia", status: "Alineado", action: "Mantener" },
                      { name: "Área", status: "Requiere creación", action: "Crear en encuesta" },
                      { name: "Cargo", status: "Requiere creación", action: "Crear en encuesta" },
                      { name: "Antigüedad", status: "Alineado", action: "Mantener" }
                    ].map(demo => (
                      <Card key={demo.name} className="bg-card border-border shadow-sm">
                        <CardContent className="p-3 flex items-center justify-between">
                           <div>
                             <p className="font-medium text-sm text-foreground">{demo.name}</p>
                             <p className="text-xs text-muted-foreground">{demo.status}</p>
                           </div>
                           <Badge variant={demo.status === "Alineado" ? "secondary" : "outline"} className="text-[10px]">
                             {demo.action}
                           </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {msg.nextActions && msg.nextActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.nextActions.map((action) => (
                        <Button
                          key={action.id}
                          variant={action.actionType === "approve_demographics" ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            if (onAction) {
                              onAction(action.actionType);
                            }
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <span className="text-xs text-muted-foreground mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
