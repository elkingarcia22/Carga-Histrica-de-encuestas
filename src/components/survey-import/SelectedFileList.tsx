import type { LocalFileMetadata } from '@/hooks/survey-import/useLocalUploadState';
import { SelectedFileRow } from './SelectedFileRow';

interface SelectedFileListProps {
  files: LocalFileMetadata[];
  onRemove: (id: string) => void;
}

export function SelectedFileList({ files, onRemove }: SelectedFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Archivos seleccionados">
      {files.map((file) => (
        <SelectedFileRow key={file.id} file={file} onRemove={onRemove} />
      ))}
    </div>
  );
}
