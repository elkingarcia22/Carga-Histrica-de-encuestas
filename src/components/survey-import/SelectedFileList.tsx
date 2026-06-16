import type { LocalFileMetadata } from '@/hooks/survey-import/useLocalUploadState';
import { SelectedFileRow } from './SelectedFileRow';

interface SelectedFileListProps {
  files: LocalFileMetadata[];
  onRemove: (id: string) => void;
  pendingFocusId?: string | null;
  onFocusComplete?: () => void;
}

export function SelectedFileList({ files, onRemove, pendingFocusId, onFocusComplete }: SelectedFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Archivos seleccionados">
      {files.map((file) => (
        <SelectedFileRow
          key={file.id}
          file={file}
          onRemove={onRemove}
          buttonRef={pendingFocusId === file.id ? (node) => {
            if (node) {
              node.focus();
              onFocusComplete?.();
            }
          } : undefined}
        />
      ))}
    </div>
  );
}
