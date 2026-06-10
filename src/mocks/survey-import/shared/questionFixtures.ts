import type { CanonicalQuestion } from '../../../types/survey-import';

export const questionLikertMock = {
  internalId: 'demo-question-1',
  normalizedText: 'Recibo información clara para realizar mi trabajo.',
  originalText: 'Recibo info clara',
  questionType: 'likert',
  scale: {
    kind: 'likert',
    points: 5,
    transformationRequiresReview: false,
    confirmationStatus: 'confirmed',
  },
  dimensionOrSection: 'Comunicación',
  matchConfidence: 0.95,
  matchEvidences: [],
  matchStatus: 'aligned',
  reviewStatus: 'confirmed',
  relatedIssueIds: [],
  action: 'import',
} satisfies CanonicalQuestion;

export const questionNpsMock = {
  internalId: 'demo-question-2',
  normalizedText: 'Recomendaría esta organización como un buen lugar para trabajar.',
  originalText: 'Recomendaría trabajar aquí',
  questionType: 'nps',
  scale: {
    kind: 'nps',
    transformationRequiresReview: false,
    confirmationStatus: 'confirmed',
  },
  matchConfidence: 0.98,
  matchEvidences: [],
  matchStatus: 'aligned',
  reviewStatus: 'confirmed',
  relatedIssueIds: [],
  action: 'import',
} satisfies CanonicalQuestion;

export const questionConflictMock = {
  internalId: 'demo-question-3',
  normalizedText: 'Tengo acceso a las herramientas que necesito.',
  originalText: 'Herramientas necesarias',
  questionType: 'unknown',
  scale: {
    kind: 'no-scale',
    transformationRequiresReview: true,
    confirmationStatus: 'unreviewed',
  },
  matchConfidence: 0.4,
  matchEvidences: [],
  matchStatus: 'conflict',
  reviewStatus: 'unreviewed',
  relatedIssueIds: ['demo-issue-001'],
  action: 'ignore',
} satisfies CanonicalQuestion;
