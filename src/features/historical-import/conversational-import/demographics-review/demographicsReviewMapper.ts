import type {
  DemographicReviewField,
  DemographicsReviewSummary,
  DemographicsReviewConversationViewModel,
  SystemPreloadedDemographic,
  SystemMatchStatus,
  Destination,
  ReviewStatus,
  MatchConfidence,
} from './demographicsReviewTypes';
import {
  SYSTEM_PRELOADED_DEMOGRAPHICS,
  SAFE_ITEMS_PREVIEW_LIMIT,
} from './demographicsReviewTypes';

export function normalizeName(name: string): string {
  return name.toLowerCase().trim().normalize('NFC');
}

export function findSystemDemographicByLabel(
  label: string,
): SystemPreloadedDemographic | undefined {
  return SYSTEM_PRELOADED_DEMOGRAPHICS.find(
    (d) => d.label.toLowerCase() === label.toLowerCase(),
  );
}

export function findSystemDemographicByAlias(
  alias: string,
): SystemPreloadedDemographic | undefined {
  const normalizedAlias = normalizeName(alias);
  return SYSTEM_PRELOADED_DEMOGRAPHICS.find((d) =>
    d.aliases.some((a) => normalizeName(a) === normalizedAlias),
  );
}

export function matchDemographicToSystem(
  detectedName: string,
  _detectedItems?: string[],
): {
  systemMatchStatus: SystemMatchStatus;
  matchedSystemDemographic: string | null;
  matchConfidence: MatchConfidence;
  matchReason: string;
  destination: Destination;
  reviewStatus: ReviewStatus;
  warnings: string[];
} {
  void _detectedItems;
  const normalizedName = normalizeName(detectedName);

  const directMatch = findSystemDemographicByLabel(detectedName);
  if (directMatch) {
    return {
      systemMatchStatus: 'matched_system_demographic',
      matchedSystemDemographic: directMatch.label,
      matchConfidence: 'high',
      matchReason: 'Coincidencia directa con demográfico precargado del sistema.',
      destination: 'sync_with_system',
      reviewStatus: 'confirmed',
      warnings: [],
    };
  }

  const aliasMatch = findSystemDemographicByAlias(detectedName);
  if (aliasMatch) {
    const isGerencia = normalizedName === 'gerencia';
    const confidence: MatchConfidence = isGerencia ? 'medium' : 'high';
    const reason = isGerencia
      ? 'Gerencia se interpreta como área organizacional porque sus valores parecen áreas internas y coincide semánticamente con Departamento o área de trabajo.'
      : `Alias directo: ${detectedName} es ${
          normalizedName === 'departamento'
            ? 'abreviatura'
            : normalizedName === 'pais'
              ? 'variante ortográfica'
              : normalizedName === 'nivel' || normalizedName === 'nivel jerárquico' || normalizedName === 'nivel jerarquico' || normalizedName === 'jerarquía' || normalizedName === 'jerarquia'
                ? 'abreviatura'
                : 'sinónimo'
        } de ${aliasMatch.label}.`;

    return {
      systemMatchStatus: 'matched_system_demographic',
      matchedSystemDemographic: aliasMatch.label,
      matchConfidence: confidence,
      matchReason: reason,
      destination: 'sync_with_system',
      reviewStatus: 'confirmed',
      warnings: [],
    };
  }

  const surveyOnlyNames = [
    'rol', 'antigüedad', 'antiguedad', 'sede', 'unidad', 'regional',
    'equipo', 'líder', 'lider', 'segmento personalizado', 'generación',
    'generacion', 'rangosalarial', 'rango salarial', 'cargo',
  ];

  if (surveyOnlyNames.includes(normalizedName)) {
    return {
      systemMatchStatus: 'survey_only',
      matchedSystemDemographic: null,
      matchConfidence: 'high',
      matchReason: `No existe como demográfico precargado del sistema. Se creará solo para esta encuesta como segmentador agregado.`,
      destination: 'create_in_survey_only',
      reviewStatus: 'pending_review',
      warnings: [],
    };
  }

  return {
    systemMatchStatus: 'needs_review',
    matchedSystemDemographic: null,
    matchConfidence: 'low',
    matchReason:
      'El nombre no coincide claramente con ningún demográfico precargado del sistema. Los valores detectados no proporcionan suficiente evidencia para determinar un mapeo.',
    destination: 'needs_user_decision',
    reviewStatus: 'ambiguous',
    warnings: [
      'No hay suficiente evidencia para determinar si debe sincronizarse o crearse solo en encuesta.',
    ],
  };
}

