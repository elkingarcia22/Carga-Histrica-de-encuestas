export type MessageRole = "system" | "assistant" | "user";
export type MessageType = "text" | "file_staging" | "structure_summary" | "warning" | "approval_request" | "correction" | "contract_summary" | "synthetic_file_mount_summary" | "guided_review_step" | "analysis_progress" | "demographics_guided_review" | "analysis_summary_blocks" | "sandbox_upload_panel" | "sandbox_files_selected" | "decision_request" | "parser_structural_summary";

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
  actionType: "review_structure" | "change_files" | "view_format" | "start_guided_review" | "approve_files" | "detail_files" | "approve_demographics" | "correct_demographics" | "detail_demographics" | "start_dimensions_review" | "approve_dimensions" | "correct_dimensions" | "detail_dimensions" | "start_questions_review" | "review_comparable_questions" | "review_new_questions" | "review_historical_questions" | "approve_questions" | "correct_questions" | "start_mappings_review" | "review_pending_mappings" | "approve_automatic_mappings" | "detail_mappings" | "approve_mappings" | "correct_mappings" | "start_contract_review" | "approve_contract" | "review_contract_summary" | "return_to_mappings" | "start_local_analysis" | "cancel_analysis" | string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: string;
  files?: SyntheticMountedSurveyFile[];
  sandboxFiles?: import("./SandboxUploadPanel").SandboxFileMetadata[];
  boundaryNote?: string;
  nextActions?: SyntheticMountNextAction[];
  visualBlocks?: { icon?: string; title: string; description: string; status?: string }[];
  decision?: { id: string; question: string; options: { id: string; label: string; value: string }[] };
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
  | "SAFETY_GATE_PENDING"
  | "PARSING_IN_PROGRESS"
  | "PARSER_PREVIEW_READY"
  | "CONTRACT_ASSEMBLY_IN_PROGRESS"
  | "DRAFT_CONTRACT_READY"
  | "DECISION_REVIEW_IN_PROGRESS"
  | "DECISION_RESOLVED"
  | "ALL_CURRENT_DECISIONS_REVIEWED"
  | "BLOCKED_BY_ERROR"
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
  | "QUESTIONS_COMPARABLE_REVIEW_SELECTED"
  | "QUESTIONS_NEW_REVIEW_SELECTED"
  | "QUESTIONS_HISTORICAL_REVIEW_SELECTED"
  | "QUESTIONS_APPROVED"
  | "QUESTIONS_CHANGES_REQUESTED"
  | "REVIEW_MAPPINGS_STEP"
  | "REVIEW_APPROVED_CONTRACT_STEP"
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
