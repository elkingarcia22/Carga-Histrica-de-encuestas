import type { ParsedWorkbookPreview } from '../local-parser/types';
import type { SurveyAnonymityStatus, MatchMethodDetails, PiiRiskLevel, SurveyFileAnalysisContract, AnalysisWarning, RequiredUserDecision, AnalysisAuditEntry } from '../survey-file-analysis/types';
import type { MockUbitsCatalogs } from '../mock-ubits-catalogs/types';

export type ContractAssemblyStage = 'INITIALIZATION' | 'CLASSIFICATION' | 'MATCHING' | 'USER_REVIEW' | 'FINALIZATION';
export type ContractAssemblyStatus = 'not_started' | 'in_progress' | 'awaiting_decision' | 'completed' | 'failed';
export type ContractAssemblyMode = 'AUTOMATIC' | 'INTERACTIVE';

export interface ContractAssemblyCapability {
  usesParserPreviewAsSourceOfTruth: boolean;
  usesMockCatalogsAsReference: boolean;
  requiresUserDecisionForAmbiguity: boolean;
  aiIsNotSourceOfTruth: boolean;
  createsDraftContract: boolean;
  matchingEngineEnabled: boolean;
  claudeEnabled: boolean;
  uiIntegrationEnabled: boolean;
}

export interface ContractAssemblyInput {
  parsedPreview: ParsedWorkbookPreview;
  mockCatalogs: MockUbitsCatalogs;
  mode: ContractAssemblyMode;
  options: Record<string, unknown>;
}

export interface ContractAssemblyResult {
  status: ContractAssemblyStatus;
  draftContractCreated: boolean;
  requiredNextPhase: string;
  draftContract?: SurveyFileAnalysisContract;
  warnings?: AnalysisWarning[];
  decisions?: RequiredUserDecision[];
  auditTrail?: AnalysisAuditEntry[];
}

export interface ContractAssemblyWarning {
  code: string;
  message: string;
  columnReference?: number;
}

export interface ContractAssemblyError {
  code: string;
  message: string;
  fatal: boolean;
}

export interface ContractAssemblyDecisionCandidate {
  id: string;
  type: string;
  reason: string;
}

export interface ContractAssemblyAuditEvent {
  timestamp: string;
  event: string;
  details: Record<string, unknown>;
}

export interface ColumnClassificationCandidate {
  columnIndex: number;
  inferredRole: string;
  confidence: number;
}

export interface SheetSelectionCandidate {
  sheetName: string;
  reason: string;
  isRecommended: boolean;
}

export interface HeaderNormalizationResult {
  originalHeader: string;
  normalizedHeader: string;
  appliedRules: string[];
}

export interface DemographicCandidate {
  originalName: string;
  matchedDemographicId: string | null;
  matchDetails: MatchMethodDetails;
}

export interface QuestionCandidate {
  originalText: string;
  matchedQuestionId: string | null;
  matchDetails: MatchMethodDetails;
}

export interface DimensionCandidate {
  originalName: string;
  matchedDimensionId: string | null;
}

export interface ResponseScaleCandidate {
  questionId: string;
  detectedScaleType: string;
}

export interface ParticipantIdentifierCandidate {
  columns: number[];
  anonymityStatus: SurveyAnonymityStatus;
}

export interface PiiSignalCandidate {
  columns: number[];
  riskLevel: PiiRiskLevel;
}
