import type { ContractAssemblyCapability, ContractAssemblyInput, ContractAssemblyResult, ContractAssemblyMode } from './types';
import type { ParsedWorkbookPreview } from '../local-parser/types';

export function getContractAssemblerCapabilities(): ContractAssemblyCapability {
  return {
    usesParserPreviewAsSourceOfTruth: true,
    usesMockCatalogsAsReference: true,
    requiresUserDecisionForAmbiguity: true,
    aiIsNotSourceOfTruth: true,
    createsDraftContract: false,
    matchingEngineEnabled: false,
    claudeEnabled: false,
    uiIntegrationEnabled: false,
  };
}

export function createDefaultContractAssemblyInput(parsedPreview: ParsedWorkbookPreview, mode: ContractAssemblyMode = 'INTERACTIVE'): ContractAssemblyInput {
  return {
    parsedPreview,
    mode,
    options: {},
  };
}

export function validateContractAssemblyInput(input: ContractAssemblyInput): boolean {
  if (!input || !input.parsedPreview) {
    return false;
  }
  return true;
}

export function createContractAssemblyPlan(input: ContractAssemblyInput): ContractAssemblyResult {
  // Placeholder implementation for Fase 7B.
  // Does not create SurveyFileAnalysisContract.
  if (!input) {
    return {
      status: 'failed',
      draftContractCreated: false,
      requiredNextPhase: 'Fase 7C · Contract assembler v1 implementation',
    };
  }
  return {
    status: 'not_started',
    draftContractCreated: false,
    requiredNextPhase: 'Fase 7C · Contract assembler v1 implementation',
  };
}
