export type SurveyFileType = "xlsx" | "csv" | "unknown";
export type SurveyDetectionStatus = "pending" | "analyzing" | "completed" | "error";
export type SurveyAnonymityStatus = "anonymous" | "identified" | "mixed" | "unknown";
export type ColumnSemanticRole = "question" | "demographic" | "participant_id" | "metadata" | "unknown";
export type QuestionMatchStatus = "official" | "similar" | "new" | "historical";
export type DimensionMatchStatus = "existing" | "new";
export type DemographicMatchStatus = "exact" | "alias" | "new";
export type ParticipantMatchStatus = "matched" | "not_found" | "ambiguous";
export type PiiRiskLevel = "low" | "medium" | "high" | "none";
export type UserDecisionType = "approve_demographics" | "approve_dimensions" | "map_question" | "resolve_pii" | "approve_contract" | "resolve_ambiguity";
export type UserDecisionStatus = "pending" | "resolved" | "skipped";
export type AnalysisWarningSeverity = "info" | "warning" | "critical";
export type MatchMethod = "exact" | "normalized" | "alias" | "fuzzy" | "ai_suggested" | "manual_override" | "no_match";
export type MatchConfidence = "high" | "medium" | "low" | "none";

export interface SurveyFileSummary {
  fileName: string;
  fileSize: number;
  fileType: SurveyFileType;
  md5hash: string;
}

export interface DetectedSurvey {
  surveyId: string;
  name: string | null;
  rowCount: number;
}

export interface SurveySheet {
  sheetName: string;
  columnsCount: number;
  rowsCount: number;
  isEmpty: boolean;
}

export interface SurveyColumn {
  columnIndex: number;
  originalHeader: string;
  normalizedHeader: string;
  inferredDataType: "string" | "integer" | "float" | "date" | "boolean" | "unknown";
  emptyCellsRatio: number;
  semanticRole: ColumnSemanticRole;
}

export interface MatchMethodDetails {
  method: MatchMethod;
  confidence: MatchConfidence;
  reason?: string;
}

export interface DetectedDemographic {
  id: string;
  columnReference: number;
  originalName: string;
  proposedDemographicId: string | null;
  matchStatus: DemographicMatchStatus;
  matchDetails: MatchMethodDetails;
}

export interface DetectedDemographicValue {
  demographicId: string;
  originalValue: string;
  mappedValue: string;
  isNew: boolean;
}

export interface DetectedDimension {
  id: string;
  originalDimensionName: string;
  mappedDimensionId: string | "NEW";
  matchStatus: DimensionMatchStatus;
}

export interface DetectedQuestion {
  id: string;
  columnReference: number;
  originalQuestionText: string;
  mappedQuestionId: string | null;
  assignedDimensionId: string | null;
  matchStatus: QuestionMatchStatus;
  matchDetails: MatchMethodDetails;
}

export interface DetectedResponseScale {
  questionId: string;
  detectedScaleType: "LIKERT_5" | "LIKERT_4" | "BOOLEAN" | "TEXT" | "ENPS" | "UNKNOWN";
  minValue: number | null;
  maxValue: number | null;
}

export interface ParticipantDetection {
  isAnonymous: boolean;
  anonymityStatus: SurveyAnonymityStatus;
  participantColumns: number[];
}

export interface ParticipantMatch {
  totalParticipantsInFile: number;
  exactMatches: number;
  notFound: number;
  ambiguousMatches: number;
}

export interface PiiDetectionResult {
  hasPII: boolean;
  piiColumns: number[];
  riskLevel: PiiRiskLevel;
}

export interface AnalysisWarning {
  id: string;
  severity: AnalysisWarningSeverity;
  message: string;
  columnReference?: number;
}

export interface RequiredUserDecision {
  id: string;
  type: UserDecisionType;
  status: UserDecisionStatus;
  promptDescription: string;
  relatedEntityId?: string;
}

export interface AnalysisAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  oldValue: string | null;
  newValue: string | null;
  reason?: string;
}

export interface MatchingResult {
  overallConfidence: MatchConfidence;
  matchedQuestionsCount: number;
  matchedDemographicsCount: number;
  newDimensionsCount: number;
}

export interface ReadyForComparisonOutput {
  isReady: boolean;
  contractId: string;
  generatedAt: string | null;
}

export interface SurveyFileAnalysisContract {
  analysisId: string;
  createdAt: string;
  files: SurveyFileSummary[];
  detectedSurveys: DetectedSurvey[];
  selectedSurveyId: string | null;
  sheets: SurveySheet[];
  columns: SurveyColumn[];
  demographics: DetectedDemographic[];
  demographicValues: DetectedDemographicValue[];
  dimensions: DetectedDimension[];
  questions: DetectedQuestion[];
  responseScale: DetectedResponseScale[];
  participantDetection: ParticipantDetection;
  participantMatches: ParticipantMatch[];
  piiDetection: PiiDetectionResult;
  warnings: AnalysisWarning[];
  requiredUserDecisions: RequiredUserDecision[];
  auditTrail: AnalysisAuditEntry[];
  readyForComparison: ReadyForComparisonOutput;
  matchingResult: MatchingResult;
}
