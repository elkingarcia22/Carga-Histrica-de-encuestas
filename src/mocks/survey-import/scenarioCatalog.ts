import type { ImportSession, ImportMode, ImportSessionStatus } from '../../types/survey-import';
import { uploadInitialScenario } from './scenarios/uploadInitialScenario';
import { filesSelectedValidScenario } from './scenarios/filesSelectedValidScenario';
import { rawHappyPathScenario } from './scenarios/rawHappyPathScenario';
import { rawReviewRequiredScenario } from './scenarios/rawReviewRequiredScenario';
import { aggregatedHappyPathScenario } from './scenarios/aggregatedHappyPathScenario';
import { unknownBlockedScenario } from './scenarios/unknownBlockedScenario';
import { resultCompletedScenario, resultPartialScenario, resultFailedScenario, resultCancelledScenario } from './scenarios/importResultScenarios';

export interface ScenarioMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly mainView: string;
  readonly mode: ImportMode;
  readonly status: ImportSessionStatus;
  readonly fixture: ImportSession;
  readonly expectedUsage: string;
  readonly isSynthetic: true;
}

export const SCENARIO_CATALOG: readonly ScenarioMetadata[] = [
  {
    id: 'upload-initial',
    name: 'M0 · Upload inicial',
    description: 'Estado vacío, esperando archivos.',
    mainView: 'U1',
    mode: 'unknown',
    status: 'idle',
    fixture: uploadInitialScenario,
    expectedUsage: 'Validar pantalla inicial y panel lateral vacío.',
    isSynthetic: true,
  },
  {
    id: 'files-selected-valid',
    name: 'M1 · Archivos seleccionados',
    description: 'Archivos seleccionados, sin análisis profundo.',
    mainView: 'U2',
    mode: 'unknown',
    status: 'files-selected',
    fixture: filesSelectedValidScenario,
    expectedUsage: 'Validar lista de archivos en panel lateral.',
    isSynthetic: true,
  },
  {
    id: 'raw-happy-path',
    name: 'M2 · Raw individual · Happy path',
    description: 'Flujo limpio de datos individuales listos para confirmar.',
    mainView: 'U4 / C1 / R3A / P1',
    mode: 'raw-individual',
    status: 'ready-for-preview',
    fixture: rawHappyPathScenario,
    expectedUsage: 'Validar previsualización exitosa sin issues.',
    isSynthetic: true,
  },
  {
    id: 'raw-review-required',
    name: 'M3 · Raw individual · Review required',
    description: 'Flujo individual con conflictos y elementos nuevos.',
    mainView: 'C1 / R1 / R2 / R3A / P1',
    mode: 'raw-individual',
    status: 'review-required',
    fixture: rawReviewRequiredScenario,
    expectedUsage: 'Validar proceso de resolución y estado bloqueado.',
    isSynthetic: true,
  },
  {
    id: 'aggregated-happy-path',
    name: 'M4 · Agregado comparativo · Happy path',
    description: 'Flujo limpio de resultados agregados por segmento.',
    mainView: 'U4 / C1 / R1 / R2 / R3B / P1',
    mode: 'aggregated-comparison',
    status: 'ready-for-preview',
    fixture: aggregatedHappyPathScenario,
    expectedUsage: 'Validar interfaz de segmentos y datos puramente estadísticos.',
    isSynthetic: true,
  },
  {
    id: 'unknown-blocked',
    name: 'M5 · Unknown bloqueado',
    description: 'Archivo irreconocible o muy ambiguo.',
    mainView: 'U4',
    mode: 'unknown',
    status: 'detection-partial',
    fixture: unknownBlockedScenario,
    expectedUsage: 'Validar estado de error estructural temprano.',
    isSynthetic: true,
  },
  {
    id: 'result-completed',
    name: 'M6A · Resultado Completado',
    description: 'Importación finalizada con éxito.',
    mainView: 'P3',
    mode: 'raw-individual',
    status: 'completed',
    fixture: resultCompletedScenario,
    expectedUsage: 'Validar pantalla de éxito.',
    isSynthetic: true,
  },
  {
    id: 'result-partial',
    name: 'M6B · Resultado Parcial',
    description: 'Importación finalizada con advertencias.',
    mainView: 'P3',
    mode: 'raw-individual',
    status: 'partially-completed',
    fixture: resultPartialScenario,
    expectedUsage: 'Validar pantalla de éxito parcial y reporte.',
    isSynthetic: true,
  },
  {
    id: 'result-failed',
    name: 'M6C · Resultado Fallido',
    description: 'Importación falló durante procesamiento.',
    mainView: 'P3',
    mode: 'raw-individual',
    status: 'failed',
    fixture: resultFailedScenario,
    expectedUsage: 'Validar pantalla de error seguro.',
    isSynthetic: true,
  },
  {
    id: 'result-cancelled',
    name: 'M6D · Resultado Cancelado',
    description: 'Importación abortada por usuario.',
    mainView: 'wizard-exit',
    mode: 'unknown',
    status: 'cancelled',
    fixture: resultCancelledScenario,
    expectedUsage: 'Validar retorno seguro (E0/exit).',
    isSynthetic: true,
  }
];
