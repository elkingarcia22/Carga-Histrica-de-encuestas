import { useState, useCallback, useRef, useMemo } from 'react';
import type {
  HistoricalImportMappingDraft,
  HistoricalImportReviewMappingSource,
  HistoricalConfigurationCompatibilityCheck,
} from '../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import {
  checkConfigurationCompatibility,
  getReviewMappingScenario,
  buildConfirmationBoundary,
  getPriorityIssues,
} from '../../lib/survey-import/review-mapping/historicalImportReviewMappingAdapter';

export function useHistoricalImportReviewMappingState() {
  const [draft, setDraft] = useState<HistoricalImportMappingDraft | null>(null);
  const [source, setSource] = useState<HistoricalImportReviewMappingSource | null>(null);
  const [compatibility, setCompatibility] = useState<HistoricalConfigurationCompatibilityCheck | null>(null);

  // We keep a ref to the current source to avoid stale closures in initialize if needed
  const sourceRef = useRef<HistoricalImportReviewMappingSource | null>(null);

  const initialize = useCallback((newSource: HistoricalImportReviewMappingSource) => {
    // Check if we already have a draft that matches this source's scenario
    if (draft && draft.sourceScenarioId === newSource.sourceScenarioId) {
      // Configuration matches conceptually (same scenario), we can keep the current draft.
      // But we must re-check compatibility with the new runtime source.
      const comp = checkConfigurationCompatibility(draft.configurationSignature, newSource);

      setCompatibility(comp);
      setSource(newSource);
      sourceRef.current = newSource;
      return;
    }

    // Otherwise, start fresh or from scenario
    const newDraft = getReviewMappingScenario(newSource.sourceScenarioId);

    // The mapping draft must initialize with the real runtime configuration signature
    // to avoid an immediate mismatch with the mock's signature.
    newDraft.configurationSignature = newSource.configurationSignature;

    const comp = checkConfigurationCompatibility(newDraft.configurationSignature, newSource);

    setDraft(newDraft);
    setCompatibility(comp);
    setSource(newSource);
    sourceRef.current = newSource;
  }, [draft]);

  const reset = useCallback(() => {
    setDraft(null);
    setSource(null);
    setCompatibility(null);
    sourceRef.current = null;
  }, []);

  const effectiveDraft = useMemo(() => {
    if (!draft || !compatibility) return null;

    if (draft.globalStatus === 'simulated-error') {
      return draft;
    }

    if (compatibility.status === 'incompatible' || compatibility.status === 'stale') {
      return {
        ...draft,
        globalStatus: compatibility.status as import('../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes').HistoricalImportMappingDraftStatus,
        canContinueToConfirmation: false,
      };
    }

    return draft;
  }, [draft, compatibility]);

  const buildBoundary = useCallback(() => {
    if (!effectiveDraft || !source) return null;
    return buildConfirmationBoundary(effectiveDraft, source);
  }, [effectiveDraft, source]);

  const priorityIssues = effectiveDraft ? getPriorityIssues(effectiveDraft.issues) : [];

  return {
    draft: effectiveDraft,
    source,
    compatibility,
    priorityIssues,
    initialize,
    reset,
    buildBoundary,
  };
}
