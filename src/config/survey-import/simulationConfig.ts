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
  'validating-metadata': 1200,
  'profiling-structure': 1800,
  'detecting-survey-type': 1500,
  'building-historical-result': 2000,
};

/**
 * Ordered immutable collection of simulation phases.
 */
export const SIMULATION_PHASES: readonly SimulationPhaseDefinition[] = [
  {
    id: 'validating-metadata',
    label: 'Verificando archivos seleccionados',
    description: 'Comprobando la integridad de la cabecera y el formato.',
    durationMs: SIMULATION_PHASE_DURATIONS['validating-metadata'],
    accessibleLabel: 'Fase 1: Verificando archivos seleccionados',
  },
  {
    id: 'profiling-structure',
    label: 'Revisando la estructura esperada',
    description: 'Analizando las columnas de atributos y respuestas.',
    durationMs: SIMULATION_PHASE_DURATIONS['profiling-structure'],
    accessibleLabel: 'Fase 2: Revisando la estructura esperada',
  },
  {
    id: 'detecting-survey-type',
    label: 'Identificando el tipo de encuesta',
    description: 'Clasificando la encuesta según sus dimensiones.',
    durationMs: SIMULATION_PHASE_DURATIONS['detecting-survey-type'],
    accessibleLabel: 'Fase 3: Identificando el tipo de encuesta',
  },
  {
    id: 'building-historical-result',
    label: 'Preparando el resultado histórico',
    description: 'Consolidando la vista previa del historial.',
    durationMs: SIMULATION_PHASE_DURATIONS['building-historical-result'],
    accessibleLabel: 'Fase 4: Preparando el resultado histórico',
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
