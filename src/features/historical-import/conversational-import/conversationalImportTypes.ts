export type MessageRole = "system" | "assistant" | "user";
export type MessageType = "text" | "file_staging" | "structure_summary" | "warning" | "approval_request" | "correction" | "contract_summary";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: string;
}

export type SessionState = 
  | "EMPTY_SESSION"
  | "AWAITING_FILES"
  | "FILES_STAGED"
  | "ANALYZING_MOCK"
  | "STRUCTURE_PROPOSED"
  | "REVIEWING_DEMOGRAPHICS"
  | "REVIEWING_DIMENSIONS"
  | "REVIEWING_QUESTIONS"
  | "REVIEWING_MAPPINGS"
  | "CHANGES_REQUESTED"
  | "PARTIALLY_APPROVED"
  | "CONTRACT_APPROVED"
  | "READY_FOR_COMPARISON"
  | "ERROR";

export interface ApprovalBlock {
  id: string;
  name: string;
  status: "pending" | "approved" | "changes_requested";
  totalItems: number;
  approvedItems: number;
  warningCount: number;
  blockingIssueCount: number;
}
