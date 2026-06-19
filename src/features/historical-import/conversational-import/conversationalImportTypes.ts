export type MessageRole = "system" | "assistant" | "user";
export type MessageType = "text" | "file_staging" | "structure_summary" | "warning" | "approval_request" | "correction" | "contract_summary" | "synthetic_file_mount_summary" | "guided_review_step";

export interface SyntheticMountedSurveyFile {
  id: string;
  displayName: string;
  periodLabel: string;
  surveyType: "clima";
  fileKind: "xlsx_mock";
  source: "synthetic";
  status: "staged" | "ready_for_review";
  rowsLabel: string;
  sheetsLabel: string;
  safetyLabel: string;
}

export interface SyntheticMountNextAction {
  id: string;
  label: string;
  actionType: "review_structure" | "change_files" | "view_format" | "start_guided_review" | "approve_files" | "detail_files" | "approve_demographics" | "correct_demographics" | "detail_demographics" | "start_dimensions_review" | "approve_dimensions" | "correct_dimensions" | "detail_dimensions";
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: string;
  files?: SyntheticMountedSurveyFile[];
  boundaryNote?: string;
  nextActions?: SyntheticMountNextAction[];
}

export interface MockMapping {
  question: string;
  dimension: string;
}

export interface MockIssue {
  type: "warning" | "error";
  message: string;
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
  | "ERROR"
  | "INITIAL_CHAT_SHELL"
  | "MOUNTING_SYNTHETIC_FILES"
  | "SYNTHETIC_FILES_STAGED"
  | "REVIEW_FILES_STEP"
  | "FILES_APPROVED"
  | "FILES_CHANGES_REQUESTED"
  | "DEMOGRAPHICS_APPROVED"
  | "DEMOGRAPHICS_CHANGES_REQUESTED"
  | "REVIEW_DEMOGRAPHICS_STEP"
  | "REVIEW_DIMENSIONS_STEP"
  | "REVIEW_QUESTIONS_STEP"
  | "REVIEW_MAPPINGS_STEP"
  | "READY_TO_REVIEW_STRUCTURE"
  | "SYNTHETIC_MOUNT_ERROR";

export interface ApprovalBlock {
  id: string;
  name: string;
  status: "pending" | "approved" | "changes_requested";
  totalItems: number;
  approvedItems: number;
  warningCount: number;
  blockingIssueCount: number;
}
