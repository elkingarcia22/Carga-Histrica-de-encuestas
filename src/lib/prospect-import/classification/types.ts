export interface ParsedImportedProspectRow {
  rowNumber: number;
  industryOriginalValue: string | null;
  subindustryOriginalValue: string | null;
  // Other raw data fields from parser
  raw_data?: Record<string, unknown>;
}

export interface CatalogIndustry {
  id: string;
  name: string;
}

export interface CatalogSubindustry {
  id: string;
  industryId: string;
  name: string;
}

export interface CatalogAlias {
  alias: string;
  canonicalId: string;
  type: 'industry' | 'subindustry';
}

export interface ImportClassificationCatalog {
  version: string;
  versionId: string;
  industries: CatalogIndustry[];
  subindustries: CatalogSubindustry[];
  aliases: CatalogAlias[];
}

export type ClassificationValidationStatus = 
  | 'valid'
  | 'ambiguous'
  | 'not-found'
  | 'not-applicable'
  | 'wrong-industry';

export interface ImportedProspectClassification {
  industryId: string | null;
  industryName: string | null;
  subindustryId: string | null;
  subindustryName: string | null;
  requiresHumanReview: boolean;
  status: ClassificationValidationStatus;
}

export interface ClassifiedImportRow {
  rowNumber: number;
  parsedRow: ParsedImportedProspectRow;
  classification: ImportedProspectClassification;
  validationStatus: ClassificationValidationStatus;
  canPersistAutomatically: boolean;
}

export interface ImportClassificationBlockingIssue {
  rowNumber: number;
  reason: string;
}

export interface ImportClassificationValidationResult {
  valid: boolean;
  catalogVersion: string;
  catalogVersionId: string;
  rows: ClassifiedImportRow[];
  summary: {
    totalRows: number;
    readyRows: number;
    normalizedRows: number;
    warningRows: number;
    reviewRows: number;
    invalidRows: number;
  };
  blockingIssues: ImportClassificationBlockingIssue[];
}
