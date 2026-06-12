import type {
  SimulationPhaseDefinition,
  SimulationPhaseId,
  SimulationStatus,
} from '../../lib/survey-import/simulation/simulationTypes';

/**
 * PROVISIONAL_LOCKED_PENDING_VISUAL_QA
 * Deterministic provisional durations for each phase.
 * Never use Math.random() or 0.
 */
export const SIMULATION_PHASE_DURATIONS: Record<SimulationPhaseId, number> = {
  'validating-metadata': 1000,
  'identifying-function': 1200,
  'detecting-survey': 1500,
  'recognizing-data': 1800,
  'preparing-mappings': 1500,
  'consolidating-issues': 1000,
};

/**
 * Ordered immutable collection of simulation phases.
 */
export const SIMULATION_PHASES: readonly SimulationPhaseDefinition[] = [
  {
    id: 'validating-metadata',
    label: 'Validando formato y metadata del lote',
    description: 'Comprobando la integridad de la cabecera y el formato.',
    durationMs: SIMULATION_PHASE_DURATIONS['validating-metadata'],
    accessibleLabel: 'Fase 1: Validando formato y metadata del lote',
    finding: '4 archivos preparados para revisión'
  },
  {
    id: 'identifying-function',
    label: 'Identificando la función probable de cada archivo',
    description: 'Analizando posibles fuentes principales y auxiliares.',
    durationMs: SIMULATION_PHASE_DURATIONS['identifying-function'],
    accessibleLabel: 'Fase 2: Identificando la función probable de cada archivo',
    finding: '1 fuente principal y 3 archivos auxiliares propuestos'
  },
  {
    id: 'detecting-survey',
    label: 'Detectando encuesta y periodo',
    description: 'Identificando correspondencias temporales.',
    durationMs: SIMULATION_PHASE_DURATIONS['detecting-survey'],
    accessibleLabel: 'Fase 3: Detectando encuesta y periodo',
    finding: 'Encuesta y periodo representados como consistentes'
  },
  {
    id: 'recognizing-data',
    label: 'Reconociendo hojas, columnas y registros',
    description: 'Extrayendo esquema de datos simulado.',
    durationMs: SIMULATION_PHASE_DURATIONS['recognizing-data'],
    accessibleLabel: 'Fase 4: Reconociendo hojas, columnas y registros',
  },
  {
    id: 'preparing-mappings',
    label: 'Preparando mapeos preliminares',
    description: 'Enlazando columnas con atributos requeridos.',
    durationMs: SIMULATION_PHASE_DURATIONS['preparing-mappings'],
    accessibleLabel: 'Fase 5: Preparando mapeos preliminares',
    finding: 'Mapeos preliminares preparados'
  },
  {
    id: 'consolidating-issues',
    label: 'Consolidando incidencias y bloqueos',
    description: 'Preparando el resultado final.',
    durationMs: SIMULATION_PHASE_DURATIONS['consolidating-issues'],
    accessibleLabel: 'Fase 6: Consolidando incidencias y bloqueos',
    finding: 'Sin bloqueos críticos en el escenario simulado'
  },
];

/**
 * Centralized disclosure copy for the prototype simulation.
 * Must be permanent, honest, and avoid claims of real processing.
 */
export const SIMULATION_DISCLOSURE = {
  title: 'Simulación de prototipo',
  description:
    'Esta experiencia representa visualmente cómo funcionará la revisión. Los archivos seleccionados no se están leyendo y los resultados mostrados usan datos sintéticos.',
  accessibleLabel: 'Aviso de simulación de prototipo',
};

/**
 * Centralized state copy.
 */
export const SIMULATION_STATE_COPY: Record<SimulationStatus, string> = {
  idle: 'Esperando inicio de la simulación.',
  queued: 'La simulación está en cola.',
  running: 'Simulando revisión de archivos...',
  completed: 'La simulación terminó y preparó un resultado histórico de ejemplo.',
  failed: 'Ocurrió un fallo simulado de procesamiento.',
  cancelled: 'La simulación fue cancelada.',
};

/**
 * Centralized action labels.
 */
export const SIMULATION_ACTION_LABELS = {
  stopSimulation: 'Detener simulación',
  returnToFiles: 'Volver a archivos',
  cancelImport: 'Cancelar importación',
};

/**
 * Centralized accessible labels for status and items.
 */
export const SIMULATION_ACCESSIBILITY_LABELS = {
  phaseActive: 'Fase activa',
  phaseCompleted: 'Fase completada',
  filePending: 'Archivo pendiente',
  fileActive: 'Procesando archivo activo',
  fileCompleted: 'Archivo completado',
  fileWarning: 'Archivo con advertencias',
  simulationCompleted: 'Simulación completada con éxito',
  simulationCancelled: 'Simulación cancelada por el usuario',
  simulationFailed: 'Fallo simulado de procesamiento',
};
