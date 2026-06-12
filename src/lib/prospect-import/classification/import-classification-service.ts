import type {
  ParsedImportedProspectRow,
  ImportClassificationCatalog,
  ClassifiedImportRow,
  ImportClassificationValidationResult,
  ClassificationValidationStatus,
  ImportClassificationBlockingIssue,
  ImportedProspectClassification
} from './types';

interface ServiceParams {
  rows: ParsedImportedProspectRow[];
  catalog: ImportClassificationCatalog;
  catalogVersionId: string;
}

export function classifyImportBatch(params: ServiceParams): ImportClassificationValidationResult {
  const { rows, catalog, catalogVersionId } = params;

  // 1. Build indices once
  const industryByName = new Map<string, string>();
  const industryById = new Map<string, string>();
  for (const ind of catalog.industries) {
    const normName = ind.name.toLowerCase().trim();
    industryByName.set(normName, ind.id);
    industryById.set(ind.id, ind.name);
  }

  const subindustryByName = new Map<string, { id: string, parentId: string }>();
  const subindustryById = new Map<string, { name: string, parentId: string }>();
  for (const sub of catalog.subindustries) {
    const normName = sub.name.toLowerCase().trim();
    subindustryByName.set(normName, { id: sub.id, parentId: sub.industryId });
    subindustryById.set(sub.id, { name: sub.name, parentId: sub.industryId });
  }

  const aliases = new Map<string, { canonicalId: string, type: 'industry' | 'subindustry' }>();
  for (const alias of catalog.aliases) {
    const normAlias = alias.alias.toLowerCase().trim();
    aliases.set(normAlias, { canonicalId: alias.canonicalId, type: alias.type });
  }

  const classifiedRows: ClassifiedImportRow[] = [];
  const blockingIssues: ImportClassificationBlockingIssue[] = [];

  let readyRows = 0;
  let normalizedRows = 0;
  let warningRows = 0;
  let reviewRows = 0;
  let invalidRows = 0;

  // 3. Normalize each row
  for (const row of rows) {
    let indId: string | null = null;
    let indName: string | null = null;
    let subId: string | null = null;
    let subName: string | null = null;

    let requiresHumanReview = false;
    let validationStatus: ClassificationValidationStatus = 'valid';

    const originalInd = row.industryOriginalValue?.trim() || null;
    const originalSub = row.subindustryOriginalValue?.trim() || null;

    let isNormalized = false;

    // Process Industry
    if (originalInd) {
      const normInd = originalInd.toLowerCase();
      if (industryByName.has(normInd)) {
        indId = industryByName.get(normInd)!;
        indName = industryById.get(indId)!;
      } else if (aliases.has(normInd) && aliases.get(normInd)!.type === 'industry') {
        indId = aliases.get(normInd)!.canonicalId;
        indName = industryById.get(indId)!;
        isNormalized = true;
      } else {
        validationStatus = 'not-found';
        requiresHumanReview = true;
      }
    } else {
      // Missing industry usually means review required
      validationStatus = 'not-found';
      requiresHumanReview = true;
    }

    // Process Subindustry
    if (originalSub) {
      const normSub = originalSub.toLowerCase();
      if (subindustryByName.has(normSub)) {
        const subData = subindustryByName.get(normSub)!;
        subId = subData.id;
        subName = subindustryById.get(subId)!.name;
        
        // Parent conflict check
        if (indId && subData.parentId !== indId) {
          validationStatus = 'wrong-industry';
          requiresHumanReview = true;
        } else if (!indId) {
          // Infer industry if possible
          indId = subData.parentId;
          indName = industryById.get(indId)!;
        }
      } else if (aliases.has(normSub) && aliases.get(normSub)!.type === 'subindustry') {
        const subData = aliases.get(normSub)!;
        subId = subData.canonicalId;
        const sById = subindustryById.get(subId)!;
        subName = sById.name;
        isNormalized = true;

        if (indId && sById.parentId !== indId) {
          validationStatus = 'wrong-industry';
          requiresHumanReview = true;
        } else if (!indId) {
          indId = sById.parentId;
          indName = industryById.get(indId)!;
        }
      } else {
        validationStatus = 'not-found';
        requiresHumanReview = true;
      }
    }

    // Subindustry ausente rule:
    // If subindustry is null/absent, but industry is valid -> valid
    
    // Geographical or other conflicts (simulated as ambiguous for this prototype if needed, 
    // but without real Supabase we just rely on perfect match)

    const canPersistAutomatically = !requiresHumanReview && validationStatus === 'valid';

    if (requiresHumanReview) {
      reviewRows++;
      if (validationStatus === 'not-found' || validationStatus === 'wrong-industry') {
        invalidRows++;
      } else {
        warningRows++;
      }
      blockingIssues.push({
        rowNumber: row.rowNumber,
        reason: `Classification review required: ${validationStatus}`
      });
    } else {
      if (isNormalized) {
        normalizedRows++;
      }
      readyRows++;
    }

    const classification: ImportedProspectClassification = {
      industryId: indId,
      industryName: indName,
      subindustryId: subId,
      subindustryName: subName,
      requiresHumanReview,
      status: validationStatus
    };

    classifiedRows.push({
      rowNumber: row.rowNumber,
      parsedRow: row,
      classification,
      validationStatus,
      canPersistAutomatically
    });
  }

  // Blocking rule: If ANY row requires review or is invalid -> valid = false
  const batchValid = blockingIssues.length === 0;

  return {
    valid: batchValid,
    catalogVersion: catalog.version,
    catalogVersionId,
    rows: classifiedRows,
    summary: {
      totalRows: rows.length,
      readyRows,
      normalizedRows,
      warningRows,
      reviewRows,
      invalidRows
    },
    blockingIssues
  };
}
