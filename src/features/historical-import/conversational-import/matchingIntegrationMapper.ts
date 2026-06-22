import { runMatchingEngine, createDefaultMatchingInput } from '../matching-engine';
import type { SurveyFileAnalysisContract, RequiredUserDecision } from '../survey-file-analysis/types';
import type { MatchingResult, MatchingRequiredUserDecision } from '../matching-engine/types';


export function runMatchingEngineIntegration(contract: SurveyFileAnalysisContract): {
  draftContract: SurveyFileAnalysisContract;
  matchingResult: MatchingResult;
} {
  // 1. Prepare input
  // Since we only have contract in the signature for now, we pass a dummy assemblyResult 
  // because the engine requires it, or we construct it.
  const input = createDefaultMatchingInput(contract, {
    status: 'completed',
    draftContractCreated: true,
    requiredNextPhase: 'matching'
  });

  // 2. Run engine
  const result = runMatchingEngine(input);

  // 3. Map matching required decisions to contract user decisions
  const mappedDecisions: RequiredUserDecision[] = result.requiredDecisions.map(mapMatchingDecisionToContractDecision);

  // 4. Return new contract draft and matching result
  return {
    draftContract: {
      ...contract,
      requiredUserDecisions: [
        ...(contract.requiredUserDecisions || []),
        ...mappedDecisions
      ]
    },
    matchingResult: result
  };
}

function mapMatchingDecisionToContractDecision(md: MatchingRequiredUserDecision): RequiredUserDecision {
  let type: RequiredUserDecision['type'] = 'resolve_ambiguity';
  
  if (md.domain === 'demographic' || md.domain === 'demographic_value') {
    type = 'approve_demographics';
  } else if (md.domain === 'participant') {
    type = 'resolve_pii';
  } else if (md.domain === 'dimension') {
    type = 'approve_dimensions';
  } else if (md.domain === 'question') {
    type = 'map_question';
  }

  return {
    id: md.id,
    type,
    status: 'pending',
    promptDescription: `Por favor resuelve la ambigüedad para ${md.domain}: ${md.sourceText}`,
    relatedEntityId: md.sourceText
  };
}
