import type {
  LocalParserCapability,
  LocalParserOptions,
  LocalParserResult,
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
