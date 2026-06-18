import type { ChatMessage } from "./conversationalImportTypes";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";
import { SyntheticAttachmentStaging } from "./SyntheticAttachmentStaging";
import { ApprovedContractSummary } from "./ApprovedContractSummary";

interface ChatTimelineProps {
  messages: ChatMessage[];
}

export function ChatTimeline({ messages }: ChatTimelineProps) {
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
            
            <div className={`flex flex-col gap-2 max-w-[80%] ${
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
                <Card className="w-full border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
                  <CardContent className="p-3 text-sm text-yellow-800 dark:text-yellow-200">
                    {msg.content}
                  </CardContent>
                </Card>
              )}
              
              {msg.type === "approval_request" && (
                <Card className="w-full border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                  <CardContent className="p-3 text-sm text-blue-800 dark:text-blue-200">
                    {msg.content}
                  </CardContent>
                </Card>
              )}
              
              {msg.type === "contract_summary" && (
                <div className="w-full">
                   <div className="rounded-lg px-3 py-2 text-sm bg-muted mb-2">
                    {msg.content}
                  </div>
                  <ApprovedContractSummary />
                </div>
              )}

              <span className="text-[10px] text-muted-foreground mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
