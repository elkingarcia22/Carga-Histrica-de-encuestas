import { UploadZone } from '@/components/upload/UploadZone';
import { uploadLimits } from '@/config/survey-import/uploadLimits';
import { SelectedFileList } from './SelectedFileList';
import { UploadBatchAlert } from './UploadBatchAlert';
import type { LocalFileMetadata } from '@/hooks/survey-import/useLocalUploadState';
import { Info, Sparkles, FileText, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatFileSize } from '@/components/upload/uploadUtils';
import { useState, useRef } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface SelectedFilesPanelProps {
  files: LocalFileMetadata[];
  filesCount: number;
  totalSizeBytes: number;
  validCount: number;
  blockedCount: number;
  hasBatchSizeError: boolean;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  globalMessage: string | null;
  className?: string;
}

export function SelectedFilesPanel({
  files,
  filesCount,
  totalSizeBytes,
  validCount,
  blockedCount,
  hasBatchSizeError,
  onAddFiles,
  onRemoveFile,
  globalMessage,
  className,
}: SelectedFilesPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const pageSize = uploadLimits.selectedFilesPageSize;

  const totalPages = Math.max(1, Math.ceil(files.length / pageSize));

  const handleRemove = (id: string) => {
    const newTotalFiles = files.length - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotalFiles / pageSize));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
    onRemoveFile(id);
    
    // Mover el foco al header para prevenir la pérdida de foco al eliminar
    headerRef.current?.focus();
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, files.length);
  const visibleFiles = files.slice(startIndex, endIndex);

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <h2 
            className="text-xl font-bold text-foreground mb-1 outline-none" 
            ref={headerRef}
            tabIndex={-1}
          >
            Archivos seleccionados
          </h2>
          <p className="text-sm text-muted-foreground">
            Revisa el lote antes de iniciar el análisis simulado. Todos los archivos deben pertenecer a una misma encuesta y periodo.
          </p>
        </div>

        {globalMessage && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm">{globalMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Archivos</span>
              </div>
              <p className="text-2xl font-bold">{filesCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm font-medium">Tamaño total</span>
              </div>
              <p className="text-2xl font-bold">{formatFileSize(totalSizeBytes)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Válidos</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{validCount}</p>
            </CardContent>
          </Card>

          {blockedCount > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-destructive mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Con atención</span>
                </div>
                <p className="text-2xl font-bold text-destructive">{blockedCount}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <UploadBatchAlert isVisible={hasBatchSizeError} />

        <SelectedFileList files={visibleFiles} onRemove={handleRemove} />

        {filesCount > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Mostrando {startIndex + 1}–{endIndex} de {filesCount} archivos
            </p>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1); }}
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : 0}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1); }}
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : 0}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {filesCount > 0 && filesCount <= pageSize && (
           <p className="text-sm text-muted-foreground py-2" aria-live="polite">
             Mostrando {filesCount} archivos
           </p>
        )}
        {filesCount === 0 && (
           <p className="text-sm text-muted-foreground py-2" aria-live="polite">
             No hay archivos seleccionados
           </p>
        )}

        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="p-5 flex gap-4">
            <div className="mt-0.5 flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                Antes de continuar
              </h3>
              <p className="text-sm text-blue-800/90 dark:text-blue-200/90 mb-3">
                Verifica que todos los archivos correspondan a la misma encuesta y al mismo periodo. Esta validación de contenido se representará de forma simulada en el siguiente paso.
              </p>
              <div className="flex items-start gap-2 pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
                <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                  En esta versión solo se valida metadata básica; el contenido real de los archivos no se lee.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-3">Agregar archivos</h3>
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
