import { useState, useCallback, useRef } from 'react';
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
    // Check if we already have a draft that matches this source
    if (draft && sourceRef.current?.configurationSignature === newSource.configurationSignature && sourceRef.current?.sourceScenarioId === newSource.sourceScenarioId) {
      // Configuration matches, we can keep the current draft, just re-check compatibility
      const comp = checkConfigurationCompatibility(draft.configurationSignature, newSource);
      setCompatibility(comp);
      setSource(newSource);
      sourceRef.current = newSource;
      return;
    }

    // Otherwise, start fresh or from scenario
    const newDraft = getReviewMappingScenario(newSource.sourceScenarioId);
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

  const buildBoundary = useCallback(() => {
    if (!draft || !source) return null;
    return buildConfirmationBoundary(draft, source);
  }, [draft, source]);

  const priorityIssues = draft ? getPriorityIssues(draft.issues) : [];

  return {
    draft,
    source,
    compatibility,
    priorityIssues,
    initialize,
    reset,
    buildBoundary,
  };
}
