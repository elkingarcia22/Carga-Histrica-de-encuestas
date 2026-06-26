/**
 * Phase 11D-H47 · Ambiguity Detection Mapper
 *
 * Pure, deterministic mapper that receives a sanitized historical import
 * preparation snapshot and returns an AmbiguityResolutionSnapshot populated
 * with detected ambiguities.
 *
 * Rules (strict):
 * - No `any`, no `as any`, no `any[]`.
 * - No Date, no Math.random.
 * - No localStorage, sessionStorage, IndexedDB.
 * - No fetch, no API calls.
 * - No side effects, no mutation of input.
 * - No JSX, no components, no hooks, no routes.
 * - No PII, no raw rows, no open text, no workbook data dumps.
 * - IDs are deterministic (type-derived, index-based).
 *
 * References:
 * - docs/AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE.md
 * - docs/CONTROLLED_RUNTIME_INTEGRATION_ARCHITECTURE.md
 * - docs/HISTORICAL_IMPORT_FLOW_ADAPTER_ARCHITECTURE.md
 * - src/features/historical-import/conversational-import/ambiguity-resolution/ambiguityResolutionTypes.ts
 */

import type {
  ActiveAmbiguity,
  AmbiguityExpectedInput,
  AmbiguityPrivacyFlags,
  AmbiguityResolutionOption,
  AmbiguityResolutionSnapshot,
  AmbiguitySeverity,
  AmbiguityType,
} from './ambiguityResolutionTypes';

// ============================================================================
// 1. Sanitized Input Contract
// ============================================================================

/**
 * Signal for a candidate survey scope detected from file metadata or headers.
 * No raw rows. No PII. Only structural metadata.
 */
export interface SurveyScopeSignal {
  /** Synthetic or sanitized label for this scope candidate. */
  readonly sanitizedLabel: string;
  /** Confidence level of this detection (0–1). */
  readonly confidence: number;
  /** Whether this scope is already selected/confirmed. */
  readonly isSelected: boolean;
}

/**
 * Signal for the survey name inferred during preparation.
 */
export interface SurveyNameSignal {
  /** Sanitized inferred name or empty string if absent. */
  readonly sanitizedInferredName: string;
  /** Confidence of the name inference (0–1). */
  readonly confidence: number;
  /** True if the name was confirmed by the user. */
  readonly isConfirmed: boolean;
}

/**
 * Signal for the survey type inferred during preparation.
 * Only allows confirmed values: 'climate' | 'culture' | 'nps' | unknown.
 */
export interface SurveyTypeSignal {
  /** Inferred type or 'unknown' if not determined. */
  readonly inferredType: 'climate' | 'culture' | 'nps' | 'unknown';
  /** Confidence of the type inference (0–1). */
  readonly confidence: number;
  /** True if confirmed by the user. */
  readonly isConfirmed: boolean;
}

/**
 * Signal for the visibility setting of the survey.
 */
export interface VisibilitySignal {
  /** Inferred visibility or 'unknown'. */
  readonly inferredVisibility: 'anonymous' | 'public' | 'unknown';
  /** True if confirmed by the user. */
  readonly isConfirmed: boolean;
}

/**
 * Signal for the end date of the survey.
 */
export interface EndDateSignal {
  /** True if a date was inferred at all. */
  readonly hasInferredDate: boolean;
  /** Confidence of the date inference (0–1). */
  readonly confidence: number;
  /** True if confirmed by the user. */
  readonly isConfirmed: boolean;
}

/**
 * Signal for a candidate main file.
 */
export interface FileSignal {
  /** Sanitized label for the file. */
  readonly sanitizedLabel: string;
  /** Confidence this is the main file (0–1). */
  readonly confidence: number;
}

/**
 * Signal for a file that may be associated (segment, corte, demographics).
 */
export interface AssociatedFileSignal {
  /** Sanitized label for the associated file. */
  readonly sanitizedLabel: string;
  /** Whether the role (segment/cut/demographics) is clear. */
  readonly roleIsAmbiguous: boolean;
}

/**
 * Signal for a question/scale whose interpretation is unclear.
 */
