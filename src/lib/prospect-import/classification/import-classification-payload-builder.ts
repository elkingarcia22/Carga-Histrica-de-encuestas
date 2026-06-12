import type { ImportClassificationValidationResult, ClassifiedImportRow } from './types';

export interface BatchPersistencePayload {
  catalog_version: string;
}

export interface CandidatePersistencePayload {
  row_number: number;
  catalog_version_id: string;
  industry_id: string;
  subindustry_id: string | null;
  subindustry: string | null;
  import_classification: {
    industryOriginalValue: string | null;
    subindustryOriginalValue: string | null;
    industryName: string | null;
    subindustryName: string | null;
    status: string;
    requiresHumanReview: boolean;
  };
}

export interface ClassificationPersistencePayloads {
  batch: BatchPersistencePayload;
  candidates: CandidatePersistencePayload[];
}

export function buildImportPersistencePayload(
  validationResult: ImportClassificationValidationResult
): ClassificationPersistencePayloads | null {
  // Regla estricta: No generar payload si valid = false
  if (!validationResult.valid) {
    return null;
  }

  const batchPayload: BatchPersistencePayload = {
    catalog_version: validationResult.catalogVersion
  };

  const candidatesPayloads: CandidatePersistencePayload[] = validationResult.rows.map(
    (row: ClassifiedImportRow) => {
      // Ensure we don't have non-serializable objects (Map, Set, Functions)
      const serializedClassification = {
        industryOriginalValue: row.parsedRow.industryOriginalValue,
        subindustryOriginalValue: row.parsedRow.subindustryOriginalValue,
        industryName: row.classification.industryName,
        subindustryName: row.classification.subindustryName,
        status: row.classification.status,
        requiresHumanReview: row.classification.requiresHumanReview
      };

      return {
        row_number: row.rowNumber,
        catalog_version_id: validationResult.catalogVersionId,
        industry_id: row.classification.industryId!, // Guaranteed valid by validationResult.valid
        subindustry_id: row.classification.subindustryId, // null is allowed for subindustry
        subindustry: row.classification.subindustryName, // Canonical name
        import_classification: serializedClassification
      };
    }
  );

  return {
    batch: batchPayload,
    candidates: candidatesPayloads
  };
}
