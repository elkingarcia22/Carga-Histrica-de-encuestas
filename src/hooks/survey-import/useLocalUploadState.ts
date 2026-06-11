import { useReducer, useCallback } from 'react';
import { uploadLimits } from '@/config/survey-import/uploadLimits';

export type FileStatus = 'valid' | 'warning' | 'duplicate' | 'invalid' | 'too-large' | 'unsupported';

export interface LocalFileMetadata {
  id: string;
  displayName: string;
  normalizedNameKey: string;
  extension: string;
  reportedMimeType: string;
  sizeBytes: number;
  lastModified: number;
  status: FileStatus;
  issues?: string[];
  order: number;
}

export interface UploadBatchState {
  view: 'idle' | 'files-selected';
  files: LocalFileMetadata[];
  totalSizeBytes: number;
  hasBatchSizeError: boolean;
  globalMessage: string | null;
  accessibleMessage: string | null;
  addedCountTracker: number;
}

type Action =
  | { type: 'ADD_FILES'; payload: LocalFileMetadata[]; accessibleMessage: string }
  | { type: 'REMOVE_FILE'; payload: { id: string; accessibleMessage: string } }
  | { type: 'SET_GLOBAL_MESSAGE'; payload: string | null }
  | { type: 'RESET'; payload: { accessibleMessage: string } };

const initialState: UploadBatchState = {
  view: 'idle',
  files: [],
  totalSizeBytes: 0,
  hasBatchSizeError: false,
  globalMessage: null,
  accessibleMessage: null,
  addedCountTracker: 0,
};

function revalidateBatch(files: LocalFileMetadata[]): LocalFileMetadata[] {
  // Re-calculate duplicates
  const seenKeys = new Map<string, string>(); // normalizedKey -> firstId
  const revalidated = files.map((file): LocalFileMetadata => {
    // Check if originally invalid/too-large/unsupported
    if (['invalid', 'too-large', 'unsupported'].includes(file.status)) {
      return file;
    }

    const dupKey = `${file.normalizedNameKey}-${file.sizeBytes}-${file.lastModified}`;
    if (!seenKeys.has(dupKey)) {
      seenKeys.set(dupKey, file.id);
      // Determine if valid or warning based on MIME (assumes earlier pipeline set warning if MIME mismatch)
      const isWarning = file.reportedMimeType !== '' && !uploadLimits.compatibleMimeTypes.includes(file.reportedMimeType);
      if (isWarning) {
        return { ...file, status: 'warning', issues: undefined };
      }
      return { ...file, status: 'valid', issues: undefined };
    } else {
      return { ...file, status: 'duplicate', issues: ['Archivo duplicado en el lote'] };
    }
  });

  return revalidated;
}

function reducer(state: UploadBatchState, action: Action): UploadBatchState {
  switch (action.type) {
    case 'ADD_FILES': {
      let newFiles = [...state.files, ...action.payload];
      newFiles = revalidateBatch(newFiles);
      const totalSizeBytes = newFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
      const hasBatchSizeError = totalSizeBytes > uploadLimits.maxSizeBytesPerBatch;

      return {
        ...state,
        view: newFiles.length > 0 ? 'files-selected' : 'idle',
        files: newFiles,
        totalSizeBytes,
        hasBatchSizeError,
        accessibleMessage: action.accessibleMessage,
        addedCountTracker: state.addedCountTracker + action.payload.length,
      };
    }
    case 'REMOVE_FILE': {
      let newFiles = state.files.filter(f => f.id !== action.payload.id);
      newFiles = revalidateBatch(newFiles);
      const totalSizeBytes = newFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
      const hasBatchSizeError = totalSizeBytes > uploadLimits.maxSizeBytesPerBatch;

      return {
        ...state,
        view: newFiles.length > 0 ? 'files-selected' : 'idle',
        files: newFiles,
        totalSizeBytes,
        hasBatchSizeError,
        accessibleMessage: action.payload.accessibleMessage,
      };
    }
    case 'SET_GLOBAL_MESSAGE': {
      return { ...state, globalMessage: action.payload };
    }
    case 'RESET': {
      return {
        ...initialState,
        accessibleMessage: action.payload.accessibleMessage,
      };
    }
    default:
      return state;
  }
}

export function useLocalUploadState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addFiles = useCallback((files: LocalFileMetadata[], accessibleMessage: string) => {
    dispatch({ type: 'ADD_FILES', payload: files, accessibleMessage });
  }, []);

  const removeFile = useCallback((id: string, accessibleMessage: string) => {
    dispatch({ type: 'REMOVE_FILE', payload: { id, accessibleMessage } });
  }, []);

  const setGlobalMessage = useCallback((message: string | null) => {
    dispatch({ type: 'SET_GLOBAL_MESSAGE', payload: message });
  }, []);

  const reset = useCallback((accessibleMessage: string) => {
    dispatch({ type: 'RESET', payload: { accessibleMessage } });
  }, []);

  return {
    state,
    addFiles,
    removeFile,
    setGlobalMessage,
    reset,
  };
}

// Pure functions for pipeline

export function normalizeExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

export function getNormalizedNameKey(filename: string): string {
  return filename.trim().toLowerCase();
}

export function validateSingleFile(
  displayName: string,
  extension: string,
  mimeType: string,
  sizeBytes: number
): { status: FileStatus; issues?: string[]; retainBinary: boolean } {
  if (displayName.trim() === '') {
    return { status: 'invalid', issues: ['El nombre del archivo está vacío'], retainBinary: false };
  }
  
  const isTemp = uploadLimits.rejectedPrefixes.some(prefix => displayName.startsWith(prefix));
  if (isTemp) {
    return { status: 'invalid', issues: ['No se permiten archivos temporales'], retainBinary: false };
  }

  if (sizeBytes === 0) {
    return { status: 'invalid', issues: ['El archivo está vacío (0 bytes)'], retainBinary: false };
  }

  if (!uploadLimits.allowedExtensions.includes(extension)) {
    return { status: 'unsupported', issues: ['Formato no soportado'], retainBinary: false };
  }

  if (sizeBytes > uploadLimits.maxSizeBytesPerFile) {
    return { status: 'too-large', issues: ['El archivo supera el límite de 25 MB'], retainBinary: false };
  }

  const hasEmptyMime = mimeType === '';
  const isKnownMime = uploadLimits.compatibleMimeTypes.includes(mimeType);

  if (!hasEmptyMime && !isKnownMime) {
    return { status: 'warning', issues: ['El tipo de archivo no coincide con la extensión, pero se retendrá'], retainBinary: true };
  }

  return { status: 'valid', retainBinary: true };
}
