import type { ImportIssue } from '../../../types/survey-import';

export const blockingIssueMock = {
  id: 'demo-issue-001',
  code: 'MISSING_SCALE',
  severity: 'blocking',
  category: 'scale',
  entity: 'question',
  sourceReferences: [{ fileId: 'demo-file-1', sheetId: 'demo-sheet-1', fieldId: 'demo-field-3' }],
  userMessage: 'La pregunta no tiene una escala reconocible.',
  resolutionStatus: 'open',
  isBlocking: true,
  requiresHumanReview: true,
} satisfies ImportIssue;

export const reviewRequiredIssueMock = {
  id: 'demo-issue-002',
  code: 'NEW_DEMOGRAPHIC_VALUE',
  severity: 'review-required',
  category: 'demographic',
  entity: 'demographic',
  sourceReferences: [{ fileId: 'demo-file-1', sheetId: 'demo-sheet-1', fieldId: 'demo-field-demog' }],
  userMessage: 'Se detectó un valor demográfico nuevo.',
  resolutionStatus: 'open',
  isBlocking: false,
  requiresHumanReview: true,
} satisfies ImportIssue;
