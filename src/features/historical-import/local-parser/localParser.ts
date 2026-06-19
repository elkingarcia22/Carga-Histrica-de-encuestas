import * as XLSX from 'xlsx';
import type {
  LocalParserCapability,
  LocalParserOptions,
  LocalParserResult,
  ParsedWorkbookPreview,
  ParsedSheetPreview,
  HeaderDetectionResult,
  HeaderDetectionReason,
  ParserPreviewColumn,
  ParserPreviewRow,
  LocalParserWarning,
} from './types';

export function getLocalParserCapabilities(): LocalParserCapability {
  return {
    supportedFileTypes: ['.xlsx', '.xls', '.csv'],
    maxFileSizeMb: 20,
    maxSheets: 5,
    maxRowsToSample: 100,
    dynamicHeaderDetectionEnabled: true,
    introductoryRowsSupported: true,
    piiSignalDetectionEnabled: true,
    multiSurveyDetectionEnabled: true,
    siisLikeHeaderOffsetCaseSupported: true,
    dependencyStatus: 'INSTALLED',
  };
}

export function createDefaultLocalParserOptions(): LocalParserOptions {
  return {
    detectHeadersAutomatically: true,
    sampleSize: 50,
    requirePiiScan: true,
  };
}

export function validateLocalParserInputMetadata(
  fileSize: number,
  fileName: string
): { isValid: boolean; reason?: string } {
  const capabilities = getLocalParserCapabilities();
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (!capabilities.supportedFileTypes.includes(fileExt)) {
    return { isValid: false, reason: `Unsupported file type: ${fileExt}` };
  }

  const fileMb = fileSize / (1024 * 1024);
  if (fileMb > capabilities.maxFileSizeMb) {
    return { isValid: false, reason: `File exceeds maximum size of ${capabilities.maxFileSizeMb}MB` };
  }

  return { isValid: true };
}

export async function parseSurveyFileMetadataOnly(
  fileSize: number,
  fileName: string
): Promise<LocalParserResult> {
  const validation = validateLocalParserInputMetadata(fileSize, fileName);

  if (!validation.isValid) {
    return {
      status: 'FAILED',
      fileKind: 'UNKNOWN',
      errors: [
        {
          code: 'METADATA_VALIDATION_ERROR',
          message: validation.reason || 'Unknown validation error',
          stage: 'METADATA_VALIDATION',
          fatal: true,
        },
      ],
      warnings: [],
    };
  }

  return {
    status: 'COMPLETED',
    fileKind: fileName.toLowerCase().endsWith('.csv') ? 'CSV' : 'XLSX',
    errors: [],
    warnings: [],
  };
}

export function detectHeaderRow(rows: unknown[][], options?: LocalParserOptions): HeaderDetectionResult {
  const sampleSize = options?.sampleSize || 50;
  const sampleRows = rows.slice(0, sampleSize);

  if (sampleRows.length === 0) {
    return {
      headerRowIndex: 0,
      headerValues: [],
      dataStartRowIndex: 1,
      confidenceScore: 0,
      reason: 'FIRST_NON_EMPTY'
    };
  }

  const knownKeywords = ['nit', 'razón social', 'país', 'área', 'gerencia', 'pregunta', 'respuesta'];
  let bestRowIndex = 0;
  let bestScore = -1;
  let bestReason: HeaderDetectionReason = 'FALLBACK_FIRST_ROW';

  for (let i = 0; i < sampleRows.length; i++) {
    const row = sampleRows[i];
    if (!Array.isArray(row)) continue;

    const cells = row.map(c => String(c || '').trim());
    const nonEmptyCells = cells.filter(c => c.length > 0);

    if (nonEmptyCells.length === 0) continue;

    // Is it likely a title row? (e.g., only 1 non-empty cell in a wide sheet)
    const isLikelyTitle = nonEmptyCells.length === 1 && cells.length > 3;

    // Density: ratio of non-empty cells to total columns
    const density = nonEmptyCells.length / Math.max(1, cells.length);

    // Keyword match
    const keywordMatchCount = nonEmptyCells.filter(c =>
      knownKeywords.some(kw => c.toLowerCase().includes(kw))
    ).length;

    let score = density * 10;
    if (isLikelyTitle) score -= 20;
    score += keywordMatchCount * 5;

    // SIIS offset pattern (density drops then suddenly spikes after title rows)
    if (i > 1 && density > 0.5 && keywordMatchCount > 0) {
       score += 15; // Boost for likely SIIS header after title
    }

    if (score > bestScore) {
      bestScore = score;
      bestRowIndex = i;
      if (keywordMatchCount > 0 && i > 1) {
        bestReason = 'SIIS_OFFSET_PATTERN';
      } else if (keywordMatchCount > 0) {
        bestReason = 'KNOWN_KEYWORDS';
      } else if (density > 0.8) {
        bestReason = 'HIGH_DENSITY';
      } else {
        bestReason = 'FIRST_NON_EMPTY';
      }
    }
  }

  const headerRow = Array.isArray(rows[bestRowIndex]) ? rows[bestRowIndex] as unknown[] : [];
  const headerValues = headerRow.map(c => String(c || '').trim());

  return {
    headerRowIndex: bestRowIndex,
    headerValues,
    dataStartRowIndex: bestRowIndex + 1,
    confidenceScore: Math.min(100, Math.max(0, bestScore * 10)),
    reason: bestReason
  };
}

