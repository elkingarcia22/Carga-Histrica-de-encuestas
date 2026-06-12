import type { ParsedImportedProspectRow, ImportClassificationCatalog } from './types';
import { classifyImportBatch } from './import-classification-service';
import type { ClassificationPersistencePayloads } from './import-classification-payload-builder';
import { buildImportPersistencePayload } from './import-classification-payload-builder';

// Stubs for parser and loader dependencies missing from tree
export const mockParser = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse: (_fileData: unknown): { rows: ParsedImportedProspectRow[], duplicate_columns?: string[] } => {
    return { rows: [] };
  }
};

export const mockLoader = {
  loadCatalog: async (): Promise<ImportClassificationCatalog | null> => {
    return null;
  }
};

// Existing validations and persistence mocks
export const existingValidations = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: (_rows: unknown) => true
};

export const existingPersistence = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  persist: async (_payload: ClassificationPersistencePayloads) => {
    // 0 prospect_batches, 0 prospect_candidates writes
    return true;
  }
};

export interface ProcessImportRequest {
  fileData: unknown;
  currentCatalogVersionId?: string;
}

export type ProcessImportResponse = 
  | { success: true, payload: ClassificationPersistencePayloads }
  | { success: false, code: 'classification_review_required', catalogVersion: string, classificationSummary: unknown, rows: unknown[] }
  | { success: false, code: 'industry_catalog_unavailable' }
  | { success: false, code: 'catalog_version_changed' }
  | { success: false, code: 'duplicate_import_columns', duplicates: string[] }
  | { success: false, code: 'validation_error' };

export async function processImportApiEndpoint(req: ProcessImportRequest): Promise<ProcessImportResponse> {
  // 1. Parsear archivo -> validar encabezados
  const parseResult = mockParser.parse(req.fileData);
  if (parseResult.duplicate_columns && parseResult.duplicate_columns.length > 0) {
    return {
      success: false,
      code: 'duplicate_import_columns',
      duplicates: parseResult.duplicate_columns
    };
  }

  // 2. Cargar catálogo
  const catalog = await mockLoader.loadCatalog();
  if (!catalog) {
    return {
      success: false,
      code: 'industry_catalog_unavailable'
    };
  }

  // Version lock check
  if (req.currentCatalogVersionId && catalog.versionId !== req.currentCatalogVersionId) {
    return {
      success: false,
      code: 'catalog_version_changed'
    };
  }

  // 3. Clasificar todas las filas
  const classificationResult = classifyImportBatch({
    rows: parseResult.rows,
    catalog,
    catalogVersionId: catalog.versionId
  });

  // 4. Bloquear si requieren revisión
  if (!classificationResult.valid) {
    return {
      success: false,
      code: 'classification_review_required',
      catalogVersion: classificationResult.catalogVersion,
      classificationSummary: classificationResult.summary,
      rows: classificationResult.rows.filter(r => r.classification.requiresHumanReview)
    };
  }

  // 5. Ejecutar validaciones actuales (stubbed)
  const isExistingValid = existingValidations.run(parseResult.rows);
  if (!isExistingValid) {
    return { success: false, code: 'validation_error' };
  }

  // 6. Preparar payload
  const payload = buildImportPersistencePayload(classificationResult);
  if (!payload) {
    // Should not happen since we already checked !classificationResult.valid
    return { success: false, code: 'validation_error' };
  }

  // 7. Persistencia actual
  await existingPersistence.persist(payload);

  return {
    success: true,
    payload
  };
}
