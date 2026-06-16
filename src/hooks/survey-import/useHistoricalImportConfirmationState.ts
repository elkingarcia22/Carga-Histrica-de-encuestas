import { useState, useCallback } from 'react';
import type {
  HistoricalImportConfirmationSource,
  HistoricalImportConfirmationDraft,
  HistoricalConfirmationCompatibility,
  HistoricalImportConfirmationReadiness,
  HistoricalConfirmationStatus,
  HistoricalImportConfirmationExecutionBoundary,
} from '../../lib/survey-import/confirmation/historicalImportConfirmationTypes';
import {
  initializeHistoricalImportConfirmationDraft,
  prepareConfirmationDraft,
  buildConfirmationExecutionBoundary,
  buildConfirmationInputSignature,
  checkConfirmationCompatibility,
} from '../../lib/survey-import/confirmation/historicalImportConfirmationAdapter';

export function useHistoricalImportConfirmationState() {
  const [source, setSource] = useState<HistoricalImportConfirmationSource | null>(null);
  const [draft, setDraft] = useState<HistoricalImportConfirmationDraft | null>(null);

  const initialize = useCallback((newSource: HistoricalImportConfirmationSource) => {
    setSource(prevSource => {
      if (prevSource && prevSource.mappingDraftId === newSource.mappingDraftId) {
        return newSource;
      }
      return newSource;
    });

    setDraft(prevDraft => {
      if (prevDraft && prevDraft.mappingDraftId === newSource.mappingDraftId) {
        const inputSignature = buildConfirmationInputSignature(newSource);
        const compatibility = checkConfirmationCompatibility(newSource, prevDraft.mappingDraftId, inputSignature);

        if (
          prevDraft.configurationDraftId === newSource.configurationDraftId &&
          prevDraft.sourceBatchId === newSource.sourceBatchId &&
          compatibility === 'current'
        ) {
          return prevDraft;
        }

        return initializeHistoricalImportConfirmationDraft(
          prevDraft.confirmationDraftId,
          newSource,
          'implementation-consultant',
          {
            explicitConfirmationAccepted: prevDraft.explicitConfirmationAccepted,
            hasBlockingIssues: newSource.blockingMappingIssueIds.length > 0,
            hasConfirmationRequiredIssues: newSource.deferredIssueIds.length > 0,
            hasRequiredIgnoredColumns: newSource.ignoredColumnIds.length > 0,
            hasSimulatedError: prevDraft.confirmationStatus === 'simulated-error',
            blockingIssueIds: newSource.blockingMappingIssueIds,
            deferredIssueIds: newSource.deferredIssueIds,
            ignoredColumnIds: newSource.ignoredColumnIds,
          }
        );
      }

      // New draft
      return initializeHistoricalImportConfirmationDraft(
        `${newSource.mappingDraftId}-conf`,
        newSource,
        'implementation-consultant',
        {
          hasBlockingIssues: newSource.blockingMappingIssueIds.length > 0,
          hasConfirmationRequiredIssues: newSource.deferredIssueIds.length > 0,
          hasRequiredIgnoredColumns: newSource.ignoredColumnIds.length > 0,
          hasSimulatedError: false,
          blockingIssueIds: newSource.blockingMappingIssueIds,
          deferredIssueIds: newSource.deferredIssueIds,
          ignoredColumnIds: newSource.ignoredColumnIds,
        }
      );
    });
  }, []);

  const setExplicitConfirmationAccepted = useCallback((accepted: boolean) => {
    setDraft(prev => {
      if (!prev || !source) return prev;
      return initializeHistoricalImportConfirmationDraft(
        prev.confirmationDraftId,
        source,
        prev.confirmedByRole,
        {
          explicitConfirmationAccepted: accepted,
          hasBlockingIssues: source.blockingMappingIssueIds.length > 0,
          hasConfirmationRequiredIssues: source.deferredIssueIds.length > 0,
          hasRequiredIgnoredColumns: source.ignoredColumnIds.length > 0,
          hasSimulatedError: prev.confirmationStatus === 'simulated-error',
          blockingIssueIds: prev.blockingIssueIds,
          deferredIssueIds: prev.deferredIssueIds,
          ignoredColumnIds: prev.ignoredColumnIds,
        }
      );
    });
  }, [source]);

  const prepare = useCallback(() => {
    setDraft(prev => {
      if (!prev || !source) return prev;
      const newDraft = prepareConfirmationDraft(
        prev,
        source,
        source.blockingMappingIssueIds.length > 0,
        source.deferredIssueIds.length > 0,
        source.ignoredColumnIds.length > 0,
        prev.confirmationStatus === 'simulated-error'
      );
      return newDraft || prev;
    });
  }, [source]);

  const buildBoundary = useCallback((): HistoricalImportConfirmationExecutionBoundary | null => {
    if (!draft || !source) return null;
    return buildConfirmationExecutionBoundary(draft, source);
  }, [draft, source]);

  const reset = useCallback(() => {
    setSource(null);
    setDraft(null);
  }, []);

  return {
    source,
    draft,
    compatibility: draft?.compatibility as HistoricalConfirmationCompatibility | undefined,
    readiness: draft?.finalReadiness as HistoricalImportConfirmationReadiness | undefined,
    status: draft?.confirmationStatus as HistoricalConfirmationStatus | undefined,
    explicitConfirmationAccepted: draft?.explicitConfirmationAccepted ?? false,
    canPrepareSimulatedExecution: draft?.canPrepareSimulatedExecution ?? false,
    initialize,
    setExplicitConfirmationAccepted,
    prepare,
    buildBoundary,
    reset,
  };
}
