import type {
  StructureInventoryCapabilities,
  StructureInventoryDecision,
  StructureInventoryDemographic,
  StructureInventoryDimension,
  StructureInventoryEntityType,
  StructureInventoryInput,
  StructureInventoryMetric,
  StructureInventoryQuestion,
  StructureInventoryResult,
  StructureInventorySegment,
  StructureInventorySummary
} from './types';

const SEPARATOR = '_';

function normalizeLabel(label: string): string {
  return label.toLowerCase().trim();
}

function generateDeterministicId(
  entityType: StructureInventoryEntityType,
  normalizedLabel: string,
  index: number,
  sheetName: string
): string {
  const cleanLabel = normalizedLabel.replace(/[^a-z0-9]/g, '');
  const cleanSheet = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${entityType}${SEPARATOR}${cleanSheet}${SEPARATOR}${cleanLabel}${SEPARATOR}${index}`;
}

const DEMOGRAPHIC_SIGNALS = [
  'gerencia', 'área', 'area', 'departamento', 'cargo', 'rol',
  'antigüedad', 'antiguedad', 'país', 'pais', 'ciudad', 'sede',
  'equipo', 'generación', 'generacion', 'rango'
];

const NOT_DEMOGRAPHIC_SIGNALS = [
  'correo', 'email', 'documento', 'cedula', 'cédula', 'id',
  'employee_id', 'colaborador_id', 'nombre'
];

const METRIC_SIGNALS = [
  'percepción negativa', 'percepcion negativa', 'negativa',
  'percepción neutra', 'percepcion neutra', 'neutra',
  'percepción positiva', 'percepcion positiva', 'positiva',
  'total de respuestas', 'respuestas', 'participación', 'participacion',
  'favorabilidad'
];

function isDemographic(label: string): boolean {
  const norm = normalizeLabel(label);
  if (NOT_DEMOGRAPHIC_SIGNALS.some((s) => norm.includes(s))) {
    return false;
  }
  return DEMOGRAPHIC_SIGNALS.some((s) => norm.includes(s));
}

function isMetric(label: string): boolean {
  const norm = normalizeLabel(label);
  return METRIC_SIGNALS.some((s) => norm.includes(s));
}

function isIdentification(label: string): boolean {
  const norm = normalizeLabel(label);
  return NOT_DEMOGRAPHIC_SIGNALS.some((s) => norm.includes(s));
}

export function mapStructureInventory(input: StructureInventoryInput): StructureInventoryResult {
  const dimensions: StructureInventoryDimension[] = [];
  const questions: StructureInventoryQuestion[] = [];
  const demographics: StructureInventoryDemographic[] = [];
  const metrics: StructureInventoryMetric[] = [];
  const segments: StructureInventorySegment[] = [];
  const decisions: StructureInventoryDecision[] = [];

  let inventoryDetailAvailable = false;
  const canListDimensions = false;
  let canListQuestions = false;
  let canListDemographics = false;
  let canListMetrics = false;
  let canListSegments = false;
  let requiresSecureRowInventory = false;
  let fallbackReason: string | undefined = undefined;

  if (input.sourceFileRole === 'segment_summary' || input.sourceFileRole === 'segment') {
    canListSegments = true;
    const label = input.fileName || input.sourceFileRole;
    const norm = normalizeLabel(label);

    segments.push({
      id: generateDeterministicId('segment', norm, 0, input.sheetName),
      entityType: 'segment',
      label: label,
      reviewState: 'pending_review',
      trace: {
        sourceFileName: input.fileName,
        sourceSheetName: input.sheetName,
        sourceLayout: input.sheetLayout,
        sourceEntityType: 'segment',
        sourceLabel: label,
        normalizedSourceLabel: norm,
        confidence: 'high',
        detectionReason: 'Derived from secure sourceFileRole',
      }
    });
  }

  if (input.sheetLayout === 'aggregated_items_by_rows') {
    inventoryDetailAvailable = false;
    requiresSecureRowInventory = true;
    fallbackReason = 'Aún falta inventario estructural seguro para listar dimensiones y preguntas una por una.';

    input.sampleColumnLabels.forEach((label, index) => {
      const norm = normalizeLabel(label);
      if (isDemographic(label)) {
        canListDemographics = true;
        demographics.push({
          id: generateDeterministicId('demographic', norm, index, input.sheetName),
          entityType: 'demographic',
          label: label,
          reviewState: 'pending_review',
          trace: {
            sourceFileName: input.fileName,
            sourceSheetName: input.sheetName,
            sourceLayout: input.sheetLayout,
            sourceEntityType: 'column',
            sourceLabel: label,
            normalizedSourceLabel: norm,
            confidence: 'medium',
            detectionReason: 'Matches demographic safe keywords'
          }
        });
      } else if (isMetric(label)) {
        canListMetrics = true;
        metrics.push({
          id: generateDeterministicId('metric', norm, index, input.sheetName),
          entityType: 'metric',
          label: label,
          reviewState: 'pending_review',
          trace: {
            sourceFileName: input.fileName,
            sourceSheetName: input.sheetName,
            sourceLayout: input.sheetLayout,
            sourceEntityType: 'column',
            sourceLabel: label,
            normalizedSourceLabel: norm,
            confidence: 'high',
            detectionReason: 'Matches expected aggregate metric keywords'
          }
        });
      }
    });

  } else if (input.sheetLayout === 'raw_responses_by_columns') {
    inventoryDetailAvailable = true;
    canListQuestions = true;
    canListDemographics = true;
    canListMetrics = true;

    input.sampleColumnLabels.forEach((label, index) => {
      const norm = normalizeLabel(label);
      if (isDemographic(label)) {
        demographics.push({
          id: generateDeterministicId('demographic', norm, index, input.sheetName),
          entityType: 'demographic',
          label: label,
          reviewState: 'pending_review',
          trace: {
            sourceFileName: input.fileName,
            sourceSheetName: input.sheetName,
            sourceLayout: input.sheetLayout,
            sourceEntityType: 'column',
            sourceLabel: label,
            normalizedSourceLabel: norm,
            confidence: 'medium',
            detectionReason: 'Matches demographic safe keywords'
          }
        });
      } else if (isMetric(label)) {
        metrics.push({
          id: generateDeterministicId('metric', norm, index, input.sheetName),
          entityType: 'metric',
          label: label,
          reviewState: 'pending_review',
          trace: {
            sourceFileName: input.fileName,
            sourceSheetName: input.sheetName,
            sourceLayout: input.sheetLayout,
            sourceEntityType: 'column',
            sourceLabel: label,
            normalizedSourceLabel: norm,
            confidence: 'medium',
            detectionReason: 'Matches metric safe keywords'
          }
        });
      } else if (!isIdentification(label)) {
        questions.push({
          id: generateDeterministicId('question', norm, index, input.sheetName),
          entityType: 'question',
          label: label,
          reviewState: 'pending_review',
          trace: {
            sourceFileName: input.fileName,
            sourceSheetName: input.sheetName,
            sourceLayout: input.sheetLayout,
            sourceEntityType: 'column',
            sourceLabel: label,
            normalizedSourceLabel: norm,
            confidence: 'low',
            detectionReason: 'Assumed question from unknown column label'
          }
        });
      }
    });
  } else {
    fallbackReason = 'Aún falta inventario estructural seguro para listar dimensiones y preguntas una por una.';
  }

  if (input.homologationPrecheckResult) {
    decisions.push({
      id: generateDeterministicId('decision', 'homologation_precheck', 0, input.sheetName),
      entityType: 'decision',
      description: input.homologationPrecheckResult.reason,
      isBlocking: !input.homologationPrecheckResult.isHomologationPossible,
      reviewState: 'pending_review',
      trace: {
        sourceFileName: input.fileName,
        sourceSheetName: input.sheetName,
        sourceLayout: input.sheetLayout,
        sourceEntityType: 'precheck_result',
        sourceLabel: 'Homologation Precheck',
        normalizedSourceLabel: 'homologation_precheck',
        confidence: 'high',
        detectionReason: 'Provided by homologation precheck'
      }
    });
  }

  const blockingDecisionsCount = decisions.filter((d) => d.isBlocking).length;

  const summary: StructureInventorySummary = {
    dimensionsCount: dimensions.length,
    questionsCount: questions.length,
    demographicsCount: demographics.length,
    metricsCount: metrics.length,
    segmentsCount: segments.length,
    decisionsCount: decisions.length,
    blockingDecisionsCount,
    inventoryDetailAvailable,
    recommendedNextStep: blockingDecisionsCount > 0
      ? 'resolve_blocking_decisions'
      : (inventoryDetailAvailable ? 'review_inventory' : 'wait_for_secure_row_inventory')
  };

  const capabilities: StructureInventoryCapabilities = {
    inventoryDetailAvailable,
    canListDimensions,
    canListQuestions,
    canListDemographics,
    canListMetrics,
    canListSegments,
    requiresSecureRowInventory,
    fallbackReason
  };

  return {
    dimensions,
    questions,
    demographics,
    metrics,
    segments,
    decisions,
    summary,
    capabilities
  };
}