export async function parseWorkbookPreview(
  file: File,
  options?: Partial<LocalParserOptions>
): Promise<ParsedWorkbookPreview> {
  const mergedOptions = { ...createDefaultLocalParserOptions(), ...options };
  const validation = validateLocalParserInputMetadata(file.size, file.name);

  const warnings: LocalParserWarning[] = [];

  if (!validation.isValid) {
    throw new Error(validation.reason || 'Invalid file');
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    warnings.push({ code: 'empty_workbook', message: 'The workbook contains no sheets.' });
  }

  if (sheetNames.length > 1) {
    warnings.push({ code: 'multiple_sheets_detected', message: 'Multiple sheets detected. Only the primary sheet will be parsed by default.' });
  }

  if (file.size > 5 * 1024 * 1024) {
     warnings.push({ code: 'large_file_warning', message: 'File is quite large, parsing might take a moment.' });
  }

  const sheets: ParsedSheetPreview[] = [];

  for (const sheetName of sheetNames) {
    const sheetWarnings: LocalParserWarning[] = [];
    const worksheet = workbook.Sheets[sheetName];
    const rangeRef = worksheet['!ref'];

    let rows: unknown[][] = [];
    if (rangeRef) {
       rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    }

    if (rows.length === 0) {
       sheetWarnings.push({ code: 'empty_sheet', message: `Sheet ${sheetName} is empty.` });
    }

    const headerDetection = detectHeaderRow(rows, mergedOptions);
    if (headerDetection.headerValues.length === 0 && rows.length > 0) {
      sheetWarnings.push({ code: 'header_not_detected', message: 'Could not detect a header row.' });
    }

    const columns: ParserPreviewColumn[] = headerDetection.headerValues.map((h, i) => ({
      index: i,
      rawHeader: h,
      normalizedHeader: h.trim().toLowerCase().replace(/\s+/g, '_'),
      isEmpty: h.trim() === ''
    }));

    // Generate preview rows (limit to 5)
    const previewDataRows = rows.slice(headerDetection.dataStartRowIndex, headerDetection.dataStartRowIndex + 5);
    const previewRows: ParserPreviewRow[] = previewDataRows.map((r, rowIndex) => {
      const rowArr = Array.isArray(r) ? r : [];
      const data: Record<string, unknown> = {};
      columns.forEach(col => {
        data[col.normalizedHeader] = rowArr[col.index];
      });
      return {
        rowIndex: headerDetection.dataStartRowIndex + rowIndex,
        data
      };
    });

    sheets.push({
      sheetName,
      rangeRef,
      rowCount: rows.length,
      columnCount: columns.length,
      headerDetection,
      columns,
      previewRows,
      warnings: sheetWarnings
    });
  }

  return {
    fileName: file.name,
    fileKind: file.name.toLowerCase().endsWith('.csv') ? 'CSV' : 'XLSX',
    sheetNames,
    sheets,
    selectedSheetName: sheetNames[0],
    warnings,
    errors: [],
    contractAssemblyStatus: 'not_started'
  };
}
