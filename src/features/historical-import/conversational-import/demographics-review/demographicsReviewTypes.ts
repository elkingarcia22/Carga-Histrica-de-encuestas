export type SystemDemographicId =
  | 'system_demo_dept_area'
  | 'system_demo_level'
  | 'system_demo_country'
  | 'system_demo_city'
  | 'system_demo_column_a'
  | 'system_demo_column_b';

export interface SystemPreloadedDemographic {
  id: SystemDemographicId;
  label: string;
  aliases: string[];
  description: string;
}

export const SYSTEM_PRELOADED_DEMOGRAPHICS: SystemPreloadedDemographic[] = [
  {
    id: 'system_demo_dept_area',
    label: 'Departamento o área de trabajo',
    aliases: ['Área', 'Area', 'Departamento', 'Gerencia', 'Depto', 'Dpto'],
    description: 'Departamento organizacional o área de trabajo del participante',
  },
  {
    id: 'system_demo_level',
    label: 'Nivel jerárquico en la empresa',
    aliases: ['Nivel', 'Nivel jerárquico', 'Nivel jerarquico', 'Jerarquía', 'Jerarquia'],
    description: 'Nivel jerárquico del participante dentro de la organización',
  },
  {
    id: 'system_demo_country',
    label: 'País',
    aliases: ['País', 'Pais'],
    description: 'País de residencia o ubicación del participante',
  },
  {
    id: 'system_demo_city',
    label: 'Ciudad',
    aliases: ['Ciudad'],
    description: 'Ciudad de residencia o ubicación del participante',
  },
  {
    id: 'system_demo_column_a',
    label: 'Columna A',
    aliases: ['Columna A'],
    description: 'Columna segmentadora personalizable A',
  },
  {
    id: 'system_demo_column_b',
    label: 'Columna B',
    aliases: ['Columna B'],
    description: 'Columna segmentadora personalizable B',
  },
];

export type SystemMatchStatus =
  | 'matched_system_demographic'
  | 'survey_only'
  | 'needs_review'
  | 'excluded';

export type Destination =
  | 'sync_with_system'
  | 'create_in_survey_only'
  | 'needs_user_decision'
  | 'excluded';

export type ReviewStatus =
  | 'confirmed'
  | 'pending_review'
  | 'ambiguous'
  | 'not_interpretable';

export type MatchConfidence = 'high' | 'medium' | 'low';

export interface DemographicReviewField {
  id: string;
  detectedName: string;
  normalizedName: string;
  sourceLabel: string;
  detectedItems: string[];
  detectedItemCount: number;
  sampleItemsPreview: string;
  systemMatchStatus: SystemMatchStatus;
  matchedSystemDemographic: string | null;
  matchConfidence: MatchConfidence;
  matchReason: string;
  destination: Destination;
  reviewStatus: ReviewStatus;
  warnings: string[];
}

export interface DemographicsReviewSummary {
  totalDetected: number;
  syncWithSystem: number;
  surveyOnly: number;
  needsReview: number;
  excluded: number;
  fields: DemographicReviewField[];
}

export interface DemographicsReviewConversationViewModel {
  title: string;
  intro: string;
  fields: DemographicReviewField[];
  syncWithSystem: DemographicReviewField[];
  surveyOnly: DemographicReviewField[];
  needsReview: DemographicReviewField[];
  commands: string[];
}

export const SAFE_ITEMS_PREVIEW_LIMIT = 5;
