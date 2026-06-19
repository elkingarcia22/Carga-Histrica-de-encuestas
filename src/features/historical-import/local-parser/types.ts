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

export interface HeaderDetectionCandidate {
  rowIndex: number;
  confidenceScore: number;
  matchedKeywords: string[];
  isLikelySiisHeader: boolean;
}

export interface DetectedHeaderRow {
  rowIndex: number;
  columns: string[];
  headerType: 'STANDARD' | 'SIIS_OFFSET' | 'UNKNOWN';
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
  detectedHeaders?: DetectedHeaderRow[];
  errors: LocalParserError[];
  warnings: LocalParserWarning[];
}
