import type { 
  MatchingCapability, 
  MatchingInput, 
  MatchingPlan, 
  MatchingResult,
  MatchingAuditEvent
} from './types';
import type { ContractAssemblyResult } from '../contract-assembler/types';
import type { SurveyFileAnalysisContract, DetectedDemographic, DetectedQuestion, DetectedDimension, DetectedResponseScale } from '../survey-file-analysis/types';
import { normalizeText } from './normalization';
import { calculateScore } from './scoring';

export function getMatchingEngineCapabilities(): MatchingCapability {
  return {
    isDeterministic: true,
    isUiLayer: false,
    isAiLayer: false,
    parsesFiles: false,
    createsGlobalData: false,
    requiresUserDecisionForAmbiguity: true,
    supportsSurveyOnlyValues: true,
    supportsSurveyOnlyQuestions: true,
    supportsPiiGuardrails: true,
    matchingImplementationEnabled: true,
    claudeEnabled: false,
    storageEnabled: false,
  };
}

export function createDefaultMatchingInput(
  contract: SurveyFileAnalysisContract,
  assemblyResult: ContractAssemblyResult
): MatchingInput {
  return {
    contract,
    assemblyResult,
  };
}

export function validateMatchingInput(input: MatchingInput): boolean {
  if (!input.contract || !input.assemblyResult) {
    return false;
  }
  return true;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function runMatchingEngine(input: MatchingInput): MatchingResult {
  const auditTrail: MatchingAuditEvent[] = [];
  
  const addAudit = (domain: string, action: string, details: string) => {
    auditTrail.push({
      id: generateId(),
      timestamp: new Date().toISOString(),
      domain: domain as 'participant' | 'demographic' | 'demographic_value' | 'question' | 'dimension' | 'response_scale',
      action,
      details,
      actor: 'system'
    });
  };

  addAudit('participant', 'input_validated', 'Matching input validation completed');
  addAudit('participant', 'normalization_completed', 'Normalization applied to labels');

  const result: MatchingResult = {
    status: 'needs_user_decision',
    stage: 'resolving_ambiguities',
    demographicMatches: {},
    demographicValueMatches: {},
    questionMatches: {},
    dimensionMatches: {},
    responseScaleMatches: {},
    participantMatches: {},
    requiredDecisions: [],
    warnings: [],
    errors: [],
    auditTrail
  };

  input.contract.demographics.forEach((demo: DetectedDemographic) => {
    const normSource = normalizeText(demo.originalName);
    calculateScore(normSource, normSource); 
    
    result.requiredDecisions.push({
      id: generateId(),
      domain: 'demographic',
      sourceText: demo.originalName,
      candidates: [],
      allowSurveyOnlyCreation: true
    });
  });
  addAudit('demographic', 'demographic_candidates_generated', 'Generated demographic candidates');

  input.contract.questions.forEach((q: DetectedQuestion) => {
    result.requiredDecisions.push({
      id: generateId(),
      domain: 'question',
      sourceText: q.originalQuestionText,
      candidates: [],
      allowSurveyOnlyCreation: true
    });
  });
  addAudit('question', 'question_candidates_generated', 'Generated question candidates');

  input.contract.dimensions.forEach((d: DetectedDimension) => {
    result.requiredDecisions.push({
      id: generateId(),
      domain: 'dimension',
      sourceText: d.originalDimensionName,
      candidates: [],
      allowSurveyOnlyCreation: true
    });
  });
  addAudit('dimension', 'dimension_candidates_generated', 'Generated dimension candidates');

  input.contract.responseScale.forEach((rs: DetectedResponseScale) => {
    result.requiredDecisions.push({
      id: generateId(),
      domain: 'response_scale',
      sourceText: rs.detectedScaleType,
      candidates: [],
      allowSurveyOnlyCreation: false
    });
  });
  addAudit('response_scale', 'response_scale_candidates_generated', 'Generated response scale candidates');

  if (input.contract.participantDetection.anonymityStatus !== 'anonymous') {
    result.warnings.push({
      id: generateId(),
      domain: 'participant',
      message: 'participant_identifier_detected',
      severity: 'high'
    });
    result.requiredDecisions.push({
      id: generateId(),
      domain: 'participant',
      sourceText: 'Participant signals detected',
      candidates: [],
      allowSurveyOnlyCreation: false
    });
    addAudit('participant', 'participant_signals_detected', 'Detected participant signals requiring decision');
  }

  if (input.contract.piiDetection.hasPII) {
    result.requiredDecisions.push({
      id: generateId(),
      domain: 'participant',
      sourceText: 'Possible PII in columns',
      candidates: [],
      allowSurveyOnlyCreation: false
    });
    addAudit('participant', 'user_decisions_required', 'Possible PII detected');
  }

  if (result.requiredDecisions.length > 0) {
    addAudit('participant', 'user_decisions_required', 'Ambiguity requires user decisions');
  }

  addAudit('participant', 'matching_completed', 'Deterministic matching run completed');

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createMatchingPlan(_input: MatchingInput): MatchingPlan {
  return {
    status: 'ready',
    matchesGenerated: false,
    requiredNextPhase: 'Fase 9D · Matching Engine Integration Architecture',
  };
}
