import type { MatchingCapability, MatchingInput, MatchingPlan } from './types';
import type { ContractAssemblyResult } from '../contract-assembler/types';
import type { SurveyFileAnalysisContract } from '../survey-file-analysis/types';

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
    matchingImplementationEnabled: false,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createMatchingPlan(_input: MatchingInput): MatchingPlan {
  return {
    status: 'not_started',
    matchesGenerated: false,
    requiredNextPhase: 'Fase 9C · Matching Engine v1 Implementation',
  };
}
