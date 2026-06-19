export type ParserDependencyStatus = 'MISSING' | 'INSTALLED' | 'READY';
export type LocalParserFileKind = 'XLSX' | 'CSV' | 'UNKNOWN';
export type LocalParserStage = 'METADATA_VALIDATION' | 'PROFILING' | 'SEMANTIC_INFERENCE' | 'EXTRACTION';
export type LocalParserStatus = 'IDLE' | 'PARSING' | 'COMPLETED' | 'FAILED';

export interface LocalParserCapability {
  supportedFileTypes: string[];
  maxFileSizeMb: number;
  maxSheets: number;
  maxRowsToSample: number;
  dynamicHeaderDetectionEnabled: boolean;
  introductoryRowsSupported: boolean;
  piiSignalDetectionEnabled: boolean;
  multiSurveyDetectionEnabled: boolean;
  siisLikeHeaderOffsetCaseSupported: boolean;
  dependencyStatus: ParserDependencyStatus;
}

export interface HeaderDetectionScore {
  score: number;
  density: number;
  diversity: number;
  keywordMatch: boolean;
  isLikelyTitle: boolean;
}

export type HeaderDetectionReason =
  | 'HIGH_DENSITY'
  | 'KNOWN_KEYWORDS'
  | 'FIRST_NON_EMPTY'
  | 'SIIS_OFFSET_PATTERN'
  | 'FALLBACK_FIRST_ROW';

export interface HeaderDetectionResult {
  headerRowIndex: number;
  headerValues: string[];
  dataStartRowIndex: number;
  confidenceScore: number;
  reason: HeaderDetectionReason;
}

export interface ParserPreviewColumn {
  index: number;
  rawHeader: string;
  normalizedHeader: string;
  isEmpty: boolean;
}

export interface ParserPreviewRow {
  rowIndex: number;
  data: Record<string, unknown>;
}

export interface ParsedSheetPreview {
  sheetName: string;
  rangeRef?: string;
  rowCount: number;
  columnCount: number;
  headerDetection: HeaderDetectionResult;
  columns: ParserPreviewColumn[];
  previewRows: ParserPreviewRow[];
  warnings: LocalParserWarning[];
}

export interface ParsedWorkbookPreview {
  fileName: string;
  fileKind: LocalParserFileKind;
  sheetNames: string[];
  sheets: ParsedSheetPreview[];
  selectedSheetName?: string;
  warnings: LocalParserWarning[];
  errors: LocalParserError[];
  contractAssemblyStatus: 'not_started';
}

export interface WorkbookExtractionResult {
  workbookPreview: ParsedWorkbookPreview;
}

export interface LocalParserOptions {
  detectHeadersAutomatically?: boolean;
  sampleSize?: number;
  requirePiiScan?: boolean;
}

export interface LocalParserError {
  code: string;
  message: string;
  stage: LocalParserStage;
  fatal: boolean;
}

export interface LocalParserWarning {
  code: string;
  message: string;
}

export interface LocalParserResult {
  status: LocalParserStatus;
  fileKind: LocalParserFileKind;
  workbookPreview?: ParsedWorkbookPreview;
  errors: LocalParserError[];
  warnings: LocalParserWarning[];
}
