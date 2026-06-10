import type { ImportSourceFile } from '../../../types/survey-import';

export const fileResponsesMock = {
  id: 'demo-file-1',
  visibleName: 'respuestas_clima_2025.xlsx',
  extension: 'xlsx',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  sizeBytes: 102400,
  validationStatus: 'valid',
  analysisStatus: 'completed',
  acceptanceStatus: 'accepted',
  detectedSheetIds: ['demo-sheet-1'],
  relatedIssueIds: [],
} satisfies ImportSourceFile;

export const fileParticipantsMock = {
  id: 'demo-file-2',
  visibleName: 'participantes_2025.xlsx',
  extension: 'xlsx',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  sizeBytes: 51200,
  validationStatus: 'valid',
  analysisStatus: 'completed',
  acceptanceStatus: 'accepted',
  detectedSheetIds: ['demo-sheet-2'],
  relatedIssueIds: [],
} satisfies ImportSourceFile;
