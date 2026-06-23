import type { SafeSheetInspectionInput, XlsxSheetLayout } from './types';

export function classifySheetLayout(sheet: SafeSheetInspectionInput, fileName: string): XlsxSheetLayout {
  const name = sheet.sheetName.toLowerCase();
  const fName = fileName.toLowerCase();
  const textSignals = sheet.detectedTextSignals.map(s => s.toLowerCase());
  const allLabels = (sheet.sampleColumnLabels || []).map(l => l.toLowerCase());

  const hasItemType = textSignals.some(s => s.includes('tipo de item') || s.includes('tipo')) || allLabels.some(l => l.includes('tipo de item'));
  const hasItem = textSignals.some(s => s.includes('item') || s.includes('pregunta')) || allLabels.some(l => l.includes('item'));
  const hasPerceptions = textSignals.some(s => s.includes('percepción') || s.includes('percepcion') || s.includes('negativa') || s.includes('positiva')) || allLabels.some(l => l.includes('percepción') || l.includes('negativa') || l.includes('positiva'));

  if (hasItemType && hasItem && hasPerceptions) {
    return 'aggregated_items_by_rows';
  }

  const isAnswersSheet = name.includes('answers') || name.includes('respuestas');
  const hasCollab = textSignals.some(s => s.includes('colaborador') || s.includes('participante')) || allLabels.some(l => l.includes('colaborador') || l.includes('participante'));

  if (isAnswersSheet && hasCollab) {
    return 'raw_responses_by_columns';
  }

  const isGerencia = fName.includes('gerencia') || name.includes('gerencia');
  const hasMonitor = textSignals.some(s => s.includes('monitor') || s.includes('tasa') || s.includes('finalizada')) || allLabels.some(l => l.includes('monitor') || l.includes('tasa'));

  if (isGerencia && hasMonitor) {
    return 'segment_summary';
  }

  if (name.includes('metadata') || name.includes('instrucciones') || name.includes('portada')) {
    return 'metadata';
  }

  if (name.includes('dimensiones') || name.includes('catalogo') || name.includes('catálogo')) {
    return 'question_catalog';
  }

  return 'unknown';
}
