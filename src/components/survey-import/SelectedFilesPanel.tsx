import { UploadZone } from '@/components/upload/UploadZone';
import { uploadLimits } from '@/config/survey-import/uploadLimits';
import { SelectedFileList } from './SelectedFileList';
import { UploadBatchAlert } from './UploadBatchAlert';
import type { LocalFileMetadata } from '@/hooks/survey-import/useLocalUploadState';
import { Info } from 'lucide-react';

interface SelectedFilesPanelProps {
  files: LocalFileMetadata[];
  hasBatchSizeError: boolean;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  globalMessage: string | null;
  className?: string;
}

export function SelectedFilesPanel({
  files,
  hasBatchSizeError,
  onAddFiles,
  onRemoveFile,
  globalMessage,
  className,
}: SelectedFilesPanelProps) {
  const allValidish = files.length > 0 && files.every(f => f.status === 'valid' || f.status === 'warning');
  const isReadyForValidation = allValidish && !hasBatchSizeError;

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">Archivos seleccionados</h2>
          <p className="text-sm text-muted-foreground">
            {isReadyForValidation 
              ? 'Archivos listos para validación profunda. La validación profunda se habilitará en la siguiente fase.'
              : 'Revisa los archivos seleccionados y corrige los problemas antes de continuar.'}
          </p>
        </div>

        {globalMessage && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm">{globalMessage}</p>
          </div>
        )}

        <UploadBatchAlert isVisible={hasBatchSizeError} />

        <SelectedFileList files={files} onRemove={onRemoveFile} />

        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-3">Agregar más archivos</h3>
          <UploadZone
            multiple
            accept={uploadLimits.allowedExtensions.join(',')}
            onChange={onAddFiles}
            idleText="Arrastra y suelta más archivos aquí, o haz clic para buscar"
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
