import type { CanonicalDemographic } from '../../../types/survey-import';

export const demographicAreaMock = {
  internalId: 'demo-demographic-1',
  originalName: 'Área',
  normalizedName: 'area',
  type: 'categorical',
  originalValues: ['Operaciones Demo', 'Finanzas Demo', 'Talento Demo'],
  normalizedValues: ['operaciones-demo', 'finanzas-demo', 'talento-demo'],
  matchConfidence: 0.9,
  valueEquivalences: [
    { originalValue: 'Operaciones Demo', normalizedValue: 'operaciones-demo', confidence: 0.9, reviewStatus: 'confirmed' }
  ],
  matchStatus: 'aligned',
  reviewStatus: 'confirmed',
  action: 'associate',
  relatedIssueIds: [],
} satisfies CanonicalDemographic;

export const demographicLocationMock = {
  internalId: 'demo-demographic-2',
  originalName: 'Sede',
  normalizedName: 'sede',
  type: 'categorical',
  originalValues: ['Sede Norte', 'Sede Centro'],
  normalizedValues: ['sede-norte', 'sede-centro'],
  matchConfidence: 0.6,
  valueEquivalences: [
    { originalValue: 'Sede Norte', normalizedValue: 'sede-norte', confidence: 0.6, reviewStatus: 'unreviewed' }
  ],
  matchStatus: 'review-required',
  reviewStatus: 'unreviewed',
  action: 'create',
  relatedIssueIds: ['demo-issue-002'],
} satisfies CanonicalDemographic;
