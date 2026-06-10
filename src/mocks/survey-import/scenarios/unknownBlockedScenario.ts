import type { ImportSession } from '../../../types/survey-import';
import { fileResponsesMock } from '../shared/sourceFixtures';
import { blockingIssueMock } from '../shared/issueFixtures';

export const unknownBlockedScenario: ImportSession = {
  id: 'demo-session-unknown-blocked',
  status: 'detection-partial',
  macroStage: 'upload',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:02:00Z',
  files: [fileResponsesMock],
  sheets: [],
  fields: [],
  detection: {
    suggestedMode: 'unknown',
    overallConfidence: 0.2,
    evidences: [],
    classifiedSheetIds: [],
    potentialCapabilities: [],
    relatedIssueIds: ['demo-issue-001'],
    reviewStatus: 'unreviewed',
  },
  data: { mode: 'unknown' },
  reviewProgress: {
    overall: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byQuestion: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byDemographic: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byParticipant: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    bySegment: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
  },
  issues: [blockingIssueMock],
  isCancelled: false,
  isCommitStarted: false,
};