export interface QuestionScaleSignal {
  /** Sanitized label for the question or scale. */
  readonly sanitizedLabel: string;
  /** True if scale or favorability interpretation is unconfirmed. */
  readonly isUnconfirmed: boolean;
}

/**
 * Signal for a demographic column with potentially multiple mappings.
 */
export interface DemographicMappingSignal {
  /** Sanitized column label. */
  readonly sanitizedLabel: string;
  /** Number of possible UBITS demographic targets for this column. */
  readonly possibleMappingCount: number;
}

/**
 * Signal for a question that may belong to multiple dimensions.
 */
export interface DimensionMappingSignal {
  /** Sanitized question label. */
  readonly sanitizedLabel: string;
  /** Number of possible dimension targets for this question. */
  readonly possibleDimensionCount: number;
}

/**
 * Signal for a column or file that may be segment, corte, gerencia or área.
 */
export interface SegmentCutSignal {
  /** Sanitized label. */
  readonly sanitizedLabel: string;
  /** Number of possible structural roles for this entity. */
  readonly possibleRoleCount: number;
}

/**
 * Signal for privacy threshold risks.
 */
export interface PrivacyThresholdSignal {
  /** True if small groups were detected that might expose individuals. */
  readonly privacyRisk: boolean;
  /** True if the confidentiality threshold was confirmed by the user. */
  readonly thresholdConfirmed: boolean;
}

/**
 * Signal for duplicate or conflicting files/structures.
 */
export interface DuplicateOrConflictSignal {
  /** Sanitized labels of the conflicting entities. */
  readonly sanitizedLabels: readonly string[];
  /** Description of the conflict (sanitized, no raw data). */
  readonly sanitizedConflictDescription: string;
}

/**
 * Signal that the user requested an out-of-scope action.
 */
export interface OutOfScopeRequestSignal {
  /** True if the user requested something out of scope in the current turn. */
  readonly hasOutOfScopeRequest: boolean;
  /** Sanitized description of what was requested. */
  readonly sanitizedRequestDescription: string;
}

/**
 * Sanitized input snapshot for the ambiguity detection mapper.
 *
 * Rules:
 * - No raw rows.
 * - No workbook data dumps.
 * - No response-level open text.
 * - No PII.
 * - No unsanitized file content.
 * - Only structural signals derived from safe metadata.
 */
export interface AmbiguityDetectionInput {
  /**
   * All candidate survey scopes detected from uploaded files.
   * Empty if no files uploaded yet.
   */
  readonly detectedSurveyScopes: readonly SurveyScopeSignal[];

  /** Survey name inference signal. */
  readonly surveyNameSignal: SurveyNameSignal;

  /** Survey type inference signal. */
  readonly surveyTypeSignal: SurveyTypeSignal;

  /** Visibility signal. */
  readonly visibilitySignal: VisibilitySignal;

  /** End date signal. */
  readonly endDateSignal: EndDateSignal;

  /** Candidate main files detected. */
  readonly fileSignals: readonly FileSignal[];

  /** Candidate associated files detected. */
  readonly associatedFileSignals: readonly AssociatedFileSignal[];

  /** Questions or scales whose interpretation is unconfirmed. */
  readonly questionScaleSignals: readonly QuestionScaleSignal[];

  /** Demographic columns with multiple possible mappings. */
  readonly demographicMappingSignals: readonly DemographicMappingSignal[];

  /** Questions with multiple possible dimension assignments. */
  readonly dimensionMappingSignals: readonly DimensionMappingSignal[];

  /** Files or columns whose structural role (segment/cut) is ambiguous. */
  readonly segmentCutSignals: readonly SegmentCutSignal[];

  /** Privacy threshold signal. */
  readonly privacyThresholdSignal: PrivacyThresholdSignal;

  /** Duplicate or conflict signals between files or structures. */
  readonly duplicateOrConflictSignals: readonly DuplicateOrConflictSignal[];

  /** Out-of-scope request signal from the current user turn. */
  readonly outOfScopeRequestSignal: OutOfScopeRequestSignal;

  /**
   * Current wizard step id at which detection is triggered.
   * Used to populate `detectedAtStep` on each ambiguity.
   */
  readonly currentStep: string;
}