function deriveSampleItemsPreview(items: string[]): string {
  if (items.length === 0) return 'Ninguno';
  if (items.length <= SAFE_ITEMS_PREVIEW_LIMIT) return items.join(', ');
  const preview = items.slice(0, SAFE_ITEMS_PREVIEW_LIMIT).join(', ');
  return `${preview} y ${items.length - SAFE_ITEMS_PREVIEW_LIMIT} más`;
}

export function mapDetectedFieldToReviewField(
  id: string,
  detectedName: string,
  sourceLabel: string,
  detectedItems: string[],
): DemographicReviewField {
  const normalizedName = normalizeName(detectedName);
  const match = matchDemographicToSystem(detectedName, detectedItems);

  const destination: Destination =
    match.systemMatchStatus === 'matched_system_demographic'
      ? 'sync_with_system'
      : match.systemMatchStatus === 'survey_only'
        ? 'create_in_survey_only'
        : match.systemMatchStatus === 'needs_review'
          ? 'needs_user_decision'
          : 'excluded';

  return {
    id,
    detectedName,
    normalizedName,
    sourceLabel,
    detectedItems: [...detectedItems],
    detectedItemCount: detectedItems.length,
    sampleItemsPreview: deriveSampleItemsPreview(detectedItems),
    systemMatchStatus: match.systemMatchStatus,
    matchedSystemDemographic: match.matchedSystemDemographic,
    matchConfidence: match.matchConfidence,
    matchReason: match.matchReason,
    destination,
    reviewStatus: match.reviewStatus,
    warnings: [...match.warnings],
  };
}

export function mapFieldsToReviewSummary(
  fields: DemographicReviewField[],
): DemographicsReviewSummary {
  const totalDetected = fields.length;
  const syncWithSystem = fields.filter(
    (f) => f.systemMatchStatus === 'matched_system_demographic',
  ).length;
  const surveyOnly = fields.filter(
    (f) => f.systemMatchStatus === 'survey_only',
  ).length;
  const needsReview = fields.filter(
    (f) => f.systemMatchStatus === 'needs_review',
  ).length;
  const excluded = fields.filter(
    (f) => f.systemMatchStatus === 'excluded',
  ).length;

  return {
    totalDetected,
    syncWithSystem,
    surveyOnly,
    needsReview,
    excluded,
    fields: fields.map((f) => ({ ...f })),
  };
}

export function mapReviewSummaryToConversationViewModel(
  summary: DemographicsReviewSummary,
): DemographicsReviewConversationViewModel {
  const syncWithSystem = summary.fields.filter(
    (f) => f.destination === 'sync_with_system',
  );
  const surveyOnly = summary.fields.filter(
    (f) => f.destination === 'create_in_survey_only',
  );
  const needsReview = summary.fields.filter(
    (f) => f.destination === 'needs_user_decision' || f.reviewStatus === 'ambiguous',
  );

  const commands: string[] = [
    'Confirmar demográficos',
    'Revisar {nombre del demográfico}',
    'Cambiar destino de sincronización',
    'Excluir un demográfico',
    'Continuar sin cambios',
  ];

  return {
    title: '2/7 · Demográficos',
    intro: `Detecté ${summary.totalDetected} campos demográficos y segmentadores asociados a la encuesta.`,
    fields: summary.fields.map((f) => ({ ...f })),
    syncWithSystem: syncWithSystem.map((f) => ({ ...f })),
    surveyOnly: surveyOnly.map((f) => ({ ...f })),
    needsReview: needsReview.map((f) => ({ ...f })),
    commands,
  };
}

export function countUniqueItems(fields: DemographicReviewField[]): number {
  const allItems = fields.flatMap((f) => f.detectedItems);
  return new Set(allItems).size;
}

export function getDestinationText(field: DemographicReviewField): string {
  if (field.destination === 'sync_with_system') {
    return `Se sincronizará con "${field.matchedSystemDemographic}"`;
  }
  if (field.destination === 'create_in_survey_only') {
    return 'Se creará solo en esta encuesta';
  }
  if (field.destination === 'needs_user_decision') {
    return 'Requiere revisión';
  }
  return 'Excluido de la estructura de demográficos';
}

export function getDestinationReasonText(field: DemographicReviewField): string {
  if (field.destination === 'sync_with_system') {
    return 'Coincidencia directa con demográfico precargado.';
  }
  if (field.destination === 'create_in_survey_only') {
    return 'No existe como demográfico precargado del sistema.';
  }
  if (field.destination === 'needs_user_decision') {
    return 'El campo puede tener más de una interpretación o no hay suficiente evidencia.';
  }
  return 'No se usará como segmentador para esta encuesta.';
}
