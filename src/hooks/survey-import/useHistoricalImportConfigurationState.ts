import { useState, useCallback, useMemo } from 'react';
import type {
  HistoricalImportConfigurationDraft,
  HistoricalPrivacyMode,
  HistoricalVisibilityMode
} from '../../lib/survey-import/configuration/historicalImportConfigurationTypes';
import {
  initializeHistoricalConfigurationDraft,
  getHistoricalConfigurationSource,
  deriveDraftStatus,
  determineCanContinueToMapping,
  buildReviewMappingBoundary
} from '../../lib/survey-import/configuration/historicalImportConfigurationAdapter';

export function useHistoricalImportConfigurationState(scenarioId: string) {
  const source = useMemo(() => getHistoricalConfigurationSource(scenarioId), [scenarioId]);

  const [draft, setDraft] = useState<HistoricalImportConfigurationDraft>(() =>
    initializeHistoricalConfigurationDraft(scenarioId)
  );

  const updateName = useCallback((name: string) => {
    setDraft(prev => ({
      ...prev,
      surveyName: name,
      surveyNameOrigin: 'user-edited'
    }));
  }, []);

  const updateType = useCallback((type: string) => {
    setDraft(prev => ({
      ...prev,
      surveyType: type,
      surveyTypeOrigin: 'user-edited',
      surveyTypeConfirmed: true
    }));
  }, []);

  const confirmType = useCallback(() => {
    setDraft(prev => ({
      ...prev,
      surveyTypeConfirmed: true,
      surveyTypeOrigin: 'user-confirmed'
    }));
  }, []);

  const updateYear = useCallback((year: number | undefined) => {
    setDraft(prev => ({
      ...prev,
      periodYear: year,
      periodYearOrigin: 'user-edited'
    }));
  }, []);

  const updatePrivacy = useCallback((privacy: HistoricalPrivacyMode) => {
    setDraft(prev => ({
      ...prev,
      privacyMode: privacy,
      identifiedModeConfirmed: prev.privacyMode === 'identified' ? prev.identifiedModeConfirmed : false
    }));
  }, []);

  const confirmIdentifiedMode = useCallback(() => {
    setDraft(prev => ({
      ...prev,
      identifiedModeConfirmed: true
    }));
  }, []);

  const updateThreshold = useCallback((threshold: number | undefined) => {
    setDraft(prev => ({
      ...prev,
      minimumThreshold: threshold
    }));
  }, []);

  const updateVisibility = useCallback((visibility: HistoricalVisibilityMode) => {
    setDraft(prev => ({
      ...prev,
      visibilityMode: visibility
    }));
  }, []);

  const reset = useCallback(() => {
    setDraft(initializeHistoricalConfigurationDraft(scenarioId));
  }, [scenarioId]);

  // Derived state
  const status = deriveDraftStatus(draft, source.inheritedIssues);
  const canContinueToMapping = determineCanContinueToMapping(draft, source.inheritedIssues);

  const buildBoundary = useCallback(() => {
    return buildReviewMappingBoundary(draft, source);
  }, [draft, source]);

  return {
    source,
    draft: {
      ...draft,
      draftStatus: status,
      canContinueToMapping
    },
    updateName,
    updateType,
    confirmType,
    updateYear,
    updatePrivacy,
    confirmIdentifiedMode,
    updateThreshold,
    updateVisibility,
    reset,
    buildBoundary
  };
}
