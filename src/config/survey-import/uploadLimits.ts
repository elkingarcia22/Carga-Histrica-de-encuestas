export const uploadLimits = {
  allowedExtensions: ['.xlsx', '.xls'],
  // Known compatible MIME types (as a signal, but extension is primary)
  compatibleMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  maxFiles: 5,
  maxSizeBytesPerFile: 25 * 1024 * 1024, // 25 MB
  maxSizeBytesPerBatch: 50 * 1024 * 1024, // 50 MB
  rejectedPrefixes: ['~$'], // Temporary files
  labels: {
    maxSizePerFile: '25 MB',
    maxSizePerBatch: '50 MB',
  },
};
