import type { ContractAssemblyResult } from '../contract-assembler/types';
import type { SurveyFileAnalysisContract } from '../survey-file-analysis/types';
import type {
  MockUbitsDimension,
  MockUbitsDemographic,
  MockUbitsDemographicValue,
  MockUbitsQuestion,
  MockQuestionScale
} from '../mock-ubits-catalogs/types';

export type MatchingEngineStage = 'initial' | 'planning' | 'resolving_ambiguities' | 'finalized';
export type MatchingEngineStatus = 'not_started' | 'in_progress' | 'needs_user_decision' | 'completed' | 'failed';
export type MatchingDomain = 'demographic' | 'demographic_value' | 'question' | 'dimension' | 'response_scale' | 'participant';
export type MatchingConfidenceLevel = 'exact' | 'high' | 'medium' | 'low' | 'none';

export type MatchingConfidenceScore = {
  level: MatchingConfidenceLevel;
  score: number; // 0 to 100
  reasoning: string;
};

export type MatchingCapability = {
  isDeterministic: boolean;
  isUiLayer: boolean;
  isAiLayer: boolean;
  parsesFiles: boolean;
  createsGlobalData: boolean;
  requiresUserDecisionForAmbiguity: boolean;
  supportsSurveyOnlyValues: boolean;
  supportsSurveyOnlyQuestions: boolean;
  supportsPiiGuardrails: boolean;
  matchingImplementationEnabled: boolean;
  claudeEnabled: boolean;
  storageEnabled: boolean;
};

export type MatchingInput = {
  contract: SurveyFileAnalysisContract;
  assemblyResult: ContractAssemblyResult;
};

export type MatchingCandidate<T> = {
  catalogItem: T | null;
  confidence: MatchingConfidenceScore;
  isSurveyOnly: boolean;
};

export type DemographicMatchCandidate = MatchingCandidate<MockUbitsDemographic>;
export type DemographicValueMatchCandidate = MatchingCandidate<MockUbitsDemographicValue>;
export type QuestionMatchCandidate = MatchingCandidate<MockUbitsQuestion>;
export type DimensionMatchCandidate = MatchingCandidate<MockUbitsDimension>;
export type ResponseScaleMatchCandidate = MatchingCandidate<MockQuestionScale>;

export type ParticipantMatchSignal = {
  identifierType: 'email' | 'employeeId' | 'name' | 'other';
  extractedValue: string;
};

export type ParticipantMatchCandidate = {
  catalogItem: Record<string, unknown> | null; // Using Record instead of any to pass strict linting, although instructions said placeholder
  confidence: MatchingConfidenceScore;
  isSurveyOnly: boolean;
};

export type PiiMatchSignal = {
  columnName: string;
  sampleValues: string[];
  piiType: 'email' | 'name' | 'phone' | 'ssn' | 'other';
};

export type MatchingRequiredUserDecision = {
  id: string;
  domain: MatchingDomain;
  sourceText: string;
  candidates: { id: string; label: string; confidenceLevel: MatchingConfidenceLevel }[];
  allowSurveyOnlyCreation: boolean;
};

export type MatchingWarning = {
  id: string;
  domain: MatchingDomain;
  message: string;
  severity: 'low' | 'medium' | 'high';
};

export type MatchingError = {
  id: string;
  domain: MatchingDomain;
  message: string;
};

export type MatchingAuditEvent = {
  id: string;
  timestamp: string;
  domain: MatchingDomain;
  action: string;
  details: string;
  actor: 'system' | 'user';
};

export type NormalizationRule = {
  id: string;
  domain: MatchingDomain;
  pattern: RegExp | string;
  replacement: string;
};

export type NormalizedMatchText = {
  original: string;
  normalized: string;
  appliedRules: string[];
};

export type MatchingPlan = {
  status: 'not_started' | 'ready';
  matchesGenerated: boolean;
  requiredNextPhase: string;
};

export type MatchingResult = {
  status: MatchingEngineStatus;
  stage: MatchingEngineStage;
  demographicMatches: Record<string, DemographicMatchCandidate>;
  demographicValueMatches: Record<string, DemographicValueMatchCandidate>;
  questionMatches: Record<string, QuestionMatchCandidate>;
  dimensionMatches: Record<string, DimensionMatchCandidate>;
  responseScaleMatches: Record<string, ResponseScaleMatchCandidate>;
  participantMatches: Record<string, ParticipantMatchCandidate>;
  requiredDecisions: MatchingRequiredUserDecision[];
  warnings: MatchingWarning[];
  errors: MatchingError[];
  auditTrail: MatchingAuditEvent[];
};
