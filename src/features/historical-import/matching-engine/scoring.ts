import type { MatchingConfidenceScore, MatchingConfidenceLevel, NormalizedMatchText } from './types';

export function calculateScore(source: NormalizedMatchText, target: NormalizedMatchText, hasAliasMatch: boolean = false, knownCatalogIdMatch: boolean = false): MatchingConfidenceScore {
  if (knownCatalogIdMatch) {
    return { level: 'exact', score: 100, reasoning: 'known_catalog_id_match' };
  }

  if (source.normalized === target.normalized) {
    return { level: 'exact', score: 100, reasoning: 'exact_normalized_match' };
  }

  if (hasAliasMatch) {
    return { level: 'high', score: 95, reasoning: 'alias_match' };
  }

  if (source.normalized.length > 0 && target.normalized.length > 0 && source.normalized.includes(target.normalized)) {
    return { level: 'high', score: 85, reasoning: 'contains_match' };
  }

  if (source.normalized.length > 0 && target.normalized.length > 0 && target.normalized.includes(source.normalized)) {
    return { level: 'high', score: 85, reasoning: 'contains_match' };
  }

  // Token overlap
  const sourceTokens = source.normalized.split(' ');
  const targetTokens = target.normalized.split(' ');

  const overlap = sourceTokens.filter(t => targetTokens.includes(t)).length;
  const maxTokens = Math.max(sourceTokens.length, targetTokens.length);
  const overlapRatio = maxTokens > 0 ? overlap / maxTokens : 0;

  const score = Math.round(overlapRatio * 100);
  let level: MatchingConfidenceLevel;
  const reasoning = 'token_overlap';

  if (score === 100) level = 'exact';
  else if (score >= 85) level = 'high';
  else if (score >= 65) level = 'medium';
  else if (score >= 35) level = 'low';
  else level = 'none';

  return { level, score, reasoning };
}