// ============================================================================
// 2. Internal constants
// ============================================================================

/**
 * Deterministic priority order for ambiguity types.
 * Lower index = higher priority.
 * Used to sort pending ambiguities and select activeAmbiguity.
 */
const AMBIGUITY_PRIORITY_ORDER: readonly AmbiguityType[] = [
  'PrivacyThresholdAmbiguity',
  'OutOfScopeRequestAmbiguity',
  'MultipleSurveyScopeAmbiguity',
  'MainFileAmbiguity',
  'DuplicateOrConflictAmbiguity',
  'SurveyTypeAmbiguity',
  'VisibilityAmbiguity',
  'EndDateAmbiguity',
  'SurveyNameAmbiguity',
  'AssociatedFilesAmbiguity',
  'QuestionScaleAmbiguity',
  'DemographicMappingAmbiguity',
  'DimensionMappingAmbiguity',
  'SegmentCutAmbiguity',
] as const;

// ============================================================================
// 3. Pure helper functions
// ============================================================================

/**
 * Generates a deterministic ambiguity ID from the type and a stable index.
 * Uses no Date, no Math.random, no counters from external state.
 *
 * Format: `ambiguity-{type-slug}-{optionalSuffix}`
 */
function buildAmbiguityId(type: AmbiguityType, suffix?: string): string {
  const slug = type
    .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
  return suffix !== undefined && suffix !== ''
    ? `ambiguity-${slug}-${suffix}`
    : `ambiguity-${slug}`;
}

/**
 * Generates a deterministic option ID from the ambiguity type and option index.
 * Index is 1-based for user display consistency.
 */
function buildOptionId(type: AmbiguityType, index: number): string {
  const slug = type
    .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
  return `${slug}-opt-${String(index)}`;
}

/**
 * Returns the priority rank of an ambiguity type (lower = higher priority).
 * Unknown types get max rank.
 */
function priorityOf(type: AmbiguityType): number {
  const idx = AMBIGUITY_PRIORITY_ORDER.indexOf(type);
  return idx === -1 ? AMBIGUITY_PRIORITY_ORDER.length : idx;
}

/**
 * Returns the numeric weight of a severity for ordering purposes.
 * blocking > high > medium > low.
 */
