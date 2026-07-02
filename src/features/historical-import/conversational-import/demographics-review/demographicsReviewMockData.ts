import type {
  DemographicReviewField,
  SystemMatchStatus,
  Destination,
  ReviewStatus,
  MatchConfidence,
} from './demographicsReviewTypes';

function deriveSampleItemsPreview(items: string[]): string {
  const limit = 5;
  if (items.length === 0) return 'Ninguno';
  if (items.length <= limit) return items.join(', ');
  const preview = items.slice(0, limit).join(', ');
  const remaining = items.length - limit;
  return `${preview} y ${remaining} más`;
}

export const SYSTEM_MATCH_REASON_DIRECT = 'Coincidencia directa con demográfico precargado del sistema.';

export function createDemographicReviewField(
  id: string,
  detectedName: string,
  sourceLabel: string,
  detectedItems: string[],
  systemMatchStatus: SystemMatchStatus,
  matchedSystemDemographic: string | null,
  matchConfidence: MatchConfidence,
  matchReason: string,
  destination: Destination,
  reviewStatus: ReviewStatus,
  warnings: string[] = [],
): DemographicReviewField {
  const normalizedName = detectedName.toLowerCase().trim();
  return {
    id,
    detectedName,
    normalizedName,
    sourceLabel,
    detectedItems: [...detectedItems],
    detectedItemCount: detectedItems.length,
    sampleItemsPreview: deriveSampleItemsPreview(detectedItems),
    systemMatchStatus,
    matchedSystemDemographic,
    matchConfidence,
    matchReason,
    destination,
    reviewStatus,
    warnings: [...warnings],
  };
}

export const MOCK_DETECTED_DEMOGRAPHIC_FIELDS: DemographicReviewField[] = [
  createDemographicReviewField(
    'demo-field-01',
    'Gerencia',
    'Gerencia',
    ['Comercial', 'Operaciones', 'Tecnología', 'Talento'],
    'matched_system_demographic',
    'Departamento o área de trabajo',
    'medium',
    'Gerencia se interpreta como área organizacional porque sus valores parecen áreas internas y coincide semánticamente con Departamento o área de trabajo.',
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-02',
    'Área',
    'Área',
    ['Comercial', 'Operaciones', 'Tecnología'],
    'matched_system_demographic',
    'Departamento o área de trabajo',
    'high',
    'Alias directo: Área es sinónimo de Departamento o área de trabajo.',
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-03',
    'Rol',
    'Rol',
    ['Líder', 'Manager', 'Individual Contributor'],
    'survey_only',
    null,
    'high',
    'No existe un demográfico precargado del sistema llamado Rol. Se creará solo en esta encuesta.',
    'create_in_survey_only',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-04',
    'Antigüedad',
    'Antigüedad',
    ['0-1 años', '1-3 años', '3-5 años', 'Más de 5 años'],
    'survey_only',
    null,
    'high',
    'No existe un demográfico precargado del sistema llamado Antigüedad. Se creará solo en esta encuesta.',
    'create_in_survey_only',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-05',
    'Sede',
    'Sede',
    ['Bogotá', 'Medellín', 'CDMX'],
    'survey_only',
    null,
    'high',
    'No existe como demográfico precargado del sistema. Se creará solo para esta encuesta como segmentador agregado.',
    'create_in_survey_only',
    'pending_review',
  ),
  createDemographicReviewField(
    'demo-field-06',
    'Nivel',
    'Nivel',
    ['Directivo', 'Manager', 'Coordinador', 'Individual Contributor'],
    'matched_system_demographic',
    'Nivel jerárquico en la empresa',
    'high',
    'Alias directo: Nivel es abreviatura de Nivel jerárquico en la empresa.',
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-07',
    'Departamento',
    'Departamento',
    ['Comercial', 'Operaciones', 'Producto'],
    'matched_system_demographic',
    'Departamento o área de trabajo',
    'high',
    'Alias directo: Departamento es abreviatura de Departamento o área de trabajo.',
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-08',
    'País',
    'País',
    ['Colombia', 'México', 'Perú'],
    'matched_system_demographic',
    'País',
    'high',
    SYSTEM_MATCH_REASON_DIRECT,
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-09',
    'Ciudad',
    'Ciudad',
    ['Bogotá', 'Medellín', 'Ciudad de México'],
    'matched_system_demographic',
    'Ciudad',
    'high',
    SYSTEM_MATCH_REASON_DIRECT,
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-10',
    'Columna A',
    'Columna A',
    ['Segmento A', 'Segmento B'],
    'matched_system_demographic',
    'Columna A',
    'high',
    SYSTEM_MATCH_REASON_DIRECT,
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-11',
    'Columna B',
    'Columna B',
    ['Grupo 1', 'Grupo 2'],
    'matched_system_demographic',
    'Columna B',
    'high',
    SYSTEM_MATCH_REASON_DIRECT,
    'sync_with_system',
    'confirmed',
  ),
  createDemographicReviewField(
    'demo-field-12',
    'Segmento personalizado',
    'Segmento personalizado',
    ['Premium', 'Standard', 'Básico'],
    'needs_review',
    null,
    'low',
    'El nombre no coincide claramente con ningún demográfico precargado del sistema. Los valores detectados no proporcionan suficiente evidencia para determinar un mapeo.',
    'needs_user_decision',
    'ambiguous',
    ['No hay suficiente evidencia para determinar si debe sincronizarse o crearse solo en encuesta.'],
  ),
];

export function createDemographicsReviewMockData(): DemographicReviewField[] {
  return MOCK_DETECTED_DEMOGRAPHIC_FIELDS.map((f) => ({ ...f }));
}

export function getMockFieldByName(name: string): DemographicReviewField | undefined {
  return MOCK_DETECTED_DEMOGRAPHIC_FIELDS.find(
    (f) => f.detectedName.toLowerCase() === name.toLowerCase(),
  );
}
