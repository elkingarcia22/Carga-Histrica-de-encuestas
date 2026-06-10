import type { ImportSession } from '../../../types/survey-import';
import { fileResponsesMock, fileParticipantsMock } from '../shared/sourceFixtures';

export const filesSelectedValidScenario: ImportSession = {
  id: 'demo-session-files',
  status: 'files-selected',
  macroStage: 'upload',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:01:00Z',
  files: [fileResponsesMock, fileParticipantsMock],
  sheets: [],
  fields: [],
  data: { mode: 'unknown' },
  reviewProgress: {
    overall: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byQuestion: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byDemographic: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    byParticipant: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
    bySegment: { total: 0, confirmed: 0, modified: 0, pending: 0, conflicting: 0, ignored: 0, blocking: 0 },
  },
  issues: [],
  isCancelled: false,
  isCommitStarted: false,
};
