import type { NormalizedMatchText } from './types';

export function normalizeText(text: string): NormalizedMatchText {
  if (!text) {
    return { original: '', normalized: '', appliedRules: [] };
  }

  let normalized = text;
  const appliedRules: string[] = [];

  // lowercase
  if (normalized !== normalized.toLowerCase()) {
    normalized = normalized.toLowerCase();
    appliedRules.push('lowercase');
  }

  // remove accents/diacritics
  const noAccents = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized !== noAccents) {
    normalized = noAccents;
    appliedRules.push('remove_accents');
  }

  // normalize common separators: _, -, /
  const noSeparators = normalized.replace(/[_\-/]/g, ' ');
  if (normalized !== noSeparators) {
    normalized = noSeparators;
    appliedRules.push('normalize_separators');
  }

  // normalize punctuation
  const noPunctuation = normalized.replace(/[.,:;!?()[\]{}"']/g, ' ');
  if (normalized !== noPunctuation) {
    normalized = noPunctuation;
    appliedRules.push('normalize_punctuation');
  }

  // remove duplicate whitespace and trim
  const trimmed = normalized.replace(/\s+/g, ' ').trim();
  if (normalized !== trimmed) {
    normalized = trimmed;
    appliedRules.push('trim_whitespace');
  }

  return {
    original: text,
    normalized,
    appliedRules
  };
}