function severityWeight(severity: AmbiguitySeverity): number {
  const weights: Record<AmbiguitySeverity, number> = {
    blocking: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return weights[severity];
}

/**
 * Builds the default safe privacy flags for non-privacy ambiguities.
 */
function defaultPrivacyFlags(): AmbiguityPrivacyFlags {
  return {
    privacyRisk: false,
    safeToRender: true,
    requiresExplicitConfirmation: false,
    redactionApplied: false,
  };
}

/**
 * Builds a minimal expected input for numeric choice ambiguities.
 */
function numericChoiceInput(
  optionIds: readonly string[],
): AmbiguityExpectedInput {
  return {
    kind: 'numeric_choice',
    required: true,
    validOptionIds: optionIds,
  };
}

/**
 * Builds a confirmation expected input.
 */
function confirmationInput(): AmbiguityExpectedInput {
  return {
    kind: 'confirmation',
    required: true,
  };
}

/**
 * Builds a clarification expected input.
 */
function clarificationInput(): AmbiguityExpectedInput {
  return {
    kind: 'clarification',
    required: true,
  };
}

/**
 * Sorts an array of ActiveAmbiguity by priority order deterministically.
 * Primary sort: AMBIGUITY_PRIORITY_ORDER index.
 * Secondary sort: severity weight (blocking first).
 * Tertiary sort: ambiguity id (lexicographic, stable).
 * Does NOT mutate the input array.
 */
function sortByPriority(
  ambiguities: readonly ActiveAmbiguity[],
): ActiveAmbiguity[] {
  return [...ambiguities].sort((a, b) => {
    const pa = priorityOf(a.type);
    const pb = priorityOf(b.type);
    if (pa !== pb) return pa - pb;
    const sa = severityWeight(a.severity);
    const sb = severityWeight(b.severity);
    if (sa !== sb) return sb - sa; // higher severity first
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

// ============================================================================
// 4. Individual detection functions
// ============================================================================

/**
 * Detects MultipleSurveyScopeAmbiguity.
 * Triggers when there are multiple scope candidates and none is selected.
 */
function detectMultipleSurveyScope(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const scopes = input.detectedSurveyScopes;
  const anySelected = scopes.some((s) => s.isSelected);
  if (scopes.length <= 1 || anySelected) return null;

  const options: AmbiguityResolutionOption[] = scopes.map((scope, idx) => ({
    id: buildOptionId('MultipleSurveyScopeAmbiguity', idx + 1),
    label: scope.sanitizedLabel,
    isRecommended: scope.confidence === Math.max(...scopes.map((s) => s.confidence)),
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('MultipleSurveyScopeAmbiguity');

  return {
    id,
    type: 'MultipleSurveyScopeAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'high',
    confidence: 0.9,
    userFacingExplanation:
      'Se detectaron varios ciclos o alcances posibles en los archivos cargados. Es necesario confirmar cuál es el objetivo de esta carga histórica antes de continuar.',
    impactSummary:
      'Sin confirmar el alcance, no es posible preparar la estructura de la carga histórica correctamente.',
    options,
    recommendedOptionId: options.find((o) => o.isRecommended)?.id,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `Detected ${String(scopes.length)} scope candidates with no selection. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects SurveyNameAmbiguity.
 * Triggers when name is absent, empty, or low-confidence and not confirmed.
 */
function detectSurveyName(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const sig = input.surveyNameSignal;
  if (sig.isConfirmed) return null;
  const isAbsent = sig.sanitizedInferredName.trim() === '';
  const isLowConfidence = sig.confidence < 0.6;
  if (!isAbsent && !isLowConfidence) return null;

  const id = buildAmbiguityId('SurveyNameAmbiguity');
  return {
    id,
    type: 'SurveyNameAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.8,
    userFacingExplanation: isAbsent
      ? 'No se detectó un nombre de encuesta en los archivos cargados. Es necesario confirmarlo para continuar.'
      : 'El nombre de la encuesta inferido tiene baja confianza. Confirma o ajusta el nombre antes de continuar.',
    impactSummary:
      'El nombre de la encuesta es necesario para identificar la carga histórica en el sistema.',
    options: [],
    expectedInput: { kind: 'free_text', required: true },
    status: 'ambiguity_detected',
    auditNote: `Name absent: ${String(isAbsent)}, confidence: ${String(sig.confidence)}. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects SurveyTypeAmbiguity.
 * Triggers when type is not confirmed as 'climate', 'culture', or 'nps'.
 */
function detectSurveyType(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const sig = input.surveyTypeSignal;
  if (sig.isConfirmed && sig.inferredType !== 'unknown') return null;

  const typeOptions: AmbiguityResolutionOption[] = [
    {
      id: buildOptionId('SurveyTypeAmbiguity', 1),
      label: 'Clima',
      description: 'Encuesta de clima organizacional.',
    },
    {
      id: buildOptionId('SurveyTypeAmbiguity', 2),
      label: 'Cultura',
      description: 'Encuesta de cultura organizacional.',
    },
    {
      id: buildOptionId('SurveyTypeAmbiguity', 3),
      label: 'NPS',
      description: 'Net Promoter Score.',
    },
  ];

  const optionIds = typeOptions.map((o) => o.id);
  const id = buildAmbiguityId('SurveyTypeAmbiguity');

  return {
    id,
    type: 'SurveyTypeAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'high',
    confidence: 0.85,
    userFacingExplanation:
      'No fue posible determinar con certeza el tipo de encuesta. Selecciona el tipo correcto para que la estructura de la carga histórica sea correcta.',
    impactSummary:
      'El tipo de encuesta determina qué dimensiones, preguntas y escalas se esperan en la estructura.',
    options: typeOptions,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `Inferred type: ${sig.inferredType}, confirmed: ${String(sig.isConfirmed)}. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects VisibilityAmbiguity.
 * Triggers when visibility is not confirmed as 'anonymous' or 'public'.
 */
function detectVisibility(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const sig = input.visibilitySignal;
  if (sig.isConfirmed && sig.inferredVisibility !== 'unknown') return null;

  const visOptions: AmbiguityResolutionOption[] = [
    {
      id: buildOptionId('VisibilityAmbiguity', 1),
      label: 'Anónimo',
      description: 'Los respondentes no pueden ser identificados individualmente.',
    },
    {
      id: buildOptionId('VisibilityAmbiguity', 2),
      label: 'Público',
      description: 'Los datos de respondentes son visibles con identificación.',
    },
  ];

  const optionIds = visOptions.map((o) => o.id);
  const id = buildAmbiguityId('VisibilityAmbiguity');

  return {
    id,
    type: 'VisibilityAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'high',
    confidence: 0.8,
    userFacingExplanation:
      'No se pudo confirmar si la encuesta es anónima o pública. Esta configuración afecta cómo se tratan los datos de participación.',
    impactSummary:
      'La visibilidad determina las reglas de privacidad y cómo se procesan los datos de participantes.',
    options: visOptions,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `Inferred visibility: ${sig.inferredVisibility}, confirmed: ${String(sig.isConfirmed)}. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects EndDateAmbiguity.
 * Triggers when no date was inferred, or confidence is low, and not confirmed.
 */
function detectEndDate(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const sig = input.endDateSignal;
  if (sig.isConfirmed) return null;
  if (sig.hasInferredDate && sig.confidence >= 0.7) return null;

  const id = buildAmbiguityId('EndDateAmbiguity');
  return {
    id,
    type: 'EndDateAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.75,
    userFacingExplanation: !sig.hasInferredDate
      ? 'No se detectó una fecha de cierre de la encuesta. Indica la fecha de finalización para completar la carga histórica.'
      : 'La fecha de cierre inferida tiene baja confianza. Confirma o ajusta la fecha antes de continuar.',
    impactSummary:
      'La fecha de finalización es necesaria para ubicar correctamente el ciclo de la encuesta en el historial.',
    options: [],
    expectedInput: { kind: 'free_text', required: true },
    status: 'ambiguity_detected',
    auditNote: `Has date: ${String(sig.hasInferredDate)}, confidence: ${String(sig.confidence)}. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects MainFileAmbiguity.
 * Triggers when there are multiple candidate main files with no clear winner.
 */
function detectMainFile(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const files = input.fileSignals;
  if (files.length <= 1) return null;

  // Check if one file clearly dominates by confidence
  const sorted = [...files].sort((a, b) => b.confidence - a.confidence);
  if (sorted.length >= 2 && sorted[0].confidence - sorted[1].confidence > 0.3) {
    // Clear winner — no ambiguity needed
    return null;
  }

  const options: AmbiguityResolutionOption[] = sorted.map((f, idx) => ({
    id: buildOptionId('MainFileAmbiguity', idx + 1),
    label: f.sanitizedLabel,
    isRecommended: idx === 0,
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('MainFileAmbiguity');

  return {
    id,
    type: 'MainFileAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'high',
    confidence: 0.85,
    userFacingExplanation:
      'Hay más de un archivo que podría ser el archivo principal de la carga histórica. Selecciona cuál debe usarse como fuente principal.',
    impactSummary:
      'El archivo principal es el que define la estructura de la carga. Una selección incorrecta afecta todas las etapas siguientes.',
    options,
    recommendedOptionId: options[0]?.id,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(files.length)} candidate main files. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects AssociatedFilesAmbiguity.
 * Triggers when at least one associated file has an ambiguous role.
 */
function detectAssociatedFiles(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const ambiguous = input.associatedFileSignals.filter(
    (f) => f.roleIsAmbiguous,
  );
  if (ambiguous.length === 0) return null;

  const options: AmbiguityResolutionOption[] = ambiguous.map((f, idx) => ({
    id: buildOptionId('AssociatedFilesAmbiguity', idx + 1),
    label: f.sanitizedLabel,
    description:
      'No se pudo determinar si este archivo representa un segmento, corte, gerencia u otro rol.',
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('AssociatedFilesAmbiguity');

  return {
    id,
    type: 'AssociatedFilesAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.8,
    userFacingExplanation:
      'Hay archivos asociados cuyo rol en la carga histórica no está claro. Indica para cada uno si es un segmento, corte, gerencia u otro tipo.',
    impactSummary:
      'El rol de los archivos asociados determina cómo se estructuran los segmentos y cortes en la carga histórica.',
    options,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(ambiguous.length)} associated files with ambiguous role. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects QuestionScaleAmbiguity.
 * Triggers when at least one question/scale is unconfirmed.
 */
function detectQuestionScale(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const unconfirmed = input.questionScaleSignals.filter(
    (q) => q.isUnconfirmed,
  );
  if (unconfirmed.length === 0) return null;

  const options: AmbiguityResolutionOption[] = unconfirmed.map((q, idx) => ({
    id: buildOptionId('QuestionScaleAmbiguity', idx + 1),
    label: q.sanitizedLabel,
    description: 'Escala o interpretación de favorabilidad no confirmada.',
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('QuestionScaleAmbiguity');

  return {
    id,
    type: 'QuestionScaleAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.8,
    userFacingExplanation:
      'Hay preguntas o escalas cuya interpretación no pudo confirmarse. Es necesario aclarar cómo se calculará la favorabilidad.',
    impactSummary:
      'Sin confirmar las escalas, el cálculo de favorabilidad puede ser incorrecto para esas preguntas.',
    options,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(unconfirmed.length)} unconfirmed question/scale signals. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects DemographicMappingAmbiguity.
 * Triggers when any demographic column has more than one possible mapping.
 */
function detectDemographicMapping(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const ambiguous = input.demographicMappingSignals.filter(
    (d) => d.possibleMappingCount > 1,
  );
  if (ambiguous.length === 0) return null;

  const options: AmbiguityResolutionOption[] = ambiguous.map((d, idx) => ({
    id: buildOptionId('DemographicMappingAmbiguity', idx + 1),
    label: d.sanitizedLabel,
    description: `${String(d.possibleMappingCount)} mapeos posibles para este campo demográfico.`,
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('DemographicMappingAmbiguity');

  return {
    id,
    type: 'DemographicMappingAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.8,
    userFacingExplanation:
      'Algunas columnas demográficas tienen más de un mapeo posible en el catálogo UBITS. Es necesario confirmar el mapeo correcto.',
    impactSummary:
      'Un mapeo demográfico incorrecto afectará los filtros y cortes disponibles en el análisis posterior.',
    options,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(ambiguous.length)} demographic columns with multiple possible mappings. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects DimensionMappingAmbiguity.
 * Triggers when any question can belong to more than one dimension.
 */
function detectDimensionMapping(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const ambiguous = input.dimensionMappingSignals.filter(
    (d) => d.possibleDimensionCount > 1,
  );
  if (ambiguous.length === 0) return null;

  const options: AmbiguityResolutionOption[] = ambiguous.map((d, idx) => ({
    id: buildOptionId('DimensionMappingAmbiguity', idx + 1),
    label: d.sanitizedLabel,
    description: `${String(d.possibleDimensionCount)} dimensiones posibles para esta pregunta.`,
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('DimensionMappingAmbiguity');

  return {
    id,
    type: 'DimensionMappingAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.8,
    userFacingExplanation:
      'Algunas preguntas podrían pertenecer a varias dimensiones. Es necesario confirmar la asignación correcta.',
    impactSummary:
      'Una asignación de dimensión incorrecta afectará la agrupación y el análisis de las preguntas.',
    options,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(ambiguous.length)} questions with multiple dimension candidates. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects SegmentCutAmbiguity.
 * Triggers when any file or column may be segment, corte, gerencia, or área.
 */
function detectSegmentCut(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const ambiguous = input.segmentCutSignals.filter(
    (s) => s.possibleRoleCount > 1,
  );
  if (ambiguous.length === 0) return null;

  const options: AmbiguityResolutionOption[] = ambiguous.map((s, idx) => ({
    id: buildOptionId('SegmentCutAmbiguity', idx + 1),
    label: s.sanitizedLabel,
    description: `${String(s.possibleRoleCount)} roles estructurales posibles (segmento, corte, gerencia, área).`,
  }));

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('SegmentCutAmbiguity');

  return {
    id,
    type: 'SegmentCutAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'medium',
    confidence: 0.8,
    userFacingExplanation:
      'Hay archivos o columnas que podrían representar segmentos, cortes, gerencias o áreas. Confirma su rol estructural para organizar correctamente la carga.',
    impactSummary:
      'El rol estructural de estos elementos determina cómo se agruparán los datos en el historial.',
    options,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(ambiguous.length)} segment/cut signals with multiple role candidates. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects PrivacyThresholdAmbiguity.
 * Triggers when privacy risk is detected or threshold not confirmed.
 * Severity is `blocking` when privacyRisk is true.
 */
function detectPrivacyThreshold(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const sig = input.privacyThresholdSignal;
  if (!sig.privacyRisk && sig.thresholdConfirmed) return null;

  const severity: AmbiguitySeverity = sig.privacyRisk ? 'blocking' : 'high';

  const privacyFlags: AmbiguityPrivacyFlags = {
    privacyRisk: sig.privacyRisk,
    safeToRender: true,
    requiresExplicitConfirmation: true,
    redactionApplied: false,
  };

  const id = buildAmbiguityId('PrivacyThresholdAmbiguity');
  return {
    id,
    type: 'PrivacyThresholdAmbiguity',
    detectedAtStep: input.currentStep,
    severity,
    confidence: 0.95,
    userFacingExplanation: sig.privacyRisk
      ? 'Se detectaron grupos con muy pocos participantes. Confirma el umbral de confidencialidad antes de continuar, para proteger la privacidad de los respondentes.'
      : 'El umbral de confidencialidad no ha sido confirmado. Es necesario confirmarlo para garantizar la protección de datos.',
    impactSummary:
      'Sin un umbral de confidencialidad confirmado, la carga histórica puede exponer datos individuales de participantes.',
    options: [],
    expectedInput: confirmationInput(),
    status: severity === 'blocking' ? 'blocked_until_user_clarifies' : 'ambiguity_detected',
    auditNote: `Privacy risk: ${String(sig.privacyRisk)}, threshold confirmed: ${String(sig.thresholdConfirmed)}. Step: ${input.currentStep}.`,
    privacyFlags,
    blockingReason: sig.privacyRisk
      ? 'Grupos con tamaño inferior al umbral mínimo detectados. La carga está bloqueada hasta confirmar un umbral seguro.'
      : undefined,
  };
}

/**
 * Detects DuplicateOrConflictAmbiguity.
 * Triggers when any duplicate/conflict signal is present.
 */
function detectDuplicateOrConflict(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  if (input.duplicateOrConflictSignals.length === 0) return null;

  const options: AmbiguityResolutionOption[] = input.duplicateOrConflictSignals.map(
    (sig, idx) => ({
      id: buildOptionId('DuplicateOrConflictAmbiguity', idx + 1),
      label: sig.sanitizedLabels.join(' / '),
      description: sig.sanitizedConflictDescription,
    }),
  );

  const optionIds = options.map((o) => o.id);
  const id = buildAmbiguityId('DuplicateOrConflictAmbiguity');

  return {
    id,
    type: 'DuplicateOrConflictAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'high',
    confidence: 0.85,
    userFacingExplanation:
      'Se detectaron archivos o estructuras que contienen información solapada o conflictiva. Es necesario resolver el conflicto antes de preparar la carga.',
    impactSummary:
      'Un conflicto sin resolver puede provocar duplicación de datos o inconsistencias en la carga histórica.',
    options,
    expectedInput: numericChoiceInput(optionIds),
    status: 'ambiguity_detected',
    auditNote: `${String(input.duplicateOrConflictSignals.length)} duplicate/conflict signals detected. Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
  };
}

/**
 * Detects OutOfScopeRequestAmbiguity.
 * Triggers when the user requested something out of scope in the current turn.
 * This redirects the user back to the preparation flow.
 */
function detectOutOfScopeRequest(
  input: AmbiguityDetectionInput,
): ActiveAmbiguity | null {
  const sig = input.outOfScopeRequestSignal;
  if (!sig.hasOutOfScopeRequest) return null;

  const id = buildAmbiguityId('OutOfScopeRequestAmbiguity');
  return {
    id,
    type: 'OutOfScopeRequestAmbiguity',
    detectedAtStep: input.currentStep,
    severity: 'blocking',
    confidence: 1.0,
    userFacingExplanation:
      'Lo que solicitaste está fuera del alcance de esta herramienta de preparación de carga histórica. Esta herramienta solo permite preparar la estructura para una carga histórica. El dashboard comparativo, la importación real y la visualización de resultados no están disponibles en esta fase.',
    impactSummary:
      'La acción solicitada no puede ejecutarse aquí. Puedes continuar con la preparación de la carga histórica.',
    options: [],
    expectedInput: clarificationInput(),
    status: 'out_of_scope_redirected',
    auditNote: `Out of scope request detected: "${sig.sanitizedRequestDescription}". Step: ${input.currentStep}.`,
    privacyFlags: defaultPrivacyFlags(),
    blockingReason:
      'Solicitud fuera del alcance del flujo de preparación de carga histórica.',
  };
}

// ============================================================================
// 5. Public mapper function
// ============================================================================

/**
 * Detects all active ambiguities from a sanitized historical import preparation
 * snapshot and returns a structured `AmbiguityResolutionSnapshot`.
 *
 * Rules:
 * - Pure and deterministic: same input always produces same output.
 * - No side effects.
 * - Does not mutate the input.
 * - No `any`, no `as any`, no Date, no Math.random.
 * - No PII, no raw rows, no workbook data.
 * - Does not apply resolutions (H49 responsibility).
 * - `resolvedAmbiguities` is always empty (resolution not applied in H47).
 *
 * Priority order (from highest to lowest):
 * 1. PrivacyThresholdAmbiguity
 * 2. OutOfScopeRequestAmbiguity
 * 3. MultipleSurveyScopeAmbiguity
 * 4. MainFileAmbiguity
 * 5. DuplicateOrConflictAmbiguity
 * 6. SurveyTypeAmbiguity
 * 7. VisibilityAmbiguity
 * 8. EndDateAmbiguity
 * 9. SurveyNameAmbiguity
 * 10. AssociatedFilesAmbiguity
 * 11. QuestionScaleAmbiguity
 * 12. DemographicMappingAmbiguity
 * 13. DimensionMappingAmbiguity
 * 14. SegmentCutAmbiguity
 *
 * @param input - Sanitized historical import preparation snapshot.
 * @returns AmbiguityResolutionSnapshot with detected ambiguities.
 */
export function detectHistoricalImportAmbiguities(
  input: AmbiguityDetectionInput,
): AmbiguityResolutionSnapshot {
  // Run all detectors — each returns null if no ambiguity found
  const detected: (ActiveAmbiguity | null)[] = [
    detectPrivacyThreshold(input),
    detectOutOfScopeRequest(input),
    detectMultipleSurveyScope(input),
    detectMainFile(input),
    detectDuplicateOrConflict(input),
    detectSurveyType(input),
    detectVisibility(input),
    detectEndDate(input),
    detectSurveyName(input),
    detectAssociatedFiles(input),
    detectQuestionScale(input),
    detectDemographicMapping(input),
    detectDimensionMapping(input),
    detectSegmentCut(input),
  ];

  // Filter out nulls and sort deterministically
  const allDetected: ActiveAmbiguity[] = detected.filter(
    (a): a is ActiveAmbiguity => a !== null,
  );

  const sorted = sortByPriority(allDetected);

  // In H47, no resolutions are applied — resolvedAmbiguities is always empty.
  const resolvedAmbiguities: readonly ActiveAmbiguity[] = [];

  // activeAmbiguity is the first pending ambiguity by priority
  const activeAmbiguity: ActiveAmbiguity | undefined = sorted[0];

  // pendingAmbiguities are all detected ambiguities except the active one
  const pendingAmbiguities: readonly ActiveAmbiguity[] =
    sorted.length > 1 ? sorted.slice(1) : [];

  const hasBlockingAmbiguity = sorted.some(
    (a) => a.severity === 'blocking',
  );

  return {
    activeAmbiguity,
    pendingAmbiguities,
    resolvedAmbiguities,
    hasBlockingAmbiguity,
  };
}
