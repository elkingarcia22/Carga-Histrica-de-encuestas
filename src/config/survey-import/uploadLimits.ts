export const uploadLimits = {
  allowedExtensions: ['.xlsx', '.xls'],
  // Known compatible MIME types (as a signal, but extension is primary)
  compatibleMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  maxFilesAbsolute: 200,
  maxFilesWarningThreshold: 50,
  maxSizeBytesPerFile: 25 * 1024 * 1024, // 25 MB
  maxSizeBytesPerBatch: 500 * 1024 * 1024, // 500 MB
  selectedFilesPageSize: 25,
  rejectedPrefixes: ['~$'], // Temporary files
  labels: {
    maxSizePerFile: '25 MB',
    maxSizePerBatch: '500 MB',
  },
};
